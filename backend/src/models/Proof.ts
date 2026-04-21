import mongoose, { Schema, Document } from 'mongoose';

export interface IProof extends Document {
  ruleId: mongoose.Types.ObjectId;
  submitter: string;
  proofData: string; // Proof or reference to proof
  status: 'pending' | 'verified' | 'failed';
  txHash?: string; // Stellar tx hash
  createdAt: Date;
}

const ProofSchema: Schema = new Schema({
  ruleId: { type: Schema.Types.ObjectId, ref: 'LogicRule', required: true },
  submitter: { type: String, required: true },
  proofData: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProof>('Proof', ProofSchema);
