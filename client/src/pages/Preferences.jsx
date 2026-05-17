import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, BellOff, Globe, Folder, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Preferences = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useApp();
  
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications: true,
    language: 'en',
    autoOrganize: true
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ preferences });
      setTheme(preferences.theme);
      setSuccess('Preferences saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleThemeChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      theme: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Preferences</h1>
        <p className="text-text-secondary mt-1">Customize your ChatVault experience</p>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-3">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    preferences.theme === 'dark'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border hover:border-text-tertiary'
                  }`}
                >
                  <Moon className={`w-6 h-6 mx-auto mb-2 ${preferences.theme === 'dark' ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                  <p className="text-sm text-text-primary">Dark</p>
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    preferences.theme === 'light'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border hover:border-text-tertiary'
                  }`}
                >
                  <Sun className={`w-6 h-6 mx-auto mb-2 ${preferences.theme === 'light' ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                  <p className="text-sm text-text-primary">Light</p>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    preferences.theme === 'system'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border hover:border-text-tertiary'
                  }`}
                >
                  <Globe className={`w-6 h-6 mx-auto mb-2 ${preferences.theme === 'system' ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                  <p className="text-sm text-text-primary">System</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
              <div className="flex items-center gap-3">
                {preferences.notifications ? (
                  <Bell className="w-5 h-5 text-accent-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-text-tertiary" />
                )}
                <div>
                  <p className="text-text-primary font-medium">Push Notifications</p>
                  <p className="text-sm text-text-tertiary">Receive notifications for new messages</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications ? 'bg-accent-primary' : 'bg-background-primary'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Region
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Data Management
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-accent-primary" />
                <div>
                  <p className="text-text-primary font-medium">Auto-organize Backups</p>
                  <p className="text-sm text-text-tertiary">Automatically organize imported backups by date</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoOrganize')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.autoOrganize ? 'bg-accent-primary' : 'bg-background-primary'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences.autoOrganize ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-bg text-white font-medium rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
};

export default Preferences;