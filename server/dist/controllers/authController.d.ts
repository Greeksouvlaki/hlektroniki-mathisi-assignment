import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
/**
 * Register new user
 * POST /api/auth/register
 */
export declare const register: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
/**
 * Login user
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export declare const refreshToken: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
/**
 * Get current user profile
 * GET /api/auth/me
 */
export declare const getProfile: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export declare const logout: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
/**
 * Change password
 * PUT /api/auth/change-password
 */
export declare const changePassword: (req: Request, res: Response<ApiResponse>, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map