import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/recommendation', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Recommendation generated successfully',
    timestamp: new Date().toISOString()
  });
}));

router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Learning profile retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

export default router; 