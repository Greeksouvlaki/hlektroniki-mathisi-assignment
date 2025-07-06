import mongoose from 'mongoose';
import { Progress } from '../models/Progress.js';
import { User } from '../models/User.js';
import { Quiz } from '../models/Quiz.js';
import { Module } from '../models/Module.js';
import dotenv from 'dotenv';

dotenv.config();

const seedProgress = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adaptive_elearning';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get a user
    const user = await User.findOne({});
    if (!user) {
      console.log('No user found. Please create a user first.');
      return;
    }

    // Get some quizzes and modules
    const quizzes = await Quiz.find({}).limit(3);
    const modules = await Module.find({}).limit(2);

    if (quizzes.length === 0 || modules.length === 0) {
      console.log('No quizzes or modules found. Please seed them first.');
      return;
    }

    // Clear existing progress for this user
    await Progress.deleteMany({ userId: user._id });

    // Create sample progress data
    const progressData = [
      // Completed quiz
      {
        userId: user._id,
        moduleId: modules[0]._id,
        quizId: quizzes[0]._id,
        score: 85,
        maxScore: 100,
        percentage: 85,
        timeSpent: 15,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        responses: [
          {
            questionId: new mongoose.Types.ObjectId(),
            userAnswer: 'A',
            isCorrect: true,
            timeSpent: 5,
            points: 10
          },
          {
            questionId: new mongoose.Types.ObjectId(),
            userAnswer: 'B',
            isCorrect: false,
            timeSpent: 10,
            points: 0
          }
        ],
        adaptiveData: {
          difficultyLevel: 'medium',
          masteryLevel: 0.85,
          confidenceScore: 0.8,
          learningPath: ['quiz1', 'quiz2'],
          recommendations: ['practice-more', 'review-basics']
        }
      },
      // Completed module
      {
        userId: user._id,
        moduleId: modules[0]._id,
        score: 90,
        maxScore: 100,
        percentage: 90,
        timeSpent: 45,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        responses: [],
        adaptiveData: {
          difficultyLevel: 'medium',
          masteryLevel: 0.9,
          confidenceScore: 0.85,
          learningPath: ['module1'],
          recommendations: ['advanced-topics']
        }
      },
      // Another completed quiz
      {
        userId: user._id,
        moduleId: modules[1]._id,
        quizId: quizzes[1]._id,
        score: 92,
        maxScore: 100,
        percentage: 92,
        timeSpent: 12,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        responses: [
          {
            questionId: new mongoose.Types.ObjectId(),
            userAnswer: 'C',
            isCorrect: true,
            timeSpent: 6,
            points: 10
          },
          {
            questionId: new mongoose.Types.ObjectId(),
            userAnswer: 'A',
            isCorrect: true,
            timeSpent: 6,
            points: 10
          }
        ],
        adaptiveData: {
          difficultyLevel: 'hard',
          masteryLevel: 0.92,
          confidenceScore: 0.9,
          learningPath: ['quiz1', 'quiz2', 'quiz3'],
          recommendations: ['challenge-more']
        }
      }
    ];

    await Progress.insertMany(progressData);
    console.log(`Created ${progressData.length} progress records for user ${user.email}`);

    // Calculate and display stats
    const userProgress = await Progress.find({ userId: user._id });
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const quizzesCompleted = userProgress.filter(p => p.quizId).length;
    const modulesCompleted = userProgress.filter(p => p.moduleId && !p.quizId).length;
    const completedQuizzes = userProgress.filter(p => p.quizId && p.score !== undefined);
    const averageScore = completedQuizzes.length > 0 
      ? Math.round(completedQuizzes.reduce((sum, p) => sum + (p.percentage || 0), 0) / completedQuizzes.length)
      : 0;

    console.log('\nProgress Statistics:');
    console.log(`Total Time Spent: ${totalTimeSpent} minutes`);
    console.log(`Quizzes Completed: ${quizzesCompleted}`);
    console.log(`Modules Completed: ${modulesCompleted}`);
    console.log(`Average Score: ${averageScore}%`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding progress:', error);
    process.exit(1);
  }
};

seedProgress(); 