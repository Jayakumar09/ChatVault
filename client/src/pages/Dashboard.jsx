import { motion } from 'framer-motion';
import { TrendingUp, Archive, Clock, Star, Wifi, WifiOff, AlertCircle, Database, HardDrive, Calendar } from 'lucide-react';
import { AnalyticsCards, MediaStatsChart, TopContacts, ActivityChart } from '../components/features/Analytics';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/ui/Skeleton';

const ConnectionStatus = () => {
  const { dbConnected, connectionError, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-xl">
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-sm text-text-secondary">Connecting to database...</span>
      </div>
    );
  }

  if (!dbConnected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-error/10 rounded-xl border border-error/20">
        <WifiOff className="w-4 h-4 text-error" />
        <span className="text-sm text-error">Database not connected</span>
        {connectionError && (
          <span className="text-xs text-error/70">- {connectionError}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20">
      <Wifi className="w-4 h-4 text-success" />
      <span className="text-sm text-success">MongoDB Atlas Connected</span>
    </div>
  );
};

const EmptyState = () => {
  const { dbConnected, refreshData } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-12 text-center"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
        <Database className="w-10 h-10 text-accent-primary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">No Data Yet</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        {dbConnected
          ? 'Import your WhatsApp backup to get started. Your chats and media will appear here.'
          : 'Please ensure MongoDB Atlas is connected to import your WhatsApp backups.'}
      </p>
      {dbConnected && (
        <button
          onClick={refreshData}
          className="px-6 py-2 rounded-xl gradient-bg text-white font-medium hover:shadow-glow transition-all"
        >
          Refresh Data
        </button>
      )}
    </motion.div>
  );
};

const Dashboard = () => {
  const { dashboardData, loading, dbConnected } = useApp();
  const { user } = useAuth();

  const hasData = dashboardData && (
    dashboardData.totalContacts > 0 ||
    dashboardData.totalMessages > 0 ||
    dashboardData.totalMedia > 0
  );

  const quickStats = [
    { label: 'Backups', value: dashboardData?.totalBackups || 0, icon: Archive, color: 'from-emerald-500 to-teal-500' },
    { label: 'This Week', value: dashboardData?.messagesLast7Days?.reduce((a, b) => a + b.count, 0) || 0, icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
    { label: 'Starred', value: dashboardData?.totalStarred || 0, icon: Star, color: 'from-amber-500 to-orange-500' },
    { label: 'Timeline', value: 'View All', icon: Clock, color: 'from-violet-500 to-purple-500', isLink: true }
  ];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, {user?.username || 'User'} 👋
          </h1>
          <p className="text-text-secondary mt-1">Your chat archive at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {dashboardData && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-xl border border-border">
                <HardDrive className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-secondary">{formatBytes(dashboardData.storageUsed || 0)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-xl border border-border">
                <Archive className="w-4 h-4 text-accent-secondary" />
                <span className="text-sm text-text-secondary">{dashboardData.totalBackups || 0} backups</span>
              </div>
            </>
          )}
          <ConnectionStatus />
        </div>
      </div>

      {!dbConnected && !loading ? (
        <EmptyState />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          <AnalyticsCards data={dashboardData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MediaStatsChart mediaStats={dashboardData?.mediaStats} />
            <ActivityChart messagesLast7Days={dashboardData?.messagesLast7Days} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopContacts contacts={dashboardData?.mostActiveContacts} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Quick Access</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{stat.label}</p>
                      <p className="text-lg font-bold text-text-primary">
                        {stat.isLink ? (
                          <span className="text-accent-primary text-sm">→</span>
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;