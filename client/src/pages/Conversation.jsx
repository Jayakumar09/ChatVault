import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Image, Video, Music, FileText,
  Star, Search, MoreVertical, Phone, Video as VideoIcon,
  Smile, Paperclip, Mic, Download, Eye, Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatNumber } from '../services/mockData';
import api from '../services/api';
import Card from '../components/ui/Card';

const MessageBubble = ({ message, isOwn, onStar }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = () => {
    switch (message.type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'image': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'video': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'audio': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'document': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold flex-shrink-0 ${
        isOwn ? 'gradient-bg' : 'bg-background-tertiary'
      }`}>
        {message.contactId?.name?.charAt(0).toUpperCase() || '?'}
      </div>

      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">
            {isOwn ? 'You' : message.contactId?.name || 'Unknown'}
          </span>
          <span className="text-xs text-text-tertiary">{formatTime(message.timestamp)}</span>
          {message.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        </div>

        <div className={`relative group rounded-2xl p-4 ${
          isOwn
            ? 'gradient-bg text-white'
            : 'bg-background-tertiary text-text-primary'
        }`}>
          {message.type !== 'text' && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2 ${getTypeColor()}`}>
              {getTypeIcon()}
              <span className="text-xs capitalize">{message.type}</span>
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          <button
            onClick={() => onStar(message._id)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
          >
            <Star className={`w-4 h-4 ${message.isStarred ? 'text-amber-400 fill-amber-400' : 'text-white/70'}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DateSeparator = ({ date }) => {
  const formatDate = (d) => {
    const now = new Date();
    const msgDate = new Date(d);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return msgDate.toLocaleDateString('en-US', { weekday: 'long' });
    return msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-text-tertiary px-3 py-1 bg-background-secondary rounded-full">
        {formatDate(date)}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

const Conversation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleStarMessage } = useApp();
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadContactAndMessages();
  }, [id]);

  const loadContactAndMessages = async () => {
    setLoading(true);
    try {
      const [contactRes, messagesRes] = await Promise.all([
        api.get(`/contacts/${id}`),
        api.get(`/contacts/${id}/messages?page=1&limit=50`)
      ]);

      setContact(contactRes.data.contact);
      setMessages(messagesRes.data.messages || []);
      setHasMore(messagesRes.data.total > messagesRes.data.messages.length);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = page + 1;
    try {
      const response = await api.get(`/contacts/${id}/messages?page=${nextPage}&limit=50`);
      setMessages(prev => [...response.data.messages, ...prev]);
      setPage(nextPage);
      setHasMore(response.data.total > (response.data.messages.length + messages.length));
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (messageId) => {
    await toggleStarMessage(messageId);
    setMessages(prev =>
      prev.map(m => m._id === messageId ? { ...m, isStarred: !m.isStarred } : m)
    );
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const dateKey = new Date(msg.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  if (loading && !contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg animate-pulse" />
          <p className="text-text-secondary">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="glass-card p-4 flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/contacts')}
          className="p-2 rounded-xl hover:bg-background-tertiary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-xl font-bold text-white">
          {contact?.name?.charAt(0).toUpperCase() || '?'}
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-text-primary">{contact?.name}</h2>
          <p className="text-sm text-text-secondary">
            {formatNumber(contact?.totalMessages || 0)} messages • {formatNumber(contact?.totalMedia || 0)} media
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <Phone className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <VideoIcon className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <MoreVertical className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {loading && messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">Loading messages...</p>
          </div>
        ) : Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            <DateSeparator date={msgs[0].timestamp} />
            <div className="space-y-4">
              {msgs.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={false}
                  onStar={handleStar}
                />
              ))}
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={loadMoreMessages}
            className="w-full py-3 text-center text-sm text-accent-primary hover:bg-background-tertiary rounded-xl transition-colors"
          >
            Load older messages
          </button>
        )}
      </div>

      <div className="glass-card p-4 mt-auto">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <Paperclip className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <Image className="w-5 h-5 text-text-secondary" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-background-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <button className="p-2 rounded-xl hover:bg-background-tertiary transition-colors">
            <Smile className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-3 rounded-xl gradient-bg text-white">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Conversation;