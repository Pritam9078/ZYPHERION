import mongoose, { Schema, Document } from 'mongoose';

export interface IBilling extends Document {
  userAddress: string;
  depositAmount: number;
  currency: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  type: 'subscription' | 'deposit' | 'escrow_stake';
  tierUpgradeTo?: 'Basic' | 'Pro' | 'Enterprise';
  createdAt: Date;
}

const BillingSchema: Schema = new Schema({
  userAddress: { type: String, required: true },
  depositAmount: { type: Number, required: true },
  currency: { type: String, default: 'USDC_TEST' },
  txHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'confirmed', 'failed', 'refunded'], default: 'pending' },
  type: { type: String, enum: ['subscription', 'deposit', 'escrow_stake'], required: true },
  tierUpgradeTo: { type: String, enum: ['Basic', 'Pro', 'Enterprise'] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBilling>('Billing', BillingSchema);
