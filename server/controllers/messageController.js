import Message from '../models/Message.js';
import Contact from '../models/Contact.js';

export const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, contactId } = req.query;
    const query = { userId: req.userId };
    if (contactId) query.contactId = contactId;

    const messages = await Message.find(query)
      .populate('contactId', 'name avatar')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({ messages, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { q, contactId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { userId: req.userId };

    if (q) query.content = { $regex: q, $options: 'i' };
    if (contactId) query.contactId = contactId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const messages = await Message.find(query)
      .populate('contactId', 'name avatar')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({ messages, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleStarMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findOne({ _id: id, userId: req.userId });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    message.isStarred = !message.isStarred;
    await message.save();
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStarredMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ userId: req.userId, isStarred: true })
      .populate('contactId', 'name avatar')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ userId: req.userId, isStarred: true });
    res.json({ messages, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findOne({ _id: id, userId: req.userId }).populate('contactId', 'name avatar');
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};