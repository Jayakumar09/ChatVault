import MediaFile from '../models/MediaFile.js';
import path from 'path';
import fs from 'fs';

export const getAllMedia = async (req, res) => {
  try {
    const { type, contactId, page = 1, limit = 30 } = req.query;
    const query = { userId: req.userId };
    if (type) query.type = type;
    if (contactId) query.contactId = contactId;

    const media = await MediaFile.find(query)
      .populate('contactId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MediaFile.countDocuments(query);

    res.json({ media, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const media = await MediaFile.find({ userId: req.userId, type })
      .populate('contactId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MediaFile.countDocuments({ userId: req.userId, type });

    res.json({ media, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await MediaFile.findOne({ _id: id, userId: req.userId }).populate('contactId', 'name');
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await MediaFile.findOne({ _id: id, userId: req.userId });
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const filePath = path.join(process.cwd(), media.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, media.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMediaStats = async (req, res) => {
  try {
    const stats = await MediaFile.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};