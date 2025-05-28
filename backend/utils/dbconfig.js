import mongoose from 'mongoose';
// import { createClient } from 'redis';

// Database configuration
export const DB_NAME = 'restaurants';
export const COLLECTION = 'mammoth';
export const MONGO_PORT = '27017';
export const DEBUG = true;

const PROTOCOL = 'mongodb://';
const MONGO_USER = '';
const MONGO_PASS = '';
const mongoHost = DEBUG ? 'localhost' : 'cs144.org';

const ATLAS_URI = process.env.ATLAS_URI;


const mongoLogin = MONGO_USER && MONGO_PASS ? `${MONGO_USER}:${MONGO_PASS}` : '';
const mongoHostPort = MONGO_PORT ? `${mongoHost}:${MONGO_PORT}/${DB_NAME}` : `${mongoHost}/${DB_NAME}`;

export const MONGO_URI = DEBUG
  ? `${PROTOCOL}${mongoHostPort}`
  : `${ATLAS_URI}/${DB_NAME}`;

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