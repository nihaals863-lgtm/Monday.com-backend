const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Board, Item, Group, User, File, Form } = require('../models');
const { Op } = require('sequelize');

// @route   GET api/search
// @desc    Search across all boards, items, users, files, forms
router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ boards: [], items: [], users: [], files: [], forms: [] });

  try {
    const searchOp = { [Op.like]: `%${q}%` };

    const [boards, items, users, files, forms] = await Promise.all([
      // Search Boards
      Board.findAll({
        where: { name: searchOp },
        attributes: ['id', 'name', 'workspace', 'type']
      }),

      // Search Items (removed assignedToId restriction to like global search)
      Item.findAll({
        where: { name: searchOp },
        include: [
          {
            model: Group,
            include: [{ model: Board, attributes: ['id', 'name'] }]
          }
        ],
        limit: 20 // Limit to prevent massive payloads
      }),

      // Search Users
      User.findAll({
        where: {
          [Op.or]: [
            { name: searchOp },
            { email: searchOp }
          ]
        },
        attributes: ['id', 'name', 'email', 'avatar', 'role']
      }),

      // Search Files
      File.findAll({
        where: { name: searchOp },
        limit: 20
      }),

      // Search Forms
      Form.findAll({
        where: { title: searchOp },
        include: [{ model: Board, attributes: ['id', 'name'] }]
      })
    ]);

    res.json({ boards, items, users, files, forms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
