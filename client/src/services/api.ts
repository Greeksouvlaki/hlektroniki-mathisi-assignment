import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Types
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

export interface User {
  id: string;
  _id?: string; // Backend compatibility
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // For display purposes
  role: 'student' | 'instructor' | 'admin';
  profile?: {
    avatar?: string;
    bio?: string;
    preferences: {
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      learningStyle: 'visual' | 'auditory' | 'kinesthetic';
      timeZone: string;
    };
  };
  stats?: {
    totalTimeSpent: number;
    quizzesCompleted: number;
    modulesCompleted: number;
    averageScore: number;
    streakDays: number;
  };
  createdAt: string;
  updatedAt: string;
}

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
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: number;
  tags: string[];
}

export interface Module {
  id: string;
  _id?: string; // Backend compatibility
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: ModuleContent[];
  prerequisites: string[];
  estimatedDuration: number;
  duration?: number; // Alternative property name
  topics?: string[]; // For display
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleContent {
  id: string;
  type: 'text' | 'video' | 'interactive' | 'assessment';
  title: string;
  content: any;
  order: number;
  duration?: number;
}

export interface Progress {
  id: string;
  _id?: string; // Backend compatibility
  userId: string;
  moduleId?: string;
  quizId?: string;
  type: 'module' | 'quiz';
  status: 'in-progress' | 'completed' | 'failed';
  score?: number;
  timeSpent: number;
  completedSections: string[];
  attempts: number;
  lastAttemptAt: string;
  masteryLevel: number;
  confidenceScore: number;
  moduleTitle?: string; // For display
  quizTitle?: string; // For display
  progressPercentage?: number; // For module progress
  completedAt?: string; // Completion timestamp
  createdAt: string;
  updatedAt: string;
}

export interface QuizSubmission {
  quizId: string;
  answers: {
    questionId: string;
    answer: string;
    timeSpent: number;
  }[];
}

export interface ModuleProgress {
  moduleId: string;
  completedSections: string[];
  timeSpent: number;
  completed: boolean;
}

// API Client
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data.tokens;
              
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.data) {
          const errorData = error.response.data as any;
          const message = errorData.message || errorData.error || 'An error occurred';
          toast.error(message);
        } else {
          toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  // Quiz endpoints
  async getQuizzes(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    subject?: string;
  }): Promise<PaginatedResponse<Quiz>> {
    const response = await this.client.get('/quizzes', { params });
    return response.data;
  }

  async getQuiz(id: string): Promise<ApiResponse<Quiz>> {
    const response = await this.client.get(`/quizzes/${id}`);
    return response.data;
  }

  async submitQuiz(data: QuizSubmission): Promise<ApiResponse<{ score: number; passed: boolean }>> {
    const response = await this.client.post(`/quizzes/${data.quizId}/submit`, data);
    return response.data;
  }

  // Module endpoints
  async getModules(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    subject?: string;
  }): Promise<PaginatedResponse<Module>> {
    const response = await this.client.get('/modules', { params });
    return response.data;
  }

  async getModule(id: string): Promise<ApiResponse<Module>> {
    const response = await this.client.get(`/modules/${id}`);
    return response.data;
  }

  async updateModuleProgress(data: ModuleProgress): Promise<ApiResponse<Progress>> {
    const response = await this.client.post(`/modules/${data.moduleId}/progress`, data);
    return response.data;
  }

  // Progress endpoints
  async getProgress(): Promise<ApiResponse<Progress[]>> {
    const response = await this.client.get('/progress');
    return response.data;
  }

  async getProgressAnalytics(): Promise<ApiResponse<{
    totalTimeSpent: number;
    averageScore: number;
    completedModules: number;
    completedQuizzes: number;
    currentStreak: number;
    weeklyProgress: Array<{ date: string; timeSpent: number; score: number }>;
  }>> {
    const response = await this.client.get('/progress/analytics');
    return response.data;
  }

  // Adaptive endpoints
  async getRecommendations(): Promise<ApiResponse<Array<Module | Quiz>>> {
    const response = await this.client.get('/adaptive/recommendations');
    return response.data;
  }

  async getLearningPath(): Promise<ApiResponse<Module[]>> {
    const response = await this.client.get('/adaptive/learning-path');
    return response.data;
  }

  // Utility methods
  setAuthTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearAuthTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type {
  ApiResponse,
  PaginatedResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Quiz,
  Question,
  Module,
  ModuleContent,
  Progress,
  QuizSubmission,
  ModuleProgress,
}; 