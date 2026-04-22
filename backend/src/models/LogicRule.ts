import mongoose, { Schema, Document } from 'mongoose';

export interface ILogicRule extends Document {
  creator: string;
  name: string;
  description: string;
  conditions: any;
  status: 'pending' | 'active' | 'disabled';
  tags: string[];
  version: number;
  automationConfig: {
    autoExecute: boolean;
    retryDelay: number;
    maxRetries: number;
  };
  
  // Cross-Chain Execution (Phase 1)
  targetChain?: string;
  targetContract?: string;
  targetPayload?: string;
  useGasAbstraction?: boolean;

  // Phase 2: Intelligence & Automation
  scheduledAt?: Date;
  recurrenceInterval?: number; // seconds
  dataSourceUrl?: string;
  dataSourcePath?: string;
  triggerEventSignature?: string;
  triggerContractAddress?: string;

  onChainId?: number;
  onChainTxHash?: string;
  createdAt: Date;
}

const LogicRuleSchema: Schema = new Schema({
  creator: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  conditions: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['pending', 'active', 'disabled'], default: 'active' },
  tags: [{ type: String }],
  version: { type: Number, default: 1 },
  automationConfig: {
    autoExecute: { type: Boolean, default: false },
    retryDelay: { type: Number, default: 60 }, // minutes
    maxRetries: { type: Number, default: 3 },
  },
  
  // Cross-Chain Fields
  targetChain: { type: String },
  targetContract: { type: String },
  targetPayload: { type: String },
  useGasAbstraction: { type: Boolean, default: false },

  // Phase 2: Intelligence & Automation
  scheduledAt: { type: Date },
  recurrenceInterval: { type: Number },
  dataSourceUrl: { type: String },
  dataSourcePath: { type: String },
  triggerEventSignature: { type: String },
  triggerContractAddress: { type: String },

  onChainId: { type: Number },
  onChainTxHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ILogicRule>('LogicRule', LogicRuleSchema);
