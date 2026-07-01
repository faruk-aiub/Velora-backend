const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  
  if (!customer) {
    console.log("No customer found");
    return;
  }

  const msg = await prisma.contactMessage.findFirst({
    where: { user_id: customer.id }
  });

  if (!msg) {
    console.log("No message found");
    return;
  }

  const fetched = await prisma.contactMessage.findUnique({
    where: { id: msg.id },
    include: {
      replies: {
        orderBy: { created_at: 'asc' },
        include: { sender: { select: { role: true, profile: { select: { first_name: true, last_name: true } } } } }
      },
      user: { select: { email: true, profile: { select: { first_name: true, last_name: true } } } }
    }
  });

  console.log("Fetched message:");
  console.log(JSON.stringify(fetched, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
