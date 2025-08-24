import mongoose, { Document } from 'mongoose';
export interface IModuleDocument extends Document {
}
export declare const Module: mongoose.Model<IModuleDocument, {}, {}, {}, mongoose.Document<unknown, {}, IModuleDocument, {}> & IModuleDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Module.d.ts.map