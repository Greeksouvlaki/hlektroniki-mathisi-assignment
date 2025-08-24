import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthenticatedRequest, JwtPayload, AppError } from '../types/index.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const error = new Error('Access token required') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const decoded = jwt.verify(token, ((process.env as any)['JWT_SECRET'] as Secret)) as JwtPayload;
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('User account is deactivated') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    req.user = user as any;
    req.userId = (user._id as any).toString();
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const appError = new Error('Invalid token') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      next(appError);
    } else if (error instanceof jwt.TokenExpiredError) {
      const appError = new Error('Token expired') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      next(appError);
    } else {
      next(error);
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, ((process.env as any)['JWT_SECRET'] as Secret)) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user as any;
      req.userId = (user._id as any).toString();
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Require specific user role
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('Insufficient permissions') as AppError;
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
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token required') as AppError;
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const decoded = jwt.verify(refreshToken, ((process.env as any)['JWT_REFRESH_SECRET'] as Secret)) as JwtPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      const error = new Error('Invalid refresh token') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    req.body.userId = (user._id as any).toString();
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const appError = new Error('Invalid refresh token') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      next(appError);
    } else {
      next(error);
    }
  }
}; 