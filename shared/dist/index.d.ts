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
            category?: Array<{
                id: string;
            }>;
            parent?: Array<{
                id: string;
            }>;
        };
        extensions?: Record<string, any>;
    };
    timestamp: string;
}
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic';
export type UserRole = 'student' | 'instructor' | 'admin';
export declare const DIFFICULTY_LEVELS: Difficulty[];
export declare const LEARNING_STYLES: LearningStyle[];
export declare const USER_ROLES: UserRole[];
export declare function formatTime(minutes: number): string;
export declare function formatTimeSeconds(seconds: number): string;
export declare function calculateProgress(completed: number, total: number): number;
export declare function getDifficultyColor(difficulty: Difficulty): string;
export declare function validateEmail(email: string): boolean;
export declare function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
};
export declare function formatDate(date: string | Date): string;
export declare function formatDateTime(date: string | Date): string;
export declare function getTimeAgo(date: string | Date): string;
export declare const storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
    clear: () => void;
};
export declare const validationSchemas: {
    email: {
        required: string;
        pattern: {
            value: RegExp;
            message: string;
        };
    };
    password: {
        required: string;
        minLength: {
            value: number;
            message: string;
        };
        pattern: {
            value: RegExp;
            message: string;
        };
    };
    name: {
        required: string;
        minLength: {
            value: number;
            message: string;
        };
    };
};
//# sourceMappingURL=index.d.ts.map