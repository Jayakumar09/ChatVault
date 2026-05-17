import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Archive, Trash2, Eye, RefreshCw, Calendar, Users, MessageSquare, Image, Download, Loader2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../services/mockData';
import api from '../services/api';
import Modal from '../components/ui/Modal';

const Backups = () => {
  const { refreshData } = useApp();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, backup: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await api.get('/backup');
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.backup) return;
    
    setDeleting(true);
    try {
      await api.delete(`/backup/${deleteModal.backup._id}`);
      setBackups(prev => prev.filter(b => b._id !== deleteModal.backup._id));
      setDeleteModal({ open: false, backup: null });
      refreshData();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Backups</h1>
          <p className="text-text-secondary mt-1">Manage your imported WhatsApp backups</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary rounded-xl border border-border">
          <Archive className="w-5 h-5 text-accent-primary" />
          <span className="text-text-primary font-medium">{backups.length} total</span>
        </div>
      </div>

      {backups.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
            <Archive className="w-10 h-10 text-accent-primary" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Backups Yet</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Import your WhatsApp backup to see it here. Upload a ZIP file to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {backups.map((backup) => (
            <motion.div
              key={backup._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 hover:border-accent-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{backup.originalName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(backup.processedAt || backup.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        {formatBytes(backup.fileSize || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4 px-4 py-2 bg-background-tertiary rounded-xl">
                    <div className="text-center">
                      <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                      <span className="text-sm font-medium text-text-primary">{backup.totalContacts || 0}</span>
                    </div>
                    <div className="text-center">
                      <MessageSquare className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-sm font-medium text-text-primary">{backup.totalMessages || 0}</span>
                    </div>
                    <div className="text-center">
                      <Image className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                      <span className="text-sm font-medium text-text-primary">{backup.totalMedia || 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteModal({ open: true, backup })}
                    className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  backup.status === 'completed' 
                    ? 'bg-success/10 text-success'
                    : backup.status === 'parsing'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-text-tertiary/10 text-text-tertiary'
                }`}>
                  {backup.status === 'completed' ? 'Imported' : backup.status === 'parsing' ? 'Processing' : 'Pending'}
                </span>
                {backup.processedAt && (
                  <span className="text-xs text-text-tertiary">
                    Imported {formatDate(backup.processedAt)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, backup: null })}
      >
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary text-center mb-2">Delete Backup?</h3>
          <p className="text-text-secondary text-center mb-6">
            This will permanently delete "{deleteModal.backup?.originalName}" and all its messages, contacts, and media.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ open: false, backup: null })}
              className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-xl hover:bg-background-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-error text-white rounded-xl hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Backups;