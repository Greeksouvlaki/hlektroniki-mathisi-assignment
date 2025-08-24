import mongoose, { Document } from 'mongoose';
import './Module.js';
export interface IQuizDocument extends Document {
}
export declare const Quiz: mongoose.Model<IQuizDocument, {}, {}, {}, mongoose.Document<unknown, {}, IQuizDocument, {}> & IQuizDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Quiz.d.ts.map