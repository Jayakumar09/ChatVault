import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Image, Video, FileText, Music } from 'lucide-react';
import { mockMessages } from '../services/mockData';
import Card from '../components/ui/Card';

const StarredMessage = ({ message }) => {
  const getTypeIcon = () => {
    const icons = {
      text: MessageSquare,
      image: Image,
      video: Video,
      audio: Music,
      document: FileText
    };
    const Icon = icons[message.type] || MessageSquare;
    return Icon;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 hover:border-amber-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white flex-shrink-0">
          {message.contactId?.name?.charAt(0).toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-text-primary">
              {message.contactId?.name || 'Unknown'}
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs text-text-tertiary ml-auto">
              {formatDate(message.timestamp)}
            </span>
          </div>

          <p className="text-text-secondary text-sm whitespace-pre-wrap">{message.content}</p>

          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-1 rounded-lg text-xs ${
              message.type === 'text' ? 'bg-violet-500/20 text-violet-400' :
              message.type === 'image' ? 'bg-pink-500/20 text-pink-400' :
              message.type === 'video' ? 'bg-purple-500/20 text-purple-400' :
              message.type === 'audio' ? 'bg-cyan-500/20 text-cyan-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {message.type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Starred = () => {
  const [filter, setFilter] = useState('all');

  const starredMessages = mockMessages.filter(m => m.isStarred);

  const filteredMessages = filter === 'all'
    ? starredMessages
    : starredMessages.filter(m => m.type === filter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'document', label: 'Documents' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            Starred Messages
          </h1>
          <p className="text-text-secondary mt-1">
            {starredMessages.length} starred messages
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? 'gradient-bg text-white'
                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredMessages.length > 0 ? (
        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <StarredMessage key={message._id} message={message} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Star className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No starred messages</h3>
          <p className="text-text-secondary">Star important messages to find them quickly</p>
        </div>
      )}
    </motion.div>
  );
};

export default Starred;