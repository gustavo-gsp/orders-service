import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DbHealthIndicator } from './db.health.indicator';
import { RedisHealthIndicator } from './redis.health.indicator';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DbHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.isHealthy(),
      () => this.redis.isHealthy(),
    ]);
  }

  @Get('version')
  version() {
    return {
      name: 'orders-service',
      version: process.env.npm_package_version ?? '0.0.0',
      env: process.env.NODE_ENV ?? 'development',
    };
  }
}