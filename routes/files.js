const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { File, Item, User, Board, Group } = require('../models');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// @route   GET api/files
// @desc    Get all files
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.findAll({
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
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/files/upload
// @desc    Upload a file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const newFile = await File.create({
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      uploadedBy: req.user.name,
      userId: req.user.id,
      ItemId: req.body.itemId || null // Optional: link to an item
    });

    // Include user info in response
    const fileWithUser = await File.findByPk(newFile.id, {
      include: [{ model: User, attributes: ['name', 'avatar'] }]
    });

    res.json(fileWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/files/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ msg: 'File not found' });

    // Delete from local storage
    const filePath = path.join(__dirname, '..', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.destroy();
    res.json({ msg: 'File deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
