import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Palette,
  Database,
  Bell,
  Shield,
  HardDrive,
  Moon,
  Sun,
  Trash2,
  Download,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';

const SettingSection = ({ title, icon: Icon, children }) => (
  <Card>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </Card>
);

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      enabled ? 'gradient-bg' : 'bg-background-tertiary'
    }`}
  >
    <motion.div
      className="absolute top-1 w-4 h-4 rounded-full bg-white"
      animate={{ left: enabled ? 28 : 4 }}
      transition={{ duration: 0.2 }}
    />
  </button>
);

const Settings = () => {
  const { theme, setTheme } = useApp();
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: false,
    compressMedia: true,
    darkMode: theme === 'dark'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'darkMode') setTheme(value ? 'dark' : 'light');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-accent-primary" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">Customize your ChatVault experience</p>
      </div>

      <SettingSection title="Appearance" icon={Palette}>
        <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
          <div className="flex items-center gap-3">
            {settings.darkMode ? (
              <Moon className="w-5 h-5 text-accent-primary" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <span className="text-text-primary">Dark Mode</span>
          </div>
          <Toggle
            enabled={settings.darkMode}
            onChange={(v) => updateSetting('darkMode', v)}
          />
        </div>
      </SettingSection>

      <SettingSection title="Notifications" icon={Bell}>
        <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
          <div>
            <span className="text-text-primary block">Push Notifications</span>
            <span className="text-sm text-text-tertiary">Receive alerts for new imports</span>
          </div>
          <Toggle
            enabled={settings.notifications}
            onChange={(v) => updateSetting('notifications', v)}
          />
        </div>
      </SettingSection>

      <SettingSection title="Storage" icon={HardDrive}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
            <div>
              <span className="text-text-primary block">Compress Media</span>
              <span className="text-sm text-text-tertiary">Reduce storage usage</span>
            </div>
            <Toggle
              enabled={settings.compressMedia}
              onChange={(v) => updateSetting('compressMedia', v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
            <div>
              <span className="text-text-primary block">Auto Backup</span>
              <span className="text-sm text-text-tertiary">Automatically backup parsed chats</span>
            </div>
            <Toggle
              enabled={settings.autoBackup}
              onChange={(v) => updateSetting('autoBackup', v)}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-text-primary block">Storage Used</span>
              <span className="text-sm text-text-tertiary">2.4 GB / 10 GB</span>
            </div>
            <div className="w-32 h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div className="w-1/4 h-full gradient-bg" />
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Data Management" icon={Database}>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-background-tertiary/50 hover:bg-background-tertiary transition-colors text-left">
            <Download className="w-5 h-5 text-accent-secondary" />
            <div>
              <span className="text-text-primary block">Export All Data</span>
              <span className="text-sm text-text-tertiary">Download all chats and media</span>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-error/10 hover:bg-error/20 transition-colors text-left">
            <Trash2 className="w-5 h-5 text-error" />
            <div>
              <span className="text-error block">Clear All Data</span>
              <span className="text-sm text-text-tertiary">Delete all imported backups</span>
            </div>
          </button>
        </div>
      </SettingSection>

      <SettingSection title="Security" icon={Shield}>
        <div className="p-3 rounded-xl bg-background-tertiary/50">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <div>
              <span className="text-text-primary block">Local Processing Only</span>
              <span className="text-sm text-text-tertiary">Your data never leaves your device</span>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="About" icon={Info}>
        <div className="space-y-2 text-sm text-text-secondary">
          <p><span className="text-text-primary">Version:</span> 1.0.0</p>
          <p><span className="text-text-primary">Build:</span> 2024.01.20</p>
          <p><span className="text-text-primary">License:</span> MIT</p>
        </div>
      </SettingSection>
    </motion.div>
  );
};

export default Settings;