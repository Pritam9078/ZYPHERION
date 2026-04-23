import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  address: string;
  role: 'admin' | 'user';
  status: 'active' | 'banned';
  
  // SaaS Tiering & Identity
  accountType: 'Guest' | 'Developer' | 'DAOAdmin' | 'NodeOperator';
  tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  kycStatus: 'unverified' | 'pending' | 'verified';
  approved: boolean;
  
  // Quotas & Usage
  proofsUsedThisMonth: number;
  creditsBalance: number;
  gasBalance: number; // For Gas Abstraction Service
  
  // Phase 3: Decentralized Identity
  did?: string;
  didDocument?: any;
  isDIDVerified: boolean;

  // Profile Information
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  apiKey?: string;


  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  
  // SaaS Fields
  accountType: { type: String, enum: ['Guest', 'Developer', 'DAOAdmin', 'NodeOperator'], default: 'Guest' },
  tier: { type: String, enum: ['Free', 'Basic', 'Pro', 'Enterprise'], default: 'Free' },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  approved: { type: Boolean, default: false }, // Requires admin approval for non-guests
  
  proofsUsedThisMonth: { type: Number, default: 0 },
  creditsBalance: { type: Number, default: 0 },
  gasBalance: { type: Number, default: 0 },

  // Phase 3: Decentralized Identity
  did: { type: String },
  didDocument: { type: Schema.Types.Mixed },
  isDIDVerified: { type: Boolean, default: false },

  // Profile Information
  name: { type: String },
  email: { type: String },
  bio: { type: String },
  avatar: { type: String },
  apiKey: { type: String, unique: true, sparse: true },


  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
