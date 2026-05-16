import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronRight, MessageSquare, Users } from 'lucide-react';
import { mockTimeline, mockMessages, formatNumber } from '../services/mockData';
import Card from '../components/ui/Card';

const TimelineItem = ({ item, isOpen, onToggle }) => {
  const getDateLabel = () => {
    const now = new Date();
    const date = new Date(item._id.includes('-') && !item._id.includes(':') ? item._id + '-01' : item._id);

    if (item.label) return item.label;

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return 'This Month';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const sampleMessages = mockMessages.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-background-tertiary/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white">
          <Calendar className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h3 className="text-text-primary font-semibold">{getDateLabel()}</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-text-secondary flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {formatNumber(item.count)} messages
            </span>
            <span className="text-sm text-text-tertiary flex items-center gap-1">
              <Users className="w-3 h-3" />
              {item.contacts} contacts
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-3">
              {sampleMessages.map((message, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-background-tertiary/50"
                >
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {message.contactId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {message.contactId?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary truncate">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Timeline = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const groupByPeriod = () => {
    const today = new Date();
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    mockTimeline.forEach(item => {
      const date = new Date(item._id.includes('-') && !item._id.includes(':') ? item._id + '-01' : item._id);
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) groups.today.push(item);
      else if (diffDays === 1) groups.yesterday.push(item);
      else if (diffDays < 7) groups.thisWeek.push(item);
      else if (diffDays < 30) groups.thisMonth.push(item);
      else groups.older.push(item);
    });

    return groups;
  };

  const grouped = groupByPeriod();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Timeline</h1>
        <p className="text-text-secondary mt-1">Browse your messages by date</p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([period, items]) => {
          if (items.length === 0) return null;

          const labels = {
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This Week',
            thisMonth: 'This Month',
            older: 'Older'
          };

          return (
            <div key={period}>
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-bg" />
                {labels[period]}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <TimelineItem
                    key={item._id}
                    item={item}
                    isOpen={openItems[item._id]}
                    onToggle={() => toggleItem(item._id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Timeline;