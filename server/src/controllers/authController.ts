import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { User } from '../models/User.js';
import { IUserCreate, IUserLogin, AuthTokens, ApiResponse, AppError } from '../types/index.js';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  role: Joi.string().valid('student', 'teacher', 'admin').default('student').messages({
    'any.only': 'Role must be student, teacher, or admin'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * Generate JWT tokens
 */
const generateTokens = (userId: string, email: string, role: string): AuthTokens => {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
  };
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const appError = new Error(error.details[0].message) as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      throw appError;
    }

    const userData: IUserCreate = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      const appError = new Error('User with this email already exists') as AppError;
      appError.statusCode = 409;
      appError.isOperational = true;
      throw appError;
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        tokens
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const appError = new Error(error.details[0].message) as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      throw appError;
    }

    const loginData: IUserLogin = value;

    // Find user by email
    const user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');
    if (!user) {
      const appError = new Error('Invalid email or password') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Check if user is active
    if (!user.isActive) {
      const appError = new Error('Account is deactivated') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      const appError = new Error('Invalid email or password') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        tokens
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      const appError = new Error('Invalid refresh token') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    res.status(200).json({
      success: true,
      data: {
        tokens
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      const appError = new Error('User not found') as AppError;
      appError.statusCode = 404;
      appError.isOperational = true;
      throw appError;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: 'Profile retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Server could maintain a blacklist of tokens if needed
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.body.userId;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      const appError = new Error('New password must be at least 8 characters long') as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      throw appError;
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const appError = new Error('User not found') as AppError;
      appError.statusCode = 404;
      appError.isOperational = true;
      throw appError;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      const appError = new Error('Current password is incorrect') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}; 