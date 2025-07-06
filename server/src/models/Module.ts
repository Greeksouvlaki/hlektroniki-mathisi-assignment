import mongoose, { Schema, Document } from 'mongoose';
import { IModule, IContent } from '../types/index.js';

export interface IModuleDocument extends IModule, Document {}

const contentSchema = new Schema<IContent>(
  {
    type: {
      type: String,
      enum: ['text', 'video', 'image', 'interactive'],
      required: [true, 'Content type is required']
    },
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    order: {
      type: Number,
      required: [true, 'Content order is required'],
      min: [1, 'Order must be at least 1']
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: true }
);

const moduleSchema = new Schema<IModuleDocument>(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Module description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty level is required']
    },
    prerequisites: {
      type: [Schema.Types.ObjectId],
      ref: 'Module',
      default: []
    },
    learningObjectives: {
      type: [String],
      required: [true, 'Learning objectives are required'],
      validate: {
        validator: function(objectives: string[]) {
          return objectives.length > 0;
        },
        message: 'Module must have at least one learning objective'
      }
    },
    content: {
      type: [contentSchema],
      required: [true, 'Content is required'],
      validate: {
        validator: function(content: IContent[]) {
          return content.length > 0;
        },
        message: 'Module must have at least one content item'
      }
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours']
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

// Virtual for content count
moduleSchema.virtual('contentCount').get(function() {
  return this.get('content') ? this.get('content').length : 0;
});

// Virtual for completion rate (placeholder for future implementation)
moduleSchema.virtual('completionRate').get(function() {
  return 0; // Will be calculated based on user progress
});

// Indexes for better query performance
moduleSchema.index({ subject: 1 });
moduleSchema.index({ difficulty: 1 });
moduleSchema.index({ isActive: 1 });
moduleSchema.index({ createdBy: 1 });
moduleSchema.index({ prerequisites: 1 });

// Pre-save middleware to sort content by order
moduleSchema.pre('save', function(next) {
  if (this.content && this.content.length > 0) {
    this.content.sort((a, b) => a.order - b.order);
  }
  next();
});

// Static method to find active modules
moduleSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('createdBy', 'firstName lastName');
};

// Static method to find modules by subject
moduleSchema.statics.findBySubject = function(subject: string) {
  return this.find({ subject, isActive: true }).populate('createdBy', 'firstName lastName');
};

// Static method to find modules by difficulty
moduleSchema.statics.findByDifficulty = function(difficulty: string) {
  return this.find({ difficulty, isActive: true }).populate('createdBy', 'firstName lastName');
};

// Static method to find modules without prerequisites
moduleSchema.statics.findEntryLevel = function() {
  return this.find({ prerequisites: { $size: 0 }, isActive: true });
};

export const Module = mongoose.model<IModuleDocument>('Module', moduleSchema); 