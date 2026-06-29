const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  
  if (users.length === 0) {
    console.log('No admin found. Seeding now manually...');
    const hashedPassword = await argon2.hash('admin123!');
    const admin = await prisma.user.create({
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
    console.log('Admin seeded:', admin);
  } else {
    console.log('Admin exists:', users[0]);
    // check password valid
    const valid = await argon2.verify(users[0].password_hash, 'admin123!');
    console.log('Password valid:', valid);
  }
}
main().catch(console.error);
