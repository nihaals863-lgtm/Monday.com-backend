const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'User' },
  avatar: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  permissions: { type: DataTypes.JSON }
}, {
  tableName: 'users'
});

const Board = sequelize.define('Board', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'board' }, // pipeline, ai-future, etc.
  workspace: { type: DataTypes.STRING, defaultValue: 'Main Workspace' },
  folder: { type: DataTypes.STRING, defaultValue: 'General' }, // Active Projects, Commercial, etc.
  columns: { type: DataTypes.JSON }, // Store column definitions: [{id: 'status', title: 'Status', type: 'status'}, ...]
  isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  ownerId: { type: DataTypes.STRING }, // New field for Board Owner/Coordinator
  viewConfig: { type: DataTypes.TEXT } // New field for storing view-specific settings
}, {
  tableName: 'boards'
});

const Folder = sequelize.define('Folder', {
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'folders'
});

const Group = sequelize.define('Group', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING }
}, {
  tableName: 'groups'
});

const Item = sequelize.define('Item', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING }, // Main status
  person: { type: DataTypes.STRING }, // Legacy string field, prefer assignedToId
  timeline: { type: DataTypes.STRING },
  receivedDate: { type: DataTypes.STRING },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  timeTracking: { type: DataTypes.STRING, defaultValue: '00:00:00' },
  plannedTime: { type: DataTypes.STRING, defaultValue: '00:00:00' },
  payment: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  isSubItem: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Flexible fields
  priority: { type: DataTypes.STRING },
  risk: { type: DataTypes.STRING }, // Low, Medium, High
  dealValue: { type: DataTypes.DECIMAL(10, 2) },
  dealStatus: { type: DataTypes.STRING }, // Lead, Negotiation, etc.
  invoiceSent: { type: DataTypes.BOOLEAN, defaultValue: false },
  aiModel: { type: DataTypes.STRING },
  source: { type: DataTypes.STRING }, // Lead source e.g. Instagram, Website
  urgency: { type: DataTypes.STRING }, // Priority e.g. Low, Medium, High
  expectedSubmissionDate: { type: DataTypes.STRING },
  dateSubmitted: { type: DataTypes.STRING }, // New field
  subitems: { type: DataTypes.STRING }, // New field for text representation
  revisionDates: { type: DataTypes.STRING },
  comments: { type: DataTypes.TEXT },
  comments2: { type: DataTypes.TEXT }, // New field
  isUnread: { type: DataTypes.BOOLEAN, defaultValue: false },
  people: { type: DataTypes.STRING }, // New field
  itemIdSerial: { type: DataTypes.STRING }, // New field (auto-generated in CSV)
  customFields: { type: DataTypes.JSON }, // For any extra data
  // New fields for ItemDetailPanel tabs
  updates: { type: DataTypes.TEXT }, // JSON string of updates array
  filesData: { type: DataTypes.TEXT }, // JSON string of files array (renamed to avoid collision with association)
  activity: { type: DataTypes.TEXT }, // JSON string of activity log array
  parentItemId: { type: DataTypes.BIGINT, allowNull: true }, // For subitems
  subItemsData: { type: DataTypes.TEXT }, // JSON string of subitems array (renamed to avoid collision with association)
  connectTasks: { type: DataTypes.TEXT }, // JSON string of connected tasks
  assignedToId: { type: DataTypes.STRING }, // Support for both User IDs (int) and Team IDs (string)
  phone: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  link: { type: DataTypes.TEXT } // Store as {url, text} JSON string
}, {
  tableName: 'items'
});

const Notification = sequelize.define('Notification', {
  content: { type: DataTypes.STRING, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  type: { type: DataTypes.STRING },
  link: { type: DataTypes.STRING }
}, {
  tableName: 'notifications'
});

const File = sequelize.define('File', {
  name: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: false }, // Cloudinary URL (long)
  cloudinaryId: { type: DataTypes.STRING },        // Cloudinary public_id for deletion
  size: { type: DataTypes.INTEGER },
  type: { type: DataTypes.STRING },
  uploadedBy: { type: DataTypes.STRING }
}, {
  tableName: 'files'
});

const Form = sequelize.define('Form', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  fields: { type: DataTypes.JSON }, // Store form structure as JSON
  settings: { type: DataTypes.JSON }, // Store success message, redirect url, etc.
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'forms'
});

const Automation = sequelize.define('Automation', {
  trigger: { type: DataTypes.STRING, allowNull: false },
  triggerValue: { type: DataTypes.STRING },
  action: { type: DataTypes.STRING, allowNull: false },
  actionValue: { type: DataTypes.STRING },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'automations'
});

const Role = sequelize.define('Role', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  permissions: { type: DataTypes.JSON, allowNull: false },
  isCustom: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'roles'
});

const Permission = sequelize.define('Permission', {
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  label: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'permissions'
});

const TimeSession = sequelize.define('TimeSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemId: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.BIGINT, allowNull: false },
  parentItemId: { type: DataTypes.STRING, allowNull: true },
  itemName: { type: DataTypes.STRING },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'time_sessions'
});

const Payroll = sequelize.define('Payroll', {
  name: { type: DataTypes.STRING, allowNull: false },
  employeeId: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  department: { type: DataTypes.STRING },
  totalWorkingDays: { type: DataTypes.INTEGER, defaultValue: 22 },
  presentDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  leaveDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  overtimeHours: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalWorkedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
  basicSalary: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  overtimeRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  performanceBonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  festivalBonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tdsPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  paymentStatus: { type: DataTypes.ENUM('Pending', 'Approved', 'Paid'), defaultValue: 'Pending' },
  paymentDate: { type: DataTypes.DATE },
  remarks: { type: DataTypes.TEXT },
  month: { type: DataTypes.STRING }, // e.g. "October 2024"
  year: { type: DataTypes.INTEGER }
}, {
  tableName: 'payroll'
});


// Associations
User.hasMany(Notification, { foreignKey: 'UserId' });
Notification.belongsTo(User, { foreignKey: 'UserId' });

Board.hasMany(Group, { as: 'Groups', foreignKey: 'BoardId', onDelete: 'CASCADE' });
Group.belongsTo(Board, { foreignKey: 'BoardId' });

Group.hasMany(Item, { as: 'items', foreignKey: 'GroupId', onDelete: 'CASCADE' });
Item.belongsTo(Group, { foreignKey: 'GroupId' });

Item.hasMany(Item, { as: 'subItems', foreignKey: 'parentItemId', onDelete: 'CASCADE' });
Item.belongsTo(Item, { as: 'parentItem', foreignKey: 'parentItemId' });

// Support both User assignments and pseudo-Team assignments by disabling strict foreign key constraints
User.hasMany(Item, { as: 'AssignedItems', foreignKey: 'assignedToId', constraints: false });
Item.belongsTo(User, { as: 'assignedUser', foreignKey: 'assignedToId', constraints: false });

Item.hasMany(File, { as: 'files', foreignKey: 'ItemId', onDelete: 'CASCADE' });
File.belongsTo(Item, { foreignKey: 'ItemId' });
User.hasMany(File, { foreignKey: 'userId', onDelete: 'CASCADE' });
File.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(Form, { foreignKey: 'BoardId', onDelete: 'CASCADE' });
Form.belongsTo(Board, { foreignKey: 'BoardId' });

User.hasMany(Automation, { foreignKey: 'UserId' });
Automation.belongsTo(User, { foreignKey: 'UserId' });

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Item.hasMany(TimeSession, { as: 'timeSessions', foreignKey: 'itemId', onDelete: 'CASCADE' });
TimeSession.belongsTo(Item, { foreignKey: 'itemId' });

// Associate session with the REAL parent record (for virtual subitems)
Item.hasMany(TimeSession, { as: 'childTimeSessions', foreignKey: 'parentItemId', onDelete: 'CASCADE' });
TimeSession.belongsTo(Item, { as: 'parentItem', foreignKey: 'parentItemId' });

User.hasMany(TimeSession, { as: 'timeSessions', foreignKey: 'userId', onDelete: 'CASCADE' });
TimeSession.belongsTo(User, { foreignKey: 'userId' });


module.exports = {
  sequelize,
  User,
  Board,
  Folder,
  Group,
  Item,
  Notification,
  File,
  Form,
  Automation,
  Role,
  Permission,
  TimeSession,
  Payroll
};

