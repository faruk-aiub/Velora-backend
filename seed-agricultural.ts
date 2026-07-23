import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Agricultural Products categories...');

  // 1. Create Parent Category
  const parentName = 'Agricultural Products';
  const parentSlug = slugify(parentName, { lower: true, strict: true });

  let parent = await prisma.category.findUnique({
    where: { slug: parentSlug }
  });

  if (!parent) {
    parent = await prisma.category.create({
      data: {
        name: parentName,
        slug: parentSlug,
        image_url: 'https://picsum.photos/seed/agri/300/300' // Placeholder image
      }
    });
    console.log(`Created parent category: ${parent.name}`);
  } else {
    console.log(`Parent category already exists: ${parent.name}`);
  }

  // 2. Create Subcategories
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
    const subSlug = slugify(subName, { lower: true, strict: true });
    
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
    } else {
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
