import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const connectDB = async (retries = MAX_RETRIES) => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  console.log(`\n📦 Attempting MongoDB Atlas connection...`);

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, options);

      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
      console.log(`   State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);

      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB Error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB Disconnected - Attempting reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB Reconnected\n');
      });

      return conn;

    } catch (error) {
      console.error(`❌ Connection attempt ${attempt}/${retries} failed:`);
      console.error(`   ${error.message}\n`);

      if (attempt < retries) {
        console.log(`   Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error(`\n❌ All ${retries} connection attempts failed.`);
        console.error(`   Please verify:\n`);
        console.error(`   1. MongoDB Atlas cluster is running`);
        console.error(`   2. Network allows connections`);
        console.error(`   3. Username/Password are correct`);
        console.error(`   4. IP address is whitelisted in Atlas\n`);
        throw error;
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected\n');
  } catch (error) {
    console.error(`❌ Error disconnecting: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
export default connectDB;