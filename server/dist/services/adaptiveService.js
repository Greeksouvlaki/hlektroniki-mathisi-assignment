import { Progress } from '../models/Progress.js';
import { Module } from '../models/Module.js';
import { Quiz } from '../models/Quiz.js';
export class AdaptiveService {
    static MASTERY_THRESHOLDS = {
        BEGINNER: 0.6,
        INTERMEDIATE: 0.7,
        ADVANCED: 0.8
    };
    static DIFFICULTY_WEIGHTS = {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3
    };
    static CONFIDENCE_THRESHOLDS = {
        LOW: 0.4,
        MEDIUM: 0.6,
        HIGH: 0.8
    };
    /**
     * Calculate adaptive recommendation based on user's learning history
     */
    static async getAdaptiveRecommendation(userId) {
        try {
            // Get user's recent progress
            const recentProgress = await Progress['findRecent'](userId, 20);
            if (recentProgress.length === 0) {
                // New user - recommend entry-level modules
                return this.getEntryLevelRecommendation();
            }
            // Calculate user profile
            const userProfile = await this.calculateUserProfile(userId, recentProgress);
            // Determine next difficulty level
            const difficultyLevel = this.calculateNextDifficulty(userProfile, recentProgress);
            // Find appropriate next module/quiz
            const recommendation = await this.findNextContent(userId, difficultyLevel, userProfile);
            return {
                ...recommendation,
                difficultyLevel,
                confidence: userProfile.confidenceScore,
                reasoning: this.generateReasoning(userProfile, recentProgress),
                learningPath: userProfile.learningPath
            };
        }
        catch (error) {
            console.error('Error generating adaptive recommendation:', error);
            throw new Error('Failed to generate adaptive recommendation');
        }
    }
    /**
     * Calculate user learning profile based on performance data
     */
    static async calculateUserProfile(userId, recentProgress) {
        const safeProgress = Array.isArray(recentProgress) ? recentProgress : [];
        const totalAttempts = safeProgress.length || 1; // avoid division by zero
        const totalScore = safeProgress.reduce((sum, progress) => sum + (progress.percentage || 0), 0);
        const averageScore = totalScore / totalAttempts;
        const totalTimeSpent = safeProgress.reduce((sum, progress) => sum + (progress.timeSpent || 0), 0);
        const averageResponseTime = totalTimeSpent / totalAttempts;
        const successes = safeProgress.filter(p => (p.percentage || 0) >= 70).length;
        const successRate = successes / totalAttempts;
        // Calculate mastery level based on recent performance
        const masteryLevel = this.calculateMasteryLevel(averageScore, successRate, averageResponseTime);
        // Determine preferred difficulty
        const preferredDifficulty = this.determinePreferredDifficulty(averageScore, successRate);
        // Calculate confidence score
        const confidenceScore = this.calculateConfidenceScore(averageScore, successRate, totalAttempts);
        // Generate learning path
        const learningPath = await this.generateLearningPath(userId, masteryLevel);
        // Calculate current streak
        const currentStreak = this.calculateCurrentStreak(safeProgress);
        return {
            userId,
            learningStyle: 'visual', // Default - could be determined from user preferences
            preferredDifficulty,
            averageResponseTime,
            successRate,
            completedModules: safeProgress
                .map(p => p.moduleId)
                .filter((id) => !!id)
                .map((id) => id.toString()),
            currentStreak,
            totalStudyTime: totalTimeSpent,
            confidenceScore,
            learningPath
        };
    }
    /**
     * Calculate mastery level (0-1) based on performance metrics
     */
    static calculateMasteryLevel(averageScore, successRate, averageResponseTime) {
        // Normalize response time (lower is better, max 300 seconds)
        const normalizedResponseTime = Math.max(0, 1 - (averageResponseTime / 300));
        // Weighted combination of metrics
        const scoreWeight = 0.5;
        const successWeight = 0.3;
        const timeWeight = 0.2;
        return ((averageScore / 100) * scoreWeight +
            successRate * successWeight +
            normalizedResponseTime * timeWeight);
    }
    /**
     * Determine user's preferred difficulty level
     */
    static determinePreferredDifficulty(averageScore, successRate) {
        if (averageScore >= 85 && successRate >= 0.8) {
            return 'hard';
        }
        else if (averageScore >= 70 && successRate >= 0.6) {
            return 'medium';
        }
        else {
            return 'easy';
        }
    }
    /**
     * Calculate confidence score in recommendations
     */
    static calculateConfidenceScore(averageScore, successRate, totalAttempts) {
        // Base confidence on performance consistency
        const performanceScore = (averageScore / 100 + successRate) / 2;
        // Adjust for sample size (more attempts = higher confidence)
        const sampleSizeFactor = Math.min(totalAttempts / 10, 1);
        return Math.min(performanceScore * sampleSizeFactor, 1);
    }
    /**
     * Calculate next difficulty level based on user profile and recent performance
     */
    static calculateNextDifficulty(userProfile, recentProgress) {
        const recentScores = recentProgress.slice(0, 5).map(p => p.percentage);
        const recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        // Adaptive difficulty adjustment
        if (recentAverage >= 90 && userProfile.successRate >= 0.9) {
            // User is performing excellently - increase difficulty
            return this.increaseDifficulty(userProfile.preferredDifficulty);
        }
        else if (recentAverage <= 60 && userProfile.successRate <= 0.5) {
            // User is struggling - decrease difficulty
            return this.decreaseDifficulty(userProfile.preferredDifficulty);
        }
        else {
            // Maintain current difficulty level
            return userProfile.preferredDifficulty;
        }
    }
    /**
     * Increase difficulty level
     */
    static increaseDifficulty(current) {
        switch (current) {
            case 'easy': return 'medium';
            case 'medium': return 'hard';
            case 'hard': return 'hard'; // Already at maximum
            default: return 'medium';
        }
    }
    /**
     * Decrease difficulty level
     */
    static decreaseDifficulty(current) {
        switch (current) {
            case 'easy': return 'easy'; // Already at minimum
            case 'medium': return 'easy';
            case 'hard': return 'medium';
            default: return 'easy';
        }
    }
    /**
     * Find next appropriate content for the user
     */
    static async findNextContent(userId, difficultyLevel, userProfile) {
        // Find modules matching the difficulty level
        const availableModules = await Module['findByDifficulty'](difficultyLevel);
        // Filter out already completed modules
        const completedModuleIds = userProfile.completedModules;
        const uncompletedModules = availableModules.filter((module) => !completedModuleIds.includes(module._id.toString()));
        if (uncompletedModules.length === 0) {
            // All modules at this level completed, try next difficulty
            const nextDifficulty = this.increaseDifficulty(difficultyLevel);
            const nextLevelModules = await Module['findByDifficulty'](nextDifficulty);
            return {
                nextModuleId: nextLevelModules[0]?._id.toString(),
                difficultyLevel: nextDifficulty
            };
        }
        // Select the best module based on prerequisites and user profile
        const recommendedModule = this.selectBestModule(uncompletedModules, userProfile);
        // Find associated quiz if available
        const quiz = await Quiz['findByModule'](recommendedModule._id.toString());
        return {
            nextModuleId: recommendedModule._id.toString(),
            nextQuizId: quiz[0]?._id.toString(),
            difficultyLevel
        };
    }
    /**
     * Select the best module based on user profile and prerequisites
     */
    static selectBestModule(modules, userProfile) {
        // Simple selection - could be enhanced with more sophisticated algorithms
        return modules[0]; // For now, return the first available module
    }
    /**
     * Generate learning path for the user
     */
    static async generateLearningPath(userId, masteryLevel) {
        // Generate a learning path based on mastery level
        const path = [];
        if (masteryLevel < 0.3) {
            path.push('Beginner modules', 'Basic concepts', 'Foundation building');
        }
        else if (masteryLevel < 0.6) {
            path.push('Intermediate modules', 'Application exercises', 'Skill development');
        }
        else {
            path.push('Advanced modules', 'Complex problems', 'Mastery application');
        }
        return path;
    }
    /**
     * Calculate current learning streak
     */
    static calculateCurrentStreak(recentProgress) {
        let streak = 0;
        const sortedProgress = recentProgress.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        for (const progress of sortedProgress) {
            if (progress.percentage >= 70) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    /**
     * Generate reasoning for the recommendation
     */
    static generateReasoning(userProfile, recentProgress) {
        const recentAverage = recentProgress.slice(0, 5).reduce((sum, p) => sum + p.percentage, 0) / Math.min(recentProgress.length, 5);
        if (recentAverage >= 90) {
            return `Excellent performance! Your recent average score of ${recentAverage.toFixed(1)}% indicates you're ready for more challenging content.`;
        }
        else if (recentAverage >= 70) {
            return `Good progress! Your recent average score of ${recentAverage.toFixed(1)}% shows consistent learning.`;
        }
        else {
            return `Let's focus on building a stronger foundation. Your recent average score of ${recentAverage.toFixed(1)}% suggests we should review some concepts.`;
        }
    }
    /**
     * Get entry-level recommendation for new users
     */
    static async getEntryLevelRecommendation() {
        const entryModules = await Module['findEntryLevel']();
        const firstModule = entryModules[0];
        return {
            nextModuleId: firstModule?._id.toString(),
            difficultyLevel: 'easy',
            confidence: 0.5,
            reasoning: 'Welcome! Starting with entry-level content to assess your current knowledge.',
            learningPath: ['Beginner modules', 'Basic concepts', 'Foundation building']
        };
    }
    /**
     * Update user's adaptive data after completing content
     */
    static async updateAdaptiveData(progress) {
        try {
            // Recalculate adaptive data based on new progress
            const userProfile = await this.calculateUserProfile(progress.userId, [progress]);
            // Update the progress record with new adaptive data
            await Progress.findByIdAndUpdate(progress._id, {
                'adaptiveData.masteryLevel': userProfile.successRate,
                'adaptiveData.confidenceScore': userProfile.successRate,
                'adaptiveData.difficultyLevel': userProfile.preferredDifficulty,
                'adaptiveData.learningPath': userProfile.completedModules,
                'adaptiveData.recommendations': ['Continue with similar difficulty', 'Practice more exercises']
            });
        }
        catch (error) {
            console.error('Error updating adaptive data:', error);
        }
    }
}
//# sourceMappingURL=adaptiveService.js.map