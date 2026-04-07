const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { Board, Group, Item, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const checkBoardAccess = require('../middleware/checkBoardAccess');

// DEBUG LOG: Ensure this file is loaded
console.log('--- BOARDS ROUTER INITIALIZING ---');

/**
 * @route   DELETE api/boards/:id
 * @desc    Delete a board by ID. 
 *          This is now at the TOP of the file to ensure it matches first.
 */
router.delete('/:id', auth, async (req, res) => {
  const boardId = req.params.id;
  console.log(`[ROUTE HIT] DELETE /api/boards/${boardId} (User: ${req.user.id}, Role: ${req.user.role})`);

  try {
    const board = await Board.findByPk(boardId);

    if (!board) {
      console.log(`[DELETE INFO] Board ${boardId} not found. Returning 200 for idempotency.`);
      return res.status(200).json({
        msg: `Board ${boardId} already deleted or does not exist.`,
        id: boardId,
        success: true
      });
    }

    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';
    const isCoordinator = String(board.ownerId) === String(req.user.id);

    if (!isAdmin && !isManager && !isCoordinator) {
      console.log(`[DELETE DENIED] User ${req.user.id} is not Admin, Manager, or Coordinator of board ${boardId}`);
      return res.status(403).json({ msg: 'Access denied: Only admins, managers, or the board coordinator can delete a board.' });
    }

    await board.destroy();

    // Extra cleanup to ensure all related time sessions are removed from the log
    try {
      const { sequelize } = require('../models');
      await sequelize.query(`
            DELETE FROM time_sessions 
            WHERE parentItemId NOT IN (SELECT id FROM items)
            AND parentItemId IS NOT NULL
        `);
    } catch (cleanupErr) {
      console.warn('[CLEANUP WARN] Orphaned session purge failed:', cleanupErr.message);
    }

    console.log(`[DELETE SUCCESS] Board ${boardId} has been removed.`);
    res.json({ msg: 'Board deleted successfully', id: boardId, success: true });
  } catch (err) {
    console.error(`[DELETE ERROR] Critical fail for board ${boardId}:`, err);
    res.status(500).json({ msg: 'Server error during deletion', error: err.message });
  }
});

// @route   GET api/boards/archived
router.get('/archived', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';

    const boards = await Board.findAll({
      where: { isArchived: true },
      include: [{
        model: Group,
        as: 'Groups',
        required: false,
        include: [{
          model: Item,
          as: 'items',
          required: false,
          where: {} // Remove item assignment restriction
        }]
      }]
    });

    const filtered = boards; // Show everything

    res.json(filtered);
  } catch (err) {
    console.error('boards.js GET /archived error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/boards/test
router.get('/test', (req, res) => {
  res.json({ msg: 'Boards router is working', id: 'TEST_ROUTE' });
});

// @route   GET api/boards/health
router.get('/health', async (req, res) => {
  try {
    await Board.findOne();
    res.json({ status: 'ok', msg: 'Database connection for Boards is healthy' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// @route   GET api/boards
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';

    const commonInclude = [{
      model: Group,
      as: 'Groups',
      required: false,
      include: [{
        model: Item,
        as: 'items',
        required: false,
        include: [
          { model: Item, as: 'subItems' },
          { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'avatar'] }
        ]
      }]
    }];

    // 1. Get all boards
    const allBoards = await Board.findAll({
      include: commonInclude
    });

    // 2. Identify boards where user is assigned to items (check ALL assignment fields)
    const userId = String(req.user.id);

    // Check assignedToId field + people JSON field + person legacy field
    const assignedItems = await Item.findAll({
      where: {
        [Op.or]: [
          { assignedToId: userId },
          // people column stores JSON like ["1","2"] or [{"id":"1"},...]
          { people: { [Op.like]: `%"${userId}"%` } },
          // person column (legacy string field)
          { person: userId }
        ]
      },
      include: [{
        model: Group,
        as: 'Group',
        attributes: ['BoardId']
      }]
    });

    const assignedBoardIds = [...new Set(assignedItems.map(item => {
      const group = item.Group || item.group;
      return group?.BoardId;
    }).filter(id => id))];

    const MASTER_BOARD_TYPES = ['ai-future', 'ai-roadmap', 'dm-inquiries', 'commercial-sira'];

    // 3. Filter and mark access
    const filteredBoards = allBoards.filter(b => {
      if (isAdmin || isManager) return true;

      const bIdStr = String(b.id);

      // Check folder permission
      if (req.user.permissions?.folders && Array.isArray(req.user.permissions.folders)) {
        if (req.user.permissions.folders.includes(b.folder)) return true;
      }

      // Check Board permissions
      if (req.user.permissions?.boards && Array.isArray(req.user.permissions.boards)) {
        if (req.user.permissions.boards.some(pbid => String(pbid) === bIdStr)) return true;
      }

      // Check assignment or ownership
      return assignedBoardIds.some(abid => String(abid) === bIdStr) || String(b.ownerId) === userId;
    }).map(b => {
      const board = b.toJSON();
      const bIdStr = String(b.id);

      const MASTER_BOARD_TYPES = ['ai-future', 'ai-roadmap', 'dm-inquiries', 'commercial-sira'];
      const isMasterBoard = MASTER_BOARD_TYPES.includes(b.type);
      const isFolderPermitted = req.user.permissions?.folders?.includes(b.folder);
      const isBoardPermitted = req.user.permissions?.boards?.some(pbid => String(pbid) === bIdStr);
      const isOwner = String(b.ownerId) === userId;

      const hasFullAccess = isAdmin || isManager || isFolderPermitted || isBoardPermitted || isOwner;

      if (hasFullAccess) {
        board.access = 'full';
        board.isCoordinator = true;
      } else {
        board.access = 'assigned';
        board.isCoordinator = false;
      }
      return board;
    });


    res.json(filteredBoards);
  } catch (err) {
    console.error('boards.js GET / error:', err);
    res.status(500).json({ msg: 'Server error fetching boards' });
  }
});

// @route   POST api/boards
router.post('/', [auth, checkPermission('createMainBoards')], async (req, res) => {
  try {
    // if (req.user.role !== 'Admin' && req.user.role !== 'Manager') return res.status(403).json({ msg: 'Access denied' });
    // Set creator as the initial coordinator/owner if not specified
    const boardData = { ...req.body };
    if (!boardData.ownerId) {
      boardData.ownerId = String(req.user.id);
    }

    const board = await Board.create(boardData);
    await Group.create({ title: 'New Group', BoardId: board.id });
    res.json(board);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/boards/:id/groups
router.post('/:id/groups', [auth, checkBoardAccess], async (req, res) => {
  try {
    const group = await Group.create({ ...req.body, BoardId: req.params.id });
    res.json(group);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/boards/:id
router.patch('/:id', [auth, checkBoardAccess], async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ msg: 'Board not found' });

    const allowedUpdates = ['name', 'type', 'folder', 'columns', 'isFavorite', 'isArchived', 'ownerId', 'viewConfig'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        board[field] = req.body[field];
      }
    });

    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
