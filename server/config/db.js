const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

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

const sampleProducts = [
  {
    name: "Wireless Noise Cancelling Headphones",
    description: "Experience world-class silence and superior sound with these premium headphones. Features 30-hour battery life and plush ear cushions for all-day comfort.",
    price: 299.99,
    category: "Electronics",
    stock: 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  },
  {
    name: "Ergonomic Office Chair",
    description: "Designed for comfort and productivity. Adjustable lumbar support, breathable mesh back, and smooth-rolling casters.",
    price: 199.99,
    category: "Furniture",
    stock: 20,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80"
  },
  {
    name: "Smart Fitness Watch",
    description: "Track your health metrics, workouts, and sleep patterns. Water-resistant and features a vibrant AMOLED display.",
    price: 149.50,
    category: "Electronics",
    stock: 100,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
  },
  {
    name: "Minimalist Backpack",
    description: "Sleek and durable backpack perfect for daily commute or travel. Features a padded laptop compartment and water-resistant fabric.",
    price: 79.00,
    category: "Accessories",
    stock: 45,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
  },
  {
    name: "Mechanical Keyboard",
    description: "Tactile and responsive mechanical switches for the ultimate typing experience. RGB backlighting and compact design.",
    price: 120.00,
    category: "Electronics",
    stock: 30,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=800&q=80"
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Handcrafted ceramic mugs with a modern matte finish. Microwave and dishwasher safe.",
    price: 35.00,
    category: "Home",
    stock: 60,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"
  },
  {
    name: "Running Shoes",
    description: "Lightweight and breathable running shoes with superior cushioning for impact protection.",
    price: 89.99,
    category: "Clothing",
    stock: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
  },
  {
    name: "Bamboo Cutting Board",
    description: "Eco-friendly bamboo cutting board. Durable, knife-friendly, and easy to clean.",
    price: 24.99,
    category: "Home",
    stock: 75,
    image: "https://images.unsplash.com/photo-1626202384357-415848521c7d?w=800&q=80"
  },
  {
    name: "Polarized Sunglasses",
    description: "Classic aviator style sunglasses with polarized lenses to reduce glare and protect your eyes.",
    price: 55.00,
    category: "Accessories",
    stock: 40,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with powerful bass and 360-degree sound. Waterproof design for outdoor adventures.",
    price: 65.00,
    category: "Electronics",
    stock: 55,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"
  }
];

const ensureSeedData = async (database) => {
  try {
    const productsColl = database.collection('products');
    const count = await productsColl.countDocuments();
    if (count === 0) {
      await productsColl.insertMany(sampleProducts);
      console.log(`🌱 Auto-seeded ${sampleProducts.length} sample products.`);
    }

    const usersColl = database.collection('users');
    const adminUser = await usersColl.findOne({ role: 'admin' });
    if (!adminUser) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await usersColl.insertOne({
        username: 'Admin User',
        email: 'admin@shopmate.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date()
      });
      console.log('👑 Auto-seeded admin user (admin@shopmate.com / password123)');
    }
    const demoUser = await usersColl.findOne({ email: 'demo@shopmate.com' });
    if (!demoUser) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await usersColl.insertOne({
        username: 'Demo User',
        email: 'demo@shopmate.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        createdAt: new Date()
      });
      console.log('👤 Auto-seeded demo user (demo@shopmate.com / password123)');
    }
  } catch (err) {
    console.error('Seed check error:', err.message);
  }
};

const connectDB = async (retries = 2, delay = 2000) => {
  if (db) return db;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n[Attempt ${attempt}/${retries}] Connecting to MongoDB...`);
      const displayUri = isAtlas ? uri.replace(/:[^@]*@/, ':****@') : uri;
      console.log(`   Connecting to: ${displayUri}`);

      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        ...(isAtlas && { tlsAllowInvalidCertificates: true }),
      });
      await client.connect();
      console.log('✅ MongoDB Connected Successfully!');
      db = client.db(dbName);
      await ensureSeedData(db);
      return db;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);
    }
  }

  // Fallback to in-memory MongoDB server if external connection fails
  try {
    console.log('\n⚠️ Could not connect to primary MongoDB. Starting In-Memory MongoDB Server fallback...');
    const mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    console.log(`📍 In-Memory MongoDB running at: ${memUri}`);
    client = new MongoClient(memUri);
    await client.connect();
    db = client.db(dbName);
    console.log('✅ Connected to In-Memory MongoDB!');
    await ensureSeedData(db);
    return db;
  } catch (memError) {
    console.error('❌ Failed to start In-Memory MongoDB:', memError.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };


