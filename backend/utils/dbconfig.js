import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
// import { createClient } from 'redis';

// Database configuration

const ATLAS_URI = process.env.MONGO_URI;
export const MONGO_URI = `${ATLAS_URI}`;

// Redis configuration
export const REDIS_PREFIX = 'mammoth:';
export const redisOptions = {
  socket: {
    host: 'localhost', // Redis server hostname
    port: 6379         // Redis server port
  }
};

// Create Redis client
// export const redisClient = createClient(redisOptions);

// Connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    return false;
  }
};

// Connect to Redis
// export const connectToRedis = async () => {
//   try {
//     await redisClient.connect();
//     console.log('Connected to Redis');
//     return true;
//   } catch (err) {
//     console.error('Failed to connect to Redis:', err);
//     return false;
//   }
// };

// Initialize database connections
export const initializeDatabases = async () => {
  const mongoConnected = await connectToMongoDB();
//   const redisConnected = await connectToRedis(); 
  const redisConnected = true;
  
  return { mongoConnected, redisConnected };
};