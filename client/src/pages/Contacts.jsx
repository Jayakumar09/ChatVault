import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Image, Phone, Mail, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockMessages, formatNumber } from '../services/mockData';
import Card from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';

const ContactCard = ({ contact, onClick, isSelected }) => {
  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onClick(contact)}
      className={`glass-card p-4 cursor-pointer transition-all ${
        isSelected ? 'border-accent-primary/50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-xl font-bold text-white">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold truncate">{contact.name}</h3>
          <p className="text-sm text-text-tertiary truncate">{contact.phone}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{formatNumber(contact.totalMessages)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Image className="w-4 h-4" />
          <span className="text-sm">{contact.totalMedia}</span>
        </div>
        <span className="ml-auto text-xs text-text-tertiary">
          {contact.lastMessageAt ? formatDate(contact.lastMessageAt) : ''}
        </span>
      </div>
    </motion.div>
  );
};

const MessageList = ({ contact, messages, onClose }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="p-4 border-b border-border flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-background-tertiary text-text-secondary"
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-semibold">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">{contact.name}</h3>
          <p className="text-xs text-text-tertiary">{formatNumber(contact.totalMessages)} messages</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.isStarred ? 'bg-accent-primary/5 -mx-2 px-2 rounded-lg' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {message.contactId?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {message.contactId?.name || 'Unknown'}
                </span>
                <span className="text-xs text-text-tertiary">{formatTime(message.timestamp)}</span>
                {message.isStarred && <span className="text-amber-400">★</span>}
              </div>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Contacts = ({ onSelectContact }) => {
  const { contacts, loading } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedContact) {
      setMessages(mockMessages.filter(m => m.contactId._id === selectedContact._id));
    }
  }, [selectedContact]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Contacts</h1>
          <p className="text-text-secondary mt-1">{contacts.length} contacts in your archive</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onClick={setSelectedContact}
                isSelected={selectedContact?._id === contact._id}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-text-secondary">No contacts found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Contacts;