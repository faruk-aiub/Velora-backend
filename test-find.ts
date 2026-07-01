import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findFirst({
    include: { brand: true, images: true }
  });
  console.log(p);
}
main();
