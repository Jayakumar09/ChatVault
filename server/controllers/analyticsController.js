import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import MediaFile from '../models/MediaFile.js';
import ChatBackup from '../models/ChatBackup.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments({ userId: req.userId });
    const totalMessages = await Message.countDocuments({ userId: req.userId });
    const totalMedia = await MediaFile.countDocuments({ userId: req.userId });
    const totalBackups = await ChatBackup.countDocuments({ userId: req.userId });

    const mediaStats = await MediaFile.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const storageUsed = mediaStats.reduce((acc, item) => acc + item.totalSize, 0);

    const mostActiveContacts = await Message.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$contactId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'contacts',
          localField: '_id',
          foreignField: '_id',
          as: 'contact'
        }
      },
      { $unwind: '$contact' },
      { $project: { name: '$contact.name', avatar: '$contact.avatar', count: 1 } }
    ]);

    const messagesLast7Days = await Message.aggregate([
      { $match: { userId: req.userId, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalContacts,
      totalMessages,
      totalMedia,
      totalBackups,
      storageUsed,
      mediaStats: mediaStats.reduce((acc, item) => ({ ...acc, [item._id]: { count: item.count, size: item.totalSize } }), {}),
      mostActiveContacts,
      messagesLast7Days
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTimelineData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const format = period === 'year' ? '%Y' : period === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const timeline = await Message.aggregate([
      {
        $group: {
          _id: { $dateToString: { format, date: '$timestamp' } },
          count: { $sum: 1 },
          contacts: { $addToSet: '$contactId' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 50 }
    ]);

    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivityByHour = async (req, res) => {
  try {
    const activity = await Message.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const hourData = Array.from({ length: 24 }, (_, i) => {
      const hourObj = activity.find(a => a._id === i);
      return { hour: i, count: hourObj ? hourObj.count : 0 };
    });

    res.json({ activity: hourData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};