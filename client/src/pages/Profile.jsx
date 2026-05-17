import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, HardDrive, Archive, Lock, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();
  const { dashboardData } = useApp();
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({ username, email });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const api = (await import('../services/api')).default;
      await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-3xl font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                getInitials(user?.username)
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{user?.username || 'User'}</h2>
              <p className="text-text-secondary">{user?.email || ''}</p>
              <p className="text-sm text-text-tertiary mt-1">Member since {formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-accent-primary" />
            Account Information
          </h3>

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 gradient-bg text-white font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent-primary" />
            Change Password
          </h3>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-background-tertiary transition-colors"
            >
              Update Password
            </button>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 gradient-bg text-white font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-background-tertiary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-accent-primary" />
            Storage & Usage
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background-tertiary rounded-xl">
              <HardDrive className="w-5 h-5 text-accent-primary mb-2" />
              <p className="text-2xl font-bold text-text-primary">{formatBytes(dashboardData?.storageUsed || 0)}</p>
              <p className="text-sm text-text-tertiary">Storage Used</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-xl">
              <Archive className="w-5 h-5 text-accent-secondary mb-2" />
              <p className="text-2xl font-bold text-text-primary">{dashboardData?.totalBackups || 0}</p>
              <p className="text-sm text-text-tertiary">Backups</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-xl">
              <User className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold text-text-primary">{dashboardData?.totalContacts || 0}</p>
              <p className="text-sm text-text-tertiary">Contacts</p>
            </div>
            <div className="p-4 bg-background-tertiary rounded-xl">
              <Calendar className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-text-primary">{dashboardData?.totalMessages || 0}</p>
              <p className="text-sm text-text-tertiary">Messages</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;