import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  address: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
