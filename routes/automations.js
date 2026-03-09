const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Automation } = require('../models');

// @route   GET api/automations
// @desc    Get all automations for user
router.get('/', auth, async (req, res) => {
    try {
        const automations = await Automation.findAll({
            where: { UserId: req.user.id }
        });
        res.json(automations);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/automations
// @desc    Create an automation
router.post('/', auth, async (req, res) => {
    try {
        const { trigger, triggerValue, action, actionValue } = req.body;
        const automation = await Automation.create({
            trigger,
            triggerValue,
            action,
            actionValue,
            UserId: req.user.id
        });
        res.json(automation);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/automations/:id
// @desc    Update automation (toggle enabled or other fields)
router.patch('/:id', auth, async (req, res) => {
    try {
        const automation = await Automation.findOne({
            where: { id: req.params.id, UserId: req.user.id }
        });

        if (!automation) return res.status(404).json({ msg: 'Automation not found' });

        if (req.body.enabled !== undefined) automation.enabled = req.body.enabled;
        if (req.body.trigger) automation.trigger = req.body.trigger;
        if (req.body.triggerValue) automation.triggerValue = req.body.triggerValue;
        if (req.body.action) automation.action = req.body.action;
        if (req.body.actionValue) automation.actionValue = req.body.actionValue;

        await automation.save();
        res.json(automation);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/automations/:id
// @desc    Delete automation
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await Automation.destroy({
            where: { id: req.params.id, UserId: req.user.id }
        });

        if (!result) return res.status(404).json({ msg: 'Automation not found' });
        res.json({ msg: 'Automation deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
