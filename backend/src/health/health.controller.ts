import { Controller, Get } from '@nestjs/common';
import * as pkg from '../../package.json';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: (pkg as { version?: string }).version ?? '0.1.0',
      env: process.env.NODE_ENV ?? 'development'
    };
  }
}
