import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
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

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  refreshTokens: (tokens: AuthTokens) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),

      setLoading: (isLoading) =>
        set((state) => ({
          ...state,
          isLoading,
        })),

      refreshTokens: (tokens) =>
        set((state) => ({
          ...state,
          tokens,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 