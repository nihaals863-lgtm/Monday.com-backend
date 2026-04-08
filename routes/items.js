const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Item, Notification, Group, Board, User } = require('../models');
const { Op } = require('sequelize');
const checkBoardAccess = require('../middleware/checkBoardAccess');

// @route   GET api/items/my
// @desc    Get items assigned to the current user
router.get('/my', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';

    // Admins/Managers see all items; regular users see only their assigned items
    const userId = String(req.user.id);
    
    // In "My Work", everyone should primarily see what is assigned to THEM personally.
    // If we want Admins to see EVERYTHING, they can use the Board view.
    // However, to satisfy "My Work", we filter by assignment regardless of role, 
    // but maybe allow Admins to see everything if they really want? 
    // The user's complaint suggests they WANT to see their assigned projects 
    // but they are getting lost or not showing up.
    
    const whereClause = {
      [Op.or]: [
        { assignedToId: userId },
        // Match numeric ID in JSON: {"id":1} or [1,2]
        { people: { [Op.like]: `%: ${userId},%` } },
        { people: { [Op.like]: `%: ${userId}}%` } },
        { people: { [Op.like]: `%[${userId},%` } },
        { people: { [Op.like]: `%,${userId},%` } },
        { people: { [Op.like]: `%,${userId}]%` } },
        { people: { [Op.like]: `[${userId}]` } },
        // Match string ID in JSON: {"id":"1"} or ["1","2"]
        { people: { [Op.like]: `%"${userId}"%` } },
        { person: userId }
      ]
    };

    // If Admin/Manager, maybe they WANT to see everything? 
    // But usually Dashboards are for "My Tasks".
    // Let's stick to assigned tasks for a cleaner dashboard.

    const items = await Item.findAll({
      where: whereClause,
      include: [
        {
          model: Group,
          include: [{ model: Board }]
        },
        { model: Item, as: 'parentItem' }
      ]
    });
    res.json(items);
  } catch (err) {
    console.error('Error in GET /my:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/items
router.post('/', [auth, checkBoardAccess], async (req, res) => {
  try {
    // Filter updates: fields in the model go to the root, others to customFields
    const modelFields = Object.keys(Item.rawAttributes);
    const updates = {};
    const customFields = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (modelFields.includes(key)) {
        updates[key] = value;
      } else if (key === 'time_tracking' && !req.body.timeTracking) {
        updates.timeTracking = value;
      } else {
        customFields[key] = value;
      }
    }

    // Auto-sync assignedToId from people list or person field if not explicitly provided
    let finalAssignedToId = updates.assignedToId;
    const hasPersonField = !!updates.person || !!updates.people; // CSV provided a person column
    if (!finalAssignedToId) {
      if (updates.people) {
        try {
          const pList = typeof updates.people === 'string' ? JSON.parse(updates.people) : updates.people;
          if (Array.isArray(pList) && pList.length > 0) {
            const first = pList[0];
            const candidateId = String(typeof first === 'object' ? first.id : first);
            // Only use if it looks like a real numeric user ID (not a long team ID or unknown string)
            if (candidateId && candidateId.length <= 10 && !isNaN(parseInt(candidateId))) {
              finalAssignedToId = candidateId;
            }
          }
        } catch (e) { }
      } else if (updates.person) {
        const personId = String(updates.person);
        // Only use if it's a valid numeric ID
        if (personId && personId.length <= 10 && !isNaN(parseInt(personId))) {
          finalAssignedToId = personId;
        }
      }
    }

    const itemData = {
      ...updates,
      customFields: Object.keys(customFields).length > 0 ? customFields : null,
      // Only fall back to the creator's ID if no person-related field was provided (i.e., not a CSV import)
      assignedToId: finalAssignedToId || (hasPersonField ? null : req.user.id),
      receivedDate: updates.receivedDate || new Date().toISOString(),
      status: updates.status || 'Working on it'
    };

    const item = await Item.create(itemData);

    // If assigned to someone, create notification
    const isTeamId = item.assignedToId && String(item.assignedToId).length > 10;
    if (item.assignedToId && item.assignedToId !== req.user.id && !isTeamId) {
      const groupData = await Group.findByPk(item.GroupId || item.groupId);
      const boardId = groupData ? groupData.BoardId : 'main';
      await Notification.create({
        UserId: item.assignedToId,
        content: `You have been assigned a new task: ${item.name}`,
        type: 'task_assigned',
        link: `/board/${boardId}/pulse/${item.id}`
      });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/items/:id
router.patch('/:id', [auth, checkBoardAccess], async (req, res) => {
  try {
    console.log(`[PATCH ITEM] ID: ${req.params.id} Body:`, JSON.stringify(req.body));
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const oldAssigneeId = item.assignedToId;
    const oldStatus = item.status;

    // Filter updates: fields in the model go to the root, others to customFields
    const modelFields = Object.keys(Item.rawAttributes);
    const updates = {};

    // Parse existing customFields if it's a string
    let customFields = item.customFields || {};
    if (typeof customFields === 'string') {
      try {
        customFields = JSON.parse(customFields);
      } catch (e) {
        customFields = {};
      }
    } else {
      // It's already an object, spread it to clone
      customFields = { ...customFields };
    }

    let hasCustomUpdates = false;

    for (const [key, value] of Object.entries(req.body)) {
      if (modelFields.includes(key)) {
        updates[key] = value;
      } else if (key === 'time_tracking' && !req.body.timeTracking) {
        // Alias for timeTracking database column
        updates.timeTracking = value;
      } else {
        // Stash unknown/dynamic fields in customFields
        customFields[key] = value;
        hasCustomUpdates = true;
      }
    }

    if (hasCustomUpdates) {
      updates.customFields = customFields;
    }

    await item.update(updates);

    // ─── SYNC: If 'people' column changed, extract IDs and notify each new person ───
    if (req.body.people !== undefined) {
      let peopleList = [];
      try {
        const raw = req.body.people;
        peopleList = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []);
      } catch (e) { peopleList = []; }

      // Extract IDs (supports both [{id, name}] and ["1","2"] formats)
      const newPeopleIds = peopleList
        .map(p => String(typeof p === 'object' ? p.id : p))
        .filter(id => id && id.length <= 10); // skip team IDs (>10 chars)

      // Auto-sync assignedToId to the first person in the list, or clear it if list is empty
      if (newPeopleIds.length > 0) {
        const firstPersonId = newPeopleIds[0];
        if (String(item.assignedToId) !== firstPersonId) {
          await item.update({ assignedToId: firstPersonId });
        }
      } else {
        // People list is now empty — clear assignedToId so the board disappears from user's view
        if (item.assignedToId) {
          await item.update({ assignedToId: null });
        }
      }

      // Get old people list to find newly added people
      let oldPeopleIds = [];
      try {
        const oldRaw = item.people;
        const oldList = Array.isArray(oldRaw) ? oldRaw : (typeof oldRaw === 'string' ? JSON.parse(oldRaw) : []);
        oldPeopleIds = oldList.map(p => String(typeof p === 'object' ? p.id : p));
      } catch (e) { oldPeopleIds = []; }

      // Send notification to newly added people
      for (const personId of newPeopleIds) {
        if (!oldPeopleIds.includes(personId) && personId !== String(req.user.id)) {
          try {
            const groupData = await Group.findByPk(item.GroupId || item.groupId);
            const boardId = groupData ? groupData.BoardId : 'main';
            await Notification.create({
              UserId: parseInt(personId),
              content: `You have been assigned a task: ${item.name}`,
              type: 'task_assigned',
              link: `/board/${boardId}/pulse/${item.id}`
            });
          } catch (e) { /* skip if user not found */ }
        }
      }
    }

    // ─── SYNC: If 'person' (legacy) column changed, also update assignedToId ───
    if (req.body.person !== undefined && req.body.assignedToId === undefined) {
      const personVal = req.body.person;
      // If cleared (null, empty string, 'null') → clear assignedToId
      if (!personVal || personVal === 'null' || personVal === '') {
        await item.update({ assignedToId: null });
      } else {
        const personId = String(personVal);
        if (personId && personId.length <= 10 && String(item.assignedToId) !== personId) {
          await item.update({ assignedToId: personId });
        }
      }
    }

    // ─── SYNC: If assignedToId is explicitly set to null/empty, ensure it's cleared ───
    if (req.body.assignedToId !== undefined && (!req.body.assignedToId || req.body.assignedToId === 'null')) {
      await item.update({ assignedToId: null });
    }

    // ─── If assignedToId changed (directly or via sync), notify the new user ───
    const currentAssignedId = String(item.assignedToId);
    const prevAssignedId = String(oldAssigneeId);
    const isTeamId = currentAssignedId && currentAssignedId.length > 10;

    if (currentAssignedId && currentAssignedId !== prevAssignedId && !isTeamId && currentAssignedId !== 'null' && currentAssignedId !== 'undefined') {
      const groupData = await Group.findByPk(item.GroupId || item.groupId);
      const boardId = groupData ? groupData.BoardId : 'main';
      try {
        await Notification.create({
          UserId: parseInt(currentAssignedId),
          content: `You have been assigned a task: ${item.name}`,
          type: 'task_assigned',
          link: `/board/${boardId}/pulse/${item.id}`
        });
      } catch (e) {
        console.error('[NOTIFICATION ERROR]', e);
      }
    }

    // If status changed to Done, notify Admins
    if (item.status === 'Done' && oldStatus !== 'Done') {
      const admins = await User.findAll({ where: { role: 'Admin' } });
      const completedBy = await User.findByPk(req.user.id); // Get user who made the change (from auth token)

      for (const admin of admins) {
        // Don't notify if the admin is the one who completed it (optional, but good UX)
        if (admin.id !== req.user.id) {
          const groupData = await Group.findByPk(item.GroupId || item.groupId);
          const boardId = groupData ? groupData.BoardId : 'main';
          await Notification.create({
            UserId: admin.id,
            content: `Task "${item.name}" marked as Done by ${completedBy ? completedBy.name : 'a user'}`,
            type: 'task_completed',
            link: `/board/${boardId}/pulse/${item.id}`
          });
        }
      }
    }

    res.json(item);
  } catch (err) {
    console.error('[PATCH ITEM ERROR]:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// @route   DELETE api/items/:id
router.delete('/:id', [auth, checkBoardAccess], async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // ONLY Admins, Managers, or the Board Coordinator (req.isCoordinator) can delete items
    // Regular assigned collaborators can only edit, not delete (Client requirement)
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && !req.isCoordinator) {
      return res.status(403).json({ msg: 'Access denied: Only coordinators and admins can delete data.' });
    }

    await item.destroy();
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/items/bulk/update
// @desc    Bulk update items (e.g. for cascading label cleanup)
router.patch('/bulk/update', auth, async (req, res) => {
  try {
    const { itemIds, updates, condition } = req.body;
    
    // Safety check: Don't allow empty updates AND empty condition
    if (!updates || (Object.keys(updates).length === 0 && !condition)) {
      return res.status(400).json({ msg: 'No updates provided' });
    }

    let whereClause = {};
    if (itemIds && Array.isArray(itemIds)) {
      whereClause.id = { [Op.in]: itemIds };
    } else if (condition) {
      whereClause = condition;
    } else {
      return res.status(400).json({ msg: 'No selection or condition provided' });
    }

    const [rowsAffected] = await Item.update(updates, { where: whereClause });
    res.json({ msg: 'Bulk update successful', rowsAffected });
  } catch (err) {
    console.error('[BULK UPDATE ERROR]:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

module.exports = router;
