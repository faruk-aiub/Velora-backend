import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CmsModule } from './modules/cms/cms.module';
import { AuditModule } from './modules/audit/audit.module';
import { join } from 'path';
import { AppConfigModule } from './modules/config/config.module';
import { UploadModule } from './modules/upload/upload.module';
import { PrismaModule } from './database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedisModule } from './infrastructure/redis/redis.module';

import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60, // General limit: 100 requests per minute
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || process.env.REDIS_URL;
        let connection: any = {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times: number) => Math.min(times * 1000, 10000),
        };

        if (redisUrl) {
          try {
            const parsed = new URL(redisUrl);
            connection = {
              ...connection,
              host: parsed.hostname || connection.host,
              port: parsed.port ? Number(parsed.port) : connection.port,
              username: parsed.username || undefined,
              password: parsed.password || undefined,
              db: parsed.pathname && parsed.pathname !== '/' ? Number(parsed.pathname.slice(1)) : 0,
            };
          } catch {
            // fallback to default connection
          }
        }

        return { connection };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    AdminModule,
    AuthModule, MailModule, UsersModule, ProductsModule, CategoriesModule, BrandsModule, InventoryModule, CartModule, WishlistModule, OrdersModule, PaymentsModule, CouponsModule, ReviewsModule, NotificationsModule, CmsModule, AuditModule, AppConfigModule, UploadModule, ContactModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
