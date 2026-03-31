const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { File, Item, User, Board, Group, sequelize } = require('../models');
const { Op } = require('sequelize');

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
// @desc    Get all files (Filtered by role and assignment)
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Manager';
    
    let whereClause = {};
    
    // If not admin, filter files by assigned items
    if (!isAdmin) {
      const userId = req.user.id;
      
      // Find items where user is specifically assigned OR is in the 'people' list
      const assignedItems = await Item.findAll({
        where: {
          [Op.or]: [
            { assignedToId: String(userId) },
            { 
              people: { 
                [Op.like]: `%"id":${userId}%` 
              } 
            }
          ]
        },
        attributes: ['id']
      });
      
      const assignedItemIds = assignedItems.map(item => item.id);
      
      // Visibility rule: 
      // 1. Files for assigned items
      // 2. Files uploaded by the user themselves
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
