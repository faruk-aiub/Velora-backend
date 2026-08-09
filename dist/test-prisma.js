"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: 'dummy-id' },
            skip: 0,
            take: 50,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                order_number: true,
                total_amount: true,
                status: true,
                created_at: true,
                items: {
                    select: { product_name: true }
                }
            }
        });
        console.log('Query successful');
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=test-prisma.js.map