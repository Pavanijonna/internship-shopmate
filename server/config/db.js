const { MongoClient } = require('mongodb');
require('dotenv').config();

// Support for local MongoDB
let uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const isAtlas = uri.startsWith('mongodb+srv://');

if (uri === 'local') {
  uri = 'mongodb://localhost:27017';
  console.log('📍 Using local MongoDB (set MONGO_URI="local" in .env)');
} else if (isAtlas) {
  console.log('☁️  Using MongoDB Atlas');
}

const dbName = 'shopmate';

let db;
let client;

const connectDB = async (retries = 5, delay = 3000) => {
  if (db) return db;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n[Attempt ${attempt}/${retries}] Connecting to MongoDB...`);
      const displayUri = isAtlas ? uri.replace(/:[^@]*@/, ':****@') : uri;
      console.log(`   Connecting to: ${displayUri}`);

      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 20000,
        ...(isAtlas && { tlsAllowInvalidCertificates: true }),
      });
      await client.connect();
      console.log('✅ MongoDB Connected Successfully!');
      db = client.db(dbName);
      return db;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed.`);
      console.error("Error name:", error.name);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message || error);

      if (attempt === retries) {
        console.error('\n⚠️  Could not connect to MongoDB Atlas.');
        console.error('👉  Fix: Go to https://cloud.mongodb.com → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
        console.error('👉  Also make sure your Atlas cluster is not paused.');
        process.exit(1);
      }

      console.log(`   Retrying in ${delay / 1000} seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };

