const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Folder } = require('../models');
const { Op } = require('sequelize');

// @route   GET api/folders
// @desc    Get all folders
router.get('/', auth, async (req, res) => {
    try {
        const { role, permissions, id } = req.user;
        const isAdmin = role === 'Admin';
        const isManager = role === 'Manager';

        const folders = await Folder.findAll();

        if (isAdmin || isManager) {
            return res.json(folders);
        }

        // For regular users, filter folders based on permission or assigned board visibility
        const { Board, Item, Group } = require('../models');
        const { Op } = require('sequelize');

        // 1. Get Board IDs user is assigned to (check ALL assignment fields)
        const userId = String(id);
        const assignedItems = await Item.findAll({
            where: {
                [Op.or]: [
                    { assignedToId: userId },
                    { people: { [Op.like]: `%"${userId}"%` } },
                    { person: userId }
                ]
            },
            include: [{ model: Group, attributes: ['BoardId'] }]
        });
        const assignedBoardIds = [...new Set(assignedItems.map(i => i.Group?.BoardId).filter(id => id))];

        // 2. Get folder names from boards user has access to (assigned or owner)
        const boardsWithAccess = await Board.findAll({
            where: {
                [Op.or]: [
                    { id: assignedBoardIds },
                    { ownerId: String(id) }
                ]
            },
            attributes: ['folder']
        });
        const accessibleFolderNames = new Set(boardsWithAccess.map(b => b.folder));

        // 3. Add folders from explicit permissions
        if (permissions?.folders && Array.isArray(permissions.folders)) {
            permissions.folders.forEach(f => accessibleFolderNames.add(f));
        }

        const filtered = folders.filter(f => accessibleFolderNames.has(f.name));
        res.json(filtered);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/folders
// @desc    Create a folder
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ msg: 'Please enter a folder name' });

        const folder = await Folder.create({ name });
        res.json(folder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/folders/:id
// @desc    Update a folder
router.put('/:id', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const folder = await Folder.findByPk(req.params.id);
        if (!folder) return res.status(404).json({ msg: 'Folder not found' });

        const oldName = folder.name;
        folder.name = name;
        await folder.save();

        // Update all boards that were in this folder
        const { Board } = require('../models');
        await Board.update({ folder: name }, { where: { folder: oldName } });

        res.json(folder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/folders/:id
// @desc    Delete a folder
router.delete('/:id', auth, async (req, res) => {
    try {
        const folder = await Folder.findByPk(req.params.id);
        if (!folder) return res.status(404).json({ msg: 'Folder not found' });

        const folderName = folder.name;

        // Find and delete all boards in this folder (triggers CASCADE: Board -> Group -> Item -> TimeSession)
        const { Board } = require('../models');
        const boardsInFolder = await Board.findAll({ where: { folder: folderName } });
        for (const board of boardsInFolder) {
            await board.destroy();
        }

        await folder.destroy();

        // Cleanup orphaned time sessions
        try {
            const { sequelize } = require('../models');
            await sequelize.query('DELETE FROM time_sessions WHERE parentItemId NOT IN (SELECT id FROM items) AND parentItemId IS NOT NULL');
        } catch (e) { }

        res.json({ msg: 'Folder and associated boards removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
