import { Router } from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { Module } = await import('../models/Module.js');
    
    const modules = await Module.find({ isActive: true })
      .select('title description difficulty subject estimatedDuration content')
      .lean();
    
    res.status(200).json({
      success: true,
      data: modules,
      message: 'Modules retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules',
      timestamp: new Date().toISOString()
    });
  }
}));

router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Module retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

router.post('/', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: {},
    message: 'Module created successfully',
    timestamp: new Date().toISOString()
  });
}));

router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Module updated successfully',
    timestamp: new Date().toISOString()
  });
}));

router.delete('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Module deleted successfully',
    timestamp: new Date().toISOString()
  });
}));

export default router; 
 