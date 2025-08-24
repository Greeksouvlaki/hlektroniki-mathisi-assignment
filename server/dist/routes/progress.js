import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import '../models/Progress.js';
import '../models/Quiz.js';
import '../models/Module.js';
const router = Router();
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const { Progress } = await import('../models/Progress.js');
    const userId = req.user.id;
    const progress = await Progress['findByUser'](userId);
    res.status(200).json({
        success: true,
        data: progress,
        message: 'Progress retrieved successfully',
        timestamp: new Date().toISOString()
    });
}));
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { Progress } = await import('../models/Progress.js');
    const userId = req.user.id;
    const payload = req.body;
    const created = await Progress.create({ ...payload, userId, completedAt: payload.completedAt || new Date() });
    res.status(201).json({
        success: true,
        data: created,
        message: 'Progress recorded successfully',
        timestamp: new Date().toISOString()
    });
}));
/**
 * @swagger
 * /api/progress/stats:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { Progress } = await import('../models/Progress.js');
        const { Quiz } = await import('../models/Quiz.js');
        const { Module } = await import('../models/Module.js');
        const userId = req.user.id;
        // Get user's progress data
        const userProgress = await Progress.find({ userId });
        // Calculate statistics
        const totalTimeSpent = userProgress.reduce((sum, progress) => sum + (progress.timeSpent || 0), 0);
        const quizzesCompleted = userProgress.filter(p => p.quizId).length;
        const modulesCompleted = userProgress.filter(p => p.moduleId && !p.quizId).length;
        // Calculate average score from completed quizzes
        const completedQuizzes = userProgress.filter(p => p.quizId && p.percentage !== undefined);
        const averageScore = completedQuizzes.length > 0
            ? Math.round(completedQuizzes.reduce((sum, p) => sum + (p.percentage || 0), 0) / completedQuizzes.length)
            : 0;
        // Calculate current streak (simplified - in real app would check consecutive days)
        const streakDays = Math.min(quizzesCompleted + modulesCompleted, 7); // Simplified calculation
        // Get recent activity
        const recentActivity = userProgress
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .slice(0, 5);
        res.status(200).json({
            success: true,
            data: {
                totalTimeSpent,
                quizzesCompleted,
                modulesCompleted,
                averageScore,
                streakDays,
                recentActivity
            },
            message: 'Dashboard stats retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            timestamp: new Date().toISOString()
        });
    }
}));
// Alias to match client expectations
router.get('/analytics', authenticateToken, asyncHandler(async (req, res, next) => {
    req.url = '/stats';
    next();
}));
export default router;
//# sourceMappingURL=progress.js.map