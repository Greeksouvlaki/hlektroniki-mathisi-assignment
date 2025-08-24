import { Router } from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import '../models/Module.js';
import '../models/User.js';
import { mockQuizzes } from '../services/mockData.js';

const router = Router();

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Filter by module ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 */
router.get('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  try {
    let quizzes;
    
    try {
      const { Quiz } = await import('../models/Quiz.js');
      
      // Build query based on filters
      const query: any = { isActive: true };
      
      if (req.query.moduleId) {
        query.moduleId = req.query.moduleId;
      }
      
      if (req.query.difficulty) {
        query.difficulty = req.query.difficulty;
      }
      
      // Get quizzes from database
      quizzes = await Quiz.find(query)
        .select('-questions.correctAnswer') // Don't send correct answers to client
        .populate('moduleId', 'title')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    } catch (error) {
      // If database is not available, use mock data
      quizzes = mockQuizzes.filter(quiz => {
        if (req.query.moduleId && quiz.moduleId !== req.query.moduleId) return false;
        if (req.query.difficulty && quiz.difficulty !== req.query.difficulty) return false;
        return true;
      });
    }
    
    res.status(200).json({
      success: true,
      data: quizzes,
      message: 'Quizzes retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 */
router.get('/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  try {
    const { Quiz } = await import('../models/Quiz.js');
    
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId).lean();
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      data: quiz,
      message: 'Quiz retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - moduleId
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               moduleId:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */
router.post('/', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Quiz } = await import('../models/Quiz.js');
  const created = await Quiz.create({ ...req.body, createdBy: (req as any).user.id });
  res.status(201).json({
    success: true,
    data: created,
    message: 'Quiz created successfully',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 */
router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Quiz } = await import('../models/Quiz.js');
  const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({
    success: true,
    data: updated,
    message: 'Quiz updated successfully',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 */
router.delete('/:id', authenticateToken, requireTeacher, asyncHandler(async (req: any, res: any) => {
  const { Quiz } = await import('../models/Quiz.js');
  await Quiz.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Quiz deleted successfully',
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *               - timeSpent
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *               timeSpent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 */
router.post('/:id/submit', authenticateToken, asyncHandler(async (req: any, res: any) => {
  try {
    const { Quiz } = await import('../models/Quiz.js');
    const { Progress } = await import('../models/Progress.js');
    const { XAPIService } = await import('../services/xapiService.js');
    const { User } = await import('../models/User.js');
    
    const quizId = req.params.id;
    const userId = (req as any).user.id;
    const { answers, timeSpent } = req.body;
    
    // Get the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = (quiz as any).questions.length;
    
    (quiz as any).questions.forEach((question: any, index: number) => {
      if (answers[index] && answers[index].answer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Create progress record
    const progress = new Progress({
      userId,
      moduleId: (quiz as any).moduleId,
      quizId,
      score,
      maxScore: 100,
      percentage: score,
      timeSpent,
      completedAt: new Date(),
      responses: answers.map((answer: any, index: number) => ({
        questionId: (quiz as any).questions?.[index]?._id,
        userAnswer: answer.answer,
        isCorrect: answer.answer === (quiz as any).questions?.[index]?.correctAnswer,
        timeSpent: answer.timeSpent || 0,
        points: answer.answer === (quiz as any).questions?.[index]?.correctAnswer ? 10 : 0
      })),
      adaptiveData: {
        difficultyLevel: score >= 80 ? 'hard' : score >= 60 ? 'medium' : 'easy',
        masteryLevel: score / 100,
        confidenceScore: score / 100,
        learningPath: [`quiz-${quizId}`],
        recommendations: score >= 80 ? ['advanced-topics'] : ['practice-more']
      }
    });
    
    await progress.save();

    // Send xAPI statements
    const user = await User.findById(userId);
    if (user) {
      await XAPIService.sendQuizCompletionStatement(progress as any, user);
    }
    
    res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions,
        correctAnswers,
        percentage: score,
        passed: score >= (quiz as any).passingScore
      },
      message: 'Quiz submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz',
      timestamp: new Date().toISOString()
    });
  }
}));

export default router; 