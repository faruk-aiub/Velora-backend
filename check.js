const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ 
    where: { 
      category: { 
        OR: [
            { slug: 'electronics-gadgets' },
            { parent: { slug: 'electronics-gadgets' } }
        ] 
      } 
    } 
  });
  console.log("Products found:", products.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
