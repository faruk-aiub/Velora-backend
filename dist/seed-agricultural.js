"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding Agricultural Products categories...');
    const parentName = 'Agricultural Products';
    const parentSlug = (0, slugify_1.default)(parentName, { lower: true, strict: true });
    let parent = await prisma.category.findUnique({
        where: { slug: parentSlug }
    });
    if (!parent) {
        parent = await prisma.category.create({
            data: {
                name: parentName,
                slug: parentSlug,
                image_url: 'https://picsum.photos/seed/agri/300/300'
            }
        });
        console.log(`Created parent category: ${parent.name}`);
    }
    else {
        console.log(`Parent category already exists: ${parent.name}`);
    }
    const subcategories = [
        'Vegetables',
        'Fruits',
        'Fish',
        'Meat',
        'Eggs & Poultry',
        'Dairy Products',
        'Rice, Grains & Cereals'
    ];
    for (const subName of subcategories) {
        const subSlug = (0, slugify_1.default)(subName, { lower: true, strict: true });
        let sub = await prisma.category.findUnique({
            where: { slug: subSlug }
        });
        if (!sub) {
            await prisma.category.create({
                data: {
                    name: subName,
                    slug: subSlug,
                    parent_id: parent.id,
                    image_url: `https://picsum.photos/seed/${subSlug}/300/300`
                }
            });
            console.log(`Created subcategory: ${subName}`);
        }
        else {
            console.log(`Subcategory already exists: ${subName}`);
            if (sub.parent_id !== parent.id) {
                await prisma.category.update({
                    where: { id: sub.id },
                    data: { parent_id: parent.id }
                });
                console.log(`Updated subcategory parent: ${subName}`);
            }
        }
    }
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-agricultural.js.map