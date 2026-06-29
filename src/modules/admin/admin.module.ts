import { Module } from '@nestjs/common';
import { AdminAnalyticsController } from './admin.controller';
import { AdminSeederService } from './admin-seeder.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminAnalyticsController, AdminAuthController],
  providers: [AdminSeederService, AdminAuthService],
})
export class AdminModule {}
