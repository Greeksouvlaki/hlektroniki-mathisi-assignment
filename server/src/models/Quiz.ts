import mongoose, { Schema, Document } from 'mongoose';
import { IQuiz, IQuestion } from '../types/index.js';

export interface IQuizDocument extends IQuiz, Document {}

const questionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'essay'],
      required: [true, 'Question type is required']
    },
    options: {
      type: [String],
      validate: {
        validator: function(this: IQuestion, options: string[]) {
          if (this.type === 'multiple-choice' && (!options || options.length < 2)) {
            return false;
          }
          return true;
        },
        message: 'Multiple choice questions must have at least 2 options'
      }
    },
    correctAnswer: {
      type: Schema.Types.Mixed, // Can be string or array of strings
      required: [true, 'Correct answer is required']
    },
    explanation: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [1, 'Points must be at least 1'],
      default: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty level is required']
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { _id: true }
);

const quizSchema = new Schema<IQuizDocument>(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module ID is required']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty level is required']
    },
    timeLimit: {
      type: Number,
      min: [1, 'Time limit must be at least 1 minute'],
      max: [480, 'Time limit cannot exceed 8 hours']
    },
    questions: {
      type: [questionSchema],
      required: [true, 'Questions are required'],
      validate: {
        validator: function(questions: IQuestion[]) {
          return questions.length > 0;
        },
        message: 'Quiz must have at least one question'
      }
    },
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: [0, 'Passing score cannot be negative'],
      max: [100, 'Passing score cannot exceed 100']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for estimated duration
quizSchema.virtual('estimatedDuration').get(function() {
  const baseTimePerQuestion = 2; // minutes
  return this.questions.length * baseTimePerQuestion;
});

// Indexes for better query performance
quizSchema.index({ moduleId: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ 'questions.difficulty': 1 });

// Pre-save middleware to validate questions
quizSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    return next(new Error('Quiz must have at least one question'));
  }
  next();
});

// Static method to find active quizzes
quizSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('moduleId', 'title subject');
};

// Static method to find quizzes by module
quizSchema.statics.findByModule = function(moduleId: string) {
  return this.find({ moduleId, isActive: true }).populate('moduleId', 'title subject');
};

// Static method to find quizzes by difficulty
quizSchema.statics.findByDifficulty = function(difficulty: string) {
  return this.find({ difficulty, isActive: true }).populate('moduleId', 'title subject');
};

export const Quiz = mongoose.model<IQuizDocument>('Quiz', quizSchema); 