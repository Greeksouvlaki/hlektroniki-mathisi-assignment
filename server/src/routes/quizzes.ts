import { Router } from 'express';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import '../models/Module.js';
import '../models/User.js';

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
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
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
    const quizzes = await Quiz.find(query)
      .select('-questions.correctAnswer') // Don't send correct answers to client
      .populate('moduleId', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
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
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
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
router.post('/', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  // TODO: Implement quiz creation logic
  res.status(201).json({
    success: true,
    data: {},
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
router.put('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  // TODO: Implement quiz update logic
  res.status(200).json({
    success: true,
    data: {},
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
router.delete('/:id', authenticateToken, requireTeacher, asyncHandler(async (req, res) => {
  // TODO: Implement quiz deletion logic
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
router.post('/:id/submit', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { Quiz } = await import('../models/Quiz.js');
    const { Progress } = await import('../models/Progress.js');
    
    const quizId = req.params.id;
    const userId = req.user.id;
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
    const totalQuestions = quiz.questions.length;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] && answers[index].answer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Create progress record
    const progress = new Progress({
      userId,
      moduleId: quiz.moduleId,
      quizId,
      score,
      maxScore: 100,
      percentage: score,
      timeSpent,
      completedAt: new Date(),
      responses: answers.map((answer: any, index: number) => ({
        questionId: quiz.questions[index]._id,
        userAnswer: answer.answer,
        isCorrect: answer.answer === quiz.questions[index].correctAnswer,
        timeSpent: answer.timeSpent || 0,
        points: answer.answer === quiz.questions[index].correctAnswer ? 10 : 0
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
    
    res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions,
        correctAnswers,
        percentage: score,
        passed: score >= quiz.passingScore
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