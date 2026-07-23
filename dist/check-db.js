"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const categories = await prisma.category.findMany();
    console.log('Total categories:', categories.length);
    const agri = categories.find((c) => c.name === 'Agricultural Products');
    console.log('Agricultural Products:', agri);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-db.js.map