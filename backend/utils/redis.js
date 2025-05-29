import { createClient } from 'redis';
import { REDIS_PREFIX, redisOptions } from './dbconfig.js';

let redisClient = null;

async function getRedisClient() {
    if (!redisClient) {
      console.log('Creating new Redis client');
      redisClient = createClient(redisOptions);
      
      redisClient.on('error', err => {
        console.error('Redis Client Error:', err);
        redisClient = null; 
      });
      
      await redisClient.connect();
      console.log('Connected to Redis successfully');
    }
    
    return redisClient;
}

export async function fetchFromCache(type) {
    const key = `${REDIS_PREFIX}${type}:all`;
    try {

        const client = await getRedisClient();
        console.log("Attempting to fetch data from cache");
        const data = await client.get(key);
        if (data == null){
            console.log(`Key: ${key} not found in cache`);
            return null
        }
        else{
            console.log(`Fetching key: ${key} data from Redis cache`);
            return JSON.parse(data);
        }
        
    }
    catch (error) {
        console.error(`Error fetching from Redis:`, error);
        return null;
    }
}  

export async function cacheResult(type, blob, expiration = 300) {
    const key = `${REDIS_PREFIX}${type}:all`;
    try {
        const client = await getRedisClient();
       
        console.log(`Writing ${key} to cache`);
        await client.set(key, JSON.stringify(blob), { EX: expiration });
        return true;
    }
    catch (error) {
        console.error(`Error caching result:`, error);
        return false;
    }
}
  
  