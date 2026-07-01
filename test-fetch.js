const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

  if (!admin || !customer) {
    console.log("Missing admin or customer");
    return;
  }
  console.log("Customer ID:", customer.id);
  console.log("Admin ID:", admin.id);

  // Check if any contact message exists
  let msg = await prisma.contactMessage.findFirst({
    where: { user_id: customer.id }
  });

  if (!msg) {
    msg = await prisma.contactMessage.create({
      data: {
        user_id: customer.id,
        first_name: 'Test',
        last_name: 'User',
        email: customer.email,
        subject: 'Test Thread',
        message: 'Hello!',
      }
    });
    console.log("Created message:", msg.id);
  }

  // Create an admin reply
  const reply = await prisma.contactReply.create({
    data: {
      message_id: msg.id,
      sender_id: admin.id,
      message: 'Admin says hello back!',
    }
  });

  console.log("Created reply:", reply.id);

  // Fetch exactly as contactService.findOne does
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

  console.log("Fetched thread for user:");
  console.log(JSON.stringify(fetched, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
