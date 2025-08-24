import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressDocument extends Document {}

const responseSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: [true, 'Question ID is required'] },
    userAnswer: {
      type: Schema.Types.Mixed, // Can be string or array of strings
      required: [true, 'User answer is required']
    },
    isCorrect: {
      type: Boolean,
      required: [true, 'Correctness flag is required']
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [0, 'Time spent cannot be negative']
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [0, 'Points cannot be negative']
    }
  },
  { _id: true }
);

const adaptiveDataSchema = new Schema(
  {
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty level is required']
    },
    masteryLevel: {
      type: Number,
      required: [true, 'Mastery level is required'],
      min: [0, 'Mastery level cannot be negative'],
      max: [1, 'Mastery level cannot exceed 1']
    },
    confidenceScore: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence score cannot be negative'],
      max: [1, 'Confidence score cannot exceed 1']
    },
    learningPath: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'] },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: [true, 'Module ID is required'] },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative']
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [1, 'Maximum score must be at least 1']
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [0, 'Time spent cannot be negative']
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion time is required']
    },
    responses: {
      type: [responseSchema],
      default: []
    },
    adaptiveData: {
      type: adaptiveDataSchema,
      required: [true, 'Adaptive data is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for pass/fail status
progressSchema.virtual('isPassed').get(function() {
  const self = this as any;
  return (self.percentage || 0) >= 70; // 70% passing threshold
});

// Virtual for performance level
progressSchema.virtual('performanceLevel').get(function() {
  const self = this as any;
  if ((self.percentage || 0) >= 90) return 'excellent';
  if ((self.percentage || 0) >= 80) return 'good';
  if ((self.percentage || 0) >= 70) return 'satisfactory';
  return 'needs-improvement';
});

// Indexes for better query performance
progressSchema.index({ userId: 1 });
progressSchema.index({ moduleId: 1 });
progressSchema.index({ quizId: 1 });
progressSchema.index({ completedAt: -1 });
progressSchema.index({ userId: 1, moduleId: 1 });
progressSchema.index({ userId: 1, completedAt: -1 });

// Compound index for user progress queries
progressSchema.index({ userId: 1, moduleId: 1, completedAt: -1 });

// Pre-save middleware to calculate percentage
progressSchema.pre('save', function(next) {
  const self = this as any;
  if (self.isModified('score') || self.isModified('maxScore')) {
    self.percentage = Math.round(((self.score || 0) / (self.maxScore || 1)) * 100);
  }
  next();
});

// Static method to find user progress
progressSchema.statics['findByUser'] = function(userId: string) {
  return this.find({ userId })
    .populate('moduleId', 'title subject difficulty')
    .populate('quizId', 'title')
    .sort({ completedAt: -1 });
};

// Static method to find module progress
progressSchema.statics['findByModule'] = function(moduleId: string) {
  return this.find({ moduleId })
    .populate('userId', 'firstName lastName email')
    .populate('quizId', 'title')
    .sort({ completedAt: -1 });
};

// Static method to find recent progress
progressSchema.statics['findRecent'] = function(userId: string, limit = 10) {
  return this.find({ userId })
    .populate('moduleId', 'title subject')
    .populate('quizId', 'title')
    .sort({ completedAt: -1 })
    .limit(limit);
};

// Static method to calculate user statistics
progressSchema.statics['getUserStats'] = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        totalTimeSpent: { $sum: '$timeSpent' },
        passedAttempts: {
          $sum: { $cond: [{ $gte: ['$percentage', 70] }, 1, 0] }
        }
      }
    }
  ]);
};

export const Progress = mongoose.model<IProgressDocument>('Progress', progressSchema); 