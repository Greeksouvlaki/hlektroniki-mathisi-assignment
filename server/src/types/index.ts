// User Types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export interface IUserLogin {
  email: string;
  password: string;
}

// Quiz Types
export interface IQuiz {
  _id: string;
  title: string;
  description: string;
  moduleId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number; // in minutes
  questions: IQuestion[];
  passingScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  _id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface IQuizCreate {
  title: string;
  description: string;
  moduleId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  questions: Omit<IQuestion, '_id'>[];
  passingScore: number;
}

// Module Types
export interface IModule {
  _id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  content: IContent[];
  estimatedDuration: number; // in minutes
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContent {
  _id: string;
  type: 'text' | 'video' | 'image' | 'interactive';
  title: string;
  content: string;
  order: number;
  metadata?: Record<string, any>;
}

export interface IModuleCreate {
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  content: Omit<IContent, '_id'>[];
  estimatedDuration: number;
}

// Progress Types
export interface IProgress {
  _id: string;
  userId: string;
  moduleId: string;
  quizId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  responses: IResponse[];
  adaptiveData: IAdaptiveData;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponse {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
  points: number;
}

export interface IAdaptiveData {
  difficultyLevel: 'easy' | 'medium' | 'hard';
  masteryLevel: number; // 0-1
  confidenceScore: number; // 0-1
  learningPath: string[];
  recommendations: string[];
}

export interface IProgressCreate {
  userId: string;
  moduleId: string;
  quizId?: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  responses: Omit<IResponse, 'isCorrect' | 'points'>[];
}

// Adaptive Learning Types
export interface IAdaptiveRecommendation {
  nextModuleId?: string;
  nextQuizId?: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  confidence: number;
  reasoning: string;
  learningPath: string[];
}

export interface IUserProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  averageResponseTime: number;
  successRate: number;
  completedModules: string[];
  currentStreak: number;
  totalStudyTime: number;
}

// xAPI Types
export interface IXAPIStatement {
  actor: {
    objectType: 'Agent';
    name: string;
    mbox: string;
  };
  verb: {
    id: string;
    display: {
      'en-US': string;
    };
  };
  object: {
    objectType: 'Activity';
    id: string;
    definition: {
      name: {
        'en-US': string;
      };
      description?: {
        'en-US': string;
      };
    };
  };
  result?: {
    score?: {
      raw: number;
      min: number;
      max: number;
      scaled: number;
    };
    success?: boolean;
    completion?: boolean;
    duration?: string;
    response?: string;
  };
  context?: {
    contextActivities?: {
      category?: Array<{
        id: string;
        objectType: 'Activity';
      }>;
    };
    extensions?: Record<string, any>;
  };
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

// Utility Types
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UserRole = 'student' | 'teacher' | 'admin';
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'essay';
export type ContentType = 'text' | 'video' | 'image' | 'interactive';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading'; 