import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Upload,
  Sun,
  Moon,
  Menu,
  PanelRightClose,
  User,
  X,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import UploadModal from '../features/UploadModal';

const Navbar = ({ onToggleSidebar, onToggleRightPanel }) => {
  const navigate = useNavigate();
  const { theme, setTheme, searchQuery, setSearchQuery, setUploadModalOpen } = useApp();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/contacts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="h-16 bg-background-secondary/80 backdrop-blur-lg border-b border-border flex items-center px-4 gap-4 sticky top-0 z-50">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>

        <div className={`flex-1 max-w-md transition-all ${searchFocused ? 'max-w-lg' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search messages, contacts, files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium text-sm hover:shadow-glow transition-shadow"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Backup</span>
          </motion.button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-text-secondary" />
            ) : (
              <Moon className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          <button
            onClick={onToggleRightPanel}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors hidden lg:block"
          >
            <PanelRightClose className="w-5 h-5 text-text-secondary" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-semibold text-sm"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-xl object-cover" />
              ) : (
                getInitials(user?.username)
              )}
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-56 glass-card p-2"
                >
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-medium text-text-primary">{user?.username || 'User'}</p>
                    <p className="text-xs text-text-tertiary truncate">{user?.email || ''}</p>
                  </div>
                  <button 
                    onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg"
                  >
                    <UserCircle className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); navigate('/preferences'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Preferences
                  </button>
                  <div className="border-t border-border my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-background-tertiary rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <UploadModal />
    </>
  );
};

export default Navbar;