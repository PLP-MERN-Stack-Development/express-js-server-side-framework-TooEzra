// middleware.js - Custom middleware functions

// Custom error classes
class NotFoundError extends Error {
    constructor(message) {
    super(message);
    this.statusCode = 404;
}
}

class ValidationError extends Error {
    constructor(message) {
    super(message);
    this.statusCode = 400;
}
}

// Custom logger middleware
const logger = (req, res, next) => {
    console.log('${new Date().toISOString()} - ${req.method} ${req.url}');
    next();
};

// Authentication middleware (API key: 'secretkey' in x-api-key header)
const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'secretkey') {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    next();
};

// Validation middleware for product create/update
const validateProduct = (req, res, next) => {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || price === undefined || !category || inStock === undefined) {
    throw new ValidationError('Missing required fields: name, description, price, category, inStock');
  }
  if (typeof price !== 'number' || price < 0) {
    throw new ValidationError('Price must be a positive number');
  }
  if (typeof inStock !== 'boolean') {
    throw new ValidationError('inStock must be a boolean');
  }
  next();
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = { logger, authenticate, validateProduct, globalErrorHandler, NotFoundError, ValidationError };