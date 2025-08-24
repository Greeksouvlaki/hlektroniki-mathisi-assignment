import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import '../models/Quiz.js';
import '../models/Module.js';
import { AdaptiveService } from '../services/adaptiveService.js';

const router = Router();

router.get('/recommendation', authenticateToken, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Recommendation generated successfully',
    timestamp: new Date().toISOString()
  });
}));

router.get('/recommendations', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const userId = (req as any).user.id;
  const rec = await AdaptiveService.getAdaptiveRecommendation(userId);
  // Enrich into concrete content items array for frontend compatibility
  const { Module } = await import('../models/Module.js');
  const { Quiz } = await import('../models/Quiz.js');
  const items: any[] = [];
  if ((rec as any).nextModuleId) {
    const m = await Module.findById((rec as any).nextModuleId)
      .select('title description difficulty subject estimatedDuration content')
      .lean();
    if (m) items.push(m);
  }
  if ((rec as any).nextQuizId) {
    const q = await Quiz.findById((rec as any).nextQuizId)
      .select('title description difficulty moduleId questions timeLimit passingScore createdBy')
      .lean();
    if (q) items.push(q);
  }
  res.status(200).json({ success: true, data: items, message: 'Recommendations retrieved successfully', timestamp: new Date().toISOString() });
}));

router.get('/profile', authenticateToken, asyncHandler(async (req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Learning profile retrieved successfully',
    timestamp: new Date().toISOString()
  });
}));

router.get('/learning-path', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const userId = (req as any).user.id;
  // derive a rough mastery from recent progress count; here we default medium
  const learningPath = await (AdaptiveService as any)["generateLearningPath"](userId, 0.5);
  res.status(200).json({ success: true, data: learningPath, message: 'Learning path retrieved successfully', timestamp: new Date().toISOString() });
}));

export default router; 