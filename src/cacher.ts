import { createClient } from 'redis';
import logger from './logger';

const client = createClient({
  url: process.env.REDIS_URL ?? undefined,
});

client.on('error', (err) => {
  logger.error('[redis]', err);
});

export const redisClient = client;

export const redisPrefix = process.env.REDIS_PREFIX ?? 'noderedis:';

export const defaultCacheExpireTime = process.env.REDIS_EX
  ? parseInt(process.env.REDIS_EX, 10)
  : 6 * 60 * 60; // 6 hours

export function startCacher() {
  return client.connect();
}

export function encache <T extends any>(
  key: string,
  data: T,
  expiresIn: number = defaultCacheExpireTime,
) {
  return client.set(redisPrefix + key, JSON.stringify(data), {
    EX: expiresIn,
  });
}

export async function decache <T extends any>(key: string) {
  const cached = await client.get(redisPrefix + key);

  if (cached == null) {
    return null;
  }

  return JSON.parse(cached) as T;
}
