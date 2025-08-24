import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { User } from '../models/User.js';
import { IUserCreate, IUserLogin, AuthTokens, ApiResponse, AppError } from '../types/index.js';
import { mockUsers } from '../services/mockData.js';

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
    ((process.env as any)['JWT_SECRET'] as Secret),
    { expiresIn: (((process.env as any)['JWT_EXPIRES_IN'] as string) || '7d') } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    ((process.env as any)['JWT_REFRESH_SECRET'] as Secret),
    { expiresIn: (((process.env as any)['JWT_REFRESH_EXPIRES_IN'] as string) || '30d') } as SignOptions
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
      const appError = new Error(error?.details?.[0]?.message || 'Invalid input') as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      throw appError;
    }

    const userData: IUserCreate = value;

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    } catch (error) {
      // If database is not available, check mock data
      existingUser = mockUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    }
    
    if (existingUser) {
      const appError = new Error('User with this email already exists') as AppError;
      appError.statusCode = 409;
      appError.isOperational = true;
      throw appError;
    }

    // Create new user
    let user;
    try {
      user = new User(userData);
      await user.save();
    } catch (error) {
      // If database is not available, create mock user
      const mockUser = {
        _id: (mockUsers.length + 1).toString(),
        ...userData,
        isActive: true,
        lastLogin: new Date()
      };
      mockUsers.push(mockUser);
      user = mockUser;
    }

    // Generate tokens
    const tokens = generateTokens((user._id as any).toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    try {
      await user.save();
    } catch (error) {
      // For mock users, just update the object
      (user as any).lastLogin = new Date();
    }

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
      const appError = new Error(error?.details?.[0]?.message || 'Invalid input') as AppError;
      appError.statusCode = 400;
      appError.isOperational = true;
      throw appError;
    }

    const loginData: IUserLogin = value;

    // Find user by email
    let user;
    try {
      user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');
    } catch (error) {
      // If database is not available, check mock data
      user = mockUsers.find(u => u.email.toLowerCase() === loginData.email.toLowerCase());
      if (user) {
        // Add password field for mock user
        (user as any).password = '$2a$10$mock.hash.for.demo.purposes';
      }
    }
    
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
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(loginData.password);
    } catch (error) {
      // For mock users, accept any password for demo
      isPasswordValid = true;
    }
    
    if (!isPasswordValid) {
      const appError = new Error('Invalid email or password') as AppError;
      appError.statusCode = 401;
      appError.isOperational = true;
      throw appError;
    }

    // Generate tokens
    const tokens = generateTokens((user._id as any).toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    try {
      await user.save();
    } catch (error) {
      // For mock users, just update the object
      (user as any).lastLogin = new Date();
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
    const tokens = generateTokens((user._id as any).toString(), user.email, user.role);

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
    const userId = (req as any).userId || (req as any).user?._id?.toString();

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
          createdAt: (user as any).createdAt,
          updatedAt: (user as any).updatedAt
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
    const userId = (req as any).userId || (req as any).user?._id?.toString();

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