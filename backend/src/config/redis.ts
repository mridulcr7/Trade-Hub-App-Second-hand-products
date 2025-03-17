import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    tls: {
        rejectUnauthorized: false
    }
});

// Test connection
redis.on('connect', () => {
    console.log('Successfully connected to Redis');
    // Clear online users set on server restart
    redis.del('online_users');
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});

export default redis;
