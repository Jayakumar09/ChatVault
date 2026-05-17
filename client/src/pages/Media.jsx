import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Music, FileText, Grid, List, Download, Eye, X, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../services/mockData';
import Card from '../components/ui/Card';
import { MediaGridSkeleton } from '../components/ui/Skeleton';

const tabs = [
  { id: 'all', label: 'All Media', icon: Grid },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'document', label: 'Documents', icon: FileText }
];

const getDocIcon = (filename) => {
  if (!filename) return FileText;
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    pdf: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    ),
    doc: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15Z" />
      </svg>
    ),
    docx: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15Z" />
      </svg>
    ),
    xls: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15M8,19H16V21H8V19Z" />
      </svg>
    ),
    xlsx: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15M8,19H16V21H8V19Z" />
      </svg>
    ),
    ppt: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15M8,19H16V21H8V19Z" />
      </svg>
    ),
    pptx: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M13,3.5L18.5,9H13V3.5M8,11H16V13H8V11M8,15H14V17H8V15M8,19H16V21H8V19Z" />
      </svg>
    ),
    zip: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M20,18H4V8H20M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z" />
      </svg>
    ),
    txt: () => (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M14,19H12V17H14V19M14,15H12V13H14V15M14,11H12V9H14V11M16,19H16V9H16V19Z" />
      </svg>
    )
  };
  
  return iconMap[ext] || FileText;
};

const getDocColor = (filename) => {
  if (!filename) return 'bg-gray-500/20 text-gray-400';
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const colorMap = {
    pdf: 'bg-red-500/20 text-red-400',
    doc: 'bg-blue-500/20 text-blue-400',
    docx: 'bg-blue-500/20 text-blue-400',
    xls: 'bg-green-500/20 text-green-400',
    xlsx: 'bg-green-500/20 text-green-400',
    ppt: 'bg-orange-500/20 text-orange-400',
    pptx: 'bg-orange-500/20 text-orange-400',
    zip: 'bg-amber-500/20 text-amber-400',
    txt: 'bg-gray-500/20 text-gray-400'
  };
  
  return colorMap[ext] || 'bg-gray-500/20 text-gray-400';
};

const formatDate = (date) => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const MediaCard = ({ media, onPreview }) => {
  const getIcon = () => {
    const icons = {
      image: Image,
      video: Video,
      audio: Music,
      document: getDocIcon(media.originalName)
    };
    return icons[media.type] || FileText;
  };

  const getColor = () => {
    const colors = {
      image: 'bg-pink-500/20 text-pink-400',
      video: 'bg-purple-500/20 text-purple-400',
      audio: 'bg-cyan-500/20 text-cyan-400',
      document: getDocColor(media.originalName)
    };
    return colors[media.type] || 'bg-gray-500/20 text-gray-400';
  };

  const getMediaUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/${media.path}`;
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = getMediaUrl();
    link.download = media.originalName || 'file';
    link.click();
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    window.open(getMediaUrl(), '_blank');
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getMediaUrl());
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const isDocument = media.type === 'document';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-xl overflow-hidden bg-background-tertiary hover:bg-background-secondary transition-all cursor-pointer"
      onClick={() => onPreview(media)}
    >
      {media.type === 'image' ? (
        <div className="aspect-square bg-background-card">
          <img
            src={getMediaUrl()}
            alt={media.originalName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center hidden">
            <Image className="w-12 h-12 text-accent-primary/50" />
          </div>
        </div>
      ) : isDocument ? (
        <div className="aspect-square p-4 flex flex-col">
          <div className={`w-14 h-14 rounded-xl ${getDocColor(media.originalName)} flex items-center justify-center mb-3`}>
            {getDocIcon(media.originalName)()}
          </div>
          <p className="text-xs font-medium text-text-primary truncate w-full" title={media.originalName || 'Document'}>
            {media.originalName || 'Document'}
          </p>
          <p className="text-xs text-text-tertiary mt-1">{formatBytes(media.size)}</p>
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center">
          <div className={`w-16 h-16 rounded-2xl ${getColor()} flex items-center justify-center`}>
            <getIcon className="w-8 h-8" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate">{media.originalName || 'File'}</p>
          <p className="text-white/70 text-xs">{formatBytes(media.size)}</p>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {isDocument && (
          <>
            <button 
              onClick={handleOpen}
              className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
              title="Open"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </>
        )}
        {!isDocument && (
          <button className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70">
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Lightbox = ({ media, onClose }) => {
  if (!media) return null;

  const getMediaUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/${media.path}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="max-w-4xl max-h-[80vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === 'image' ? (
          <img
            src={getMediaUrl()}
            alt={media.originalName}
            className="w-full h-full object-contain rounded-2xl"
          />
        ) : media.type === 'video' ? (
          <video
            src={getMediaUrl()}
            controls
            className="w-full max-h-[80vh] rounded-2xl"
          />
        ) : media.type === 'audio' ? (
          <div className="bg-background-card rounded-2xl p-8 flex items-center justify-center">
            <div className="text-center max-w-md w-full">
              <Music className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
              <p className="text-text-primary font-medium">{media.originalName}</p>
              <audio
                src={getMediaUrl()}
                controls
                className="w-full mt-4"
              />
            </div>
          </div>
        ) : (
          <div className="bg-background-card rounded-2xl p-8 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <p className="text-text-primary font-medium">{media.originalName}</p>
              <p className="text-text-secondary text-sm mt-2">{formatBytes(media.size)}</p>
              <button className="mt-4 px-4 py-2 rounded-xl gradient-bg text-white text-sm">
                <Download className="w-4 h-4 inline mr-2" />
                Download
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const Media = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { media, loading } = useApp();
  const [activeTab, setActiveTab] = useState(type || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filteredMedia = activeTab === 'all'
    ? media
    : media.filter(m => m.type === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Media Gallery</h1>
          <p className="text-text-secondary mt-1">{media.length} files in your archive</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.id === 'all' ? '/media' : `/media/${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'gradient-bg text-white'
                  : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <MediaGridSkeleton />
      ) : filteredMedia.length > 0 ? (
        <div className={viewMode === 'grid' ? 'masonry-grid' : 'space-y-4'}>
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((item) => (
              <MediaCard
                key={item._id}
                media={item}
                onPreview={setSelectedMedia}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-background-tertiary flex items-center justify-center">
            <Image className="w-10 h-10 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No media found</h3>
          <p className="text-text-secondary">Import a WhatsApp backup to see your media</p>
        </div>
      )}

      <AnimatePresence>
        {selectedMedia && (
          <Lightbox media={selectedMedia} onClose={() => setSelectedMedia(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Media;