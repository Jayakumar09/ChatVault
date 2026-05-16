import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: { type: String, enum: ['text', 'image', 'video', 'audio', 'document'], default: 'text' },
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaFile', default: null },
  isStarred: { type: Boolean, default: false },
  metadata: { type: Object, default: {} }
});

messageSchema.index({ contactId: 1, timestamp: -1 });
messageSchema.index({ content: 'text' });

export default mongoose.model('Message', messageSchema);