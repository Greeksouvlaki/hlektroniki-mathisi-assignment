import { IXAPIStatement, IProgress } from '../types/index.js';
export declare class XAPIService {
    private static readonly XAPI_ENDPOINT;
    private static readonly XAPI_USERNAME;
    private static readonly XAPI_PASSWORD;
    private static readonly XAPI_VERSION;
    /**
     * Send xAPI statement to Learning Record Store
     */
    static sendStatement(statement: IXAPIStatement): Promise<boolean>;
    /**
     * Create and send statement for quiz completion
     */
    static sendQuizCompletionStatement(progress: IProgress, user: any): Promise<void>;
    /**
     * Create and send statement for module completion
     */
    static sendModuleCompletionStatement(progress: IProgress, user: any, moduleTitle: string): Promise<void>;
    /**
     * Create and send statement for question answered
     */
    static sendQuestionAnsweredStatement(userId: string, questionId: string, isCorrect: boolean, timeSpent: number, points: number): Promise<void>;
    /**
     * Create and send statement for learning experience
     */
    static sendLearningExperienceStatement(userId: string, moduleId: string, moduleTitle: string, duration: number): Promise<void>;
    /**
     * Create and send statement for adaptive recommendation
     */
    static sendAdaptiveRecommendationStatement(userId: string, recommendation: any): Promise<void>;
    /**
     * Batch send multiple statements
     */
    static sendBatchStatements(statements: IXAPIStatement[]): Promise<boolean>;
    /**
     * Test xAPI connection
     */
    static testConnection(): Promise<boolean>;
}
//# sourceMappingURL=xapiService.d.ts.map