// Shared types and utilities for the Adaptive E-Learning Platform
// Constants
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const LEARNING_STYLES = ['visual', 'auditory', 'kinesthetic'];
export const USER_ROLES = ['student', 'instructor', 'admin'];
// Utility Functions
export function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
export function formatTimeSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
export function calculateProgress(completed, total) {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}
export function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case 'beginner': return 'text-green-600 bg-green-100';
        case 'intermediate': return 'text-yellow-600 bg-yellow-100';
        case 'advanced': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
    }
}
export function validateEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
}
export function validatePassword(password) {
    const errors = [];
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
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
export function getTimeAgo(date) {
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
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        }
        catch (error) {
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
//# sourceMappingURL=index.js.map