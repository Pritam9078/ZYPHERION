import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchProof extends Document {
  proofIds: mongoose.Types.ObjectId[];
  aggregatedProofData: string;
  status: 'pending' | 'submitted' | 'failed';
  txHash?: string;
  targetChain?: string;
  createdAt: Date;
}

const BatchProofSchema: Schema = new Schema({
  proofIds: [{ type: Schema.Types.ObjectId, ref: 'Proof', required: true }],
  aggregatedProofData: { type: String, required: true },
  status: { type: String, enum: ['pending', 'submitted', 'failed'], default: 'pending' },
  txHash: { type: String },
  targetChain: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBatchProof>('BatchProof', BatchProofSchema);
