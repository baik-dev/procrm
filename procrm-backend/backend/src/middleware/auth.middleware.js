// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/generateToken');
const { AppError }    = require('../utils/errorHandler');
const prisma          = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Re-fetch user from DB so revoked/deactivated accounts are blocked immediately
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, company_id: true, name: true,
        email: true, role: true, status: true,
      },
    });

    if (!user) throw new AppError('User not found', 401);
    if (user.status === 'inactive') throw new AppError('Account is deactivated', 403);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
