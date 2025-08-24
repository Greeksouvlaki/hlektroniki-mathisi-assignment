import { User } from '../models/User.js';
export class XAPIService {
    static XAPI_ENDPOINT = process.env['XAPI_ENDPOINT'] || 'http://localhost:8080/xapi/';
    static XAPI_USERNAME = process.env['XAPI_USERNAME'] || 'admin';
    static XAPI_PASSWORD = process.env['XAPI_PASSWORD'] || 'password';
    static XAPI_VERSION = process.env['XAPI_VERSION'] || '1.0.3';
    /**
     * Send xAPI statement to Learning Record Store
     */
    static async sendStatement(statement) {
        try {
            const response = await fetch(this.XAPI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Experience-API-Version': this.XAPI_VERSION,
                    'Authorization': `Basic ${Buffer.from(`${this.XAPI_USERNAME}:${this.XAPI_PASSWORD}`).toString('base64')}`
                },
                body: JSON.stringify(statement)
            });
            if (!response.ok) {
                console.error('xAPI statement failed:', response.status, response.statusText);
                return false;
            }
            console.log('xAPI statement sent successfully');
            return true;
        }
        catch (error) {
            console.error('Error sending xAPI statement:', error);
            return false;
        }
    }
    /**
     * Create and send statement for quiz completion
     */
    static async sendQuizCompletionStatement(progress, user) {
        const statement = {
            actor: {
                objectType: 'Agent',
                name: `${user.firstName} ${user.lastName}`,
                mbox: `mailto:${user.email}`
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/completed',
                display: {
                    'en-US': 'completed'
                }
            },
            object: {
                objectType: 'Activity',
                id: `http://adaptive-elearning.com/quiz/${progress.quizId}`,
                definition: {
                    name: {
                        'en-US': 'Quiz Completion'
                    },
                    description: {
                        'en-US': `Completed quiz with score ${progress.percentage}%`
                    }
                }
            },
            result: {
                score: {
                    raw: progress.score,
                    min: 0,
                    max: progress.maxScore,
                    scaled: progress.percentage / 100
                },
                success: progress.percentage >= 70,
                completion: true,
                duration: `PT${Math.floor(progress.timeSpent / 60)}M${progress.timeSpent % 60}S`
            },
            context: {
                contextActivities: {
                    category: [
                        {
                            id: 'http://adaptive-elearning.com/categories/quiz',
                            objectType: 'Activity'
                        }
                    ]
                },
                extensions: {
                    'http://adaptive-elearning.com/extensions/difficulty': progress.adaptiveData.difficultyLevel,
                    'http://adaptive-elearning.com/extensions/mastery-level': progress.adaptiveData.masteryLevel,
                    'http://adaptive-elearning.com/extensions/confidence-score': progress.adaptiveData.confidenceScore
                }
            },
            timestamp: new Date().toISOString()
        };
        await this.sendStatement(statement);
    }
    /**
     * Create and send statement for module completion
     */
    static async sendModuleCompletionStatement(progress, user, moduleTitle) {
        const statement = {
            actor: {
                objectType: 'Agent',
                name: `${user.firstName} ${user.lastName}`,
                mbox: `mailto:${user.email}`
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/completed',
                display: {
                    'en-US': 'completed'
                }
            },
            object: {
                objectType: 'Activity',
                id: `http://adaptive-elearning.com/module/${progress.moduleId}`,
                definition: {
                    name: {
                        'en-US': moduleTitle
                    },
                    description: {
                        'en-US': `Completed learning module with ${progress.percentage}% performance`
                    }
                }
            },
            result: {
                score: {
                    raw: progress.score,
                    min: 0,
                    max: progress.maxScore,
                    scaled: progress.percentage / 100
                },
                success: progress.percentage >= 70,
                completion: true,
                duration: `PT${Math.floor(progress.timeSpent / 60)}M${progress.timeSpent % 60}S`
            },
            context: {
                contextActivities: {
                    category: [
                        {
                            id: 'http://adaptive-elearning.com/categories/module',
                            objectType: 'Activity'
                        }
                    ]
                },
                extensions: {
                    'http://adaptive-elearning.com/extensions/difficulty': progress.adaptiveData.difficultyLevel,
                    'http://adaptive-elearning.com/extensions/mastery-level': progress.adaptiveData.masteryLevel,
                    'http://adaptive-elearning.com/extensions/learning-path': progress.adaptiveData.learningPath.join(',')
                }
            },
            timestamp: new Date().toISOString()
        };
        await this.sendStatement(statement);
    }
    /**
     * Create and send statement for question answered
     */
    static async sendQuestionAnsweredStatement(userId, questionId, isCorrect, timeSpent, points) {
        const user = await User.findById(userId);
        if (!user)
            return;
        const statement = {
            actor: {
                objectType: 'Agent',
                name: `${user.firstName} ${user.lastName}`,
                mbox: `mailto:${user.email}`
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/answered',
                display: {
                    'en-US': 'answered'
                }
            },
            object: {
                objectType: 'Activity',
                id: `http://adaptive-elearning.com/question/${questionId}`,
                definition: {
                    name: {
                        'en-US': 'Question Response'
                    },
                    description: {
                        'en-US': `Answered question ${isCorrect ? 'correctly' : 'incorrectly'}`
                    }
                }
            },
            result: {
                score: {
                    raw: points,
                    min: 0,
                    max: points,
                    scaled: isCorrect ? 1 : 0
                },
                success: isCorrect,
                duration: `PT${Math.floor(timeSpent / 60)}M${timeSpent % 60}S`
            },
            context: {
                contextActivities: {
                    category: [
                        {
                            id: 'http://adaptive-elearning.com/categories/question',
                            objectType: 'Activity'
                        }
                    ]
                }
            },
            timestamp: new Date().toISOString()
        };
        await this.sendStatement(statement);
    }
    /**
     * Create and send statement for learning experience
     */
    static async sendLearningExperienceStatement(userId, moduleId, moduleTitle, duration) {
        const user = await User.findById(userId);
        if (!user)
            return;
        const statement = {
            actor: {
                objectType: 'Agent',
                name: `${user.firstName} ${user.lastName}`,
                mbox: `mailto:${user.email}`
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/experienced',
                display: {
                    'en-US': 'experienced'
                }
            },
            object: {
                objectType: 'Activity',
                id: `http://adaptive-elearning.com/module/${moduleId}`,
                definition: {
                    name: {
                        'en-US': moduleTitle
                    },
                    description: {
                        'en-US': 'Experienced learning content'
                    }
                }
            },
            result: {
                completion: true,
                duration: `PT${Math.floor(duration / 60)}M${duration % 60}S`
            },
            context: {
                contextActivities: {
                    category: [
                        {
                            id: 'http://adaptive-elearning.com/categories/learning',
                            objectType: 'Activity'
                        }
                    ]
                }
            },
            timestamp: new Date().toISOString()
        };
        await this.sendStatement(statement);
    }
    /**
     * Create and send statement for adaptive recommendation
     */
    static async sendAdaptiveRecommendationStatement(userId, recommendation) {
        const user = await User.findById(userId);
        if (!user)
            return;
        const statement = {
            actor: {
                objectType: 'Agent',
                name: `${user.firstName} ${user.lastName}`,
                mbox: `mailto:${user.email}`
            },
            verb: {
                id: 'http://adlnet.gov/expapi/verbs/recommended',
                display: {
                    'en-US': 'recommended'
                }
            },
            object: {
                objectType: 'Activity',
                id: `http://adaptive-elearning.com/recommendation/${Date.now()}`,
                definition: {
                    name: {
                        'en-US': 'Adaptive Learning Recommendation'
                    },
                    description: {
                        'en-US': `Recommended ${recommendation.difficultyLevel} difficulty content`
                    }
                }
            },
            result: {},
            context: {
                contextActivities: {
                    category: [
                        {
                            id: 'http://adaptive-elearning.com/categories/adaptive',
                            objectType: 'Activity'
                        }
                    ]
                },
                extensions: {
                    'http://adaptive-elearning.com/extensions/difficulty': recommendation.difficultyLevel,
                    'http://adaptive-elearning.com/extensions/confidence': recommendation.confidence,
                    'http://adaptive-elearning.com/extensions/reasoning': recommendation.reasoning
                }
            },
            timestamp: new Date().toISOString()
        };
        await this.sendStatement(statement);
    }
    /**
     * Batch send multiple statements
     */
    static async sendBatchStatements(statements) {
        try {
            const response = await fetch(this.XAPI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Experience-API-Version': this.XAPI_VERSION,
                    'Authorization': `Basic ${Buffer.from(`${this.XAPI_USERNAME}:${this.XAPI_PASSWORD}`).toString('base64')}`
                },
                body: JSON.stringify(statements)
            });
            if (!response.ok) {
                console.error('xAPI batch statements failed:', response.status, response.statusText);
                return false;
            }
            console.log(`xAPI batch statements sent successfully: ${statements.length} statements`);
            return true;
        }
        catch (error) {
            console.error('Error sending xAPI batch statements:', error);
            return false;
        }
    }
    /**
     * Test xAPI connection
     */
    static async testConnection() {
        try {
            const response = await fetch(this.XAPI_ENDPOINT, {
                method: 'GET',
                headers: {
                    'X-Experience-API-Version': this.XAPI_VERSION,
                    'Authorization': `Basic ${Buffer.from(`${this.XAPI_USERNAME}:${this.XAPI_PASSWORD}`).toString('base64')}`
                }
            });
            return response.ok;
        }
        catch (error) {
            console.error('xAPI connection test failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=xapiService.js.map