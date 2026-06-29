import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await argon2.hash('admin123!');
  await prisma.user.create({
    data: {
      email: 'admin@velora.com',
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
  console.log('Done seeding admin');
}
main().catch(console.error);
