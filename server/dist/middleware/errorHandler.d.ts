import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../types/index.js';
/**
 * Global error handling middleware
 */
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response<ApiResponse>, next: NextFunction) => void;
/**
 * Async error wrapper
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Not found middleware
 */
export declare const notFound: (req: Request, res: Response<ApiResponse>, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map