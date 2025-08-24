import { Router } from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { mockModules } from '../services/mockData.js';

const router = Router();

router.get('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  try {
    let modules;
    
    try {
      const { Module } = await import('../models/Module.js');
      
      modules = await Module.find({ isActive: true })
        .select('title description difficulty subject estimatedDuration content')
        .lean();
    } catch (error) {
      // If database is not available, use mock data
      modules = mockModules;
    }
    
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

router.get('/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { Module } = await import('../models/Module.js');
  const moduleDoc = await Module.findById(req.params.id);
  if (!moduleDoc) {
    return res.status(404).json({ success: false, error: 'Module not found', timestamp: new Date().toISOString() });
  }
  res.status(200).json({
    success: true,
    data: moduleDoc,
    message: 'Module retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

router.post('/', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Module } = await import('../models/Module.js');
  const created = await Module.create({ ...req.body, createdBy: (req as any).user.id });
  res.status(201).json({
    success: true,
    data: created,
    message: 'Module created successfully',
    timestamp: new Date().toISOString()
  });
}));

router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Module } = await import('../models/Module.js');
  const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({
    success: true,
    data: updated,
    message: 'Module updated successfully',
    timestamp: new Date().toISOString()
  });
}));

router.delete('/:id', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Module } = await import('../models/Module.js');
  await Module.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Module deleted successfully',
    timestamp: new Date().toISOString()
  });
}));

// Record module progress (client expects this)
router.post('/:id/progress', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { Progress } = await import('../models/Progress.js');
  const userId = (req as any).user.id;
  const moduleId = req.params.id;
  const { completedSections = [], timeSpent = 0, completed = false } = req.body;
  const created = await Progress.create({
    userId,
    moduleId,
    score: completed ? 100 : 0,
    maxScore: 100,
    percentage: completed ? 100 : 0,
    timeSpent,
    completedAt: new Date(),
    adaptiveData: {
      difficultyLevel: 'easy',
      masteryLevel: completed ? 1 : 0,
      confidenceScore: completed ? 1 : 0.5,
      learningPath: [],
      recommendations: []
    }
  });
  res.status(201).json({ success: true, data: created, message: 'Module progress recorded', timestamp: new Date().toISOString() });
}));

export default router; 
 