import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoryImages: Record<string, string> = {
  'electronics-gadgets': '/hero-gadgets.jpg',
  'fashion-clothing': '/hero-clothing.jpg',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
  'home-living': '/hero-home-living.jpg',
  'kitchen-appliances': '/hero-kitchen.jpg',
  'books-stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop',
  'sports-fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  'kids-baby-products': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1200&auto=format&fit=crop',
  'automotive': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  'pet-supplies': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200&auto=format&fit=crop',
  'grocery-food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
  'others': '/hero-nakshi-kantha.jpg',
};

async function main() {
  console.log('Updating category images in database...');
  for (const [slug, imgUrl] of Object.entries(categoryImages)) {
    const updated = await prisma.category.updateMany({
      where: { slug },
      data: { image_url: imgUrl }
    });
    console.log(`Updated ${slug}: ${updated.count} affected`);
  }

  // Clear redis cache
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const keys = await redis.keys('cache:categories:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Deleted Redis keys: ${keys.join(', ')}`);
    }
    await redis.quit();
  } catch (err) {
    console.warn('Redis clear warning:', (err as Error).message);
  }

  console.log('Finished updating categories successfully.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
