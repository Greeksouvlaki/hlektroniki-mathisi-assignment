import { logger } from '../utils/logger.js';
/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    // Handle known operational errors
    if (error instanceof Error && 'statusCode' in error) {
        const appError = error;
        statusCode = appError.statusCode || 500;
        message = appError.message || 'An error occurred';
        isOperational = appError.isOperational || false;
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        isOperational = true;
    }
    // Handle Mongoose duplicate key errors
    if (error.name === 'MongoError' && error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value entered';
        isOperational = true;
    }
    // Handle Mongoose cast errors
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        isOperational = true;
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        isOperational = true;
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        isOperational = true;
    }
    // Log error
    if (isOperational) {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    else {
        logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${error.stack}`);
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...((process.env['NODE_ENV'] === 'development') && {
            stack: error.stack,
            details: error.message
        }),
        timestamp: new Date().toISOString()
    });
};
/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Not found middleware
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
};
//# sourceMappingURL=errorHandler.js.map