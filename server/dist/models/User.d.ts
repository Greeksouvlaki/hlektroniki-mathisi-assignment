import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}> & IUserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map