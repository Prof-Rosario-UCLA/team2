import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();
// import { createClient } from 'redis';

// Database configuration

const ATLAS_URI = process.env.MONGO_URI;
export const MONGO_URI = `${ATLAS_URI}`;

// Debug: Print masked MongoDB URI
const maskedUri = ATLAS_URI ? ATLAS_URI.replace(/(mongodb\+srv:\/\/[^:]+):([^@]+)@/, '$1:****@') : 'not set';
console.log('Using MongoDB URI:', maskedUri);

// Redis configuration
export const REDIS_PREFIX = 'restaurant:';
export const redisOptions = {
  socket: {
    host: process.env.REDIS_HOST || 'restaurantapp-redis-service',
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
      dbName: 'restaurants' 
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
    console.log('Connected to MongoDB!');
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
    console.log('Attempting to connect to Redis at:', redisOptions.socket.host, redisOptions.socket.port);
    await redisClient.connect();
    console.log('Connected to Redis successfully');
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