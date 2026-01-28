import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  private defaultTtlSeconds: number;

  constructor(private redis: RedisService, private config: ConfigService) {
    this.defaultTtlSeconds = this.config.get<number>('CACHE_TTL_SECONDS') ?? 60;
  }

  async get(key: string): Promise<string | null> {
    return this.redis.getClient().get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    await this.redis.getClient().set(key, value, 'EX', ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }
}
