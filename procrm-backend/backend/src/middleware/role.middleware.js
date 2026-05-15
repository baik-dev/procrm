// src/middleware/role.middleware.js
const { AppError } = require('../utils/errorHandler');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }
    next();
  };
}

const requireAdmin   = requireRole('admin');
const requireManager = requireRole('admin', 'manager');

module.exports = { requireRole, requireAdmin, requireManager };
