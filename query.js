const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany({ where: { slug: { contains: 'electronic' } } });
  console.log("Found Categories:", cats);
}
main().finally(() => prisma.$disconnect());
