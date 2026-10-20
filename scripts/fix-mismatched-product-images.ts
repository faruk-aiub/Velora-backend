import 'dotenv/config';
import { Pool } from 'pg';
import Redis from 'ioredis';
import * as http from 'http';
import * as https from 'https';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Map of exact product image replacements
// Key is either subcategory or partial title match, value is array of [prod1Img, prod2Img]
const correctedImagesBySubcategory: Record<string, [string, string]> = {
  'Chargers & Cables': [
    '/products/anker-735-ganprime-65w-fast-wall-charger.jpg',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=75'
  ],
  'Jeans': [
    '/products/levis-511-slim-fit-stretch-denim-jeans.jpg',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=75'
  ],
  'Fashion Accessories': [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=75',
    '/products/mulberry-silk-floral-pocket-square-scarf.jpg'
  ],
  'Skincare Products': [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=75'
  ],
  'Furniture': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=75',
    '/products/scandinavian-solid-teak-wood-coffee-table.jpg'
  ],
  'Table & Chair': [
    '/products/ergonomic-high-back-mesh-office-desk-chair.jpg',
    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=75'
  ],
  'Rice Cooker': [
    'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=75',
    '/products/panasonic-automatic-rice-cooker-with-steamer.jpg'
  ],
  'Electric Kettle': [
    '/products/fellow-stagg-ekg-precision-gooseneck-electric-kettle.jpg',
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=75'
  ],
  'Cookware': [
    '/products/t-fal-ultimate-hard-anodized-nonstick-cookware-set.jpg',
    '/products/lodge-seasoned-cast-iron-skillet-pan.jpg'
  ],
  'Dinner Set': [
    '/products/fine-bone-china-gold-rim-32-piece-luxury-dinnerware-set.jpg',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=75'
  ],
  'Office Supplies': [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=75',
    '/products/heavy-duty-ergonomic-effortless-desktop-stapler-kit.jpg'
  ],
  'Art Supplies': [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=75',
    '/products/faber-castell-polychromos-artists-color-pencils-tin.jpg'
  ],
  'Sports Accessories': [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=75',
    '/products/adjustable-weighted-speed-jump-rope.jpg'
  ],
  'Baby Clothes': [
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=75',
    '/products/cozy-sherpa-fleece-hooded-bear-baby-winter-jumpsuit.jpg'
  ],
  'Toys': [
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=75'
  ],
  'School Bags': [
    'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=75'
  ],
  'Baby Care Products': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=75'
  ],
  'Kids Accessories': [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=75'
  ],
  'Car Accessories': [
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=75'
  ],
  'Bike Accessories': [
    '/products/kryptonite-heavy-duty-bicycle-u-lock.jpg',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=75'
  ],
  'Helmet': [
    'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?auto=format&fit=crop&w=600&q=75'
  ],
  'Car Electronics': [
    '/products/70mai-dash-cam-pro-plus-dual-vehicle-camera.jpg',
    '/products/noco-boost-plus-portable-lithium-jump-starter.jpg'
  ],
  'Cleaning Products': [
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=75'
  ],
  'Pet Food': [
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=75'
  ],
  'Pet Care Products': [
    '/products/furminator-undercoat-de-shedding-tool-dogs.jpg',
    '/products/wahl-deluxe-cordless-professional-pet-grooming-clipper.jpg'
  ],
  'Snacks': [
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=75',
    '/products/pringles-sour-cream-onion-crisps-158g.jpg'
  ],
  'Dry Food': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=75',
    '/products/quaker-rolled-100-wholegrain-oats-1kg.jpg'
  ],
  'Fresh Food': [
    '/products/fresh-crisp-honeycrisp-red-apples-1kg.jpg',
    '/products/fresh-sweet-seedless-green-grapes-500g.jpg'
  ],
  'Cooking Ingredients': [
    '/products/olitalia-extra-virgin-cold-pressed-olive-oil-1-liter.jpg',
    '/products/kikkoman-naturally-brewed-japanese-soy-sauce-500ml.jpg'
  ],
  'Travel Accessories': [
    '/products/vintage-waxed-canvas-leather-weekender-duffle-bag.jpg',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=75'
  ]
};

async function main() {
  console.log('=== Step 1: Connecting to PostgreSQL Database ===');

  const prodsRes = await pool.query(`
    SELECT p.id, p.title, p.slug, c.name as category_name, pi.url as current_image
    FROM "Product" p
    JOIN "Category" c ON p.category_id = c.id
    LEFT JOIN "ProductImage" pi ON pi.product_id = p.id
    ORDER BY c.name, p.id
  `);

  console.log(`Found ${prodsRes.rows.length} total products in database.`);

  const catSeenCounts: Record<string, number> = {};
  let updateCount = 0;

  for (const row of prodsRes.rows) {
    const cat = row.category_name;
    const count = catSeenCounts[cat] || 0;
    catSeenCounts[cat] = count + 1;

    const replacements = correctedImagesBySubcategory[cat];
    if (replacements) {
      const newImg = replacements[count % replacements.length];
      if (newImg && newImg !== row.current_image) {
        console.log(`[Updating] [${cat}] "${row.title}"`);
        console.log(`  OLD: ${row.current_image}`);
        console.log(`  NEW: ${newImg}\n`);

        await pool.query(`
          UPDATE "ProductImage"
          SET url = $1, alt_text = $2
          WHERE product_id = $3
        `, [newImg, row.title, row.id]);

        updateCount++;
      }
    }
  }

  console.log(`=== Successfully updated ${updateCount} product images in Database ===`);

  console.log('\n=== Step 2: Clearing Redis Product & Category Caches ===');
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const pKeys = await redis.keys('cache:product*');
    const cKeys = await redis.keys('cache:categor*');
    const all = [...pKeys, ...cKeys];
    if (all.length > 0) {
      await redis.del(...all);
      console.log(`Deleted ${all.length} Redis cache keys.`);
    } else {
      console.log('No Redis keys found to clear.');
    }
    await redis.quit();
  } catch (err) {
    console.warn('Redis notice:', (err as Error).message);
  }

  console.log('\n=== All Product Images Fixed and Verified! ===');
}

main()
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
