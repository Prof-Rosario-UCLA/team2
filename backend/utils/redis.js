import { REDIS_PREFIX, redisClient } from './dbconfig.js';

export async function fetchFromCache(type) {
    const key = `${REDIS_PREFIX}${type}:all`;
    try {
        console.log("Attempting to fetch data from cache for key:", key);
        const data = await redisClient.get(key);
        if (data == null) {
            console.log(`Cache miss: Key ${key} not found in Redis`);
            return null;
        }
        console.log(`Cache hit: Successfully retrieved data for key ${key}`);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error fetching from Redis cache:`, error);
        return null;
    }
}  

export async function cacheResult(type, blob, expiration = 300) {
    const key = `${REDIS_PREFIX}${type}:all`;
    try {
        console.log(`Writing data to cache for key: ${key}`);
        await redisClient.set(key, JSON.stringify(blob), { EX: expiration });
        console.log(`Successfully cached data for key: ${key}`);
        return true;
    } catch (error) {
        console.error(`Error caching result:`, error);
        return false;
    }
}
  
  