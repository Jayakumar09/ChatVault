import { motion } from 'framer-motion';
import { Users, MessageSquare, HardDrive, Image, Video, Music, FileText } from 'lucide-react';
import Card from '../ui/Card';
import { formatBytes, formatNumber } from '../../services/mockData';

const AnalyticsCards = ({ data }) => {
  const stats = [
    {
      label: 'Total Contacts',
      value: data?.totalContacts || 0,
      icon: Users,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-400'
    },
    {
      label: 'Total Messages',
      value: data?.totalMessages || 0,
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400'
    },
    {
      label: 'Total Media',
      value: data?.totalMedia || 0,
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      iconColor: 'text-pink-400'
    },
    {
      label: 'Storage Used',
      value: formatBytes(data?.storageUsed || 0),
      icon: HardDrive,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${stat.bgColor} blur-2xl`} />
            <div className="relative flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const MediaStatsChart = ({ mediaStats }) => {
  const items = [
    { label: 'Images', icon: Image, color: 'bg-pink-500', count: mediaStats?.image?.count || 0 },
    { label: 'Videos', icon: Video, color: 'bg-purple-500', count: mediaStats?.video?.count || 0 },
    { label: 'Audio', icon: Music, color: 'bg-cyan-500', count: mediaStats?.audio?.count || 0 },
    { label: 'Documents', icon: FileText, color: 'bg-amber-500', count: mediaStats?.document?.count || 0 }
  ];

  const total = items.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Media Distribution</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.label} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm font-medium text-text-primary">{item.count}</span>
                </div>
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const TopContacts = ({ contacts }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Most Active Contacts</h3>
      <div className="space-y-3">
        {contacts?.map((contact, index) => (
          <motion.div
            key={contact._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-tertiary transition-colors"
          >
            <span className="text-lg font-bold text-text-tertiary w-6">{index + 1}</span>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-semibold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium truncate">{contact.name}</p>
              <p className="text-sm text-text-tertiary">{formatNumber(contact.count)} messages</p>
            </div>
            <div className="w-16 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-bg"
                initial={{ width: 0 }}
                animate={{ width: `${(contact.count / (contacts[0]?.count || 1)) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

const ActivityChart = ({ messagesLast7Days }) => {
  const maxCount = Math.max(...(messagesLast7Days?.map(d => d.count) || [1]));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Activity (Last 7 Days)</h3>
      <div className="flex items-end gap-2 h-32">
        {messagesLast7Days?.map((day, index) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          return (
            <motion.div
              key={day._id}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-1 rounded-t-lg gradient-bg"
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-text-tertiary">
        {messagesLast7Days?.slice(-7).map(day => (
          <span key={day._id}>{new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}</span>
        ))}
      </div>
    </Card>
  );
};

export { AnalyticsCards, MediaStatsChart, TopContacts, ActivityChart };