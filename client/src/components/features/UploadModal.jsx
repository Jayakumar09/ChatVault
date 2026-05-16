import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';

const UploadModal = () => {
  const { uploadModalOpen, setUploadModalOpen, uploadBackup } = useApp();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setStatus('uploading');

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const result = await uploadBackup(file);

    clearInterval(interval);
    setProgress(100);

    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        setUploadModalOpen(false);
        resetState();
      }, 2000);
    } else {
      setStatus('error');
      setError(result.error || 'Upload failed');
    }

    setUploading(false);
  };

  const resetState = () => {
    setFile(null);
    setProgress(0);
    setStatus(null);
    setError(null);
  };

  const handleClose = () => {
    setUploadModalOpen(false);
    resetState();
  };

  return (
    <Modal isOpen={uploadModalOpen} onClose={handleClose} title="Import WhatsApp Backup" size="md">
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
              Supported format: .zip (exported from WhatsApp)
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

            {uploading && (
              <div className="mt-4">
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-bg"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-text-secondary flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing backup...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-4 p-3 bg-success/10 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm text-success">Backup imported successfully!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-3 bg-error/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-error" />
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

        <div className="p-4 rounded-xl bg-background-tertiary/50">
          <h4 className="text-sm font-semibold text-text-primary mb-2">How to export WhatsApp chat</h4>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            <li>Open WhatsApp and go to the chat you want to export</li>
            <li>Tap More options → More → Export chat</li>
            <li>Choose "Include media" to get the full backup</li>
            <li>Select a sharing method and save as ZIP</li>
            <li>Upload the ZIP file here</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;