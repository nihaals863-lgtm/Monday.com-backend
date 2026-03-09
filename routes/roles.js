const express = require('express');
const router = express.Router();
const { Role } = require('../models');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// @route   GET api/roles
// @desc    Get all roles
router.get('/', auth, async (req, res) => {
    try {
        const roles = await Role.findAll();
        // Ensure permissions are parsed if they come back as strings (failsafe)
        const parsedRoles = roles.map(role => {
            const r = role.toJSON();
            if (typeof r.permissions === 'string') {
                try { r.permissions = JSON.parse(r.permissions); } catch (e) { }
            }
            return r;
        });
        res.json(parsedRoles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/roles
// @desc    Create a new role
router.post('/', [auth, checkPermission('editRoles')], async (req, res) => {
    const { name, permissions, isCustom } = req.body;
    try {
        // if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let role = await Role.findOne({ where: { name } });
        if (role) {
            return res.status(400).json({ msg: 'Role already exists' });
        }

        role = await Role.create({
            name,
            permissions: permissions || {},
            isCustom: isCustom !== undefined ? isCustom : true
        });

        res.json(role);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/roles/:id
// @desc    Update a role (name or permissions)
router.put('/:id', [auth, checkPermission('editRoles')], async (req, res) => {
    const { name, permissions } = req.body;
    try {
        // if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ msg: 'Role not found' });

        if (name) role.name = name;
        if (permissions) {
            role.permissions = permissions;
            role.changed('permissions', true); // Force Sequelize to persist JSON update
        }

        await role.save();

        // Return cleaned JSON
        const responseData = role.toJSON();
        if (typeof responseData.permissions === 'string') {
            try { responseData.permissions = JSON.parse(responseData.permissions); } catch (e) { }
        }

        res.json(responseData);
    } catch (err) {
        console.error('Update role error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/roles/:id
// @desc    Delete a role
router.delete('/:id', [auth, checkPermission('editRoles')], async (req, res) => {
    try {
        // if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });

        let role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ msg: 'Role not found' });

        await role.destroy();
        res.json({ msg: 'Role removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
