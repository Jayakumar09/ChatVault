import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, Loader, AlertCircle, Image, MessageSquare, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const UploadModal = () => {
  const { uploadModalOpen, setUploadModalOpen, refreshData } = useApp();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [backupId, setBackupId] = useState(null);

  useEffect(() => {
    let pollInterval;
    if (backupId && status === 'parsing') {
      pollInterval = setInterval(async () => {
        try {
          const response = await api.get(`/backup/status/${backupId}`);
          const { progress: prog, currentPhase: phase, status: stat, totalContacts, totalMessages, totalMedia } = response.data.backup;

          setProgress(prog || 0);
          setCurrentPhase(phase || 'Processing...');

          if (stat === 'completed') {
            setStatus('success');
            setProgress(100);
            setCurrentPhase('Import complete!');
            setImportResult({ totalContacts, totalMessages, totalMedia });
            setBackupId(null);
            refreshData();
          } else if (stat === 'failed') {
            setStatus('error');
            setError('Import failed');
            setBackupId(null);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 1000);
    }
    return () => clearInterval(pollInterval);
  }, [backupId, status, refreshData]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];

      if (f.size > 500 * 1024 * 1024) {
        setError('File size exceeds 500MB limit');
        return;
      }

      setFile(f);
      setError(null);
      setStatus(null);
      setImportResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setCurrentPhase('Uploading file...');
    setStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const uploadResponse = await api.post('/backup/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(Math.min(percent, 90));
        }
      });

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'Upload failed');
      }

      const { backup } = uploadResponse.data;
      setBackupId(backup._id);
      setStatus('parsing');
      setCurrentPhase('Processing backup...');

      const parseResponse = await api.post('/backup/parse', { backupId: backup._id });

      if (parseResponse.data.success) {
        setStatus('success');
        setProgress(100);
        setCurrentPhase('Import complete!');
        setImportResult(parseResponse.data.result);
        refreshData();
      }

    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');

      if (err.response?.status === 409) {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.error || err.message || 'Import failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setProgress(0);
    setCurrentPhase('');
    setStatus(null);
    setError(null);
    setImportResult(null);
    setBackupId(null);
  };

  const handleClose = () => {
    if (!uploading) {
      setUploadModalOpen(false);
      resetState();
    }
  };

  return (
    <Modal
      isOpen={uploadModalOpen}
      onClose={handleClose}
      title="Import WhatsApp Backup"
      size="md"
    >
      <div className="space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={`upload-zone p-8 rounded-2xl text-center cursor-pointer ${
              isDragActive ? 'drag-active' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload WhatsApp Export'}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Drag and drop your WhatsApp chat export ZIP file here
            </p>
            <p className="text-xs text-text-tertiary">
              Supported format: .zip (max 500MB)
            </p>
          </div>
        ) : (
          <div className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <File className="w-6 h-6 text-accent-primary" />
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">{file.name}</p>
                <p className="text-sm text-text-tertiary">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button
                  onClick={resetState}
                  className="p-2 rounded-lg hover:bg-background-tertiary"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              )}
            </div>

            {(status === 'uploading' || status === 'parsing') && (
              <div className="mt-4 space-y-3">
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-bg"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {currentPhase || 'Processing...'}
                  </p>
                  <span className="text-sm text-text-tertiary">{progress}%</span>
                </div>
              </div>
            )}

            {status === 'success' && importResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-success/10 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-success font-medium">Import completed successfully!</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-background-tertiary rounded-xl">
                    <Users className="w-5 h-5 text-accent-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-text-primary">{importResult.totalContacts}</p>
                    <p className="text-xs text-text-tertiary">Contacts</p>
                  </div>
                  <div className="text-center p-3 bg-background-tertiary rounded-xl">
                    <MessageSquare className="w-5 h-5 text-accent-secondary mx-auto mb-1" />
                    <p className="text-lg font-bold text-text-primary">{importResult.totalMessages?.toLocaleString()}</p>
                    <p className="text-xs text-text-tertiary">Messages</p>
                  </div>
                  <div className="text-center p-3 bg-background-tertiary rounded-xl">
                    <Image className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-text-primary">{importResult.totalMedia}</p>
                    <p className="text-xs text-text-tertiary">Media</p>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-3 bg-error/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                <span className="text-sm text-error">{error}</span>
              </div>
            )}
          </div>
        )}

        {file && !status && (
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-3 rounded-xl gradient-bg text-white font-medium hover:shadow-glow transition-shadow disabled:opacity-50"
            >
              {uploading ? 'Processing...' : 'Import Backup'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <button
            onClick={handleClose}
            className="w-full px-4 py-3 rounded-xl gradient-bg text-white font-medium hover:shadow-glow transition-shadow"
          >
            Done
          </button>
        )}

        <div className="p-4 rounded-xl bg-background-tertiary/50">
          <h4 className="text-sm font-semibold text-text-primary mb-2">How to export WhatsApp chat</h4>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            <li>Open WhatsApp → Select a chat</li>
            <li>Tap More (⋮) → Export chat</li>
            <li>Choose "Include media" for full backup</li>
            <li>Share via email or save to Files</li>
            <li>Upload the ZIP file here</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;