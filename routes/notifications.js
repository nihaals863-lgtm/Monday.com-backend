const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Notification } = require('../models');

// @route   GET api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/notifications/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });

    await notification.update({ isRead: true });
    res.json(notification);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
