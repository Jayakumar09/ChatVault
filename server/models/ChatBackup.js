import mongoose from 'mongoose';

const chatBackupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  status: { type: String, enum: ['uploaded', 'parsing', 'completed', 'failed'], default: 'uploaded' },
  totalContacts: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  totalMedia: { type: Number, default: 0 },
  processedAt: { type: Date, default: null },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

chatBackupSchema.index({ userId: 1 });

export default mongoose.model('ChatBackup', chatBackupSchema);