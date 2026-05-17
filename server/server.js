import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

import connectDB, { disconnectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

console.log('\n========================================');
console.log('🚀 ChatVault Server Starting...');
console.log('========================================\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/backups', express.static(path.join(__dirname, 'backups')));

app.use('/api/auth', authRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  const dbState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      state: dbState[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'not connected'
    },
    server: {
      port: PORT,
      uptime: process.uptime()
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'ChatVault API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      backup: '/api/backup',
      contacts: '/api/contacts',
      messages: '/api/messages',
      media: '/api/media',
      analytics: '/api/analytics'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(`❌ Server Error: ${err.message}`);
  console.error(`   Stack: ${err.stack}\n`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const startServer = async () => {
  let dbConnected = false;

  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error(`\n❌ Failed to connect to MongoDB Atlas: ${error.message}`);
    console.log('   Server will start but database features will be unavailable.\n');
  }

  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📡 Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
    console.log('========================================\n');
    console.log('Available Routes:');
    console.log('  GET    /api/health');
    console.log('  GET    /');
    console.log('  POST   /api/auth/register');
    console.log('  POST   /api/auth/login');
    console.log('  GET    /api/auth/me');
    console.log('  POST   /api/backup/upload');
    console.log('  POST   /api/backup/parse');
    console.log('  GET    /api/contacts');
    console.log('  GET    /api/messages');
    console.log('  GET    /api/media');
    console.log('  GET    /api/analytics/dashboard');
    console.log('========================================\n');
  });

  process.on('SIGINT', async () => {
    console.log('\n\n⚠️ Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️ Process terminated...');
    await disconnectDB();
    process.exit(0);
  });
};

startServer();

import mongoose from 'mongoose';
export default app;