const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { DataTypes, Op } = require('sequelize');

const app = express();

const allowedOrigins = [
  'https://mondaydotcom.kiaantechnology.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || origin.includes('railway.app')) {
      callback(null, true);
    } else {
      
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: "Monday.com Clone API is running", version: "1.0.0" });
});

// Global request logger
app.use((req, res, next) => {
  console.log(`[GLOBAL LOG] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/items', require('./routes/items'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));
app.use('/api/files', require('./routes/files'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/automations', require('./routes/automations'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/time', require('./routes/timeTracking'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/ai-projects', require('./routes/aiProjects'));


const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established.');

    // Helper: drop all foreign key constraints for a given column
    const dropFK = async (table, col) => {
      try {
        const [constraints] = await sequelize.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = '${table}' 
          AND COLUMN_NAME = '${col}' 
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        if (constraints && constraints.length > 0) {
          for (const c of constraints) {
            console.log(`Dropping FK constraint: ${c.CONSTRAINT_NAME} on ${table}.${col}`);
            await sequelize.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${c.CONSTRAINT_NAME}`).catch(() => { });
          }
        }
      } catch (err) { }
    };

    // SAFE MIGRATION: Add columns if they are missing
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tableInfo = await queryInterface.describeTable('items');
      const itemColumns = Object.keys(tableInfo).map(k => k.toLowerCase());

      const addCol = async (col, type, def = undefined) => {
        if (!itemColumns.includes(col.toLowerCase())) {
          console.log(`Adding missing column: ${col}`);
          const options = { type, allowNull: true };
          if (def !== undefined) options.defaultValue = def;
          await queryInterface.addColumn('items', col, options);
        }
      };

      await addCol('expectedSubmissionDate', DataTypes.STRING);
      await addCol('revisionDates', DataTypes.STRING);
      await addCol('comments', DataTypes.TEXT);
      await addCol('plannedTime', DataTypes.STRING, '00:00:00');
      await addCol('isUnread', DataTypes.BOOLEAN, false);
      await addCol('source', DataTypes.STRING);
      await addCol('urgency', DataTypes.STRING);
      await addCol('dealValue', DataTypes.DECIMAL(10, 2));
      await addCol('risk', DataTypes.STRING);
      await addCol('priority', DataTypes.STRING);
      await addCol('connectTasks', DataTypes.TEXT);
      await addCol('dateSubmitted', DataTypes.STRING);
      await addCol('comments2', DataTypes.TEXT);
      await addCol('people', DataTypes.STRING);
      await addCol('itemIdSerial', DataTypes.STRING);
      await addCol('subitems', DataTypes.STRING);
      await addCol('dealStatus', DataTypes.STRING);
      await addCol('invoiceSent', DataTypes.BOOLEAN, false);
      await addCol('aiModel', DataTypes.STRING);
      await addCol('customFields', DataTypes.JSON);
      await addCol('updates', DataTypes.TEXT);
      await addCol('filesData', DataTypes.TEXT);
      await addCol('activity', DataTypes.TEXT);
      await addCol('subItemsData', DataTypes.TEXT);
      await addCol('parentItemId', DataTypes.INTEGER);
      await addCol('payment', DataTypes.DECIMAL(10, 2), 0.00);
      await addCol('phone', DataTypes.STRING);
      await addCol('location', DataTypes.STRING);
      await addCol('link', DataTypes.TEXT);

      // Ensure assignedToId is STRING
      if (itemColumns.includes('assignedtoid')) {
        await dropFK('items', 'assignedToId');
        const actualKey = Object.keys(tableInfo).find(k => k.toLowerCase() === 'assignedtoid');
        if (tableInfo[actualKey].type.toLowerCase().includes('int')) {
          console.log('Migrating assignedToId to STRING');
          await queryInterface.changeColumn('items', 'assignedToId', { type: DataTypes.STRING, allowNull: true });
        }
      }

      // Migrate Item IDs to BIGINT
      if (tableInfo.id && tableInfo.id.type.toLowerCase().includes('int') && !tableInfo.id.type.toLowerCase().includes('big')) {
        console.log('Migrating items.id to BIGINT');
        // Must drop ALL referencing foreign keys first
        await dropFK('time_sessions', 'itemId');
        await dropFK('time_sessions', 'parentItemId');
        await dropFK('files', 'ItemId');
        await dropFK('items', 'parentItemId');

        // Use raw query for MySQL to avoid "Multiple primary key" issue with changeColumn
        await sequelize.query('ALTER TABLE items MODIFY id BIGINT NOT NULL AUTO_INCREMENT');
      }
      if (tableInfo.parentItemId && tableInfo.parentItemId.type.toLowerCase().includes('int') && !tableInfo.parentItemId.type.toLowerCase().includes('big')) {
        console.log('Migrating items.parentItemId to BIGINT');
        await queryInterface.changeColumn('items', 'parentItemId', { type: DataTypes.BIGINT, allowNull: true });
      }

      // Payroll migrations
      try {
        const payrollInfo = await queryInterface.describeTable('payroll');
        const payrollCols = Object.keys(payrollInfo).map(k => k.toLowerCase());

        if (!payrollCols.includes('performancebonus')) {
          console.log('Adding missing column: performanceBonus to payroll');
          await queryInterface.addColumn('payroll', 'performanceBonus', { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 });
        }
        if (!payrollCols.includes('festivalbonus')) {
          console.log('Adding missing column: festivalBonus to payroll');
          await queryInterface.addColumn('payroll', 'festivalBonus', { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 });
        }
      } catch (err) { }

      console.log('✅ All item table migrations completed.');
    } catch (error) {
      console.warn('⚠️  Table migration failed:', error.message);
    }

    // Boards Migrations
    try {
      const queryInterface2 = sequelize.getQueryInterface();
      const boardTableInfo = await queryInterface2.describeTable('boards');
      const boardColumns = Object.keys(boardTableInfo).map(k => k.toLowerCase());

      if (!boardColumns.includes('isfavorite')) {
        console.log('Adding missing column: isFavorite to boards');
        await queryInterface2.addColumn('boards', 'isFavorite', { type: DataTypes.BOOLEAN, defaultValue: false });
      }
      if (!boardColumns.includes('isarchived')) {
        console.log('Adding missing column: isArchived to boards');
        await queryInterface2.addColumn('boards', 'isArchived', { type: DataTypes.BOOLEAN, defaultValue: false });
      }
      if (!boardColumns.includes('viewconfig')) {
        console.log('Adding missing column: viewConfig to boards');
        await queryInterface2.addColumn('boards', 'viewConfig', { type: DataTypes.TEXT, allowNull: true });
      }
      if (!boardColumns.includes('ownerid')) {
        console.log('Adding missing column: ownerId to boards');
        await queryInterface2.addColumn('boards', 'ownerId', { type: DataTypes.STRING, allowNull: true });
      }
      console.log('✅ Boards table migrations completed successfully.');
    } catch (error) {
      console.warn('⚠️  Boards table migration skipped:', error.message);
    }

    // Users Migrations
    try {
      const queryInterface3 = sequelize.getQueryInterface();
      const userTableInfo = await queryInterface3.describeTable('users');
      const userColumns = Object.keys(userTableInfo).map(k => k.toLowerCase());

      if (!userColumns.includes('roleid')) {
        console.log('Adding missing column: roleId to users');
        await queryInterface3.addColumn('users', 'roleId', { type: DataTypes.INTEGER, allowNull: true });
      }
      if (!userColumns.includes('permissions')) {
        console.log('Adding missing column: permissions to users');
        await queryInterface3.addColumn('users', 'permissions', { type: DataTypes.JSON, allowNull: true });
      }
      if (!userColumns.includes('phone')) {
        console.log('Adding missing column: phone to users');
        await queryInterface3.addColumn('users', 'phone', { type: DataTypes.STRING, allowNull: true });
      }
      if (!userColumns.includes('address')) {
        console.log('Adding missing column: address to users');
        await queryInterface3.addColumn('users', 'address', { type: DataTypes.STRING, allowNull: true });
      }
      if (!userColumns.includes('status')) {
        console.log('Adding missing column: status to users');
        await queryInterface3.addColumn('users', 'status', { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' });
      }

      // Migrate role from ENUM to STRING
      if (userTableInfo.role && userTableInfo.role.type.toLowerCase().includes('enum')) {
        console.log('Migrating users.role from ENUM to STRING');
        await queryInterface3.changeColumn('users', 'role', { type: DataTypes.STRING, defaultValue: 'User' });
      }

      // Migrate User IDs to BIGINT
      if (userTableInfo.id && userTableInfo.id.type.toLowerCase().includes('int') && !userTableInfo.id.type.toLowerCase().includes('big')) {
        console.log('Migrating users.id to BIGINT');
        await dropFK('notifications', 'UserId');
        await dropFK('boards', 'ownerId');
        await dropFK('time_sessions', 'userId');
        await dropFK('files', 'userId');
        await sequelize.query('ALTER TABLE users MODIFY id BIGINT NOT NULL AUTO_INCREMENT');
      }

      console.log('✅ Users table migrations completed successfully.');
    } catch (error) {
      console.warn('⚠️  Users table migration skipped or failed:', error.message);
    }

    // Roles Migrations
    try {
      const queryInterface4 = sequelize.getQueryInterface();
      const roleTableInfo = await queryInterface4.describeTable('roles');
      const roleColumns = Object.keys(roleTableInfo).map(k => k.toLowerCase());

      if (!roleColumns.includes('permissions')) {
        console.log('Adding missing column: permissions to roles');
        await queryInterface4.addColumn('roles', 'permissions', { type: DataTypes.JSON, allowNull: true });
      }
      console.log('✅ Roles table migrations completed successfully.');
    } catch (error) {
      console.warn('⚠️  Roles table migration skipped or failed:', error.message);
    }

    // Forms Migrations
    try {
      const queryInterfaceF = sequelize.getQueryInterface();
      const formTableInfo = await queryInterfaceF.describeTable('forms');
      const formColumns = Object.keys(formTableInfo).map(k => k.toLowerCase());

      if (!formColumns.includes('boardid')) {
        console.log('Adding missing column: BoardId to forms');
        await queryInterfaceF.addColumn('forms', 'BoardId', { type: DataTypes.BIGINT, allowNull: true });
      }
      if (!formColumns.includes('settings')) {
        console.log('Adding missing column: settings to forms');
        await queryInterfaceF.addColumn('forms', 'settings', { type: DataTypes.JSON, allowNull: true });
      }
      console.log('✅ Forms table migrations completed successfully.');
    } catch (error) {
      console.warn('⚠️  Forms table migration failed:', error.message);
    }

    // TimeSessions Migrations
    try {
      const queryInterface5 = sequelize.getQueryInterface();
      const timeTableInfo = await queryInterface5.describeTable('time_sessions');
      const timeColumns = Object.keys(timeTableInfo).map(k => k.toLowerCase());

      const isIntButNotBig = (colInfo) => {
        if (!colInfo) return false;
        const type = colInfo.type.toLowerCase();
        return type.includes('int') && !type.includes('big');
      };

      if (isIntButNotBig(timeTableInfo.itemId) || (timeTableInfo.itemId && timeTableInfo.itemId.type.toLowerCase().includes('bigint'))) {
        console.log('Migrating time_sessions.itemId to VARCHAR');
        await dropFK('time_sessions', 'itemId');
        await queryInterface5.changeColumn('time_sessions', 'itemId', { type: DataTypes.STRING, allowNull: false });
        console.log('✅ time_sessions.itemId migrated.');
      }
      if (isIntButNotBig(timeTableInfo.userId)) {
        console.log('Migrating time_sessions.userId from INT to BIGINT');
        await dropFK('time_sessions', 'userId');
        await queryInterface5.changeColumn('time_sessions', 'userId', { type: DataTypes.BIGINT, allowNull: false });
        console.log('✅ time_sessions.userId migrated.');
      }

      // Force add/change parentItemId to time_sessions
      try {
        await sequelize.query('ALTER TABLE time_sessions ADD COLUMN parentItemId VARCHAR(255) NULL').catch(async err => {
          if (err.message.includes('duplicate column')) {
            // If it exists but is BIGINT, we might need to change it
            if (timeTableInfo.parentitemid && timeTableInfo.parentitemid.type.toLowerCase().includes('int')) {
              console.log('Migrating time_sessions.parentItemId to VARCHAR');
              await queryInterface5.changeColumn('time_sessions', 'parentItemId', { type: DataTypes.STRING, allowNull: true });
            }
          } else {
            console.warn('Silent parentItemId add/sync:', err.message);
          }
        });
        console.log('✅ Checked time_sessions.parentItemId');
      } catch (err) { }

      // Force add itemName to time_sessions
      try {
        await sequelize.query('ALTER TABLE time_sessions ADD COLUMN itemName VARCHAR(255) NULL').catch(err => {
          if (!err.message.includes('duplicate column')) {
            console.warn('Silent itemName add:', err.message);
          }
        });
        console.log('✅ Checked time_sessions.itemName');
      } catch (err) { }

      // 1. Backfill parentItemId
      await sequelize.query('UPDATE time_sessions SET parentItemId = itemId WHERE parentItemId IS NULL');

      // 2. Backfill itemName for standard items
      await sequelize.query(`
        UPDATE time_sessions ts
        JOIN items i ON ts.itemId = i.id
        SET ts.itemName = i.name
        WHERE ts.itemName IS NULL
      `);

      // 3. Backfill itemName for virtual subitems (deep parse subItemsData)
      // 3. Backfill itemName for virtual subitems
      try {
        const [itemsWithSubData] = await sequelize.query('SELECT id, subItemsData FROM items WHERE subItemsData IS NOT NULL');

        for (const parent of itemsWithSubData) {
          try {
            const subItems = JSON.parse(parent.subItemsData);
            if (Array.isArray(subItems)) {
              for (const sub of subItems) {
                if (sub.id && sub.name) {
                  await sequelize.query('UPDATE time_sessions SET itemName = :name WHERE itemId = :id AND itemName IS NULL', {
                    replacements: { name: sub.name, id: sub.id }
                  });
                }
              }
            }
          } catch (e) { }
        }
      } catch (e) {
        console.warn('Virtual subitem backfill failed:', e.message);
      }

      // 4. Purge orphaned sessions (only for numeric IDs that are real items)
      try {
        console.log('Purging orphaned time sessions...');
        await sequelize.query(`
          DELETE FROM time_sessions 
          WHERE parentItemId REGEXP '^[0-9]+$'
          AND parentItemId NOT IN (SELECT id FROM items)
        `);
      } catch (err) { }

      console.log('✅ TimeSessions table migrations and full data cleanup completed.');
    } catch (error) {
      console.warn('⚠️  TimeSessions table migration failed:', error.message);
    }

    // Files Table Migrations (Cloudinary support)
    try {
      const qiFiles = sequelize.getQueryInterface();
      const filesTableInfo = await qiFiles.describeTable('files');
      const filesCols = Object.keys(filesTableInfo).map(k => k.toLowerCase());

      // Add cloudinaryId column if missing (stores Cloudinary public_id for deletion)
      if (!filesCols.includes('cloudinaryid')) {
        console.log('Adding missing column: cloudinaryId to files');
        await qiFiles.addColumn('files', 'cloudinaryId', { type: DataTypes.STRING, allowNull: true });
      }

      // Upgrade url column from VARCHAR to TEXT to support long Cloudinary URLs
      if (filesTableInfo.url && filesTableInfo.url.type.toLowerCase().includes('varchar')) {
        console.log('Upgrading files.url from VARCHAR to TEXT for Cloudinary URLs');
        await sequelize.query('ALTER TABLE files MODIFY url TEXT NOT NULL');
      }

      console.log('✅ Files table migrations completed successfully.');
    } catch (error) {
      console.warn('⚠️  Files table migration failed:', error.message);
    }

    return sequelize.sync();
  })
  .then(async () => {
    console.log('Database synced');

    // Seed Permissions
    const { Permission, Role } = require('./models');
    const existingPermCount = await Permission.count();
    if (existingPermCount === 0) {
      console.log('Seeding default permissions...');
      const defaultPerms = [
        { category: 'Account Settings', key: 'inviteUsers', label: 'Invite new team members' },
        { category: 'Account Settings', key: 'uploadFiles', label: 'Upload files to boards' },
        { category: 'Account Settings', key: 'deleteFiles', label: 'Permanently delete files' },
        { category: 'Account Settings', key: 'createWorkspaces', label: 'Create new workspaces' },
        { category: 'Board Management', key: 'createMainBoards', label: 'Create new boards' },
        { category: 'Board Management', key: 'deleteSelfOwnedBoards', label: 'Archive or delete self-owned boards' },
        { category: 'Board Management', key: 'createBoardViews', label: 'Create board views (Dashboard, Table, etc.)' },
        { category: 'Board Management', key: 'exportExcel', label: 'Export board data to Excel' },
        { category: 'Board Management', key: 'moveGroups', label: 'Move groups between boards' },
        { category: 'Item Management', key: 'deleteSelfItems', label: 'Delete self-created items' },
        { category: 'Item Management', key: 'deleteOtherItems', label: 'Delete items created by other users' },
        { category: 'Item Management', key: 'moveItems', label: 'Move items to different boards' },
        { category: 'User & Team Management', key: 'manageMembers', label: 'Manage team members' },
        { category: 'User & Team Management', key: 'viewTeams', label: 'View user profile pages' },
        { category: 'User & Team Management', key: 'editRoles', label: 'Modify user roles and permissions' }
      ];
      // Use ignoreDuplicates to avoid ER_DUP_ENTRY if some perms were already created
      await Permission.bulkCreate(defaultPerms, { ignoreDuplicates: true });
      console.log('✅ Permissions seeded.');
    }

    // Seed Roles
    const existingRoleCount = await Role.count();
    if (existingRoleCount === 0) {
      console.log('Seeding default roles...');
      const permsDefinitions = await Permission.findAll();
      const defaultPermsMap = {};
      permsDefinitions.forEach(p => defaultPermsMap[p.key] = false);

      const adminPerms = {};
      permsDefinitions.forEach(p => adminPerms[p.key] = true);

      const defaultRoles = [
        { name: 'Admin', permissions: adminPerms, isCustom: false },
        { name: 'Member', permissions: defaultPermsMap, isCustom: false },
        { name: 'Viewer', permissions: defaultPermsMap, isCustom: false },
        { name: 'Guest', permissions: defaultPermsMap, isCustom: false }
      ];
      // Use ignoreDuplicates for safety
      await Role.bulkCreate(defaultRoles, { ignoreDuplicates: true });
      console.log('✅ Roles seeded.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// 404 Handler - MUST BE LAST
app.use((req, res) => {
  console.log(`[404 ERROR] No route found for: ${req.method} ${req.url}`);
  res.status(404).json({
    msg: "Requested endpoint not found",
    method: req.method,
    path: req.url
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
