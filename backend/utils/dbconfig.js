import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();

// Database configuration
const isProduction = false; 


const ATLAS_URI = process.env.MONGO_URI;
export const MONGO_URI = `${ATLAS_URI}`;

// Debug: Print masked MongoDB URI
const maskedUri = ATLAS_URI
  ? ATLAS_URI.replace(/(mongodb\+srv:\/\/[^:]+):([^@]+)@/, "$1:****@")
  : "not set";
console.log("Using MongoDB URI:", maskedUri);

// Redis configuration
export const REDIS_PREFIX = "restaurant:";
export const redisOptions = {
  socket: {
    host: isProduction ? "restaurantapp-redis-service" : "localhost",
    port: 6379,
  },
};

console.log("Redis configuration:", {
  host: redisOptions.socket.host,
  port: redisOptions.socket.port,
});

// Create Redis client
export const redisClient = createClient(redisOptions);

// Add error handler for Redis client
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
});

// Add connection handler for Redis client
redisClient.on("connect", () => {
  console.log("Redis Client Connected Successfully");
});

// Add reconnecting handler
redisClient.on("reconnecting", () => {
  console.log("Redis Client Reconnecting...");
});

// Add ready handler
redisClient.on("ready", () => {
  console.log("Redis Client Ready");
});

// Add end handler
redisClient.on("end", () => {
  console.log("Redis Client Connection Ended");
});

// Connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    console.log("Starting MongoDB connection...");
    console.log("MongoDB Connection Options:", {
      dbName: "restaurants",
    });

    await mongoose.connect(MONGO_URI, {
      dbName: "restaurants",
    });

    // Verify collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );

    console.log("MongoDB Connection State:", {
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      database: mongoose.connection.db.databaseName,
    });
    console.log("Connected to MongoDB successfully!");
    return true;
  } catch (err) {
    console.error("MongoDB Connection Error:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
      name: err.name,
    });
    return false;
  }
};

// Connect to Redis
export const connectToRedis = async () => {
  try {
    console.log("Attempting to connect to Redis at:", {
      host: redisOptions.socket.host,
      port: redisOptions.socket.port,
    });

    // Check if already connected
    if (redisClient.isOpen) {
      console.log("Redis client already connected");
      return true;
    }

    // Connect with timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Redis connection timeout")), 5000);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    console.log("Connected to Redis successfully");
    return true;
  } catch (err) {
    console.error("Failed to connect to Redis:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
      name: err.name,
    });
    return false;
  }
};

// Initialize database connections
export const initializeDatabases = async () => {
  console.log("Starting database initialization...");
  const mongoConnected = await connectToMongoDB();
  const redisConnected = await connectToRedis();

  console.log("Database initialization complete:", {
    mongoConnected,
    redisConnected,
  });

  return { mongoConnected, redisConnected };
};
