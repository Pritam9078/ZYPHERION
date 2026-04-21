import mongoose from 'mongoose';

const SystemSettingSchema = new mongoose.Schema({
  protocolHalt: {
    type: Boolean,
    default: false,
  },
  lastHaltedBy: {
    type: String,
  },
  haltReason: {
    type: String,
    default: 'Emergency maintenance or security audit.',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('SystemSetting', SystemSettingSchema);
