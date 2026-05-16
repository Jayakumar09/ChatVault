import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  totalMessages: { type: Number, default: 0 },
  totalMedia: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

contactSchema.index({ name: 'text' });

export default mongoose.model('Contact', contactSchema);