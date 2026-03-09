const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Form, Board } = require('../models');

// @route   GET api/forms/board/:boardId
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const targetBoardId = (boardId === 'null' || boardId === 'undefined' || boardId === '0' || !boardId) ? null : boardId;
    console.log(`[FORMS] Fetching form for board: ${targetBoardId || 'Global'}`);

    const form = await Form.findOne({ where: { BoardId: targetBoardId } });
    if (!form) {
      console.log(`[FORMS] No existing form found for ${targetBoardId || 'Global'}. Returning default.`);
      return res.json({
        id: null,
        BoardId: targetBoardId,
        title: 'New Request Form',
        description: 'Please fill out the details below.',
        fields: [], // Start empty for clean builder
        settings: {
          successMessage: 'Thank you for your submission!',
          redirectUrl: ''
        }
      });
    }
    res.json(form);
  } catch (err) {
    console.error('[FORMS] GET Error:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/forms
router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.findAll({ include: [{ model: Board, attributes: ['name'] }] });
    res.json(forms);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/forms
router.post('/', auth, async (req, res) => {
  try {
    const { BoardId, title, description, fields, settings } = req.body;
    const targetBoardId = (BoardId === 'null' || BoardId === 0 || !BoardId) ? null : BoardId;
    console.log(`[FORMS] Saving form for Board: ${targetBoardId || 'Global'}`);

    // Check if form exists for this board
    let form = await Form.findOne({ where: { BoardId: targetBoardId } });

    if (form) {
      console.log(`[FORMS] Updating existing form ID: ${form.id}`);
      form.title = title || form.title;
      form.description = description || form.description;
      form.fields = fields || form.fields;
      form.settings = settings || form.settings;
      await form.save();
    } else {
      console.log(`[FORMS] Creating new form for Board: ${targetBoardId || 'Global'}`);
      form = await Form.create({ BoardId: targetBoardId, title, description, fields, settings });
    }

    res.json(form);
  } catch (err) {
    console.error('[FORMS] POST Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
