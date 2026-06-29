import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const adminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is not defined in .env. Skipping admin seeding.');
      return;
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('Super Admin already exists. Seeding skipped.');
      return;
    }

    const hashedPassword = await argon2.hash(adminPassword);

    await this.prisma.user.create({
      data: {
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'ADMIN',
        is_email_verified: true,
        profile: {
          create: {
            first_name: 'Super',
            last_name: 'Admin',
          },
        },
      },
    });

    this.logger.log('Super Admin account created successfully.');
  }
}
