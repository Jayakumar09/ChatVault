import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

mongoose.set('debug', true);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const connectDB = async (retries = MAX_RETRIES) => {
  const srvUri = process.env.MONGODB_URI?.trim();

  if (!srvUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const url = new URL(srvUri);
  const username = url.username;
  const password = url.password;

  const shardHosts = 'cluster0-shard-00-00.sqj1i.mongodb.net:27017';

  const fullUri = `mongodb://${username}:${password}@${shardHosts}/chatvault?ssl=true&authSource=admin&retryWrites=true&w=majority`;

  console.log('\n========================================');
  console.log('📦 MongoDB Connection');
  console.log('========================================');
  console.log(`   Host: ${shardHosts}`);
  console.log(`   Type: mongodb (single host)`);
  console.log('========================================\n');

  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4,
  };

  console.log('📋 Connection Options:', JSON.stringify(options, null, 2));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🔄 Attempt ${attempt}/${retries}: Connecting...`);
      
      const conn = await mongoose.connect(fullUri, options);

      console.log('\n✅ MongoDB Atlas Connected!');
      console.log(`   Host: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
      console.log(`   State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB Error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB Disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB Reconnected');
      });

      return conn;

    } catch (error) {
      console.error(`\n❌ Attempt ${attempt} failed: ${error.message}`);

      if (attempt < retries) {
        console.log(`   Retrying in ${RETRY_DELAY / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error('\n❌ All connection attempts failed.');
        throw error;
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ Error disconnecting: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
export default connectDB;