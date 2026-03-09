const { Board, Group, Item, User } = require('../models');

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
            // Create it if it doesn't exist (First time setup)
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

            // Create some default groups
            await Group.create({ title: 'Research & Discovery', color: '#0085ff', BoardId: board.id });
            await Group.create({ title: 'Sandbox / Experiments', color: '#a25ddc', BoardId: board.id });

            // Re-fetch with groups
            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items' }] }]
            });
        }

        res.json(board);
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

            await Group.create({ title: 'Q1 2025', color: '#00c875', BoardId: board.id });
            await Group.create({ title: 'Q2 2025', color: '#ffcb00', BoardId: board.id });

            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items' }] }]
            });
        }

        res.json(board);
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

            await Group.create({ title: 'Active Deals', color: '#00c875', BoardId: board.id });
            await Group.create({ title: 'Lead - Discussion', color: '#ffcb00', BoardId: board.id });

            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items' }] }]
            });
        }

        res.json(board);
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

            await Group.create({ title: 'Unread', color: '#e2445c', BoardId: board.id });
            await Group.create({ title: 'In Progress', color: '#fdab3d', BoardId: board.id });

            board = await Board.findByPk(board.id, {
                include: [{ model: Group, as: 'Groups', include: [{ model: Item, as: 'items' }] }]
            });
        }

        res.json(board);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
};
