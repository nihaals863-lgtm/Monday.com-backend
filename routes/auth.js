const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('[LOGIN] Request received:', { email, passwordProvided: !!password });

  // Validate input
  if (!email || !password) {
    console.log('[LOGIN] Missing email or password');
    return res.status(400).json({ msg: 'Please provide both email and password' });
  }

  try {
    const { Role } = require('../models');
    let user = await User.findOne({
      where: { email },
      include: [{ model: Role }]
    });
    console.log('[LOGIN] User lookup result:', user ? `Found user: ${user.email}` : 'User not found');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
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

    const mergedPermissions = { ...basePermissions, ...userPermissions };

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' }, (err, token) => {
      if (err) {
        console.error('[LOGIN] JWT signing error:', err);
        throw err;
      }
      console.log('[LOGIN] Login successful for:', user.email);
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleId: user.roleId,
          avatar: user.avatar,
          permissions: mergedPermissions
        }
      });
    });
  } catch (err) {
    console.error('[LOGIN] Server error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
