const { Board, Group, Item, User } = require('../models');
const { Op } = require('sequelize');

const getBoardAccess = async (req, board) => {
    const userId = String(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';
    
    const isFolderPermitted = req.user.permissions?.folders?.includes(board.folder);
    const isBoardPermitted = req.user.permissions?.boards?.some(pbid => String(pbid) === String(board.id));
    const isOwner = String(board.ownerId) === userId;

    if (isAdmin || isManager || isFolderPermitted || isBoardPermitted || isOwner) {
        return { access: 'full', isCoordinator: true };
    }
    
    return { access: 'assigned', isCoordinator: false };
};

exports.getFutureProjects = async (req, res) => {
    try {
        let board = await Board.findOne({
            where: { name: 'AI Future Projects' },
            include: [{
                model: Group,
                as: 'Groups',
                include: [{
                    model: Item,
                    as: 'items',
                    include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }]
                }]
            }]
        });

        if (!board) {
            board = await Board.create({
                name: 'AI Future Projects',
                type: 'ai-future',
                folder: 'AI & Innovation',
                columns: [
                    { id: 'name', title: 'Project Name', type: 'text' },
                    { id: 'status', title: 'Phase', type: 'status' },
                    { id: 'aiModel', title: 'AI Model', type: 'status' },
                    { id: 'priority', title: 'Priority', type: 'priority' },
                    { id: 'timeline', title: 'Timeline', type: 'text' },
                    { id: 'progress', title: 'Progress', type: 'progress' }
                ]
            });
            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items', include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }] }] }]
            });
        }

        const boardJson = board.toJSON();
        const accessInfo = await getBoardAccess(req, board);
        Object.assign(boardJson, accessInfo);
        
        res.json(boardJson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getRoadmap = async (req, res) => {
    try {
        let board = await Board.findOne({
            where: { name: 'AI R&D Roadmap' },
            include: [{
                model: Group,
                as: 'Groups',
                include: [{
                    model: Item,
                    as: 'items',
                    include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }]
                }]
            }]
        });

        if (!board) {
            board = await Board.create({
                name: 'AI R&D Roadmap',
                type: 'ai-roadmap',
                folder: 'AI & Innovation',
                columns: [
                    { id: 'name', title: 'Task Name', type: 'text' },
                    { id: 'status', title: 'Status', type: 'status' },
                    { id: 'priority', title: 'Priority', type: 'priority' },
                    { id: 'timeline', title: 'Quarter', type: 'text' },
                    { id: 'progress', title: 'Completion', type: 'progress' }
                ]
            });
            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items', include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }] }] }]
            });
        }

        const boardJson = board.toJSON();
        const accessInfo = await getBoardAccess(req, board);
        Object.assign(boardJson, accessInfo);

        res.json(boardJson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getCommercialSIRA = async (req, res) => {
    try {
        let board = await Board.findOne({
            where: { name: 'Commercial - SIRA' },
            include: [{
                model: Group,
                as: 'Groups',
                include: [{
                    model: Item,
                    as: 'items',
                    include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }]
                }]
            }]
        });

        if (!board) {
            board = await Board.create({
                name: 'Commercial - SIRA',
                type: 'commercial-sira',
                folder: 'Commercial',
                columns: [
                    { id: 'name', title: 'Deal Name', type: 'text' },
                    { id: 'status', title: 'Status', type: 'status' },
                    { id: 'dealValue', title: 'Deal Value', type: 'payment' },
                    { id: 'progress', title: 'Progress', type: 'progress' },
                    { id: 'priority', title: 'Priority', type: 'priority' },
                    { id: 'receivedDate', title: 'Received Date', type: 'date' }
                ]
            });
            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items', include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }] }] }]
            });
        }

        const boardJson = board.toJSON();
        const accessInfo = await getBoardAccess(req, board);
        Object.assign(boardJson, accessInfo);

        res.json(boardJson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getDMInquiries = async (req, res) => {
    try {
        let board = await Board.findOne({
            where: { name: 'DM Inquiries - Master Board' },
            include: [{
                model: Group,
                as: 'Groups',
                include: [{
                    model: Item,
                    as: 'items',
                    include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }]
                }]
            }]
        });

        if (!board) {
            board = await Board.create({
                name: 'DM Inquiries - Master Board',
                type: 'dm-inquiries',
                folder: 'Commercial',
                columns: [
                    { id: 'name', title: 'Customer Name', type: 'text' },
                    { id: 'status', title: 'Status', type: 'status' },
                    { id: 'source', title: 'Source', type: 'status' },
                    { id: 'urgency', title: 'Urgency', type: 'priority' },
                    { id: 'person', title: 'Assigned To', type: 'person' },
                    { id: 'receivedDate', title: 'Received Date', type: 'date' }
                ]
            });
            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items', include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'avatar'] }] }] }]
            });
        }

        const boardJson = board.toJSON();
        const accessInfo = await getBoardAccess(req, board);
        Object.assign(boardJson, accessInfo);

        res.json(boardJson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};
