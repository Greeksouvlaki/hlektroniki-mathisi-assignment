import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            const error = new Error('Access token required');
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        const decoded = jwt.verify(token, process.env['JWT_SECRET']);
        // Find user and attach to request
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        if (!user.isActive) {
            const error = new Error('User account is deactivated');
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            const appError = new Error('Invalid token');
            appError.statusCode = 401;
            appError.isOperational = true;
            next(appError);
        }
        else if (error instanceof jwt.TokenExpiredError) {
            const appError = new Error('Token expired');
            appError.statusCode = 401;
            appError.isOperational = true;
            next(appError);
        }
        else {
            next(error);
        }
    }
};
/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, process.env['JWT_SECRET']);
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id.toString();
        }
        next();
    }
    catch (error) {
        // Silently continue without authentication
        next();
    }
};
/**
 * Require specific user role
 */
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            error.isOperational = true;
            return next(error);
        }
        if (!roles.includes(req.user.role)) {
            const error = new Error('Insufficient permissions');
            error.statusCode = 403;
            error.isOperational = true;
            return next(error);
        }
        next();
    };
};
/**
 * Require student role
 */
export const requireStudent = requireRole(['student']);
/**
 * Require teacher role
 */
export const requireTeacher = requireRole(['teacher', 'admin']);
/**
 * Require admin role
 */
export const requireAdmin = requireRole(['admin']);
/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            const error = new Error('Refresh token required');
            error.statusCode = 400;
            error.isOperational = true;
            throw error;
        }
        const decoded = jwt.verify(refreshToken, process.env['JWT_REFRESH_SECRET']);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            const error = new Error('Invalid refresh token');
            error.statusCode = 401;
            error.isOperational = true;
            throw error;
        }
        req.body.userId = user._id.toString();
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            const appError = new Error('Invalid refresh token');
            appError.statusCode = 401;
            appError.isOperational = true;
            next(appError);
        }
        else {
            next(error);
        }
    }
};
//# sourceMappingURL=auth.js.map