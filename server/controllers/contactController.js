import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import MediaFile from '../models/MediaFile.js';

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ lastMessageAt: -1 });
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ contactId: id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ contactId: id });

    res.json({ messages, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContactMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await MediaFile.find({ contactId: id }).sort({ createdAt: -1 });
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchContacts = async (req, res) => {
  try {
    const { q } = req.query;
    const contacts = await Contact.find({ name: { $regex: q, $options: 'i' } });
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};