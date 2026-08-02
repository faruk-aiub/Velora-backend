const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 'b8f9ca5a-0ae6-4242-b4da-51c822beb33d';
  try {
    await prisma.review.deleteMany({ where: { user_id: id } });
    await prisma.order.deleteMany({ where: { user_id: id } });
    await prisma.userProfile.deleteMany({ where: { user_id: id } });
    await prisma.user.delete({ where: { id } });
    console.log("Success");
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
