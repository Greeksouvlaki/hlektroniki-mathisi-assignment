// Shared types and utilities for the Adaptive E-Learning Platform

// Core Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  profile?: UserProfile;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  timeZone: string;
}

export interface UserStats {
  totalTimeSpent: number;
  quizzesCompleted: number;
  modulesCompleted: number;
  averageScore: number;
  streakDays: number;
}

// Content Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: number;
  tags: string[];
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';

export interface Module {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: ModuleContent[];
  prerequisites: string[];
  estimatedDuration: number;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleContent {
  id: string;
  type: ContentType;
  title: string;
  content: any;
  order: number;
  duration?: number;
}

export type ContentType = 'text' | 'video' | 'interactive' | 'assessment';

// Progress Types
export interface Progress {
  id: string;
  userId: string;
  moduleId?: string;
  quizId?: string;
  type: 'module' | 'quiz';
  status: ProgressStatus;
  score?: number;
  timeSpent: number;
  completedSections: string[];
  attempts: number;
  lastAttemptAt: string;
  masteryLevel: number;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export type ProgressStatus = 'in-progress' | 'completed' | 'failed';

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

export interface ModuleProgress {
  moduleId: string;
  completedSections: string[];
  timeSpent: number;
  completed: boolean;
}

// xAPI Types
export interface xAPIStatement {
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
      type: string;
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
      category?: Array<{ id: string }>;
      parent?: Array<{ id: string }>;
    };
    extensions?: Record<string, any>;
  };
  timestamp: string;
}

// Utility Types
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';
export type UserRole = 'student' | 'instructor' | 'admin';

// Constants
export const DIFFICULTY_LEVELS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
export const LEARNING_STYLES: LearningStyle[] = ['visual', 'auditory', 'kinesthetic'];
export const USER_ROLES: UserRole[] = ['student', 'instructor', 'admin'];

// Utility Functions
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateProgress(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'beginner': return 'text-green-600 bg-green-100';
    case 'intermediate': return 'text-yellow-600 bg-yellow-100';
    case 'advanced': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Date Utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(date);
}

// Storage Utilities
export const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Validation Schemas
export const validationSchemas = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  },
  
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters'
    }
  }
}; 