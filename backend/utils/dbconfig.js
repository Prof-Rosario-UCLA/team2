import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();
// import { createClient } from 'redis';

// Database configuration

const ATLAS_URI = process.env.MONGO_URI;
export const MONGO_URI = `${ATLAS_URI}`;

// Redis configuration
export const REDIS_PREFIX = 'restaurant:';
export const redisOptions = {
  socket: {
    host: 'localhost',
    port: 6379        
  }
};

// Create Redis client
export const redisClient = createClient(redisOptions);

// Connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    console.log('Starting MongoDB connection...');
    await mongoose.connect(MONGO_URI, {
      dbName: 'restaurants'  // Explicitly set the database name
    });
    
    // Verify collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    console.log('MongoDB Connection State:', {
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      database: mongoose.connection.db.databaseName
    });
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error:', {
      message: err.message,
      code: err.code
    });
    return false;
  }
};

// Connect to Redis
export const connectToRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
    return true;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    return false;
  }
};

// Initialize database connections
export const initializeDatabases = async () => {
  const mongoConnected = await connectToMongoDB();
  const redisConnected = await connectToRedis();
  
  return { mongoConnected, redisConnected };
};