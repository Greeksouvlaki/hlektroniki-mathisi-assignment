import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/index.js';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(((process.env as any)['BCRYPT_ROUNDS'] as string) || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance method to compare password
;(userSchema as any).methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, (this as any).password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Override toJSON to exclude password
;(userSchema as any).methods['toJSON'] = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email
;(userSchema as any).statics['findByEmail'] = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Static method to find active users
;(userSchema as any).statics['findActive'] = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
;(userSchema as any).statics['findByRole'] = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

export const User = mongoose.model<IUserDocument>('User', userSchema); 