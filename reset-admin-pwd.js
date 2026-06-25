const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.update({
    where: { email: 'faruk.ahmed@gmail.com' },
    data: { password_hash: hashedPassword },
  });

  console.log(`Password reset for ${user.email} to '${password}'`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
