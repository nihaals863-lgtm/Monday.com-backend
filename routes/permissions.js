const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Permission } = require('../models');

// @route   GET api/permissions
// @desc    Get all permission definitions
router.get('/', auth, async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            order: [['category', 'ASC'], ['label', 'ASC']]
        });
        res.json(permissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/permissions
// @desc    Add a new permission definition (Admin only)
router.post('/', auth, async (req, res) => {
    const { key, label, category } = req.body;
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let permission = await Permission.findOne({ where: { key } });
        if (permission) return res.status(400).json({ msg: 'Permission key already exists' });

        permission = await Permission.create({ key, label, category });
        res.json(permission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/permissions/:id
// @desc    Update a permission definition (Admin only)
router.put('/:id', auth, async (req, res) => {
    const { key, label, category } = req.body;
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let permission = await Permission.findByPk(req.params.id);
        if (!permission) return res.status(404).json({ msg: 'Permission not found' });

        if (key) permission.key = key;
        if (label) permission.label = label;
        if (category) permission.category = category;

        await permission.save();
        res.json(permission);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/permissions/:id
// @desc    Delete a permission definition (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let permission = await Permission.findByPk(req.params.id);
        if (!permission) return res.status(404).json({ msg: 'Permission not found' });

        await permission.destroy();
        res.json({ msg: 'Permission removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
