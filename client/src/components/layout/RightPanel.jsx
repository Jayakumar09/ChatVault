import { motion } from 'framer-motion';
import { X, User, Phone, Mail, MessageSquare, Image, File, Calendar, Sparkles } from 'lucide-react';
import { formatBytes, formatNumber } from '../../services/mockData';

const RightPanel = ({ contact, onClose }) => {
  const mockStats = {
    totalMessages: Math.floor(Math.random() * 1000) + 100,
    images: Math.floor(Math.random() * 100) + 10,
    videos: Math.floor(Math.random() * 50) + 5,
    documents: Math.floor(Math.random() * 30) + 5,
    audioFiles: Math.floor(Math.random() * 20) + 2
  };

  const mockSharedFiles = [
    { name: 'IMG_001.jpg', type: 'image', size: 1234567 },
    { name: 'VID_002.mp4', type: 'video', size: 8765432 },
    { name: 'Document.pdf', type: 'document', size: 234567 },
    { name: 'Voice.mp3', type: 'audio', size: 345678 }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-background-secondary border-l border-border flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Contact Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center text-4xl font-bold text-white">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-text-primary">{contact.name}</h3>
          <p className="text-sm text-text-secondary">{contact.phone}</p>
        </div>

        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3 text-text-secondary">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Total Messages</span>
            <span className="ml-auto text-text-primary font-medium">{formatNumber(mockStats.totalMessages)}</span>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <Image className="w-4 h-4" />
            <span className="text-sm">Images</span>
            <span className="ml-auto text-text-primary font-medium">{mockStats.images}</span>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <File className="w-4 h-4" />
            <span className="text-sm">Documents</span>
            <span className="ml-auto text-text-primary font-medium">{mockStats.documents}</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            AI Summary
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            This contact has been active since {formatDate(contact.lastMessageAt)}.
            The conversation mainly consists of text messages with occasional media sharing.
            Most conversations are about {['work updates', 'personal topics', 'plans and meetups'][Math.floor(Math.random() * 3)]}.
          </p>
          <button className="mt-3 text-xs text-accent-primary hover:underline">
            View detailed insights →
          </button>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Recent Shared Files</h4>
          <div className="space-y-2">
            {mockSharedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  file.type === 'image' ? 'bg-pink-500/20 text-pink-400' :
                  file.type === 'video' ? 'bg-purple-500/20 text-purple-400' :
                  file.type === 'audio' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  <File className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-tertiary">{formatBytes(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </h4>
          <div className="space-y-2">
            <div className="text-sm text-text-secondary">
              First message: <span className="text-text-primary">{formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))}</span>
            </div>
            <div className="text-sm text-text-secondary">
              Last active: <span className="text-text-primary">{formatDate(contact.lastMessageAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default RightPanel;