export const mockDashboardData = {
  totalContacts: 47,
  totalMessages: 12843,
  totalMedia: 2341,
  totalBackups: 3,
  storageUsed: 2456789012,
  mediaStats: {
    image: { count: 1234, size: 1234567890 },
    video: { count: 456, size: 987654321 },
    audio: { count: 321, size: 123456789 },
    document: { count: 330, size: 112233445 }
  },
  mostActiveContacts: [
    { _id: '1', name: 'Ravi Kumar', avatar: '', count: 1234 },
    { _id: '2', name: 'Priya Sharma', avatar: '', count: 987 },
    { _id: '3', name: 'Amit Patel', avatar: '', count: 756 },
    { _id: '4', name: 'Sneha Reddy', avatar: '', count: 654 },
    { _id: '5', name: 'Vikram Singh', avatar: '', count: 543 }
  ],
  messagesLast7Days: [
    { _id: '2024-01-20', count: 234 },
    { _id: '2024-01-19', count: 312 },
    { _id: '2024-01-18', count: 187 },
    { _id: '2024-01-17', count: 456 },
    { _id: '2024-01-16', count: 321 },
    { _id: '2024-01-15', count: 298 },
    { _id: '2024-01-14', count: 276 }
  ]
};

export const mockContacts = [
  { _id: '1', name: 'Ravi Kumar', phone: '+91 9876543210', avatar: '', totalMessages: 1234, totalMedia: 145, lastMessageAt: new Date('2024-01-20T14:30:00') },
  { _id: '2', name: 'Priya Sharma', phone: '+91 9876543211', avatar: '', totalMessages: 987, totalMedia: 89, lastMessageAt: new Date('2024-01-20T12:15:00') },
  { _id: '3', name: 'Amit Patel', phone: '+91 9876543212', avatar: '', totalMessages: 756, totalMedia: 67, lastMessageAt: new Date('2024-01-19T22:45:00') },
  { _id: '4', name: 'Sneha Reddy', phone: '+91 9876543213', avatar: '', totalMessages: 654, totalMedia: 123, lastMessageAt: new Date('2024-01-19T18:20:00') },
  { _id: '5', name: 'Vikram Singh', phone: '+91 9876543214', avatar: '', totalMessages: 543, totalMedia: 45, lastMessageAt: new Date('2024-01-18T16:10:00') },
  { _id: '6', name: 'Anjali Gupta', phone: '+91 9876543215', avatar: '', totalMessages: 432, totalMedia: 78, lastMessageAt: new Date('2024-01-18T14:55:00') },
  { _id: '7', name: 'Rahul Verma', phone: '+91 9876543216', avatar: '', totalMessages: 321, totalMedia: 34, lastMessageAt: new Date('2024-01-17T20:30:00') },
  { _id: '8', name: 'Kavya Nair', phone: '+91 9876543217', avatar: '', totalMessages: 298, totalMedia: 56, lastMessageAt: new Date('2024-01-17T11:45:00') }
];

export const mockMessages = [
  { _id: 'm1', contactId: { _id: '1', name: 'Ravi Kumar', avatar: '' }, content: 'Hey! How are you doing?', timestamp: new Date('2024-01-20T14:30:00'), type: 'text', isStarred: false },
  { _id: 'm2', contactId: { _id: '1', name: 'Ravi Kumar', avatar: '' }, content: 'Did you see the new movie?', timestamp: new Date('2024-01-20T14:31:00'), type: 'text', isStarred: true },
  { _id: 'm3', contactId: { _id: '1', name: 'Ravi Kumar', avatar: '' }, content: 'It was amazing! 🎬', timestamp: new Date('2024-01-20T14:32:00'), type: 'text', isStarred: false },
  { _id: 'm4', contactId: { _id: '2', name: 'Priya Sharma', avatar: '' }, content: 'Meeting at 3 PM today', timestamp: new Date('2024-01-20T12:15:00'), type: 'text', isStarred: false },
  { _id: 'm5', contactId: { _id: '2', name: 'Priya Sharma', avatar: '' }, content: 'Please confirm your attendance', timestamp: new Date('2024-01-20T12:16:00'), type: 'text', isStarred: true },
  { _id: 'm6', contactId: { _id: '3', name: 'Amit Patel', avatar: '' }, content: 'Check out this photo 📸', timestamp: new Date('2024-01-19T22:45:00'), type: 'image', isStarred: false },
  { _id: 'm7', contactId: { _id: '3', name: 'Amit Patel', avatar: '' }, content: 'From our trip last weekend', timestamp: new Date('2024-01-19T22:46:00'), type: 'text', isStarred: false }
];

export const mockMedia = [
  { _id: 'med1', contactId: { _id: '1', name: 'Ravi Kumar' }, filename: 'photo1.jpg', originalName: 'IMG_001.jpg', mimetype: 'image/jpeg', size: 1234567, type: 'image', path: '/uploads/photo1.jpg', createdAt: new Date('2024-01-20') },
  { _id: 'med2', contactId: { _id: '1', name: 'Ravi Kumar' }, filename: 'photo2.jpg', originalName: 'IMG_002.jpg', mimetype: 'image/jpeg', size: 2345678, type: 'image', path: '/uploads/photo2.jpg', createdAt: new Date('2024-01-19') },
  { _id: 'med3', contactId: { _id: '2', name: 'Priya Sharma' }, filename: 'video1.mp4', originalName: 'VID_001.mp4', mimetype: 'video/mp4', size: 12345678, type: 'video', path: '/uploads/video1.mp4', createdAt: new Date('2024-01-18') },
  { _id: 'med4', contactId: { _id: '3', name: 'Amit Patel' }, filename: 'audio1.mp3', originalName: 'Voice_001.mp3', mimetype: 'audio/mpeg', size: 345678, type: 'audio', path: '/uploads/audio1.mp3', createdAt: new Date('2024-01-17') },
  { _id: 'med5', contactId: { _id: '1', name: 'Ravi Kumar' }, filename: 'doc1.pdf', originalName: 'Report.pdf', mimetype: 'application/pdf', size: 456789, type: 'document', path: '/uploads/doc1.pdf', createdAt: new Date('2024-01-16') },
  { _id: 'med6', contactId: { _id: '2', name: 'Priya Sharma' }, filename: 'photo3.jpg', originalName: 'IMG_003.jpg', mimetype: 'image/jpeg', size: 987654, type: 'image', path: '/uploads/photo3.jpg', createdAt: new Date('2024-01-15') },
  { _id: 'med7', contactId: { _id: '3', name: 'Amit Patel' }, filename: 'photo4.jpg', originalName: 'IMG_004.jpg', mimetype: 'image/jpeg', size: 876543, type: 'image', path: '/uploads/photo4.jpg', createdAt: new Date('2024-01-14') },
  { _id: 'med8', contactId: { _id: '4', name: 'Sneha Reddy' }, filename: 'video2.mp4', originalName: 'VID_002.mp4', mimetype: 'video/mp4', size: 8765432, type: 'video', path: '/uploads/video2.mp4', createdAt: new Date('2024-01-13') }
];

export const mockTimeline = [
  { _id: '2024-01-20', count: 234, contacts: 12, label: 'Today' },
  { _id: '2024-01-19', count: 312, contacts: 15, label: 'Yesterday' },
  { _id: '2024-01-18', count: 187, contacts: 8, label: '2 days ago' },
  { _id: '2024-01-17', count: 456, contacts: 18, label: 'This Week' },
  { _id: '2024-01-16', count: 321, contacts: 14, label: 'This Week' },
  { _id: '2024-01-15', count: 298, contacts: 11, label: 'Last Week' },
  { _id: '2024-01-14', count: 276, contacts: 10, label: 'Last Week' },
  { _id: '2024-01', count: 5432, contacts: 32, label: 'January 2024' },
  { _id: '2023-12', count: 4321, contacts: 28, label: 'December 2023' },
  { _id: '2023-11', count: 3876, contacts: 25, label: 'November 2023' }
];

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};