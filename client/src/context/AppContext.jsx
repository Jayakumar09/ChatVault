import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');

  const [dashboardData, setDashboardData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [media, setMedia] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const [dashboardRes, contactsRes, mediaRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/contacts'),
        api.get('/media')
      ]);

      setDashboardData(dashboardRes.data);
      setContacts(contactsRes.data.contacts || []);
      setMedia(mediaRes.data.media || []);
    } catch (error) {
      console.error('Failed to load data:', error.message);
      setConnectionError('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const uploadBackup = async (file) => {
    if (!dbConnected) {
      return { success: false, error: 'Database not connected' };
    }

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const response = await api.post('/backup/upload', formData);
      const { backup } = response.data;

      await api.post('/backup/parse', { backupId: backup._id });

      await refreshData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const searchMessages = async (query) => {
    if (!dbConnected) return [];

    try {
      const response = await api.get(`/messages/search?q=${encodeURIComponent(query)}`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Search failed:', error.message);
      return [];
    }
  };

  const getContactMessages = async (contactId) => {
    if (!dbConnected) return [];

    try {
      const response = await api.get(`/contacts/${contactId}/messages`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Failed to get messages:', error.message);
      return [];
    }
  };

  const toggleStarMessage = async (messageId) => {
    if (!dbConnected) return;

    try {
      await api.patch(`/messages/${messageId}/star`);
      setMessages(prev =>
        prev.map(m => m._id === messageId ? { ...m, isStarred: !m.isStarred } : m)
      );
    } catch (error) {
      console.error('Failed to toggle star:', error.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        dashboardData,
        contacts,
        setContacts,
        messages,
        setMessages,
        media,
        setMedia,
        loading,
        dbConnected,
        connectionError,
        uploadModalOpen,
        setUploadModalOpen,
        searchQuery,
        setSearchQuery,
        uploadBackup,
        searchMessages,
        getContactMessages,
        toggleStarMessage,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};