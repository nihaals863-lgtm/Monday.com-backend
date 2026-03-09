const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load full user with role and permissions
    const user = await User.findByPk(decoded.user.id, {
      include: [{ model: Role }]
    });

    if (!user) {
      return res.status(401).json({ msg: 'Token is valid but user no longer exists' });
    }

    // Merge permissions: Role permissions + User-specific overrides
    let basePermissions = {};
    if (user.Role && user.Role.permissions) {
      basePermissions = typeof user.Role.permissions === 'string'
        ? JSON.parse(user.Role.permissions)
        : user.Role.permissions;
    }

    let userPermissions = {};
    if (user.permissions) {
      userPermissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;
    }

    // Combine them (User permissions override Role permissions)
    const mergedPermissions = { ...basePermissions, ...userPermissions };

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // String role (Admin, User, etc.)
      roleId: user.roleId,
      permissions: mergedPermissions
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
