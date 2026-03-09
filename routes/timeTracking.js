const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { TimeSession, Item, Group, Board, User } = require('../models');
const { Op } = require('sequelize');

// @route   POST api/time/start
// @desc    Start a time session for an item
router.post('/start', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        // We allow multiple active sessions now, so we don't stop the active session.
        // But let's just make sure there isn't already an active session for *this specific item*
        const activeSession = await TimeSession.findOne({
            where: { userId, itemId, isActive: true }
        });

        if (activeSession) {
            return res.json(activeSession);
        }

        // Create new session
        const newSession = await TimeSession.create({
            itemId,
            userId,
            parentItemId: req.body.parentItemId || itemId,
            itemName: req.body.itemName,
            startTime: new Date(),
            isActive: true
        });

        res.json(newSession);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const formatTimeSeconds = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// @route   POST api/time/stop
// @desc    Stop active time session
router.post('/stop', auth, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;
        console.log(`[TIME STOP] User ${userId} stopping item ${itemId}`);

        const activeSession = await TimeSession.findOne({
            where: { userId, itemId, isActive: true }
        });

        if (!activeSession) {
            return res.status(400).json({ msg: 'No active session found' });
        }

        const now = new Date();
        const start = new Date(activeSession.startTime);
        const diffSeconds = Math.floor((now - start) / 1000);

        activeSession.endTime = now;
        activeSession.duration += diffSeconds;
        activeSession.isActive = false;
        await activeSession.save();

        // RECALCULATE TOTAL TIME FOR ITEM
        const allSessions = await TimeSession.findAll({
            where: { itemId }
        });

        const totalDuration = allSessions.reduce((acc, sess) => acc + (sess.duration || 0), 0);
        const timeTrackingStr = formatTimeSeconds(totalDuration);

        // Only update Item table if itemId is numeric (real item, not virtual subitem)
        if (!isNaN(itemId)) {
            await Item.update({ timeTracking: timeTrackingStr }, { where: { id: itemId } });
        }

        res.json({
            ...activeSession.toJSON(),
            totalItemTime: timeTrackingStr
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/time/item/:itemId
// @desc    Get all time sessions for an item (including sub-items)
router.get('/item/:itemId', auth, async (req, res) => {
    try {
        const sessions = await TimeSession.findAll({
            where: {
                [Op.or]: [
                    { itemId: req.params.itemId },
                    { parentItemId: req.params.itemId }
                ]
            },
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
            order: [['startTime', 'DESC']]
        });
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/time/board/:boardId
// @desc    Get aggregated time for a board
router.get('/board/:boardId', auth, async (req, res) => {
    try {
        const board = await Board.findByPk(req.params.boardId, {
            include: [{
                model: Group,
                as: 'Groups',
                include: [{
                    model: Item,
                    as: 'items',
                    include: [{
                        model: TimeSession,
                        as: 'timeSessions',
                        include: [{ model: User, attributes: ['id', 'name'] }]
                    }]
                }]
            }]
        });

        if (!board) return res.status(404).json({ msg: 'Board not found' });

        // Aggregate by user
        const userStats = {};
        board.Groups.forEach(group => {
            group.items.forEach(item => {
                item.timeSessions.forEach(session => {
                    if (!userStats[session.userId]) {
                        userStats[session.userId] = {
                            userId: session.userId,
                            userName: session.User.name,
                            totalDuration: 0,
                            sessions: []
                        };
                    }

                    let sessionDuration = session.duration;
                    if (session.isActive) {
                        const now = new Date();
                        const start = new Date(session.startTime);
                        sessionDuration += Math.floor((now - start) / 1000);
                    }

                    userStats[session.userId].totalDuration += sessionDuration;
                });
            });
        });

        res.json(Object.values(userStats));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/time/active
// @desc    Get current active sessions for user
router.get('/active', auth, async (req, res) => {
    try {
        const sessions = await TimeSession.findAll({
            where: { userId: req.user.id, isActive: true },
            include: [{ model: Item, attributes: ['id', 'name'] }]
        });
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/time/stats

// @desc    Get aggregated time stats for all users and boards
router.get('/stats', auth, async (req, res) => {
    try {
        const sessions = await TimeSession.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'avatar'] },
                {
                    model: Item,
                    attributes: ['id', 'name']
                },
                {
                    model: Item,
                    as: 'parentItem',
                    attributes: ['id', 'name', 'status'],
                    include: [{
                        model: Group,
                        include: [{ model: Board, attributes: ['id', 'name', 'folder'] }]
                    }]
                }
            ]
        });

        const stats = {
            totalDuration: 0,
            byUser: {},
            byBoard: {},
            byProject: {}, // New: Track duration by specific project
            lastSessions: sessions.reverse()
        };

        sessions.forEach(session => {
            let duration = session.duration;
            if (session.isActive) {
                duration += Math.floor((new Date() - new Date(session.startTime)) / 1000);
            }

            stats.totalDuration += duration;

            // Group by user
            if (!stats.byUser[session.userId]) {
                stats.byUser[session.userId] = {
                    id: session.userId,
                    name: session.User.name,
                    total: 0,
                    isActive: session.isActive
                };
            }
            stats.byUser[session.userId].total += duration;
            if (session.isActive) stats.byUser[session.userId].isActive = true;

            // Group by Project (Parent Item)
            const project = session.parentItem || session.Item;
            const projectId = project ? project.id : (session.parentItemId || session.itemId);
            const projectName = project ? project.name : (session.itemName || 'Unnamed Item');

            if (projectId) {
                if (!stats.byProject[projectId]) {
                    stats.byProject[projectId] = {
                        id: projectId,
                        name: projectName,
                        total: 0
                    };
                }
                stats.byProject[projectId].total += duration;
            }

            // Group by board (Traversing from parentItem -> Group -> Board)
            const board = session.parentItem?.Group?.Board;
            if (board) {
                if (!stats.byBoard[board.id]) {
                    stats.byBoard[board.id] = {
                        id: board.id,
                        name: board.name,
                        total: 0
                    };
                }
                stats.byBoard[board.id].total += duration;
            }
        });

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

