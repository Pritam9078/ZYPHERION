import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  category: 'SECURITY' | 'GOVERNANCE' | 'SYSTEM' | 'USER';
  actor: string; // wallet address or 'SYSTEM'
  details: string;
  metadata: any;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  category: { type: String, enum: ['SECURITY', 'GOVERNANCE', 'SYSTEM', 'USER'], required: true },
  actor: { type: String, required: true },
  details: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
