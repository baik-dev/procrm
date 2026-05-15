// src/utils/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Operational / known errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists (duplicate field)' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Generic server error
  console.error('❌ Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    ...(isDev && { details: err.message }),
  });
}

module.exports = { AppError, errorHandler };
