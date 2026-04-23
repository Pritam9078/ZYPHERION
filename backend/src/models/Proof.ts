import mongoose, { Schema, Document } from 'mongoose';

export interface IProof extends Document {
  ruleId: mongoose.Types.ObjectId;
  submitter: string;
  proofData: string; // Stringified Groth16 proof
  publicSignals: string[]; // Public signals output from the ZK circuit
  isZK: boolean; // Flag to indicate if it's a true ZK proof
  status: 'pending' | 'pending_approval' | 'verified' | 'failed';
  txHash?: string; 
  signatures: Array<{ signer: string, signature: string, timestamp: Date }>;
  createdAt: Date;
}

const ProofSchema: Schema = new Schema({
  ruleId: { type: Schema.Types.ObjectId, ref: 'LogicRule', required: true },
  submitter: { type: String, required: true },
  proofData: { type: String, required: true },
  publicSignals: { type: [String], default: [] },
  isZK: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'pending_approval', 'verified', 'failed'], default: 'pending' },
  txHash: { type: String },
  signatures: [{
    signer: String,
    signature: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProof>('Proof', ProofSchema);
