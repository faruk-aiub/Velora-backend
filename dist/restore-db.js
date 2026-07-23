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
    await prisma.category.updateMany({
        where: { name: 'Agricultural Products' },
        data: { deleted_at: null }
    });
    console.log('Restored Agricultural Products');
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=restore-db.js.map