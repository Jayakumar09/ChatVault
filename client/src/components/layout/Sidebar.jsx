import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Image,
  FileText,
  Music,
  Video,
  Clock,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Archive
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/media', icon: Image, label: 'Media' },
  { path: '/media/documents', icon: FileText, label: 'Documents' },
  { path: '/media/audio', icon: Music, label: 'Audio' },
  { path: '/media/videos', icon: Video, label: 'Videos' },
  { path: '/backups', icon: Archive, label: 'Backups' },
  { path: '/timeline', icon: Clock, label: 'Timeline' },
  { path: '/starred', icon: Star, label: 'Starred' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-background-secondary border-r border-border flex flex-col"
    >
      <div className="p-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: collapsed ? 0 : 1 }}
        >
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Archive className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold gradient-text">ChatVault</span>
          )}
        </motion.div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive ? 'active' : 'hover:bg-background-tertiary'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-accent-primary' : 'text-text-secondary'
                }`}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-medium ${
                    isActive ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-background-tertiary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;