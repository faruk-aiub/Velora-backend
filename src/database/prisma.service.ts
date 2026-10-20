import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ 
      connectionString, 
      max: 20, // Max number of pooled connections
      idleTimeoutMillis: 0, // Never drop idle connections (keeps Neon SSL warm)
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    // Warm up Neon connection immediately
    try {
      await this.$queryRawUnsafe('SELECT 1');
      this.logger.log('Database pool warmed up successfully');
    } catch (err: any) {
      this.logger.warn(`Database warmup failed: ${err.message}`);
    }

    // Keep Neon serverless compute warm every 20 seconds so cold start never occurs
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.$queryRawUnsafe('SELECT 1');
      } catch {
        // Silent fail on transient ping
      }
    }, 20000);
  }

  async onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    await this.$disconnect();
  }
}
