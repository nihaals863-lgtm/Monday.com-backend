const { Board, Group, Item } = require('../models');
const { Op } = require('sequelize');

/**
 * Middleware to check if a user has 'full' access to a board.
 * Admins and Managers always have full access.
 * Regular users only have full access if they have at least one assigned task on the board.
 */
module.exports = async (req, res, next) => {
    try {
        const { id, role, permissions } = req.user;
        const isAdmin = role === 'Admin';
        const isManager = role === 'Manager';

        // Admins and Managers have full access
        if (isAdmin || isManager) {
            req.boardAccess = 'full';
            req.isCoordinator = true;
            return next();
        }

        // Determine target BoardId based on the request
        let boardId = req.params.boardId || req.body.BoardId;

        // If boardId is not directly available, try to infer it from other params
        if (!boardId && req.params.id) {
            const baseUrl = req.baseUrl;
            // If the route is /api/boards/:id
            if (baseUrl.includes('/api/boards')) {
                boardId = req.params.id;
            }
            // If the route is /api/items/:id, find the board via group
            else if (baseUrl.includes('/api/items')) {
                const item = await Item.findByPk(req.params.id, {
                    include: [{ model: Group, attributes: ['BoardId'] }]
                });
                if (item && item.Group) {
                    boardId = item.Group.BoardId;
                }
            }
            // If the route is /api/groups/:id, find board
            else if (baseUrl.includes('/api/groups')) {
                const group = await Group.findByPk(req.params.id);
                if (group) {
                    boardId = group.BoardId;
                }
            }
        }

        if (!boardId) {
            return next();
        }

        const board = await Board.findByPk(boardId);
        if (!board) return next();

        // 1. Check folder-level permission
        if (permissions?.folders && Array.isArray(permissions.folders)) {
            if (permissions.folders.includes(board.folder)) {
                req.boardAccess = 'full';
                req.isCoordinator = true;
                return next();
            }
        }

        // 2. Check board-level permission
        if (permissions?.boards && Array.isArray(permissions.boards)) {
            // Robust check using string comparison for BigInt/Number/String mixing
            if (permissions.boards.some(bid => String(bid) === String(boardId))) {
                req.boardAccess = 'full';
                req.isCoordinator = true;
                return next();
            }
        }

        // 3. Ownership Check
        if (String(board.ownerId) === String(id)) {
            req.boardAccess = 'full';
            req.isCoordinator = true;
            return next();
        }

        // 4. Assignment Check: Check if user is assigned (via any field) to any item on this board
        const userId = String(id);
        const assignedItem = await Item.findOne({
            include: [{
                model: Group,
                as: 'Group',
                where: { BoardId: boardId },
                required: true
            }],
            where: {
                [Op.or]: [
                    { assignedToId: userId },
                    { people: { [Op.like]: `%"${userId}"%` } },
                    { person: userId }
                ]
            }
        });

        if (assignedItem) {
            req.boardAccess = 'assigned';
            return next();
        }


        // 4. Default: Access Denied for regular users with no involvement
        return res.status(403).json({
            msg: 'Access denied: You are not assigned to this board as a coordinator or collaborator.',
            code: 'BOARD_ACCESS_DENIED'
        });

    } catch (err) {
        console.error('Permission check error:', err);
        res.status(500).send('Server error during permission check');
    }
};
