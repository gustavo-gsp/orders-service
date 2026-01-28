import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redis: RedisService) {
    super();
  }

  async isHealthy(key = 'redis'): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.getClient().ping();
      const ok = pong === 'PONG';
      if (!ok) {
        const result = this.getStatus(key, false, { message: `Unexpected ping response: ${pong}` });
        throw new HealthCheckError('Redis check failed', result);
      }
      return this.getStatus(key, true);
    } catch (e) {
      const result = this.getStatus(key, false, { message: 'Redis not reachable' });
      throw new HealthCheckError('Redis check failed', result);
    }
  }
}
