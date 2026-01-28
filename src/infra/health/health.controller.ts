import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller()
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get('health')
  @HealthCheck()
  check() {
    // Na Fase 5 vamos adicionar checks reais de Postgres e Redis.
    return this.health.check([]);
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