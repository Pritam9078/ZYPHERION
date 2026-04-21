import mongoose, { Schema, Document } from 'mongoose';

export interface IUsedNonce extends Document {
  nonce: string;
  address: string;
  createdAt: Date;
}

const UsedNonceSchema: Schema = new Schema({
  nonce: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL: Expire after 1 hour
});

// Ensure compound index for fast lookup
UsedNonceSchema.index({ nonce: 1, address: 1 });

export default mongoose.model<IUsedNonce>('UsedNonce', UsedNonceSchema);
