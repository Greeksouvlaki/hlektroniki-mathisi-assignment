import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
/**
 * Verify JWT token and attach user to request
 */
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication - doesn't fail if no token provided
 */
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Require specific user role
 */
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Require student role
 */
export declare const requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Require teacher role
 */
export declare const requireTeacher: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Require admin role
 */
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map