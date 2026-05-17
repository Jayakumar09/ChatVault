import mongoose from 'mongoose';

const mediaFileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

mediaFileSchema.index({ userId: 1 });
mediaFileSchema.index({ contactId: 1 });
mediaFileSchema.index({ type: 1 });

export default mongoose.model('MediaFile', mediaFileSchema);