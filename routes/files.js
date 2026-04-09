const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { File, Item, User, Board, Group } = require('../models');
const { Op } = require('sequelize');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — no temp files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Helper: upload buffer to Cloudinary via upload_stream
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

// @route   GET api/files
// @desc    Get all files (Filtered by role and assignment)
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Manager';

    let whereClause = {};

    if (!isAdmin) {
      const userId = req.user.id;

      const assignedItems = await Item.findAll({
        where: {
          [Op.or]: [
            { assignedToId: String(userId) },
            {
              people: {
                [Op.like]: `%\"id\":${userId}%`
              }
            }
          ]
        },
        attributes: ['id']
      });

      const assignedItemIds = assignedItems.map(item => item.id);

      whereClause = {
        [Op.or]: [
          { ItemId: { [Op.in]: assignedItemIds } },
          { userId: userId }
        ]
      };
    }

    const files = await File.findAll({
      where: whereClause,
      include: [
        {
          model: Item,
          include: [{ model: Group, include: [{ model: Board }] }]
        },
        { model: User, attributes: ['name', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(files);
  } catch (err) {
    console.error('[GET FILES ERROR]', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/files/upload
// @desc    Upload a file to Cloudinary and save URL to DB
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Determine resource type based on MIME type
    let resourceType = 'raw'; // default for documents
    if (req.file.mimetype.startsWith('image/')) resourceType = 'image';
    else if (req.file.mimetype.startsWith('video/')) resourceType = 'video';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'monday-files',
      resource_type: resourceType,
      public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      use_filename: true,
    });

    const newFile = await File.create({
      name: req.file.originalname,
      url: result.secure_url,         // Full Cloudinary URL
      cloudinaryId: result.public_id, // Save for future deletion
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: req.user.name,
      userId: req.user.id,
      ItemId: req.body.itemId || null
    });

    const fileWithUser = await File.findByPk(newFile.id, {
      include: [{ model: User, attributes: ['name', 'avatar'] }]
    });

    res.json(fileWithUser);
  } catch (err) {
    console.error('[FILE UPLOAD ERROR]', err);
    res.status(500).json({ msg: 'Upload failed: ' + err.message });
  }
});

// @route   DELETE api/files/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ msg: 'File not found' });

    // Delete from Cloudinary if cloudinaryId exists
    if (file.cloudinaryId) {
      try {
        // Determine resource type from mime type
        let resourceType = 'raw';
        if (file.type && file.type.startsWith('image/')) resourceType = 'image';
        else if (file.type && file.type.startsWith('video/')) resourceType = 'video';

        await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: resourceType });
        console.log(`[FILE DELETE] Deleted from Cloudinary: ${file.cloudinaryId}`);
      } catch (cloudErr) {
        console.warn('[FILE DELETE] Cloudinary deletion failed (continuing):', cloudErr.message);
      }
    }

    await file.destroy();
    res.json({ msg: 'File deleted' });
  } catch (err) {
    console.error('[FILE DELETE ERROR]', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
