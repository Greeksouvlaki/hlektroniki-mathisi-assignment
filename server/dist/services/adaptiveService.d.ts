import { IProgress, IAdaptiveRecommendation } from '../types/index.js';
export declare class AdaptiveService {
    private static readonly MASTERY_THRESHOLDS;
    private static readonly DIFFICULTY_WEIGHTS;
    private static readonly CONFIDENCE_THRESHOLDS;
    /**
     * Calculate adaptive recommendation based on user's learning history
     */
    static getAdaptiveRecommendation(userId: string): Promise<IAdaptiveRecommendation>;
    /**
     * Calculate user learning profile based on performance data
     */
    private static calculateUserProfile;
    /**
     * Calculate mastery level (0-1) based on performance metrics
     */
    private static calculateMasteryLevel;
    /**
     * Determine user's preferred difficulty level
     */
    private static determinePreferredDifficulty;
    /**
     * Calculate confidence score in recommendations
     */
    private static calculateConfidenceScore;
    /**
     * Calculate next difficulty level based on user profile and recent performance
     */
    private static calculateNextDifficulty;
    /**
     * Increase difficulty level
     */
    private static increaseDifficulty;
    /**
     * Decrease difficulty level
     */
    private static decreaseDifficulty;
    /**
     * Find next appropriate content for the user
     */
    private static findNextContent;
    /**
     * Select the best module based on user profile and prerequisites
     */
    private static selectBestModule;
    /**
     * Generate learning path for the user
     */
    private static generateLearningPath;
    /**
     * Calculate current learning streak
     */
    private static calculateCurrentStreak;
    /**
     * Generate reasoning for the recommendation
     */
    private static generateReasoning;
    /**
     * Get entry-level recommendation for new users
     */
    private static getEntryLevelRecommendation;
    /**
     * Update user's adaptive data after completing content
     */
    static updateAdaptiveData(progress: IProgress): Promise<void>;
}
//# sourceMappingURL=adaptiveService.d.ts.map