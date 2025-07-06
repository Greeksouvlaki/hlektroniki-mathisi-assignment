import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'Progress retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: {},
    message: 'Progress recorded successfully',
    timestamp: new Date().toISOString()
  });
}));

router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Statistics retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

export default router; 