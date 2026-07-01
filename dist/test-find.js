"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const p = await prisma.product.findFirst({
        include: { brand: true, images: true }
    });
    console.log(p);
}
main();
//# sourceMappingURL=test-find.js.map