import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  
  // Key prefixes
  keyPrefix: {
    session: 'peeplx:session:',
    cache: 'peeplx:cache:',
    rateLimit: 'peeplx:ratelimit:',
    trustScore: 'peeplx:trustscore:',
    transaction: 'peeplx:transaction:',
  },
  
  // TTL settings (in seconds)
  ttl: {
    session: 86400, // 24 hours
    cache: 3600, // 1 hour
    trustScore: 300, // 5 minutes
    transaction: 1800, // 30 minutes
  },
}));
