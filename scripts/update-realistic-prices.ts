import 'dotenv/config';
import { Pool } from 'pg';
import Redis from 'ioredis';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Realistic BDT market prices: [price, comparePrice] for Model 1 and Model 2 of every subcategory
const realisticPriceMap: Record<string, [[number, number], [number, number]]> = {
  // Electronics & Gadgets
  'Smartphone': [[24999, 27999], [45999, 49999]],
  'Laptop': [[65000, 72000], [115000, 125000]],
  'Desktop Computer': [[55000, 62000], [88000, 98000]],
  'Tablet': [[28500, 32000], [52000, 58000]],
  'Smart Watch': [[3499, 4200], [7999, 9500]],
  'Headphone / Earbuds': [[2499, 3100], [6999, 8500]],
  'Bluetooth Speaker': [[2850, 3400], [5999, 7200]],
  'Camera': [[54000, 60000], [85000, 95000]],
  'Gaming Console': [[38500, 42000], [62000, 68000]],
  'Computer Accessories': [[1850, 2300], [4500, 5400]],
  'Chargers & Cables': [[650, 850], [1250, 1600]],

  // Fashion & Clothing
  'T-shirt': [[650, 850], [950, 1200]],
  'Shirt': [[1450, 1850], [2150, 2650]],
  'Jeans': [[1850, 2350], [2750, 3400]],
  'Pants': [[1350, 1700], [1950, 2450]],
  'Jacket': [[3200, 4000], [5800, 7200]],
  'Hoodie': [[1450, 1850], [2250, 2800]],
  'Shoes': [[2850, 3500], [4950, 6200]],
  'Sandals': [[850, 1100], [1850, 2300]],
  'Bags': [[1850, 2400], [3650, 4500]],
  'Watches': [[2450, 3200], [5850, 7500]],
  'Sunglasses': [[950, 1300], [1850, 2400]],
  'Fashion Accessories': [[550, 750], [1150, 1500]],

  // Beauty & Personal Care
  'Skincare Products': [[1250, 1600], [1850, 2300]],
  'Makeup Products': [[850, 1100], [1650, 2100]],
  'Perfume': [[2450, 3200], [4850, 6000]],
  'Hair Care Products': [[750, 980], [1350, 1750]],
  'Grooming Products': [[1650, 2100], [2850, 3600]],
  'Beauty Tools': [[650, 850], [2450, 3100]],

  // Home & Living
  'Furniture': [[12500, 15000], [28000, 34000]],
  'Bed & Mattress': [[18500, 22500], [38000, 45000]],
  'Sofa': [[24500, 29000], [48000, 58000]],
  'Table & Chair': [[15500, 19000], [85000, 98000]],
  'Home Decor': [[850, 1150], [2250, 2900]],
  'Lighting': [[1450, 1900], [4250, 5400]],
  'Kitchen Tools': [[1150, 1500], [2100, 2700]],
  'Storage Items': [[750, 950], [1850, 2400]],
  'Curtains': [[1250, 1650], [2450, 3100]],
  'Carpets': [[2850, 3600], [6500, 8200]],

  // Kitchen & Appliances
  'Refrigerator': [[38500, 44000], [68000, 78000]],
  'Microwave Oven': [[11500, 13800], [19500, 23000]],
  'Blender': [[2450, 3100], [4850, 6000]],
  'Rice Cooker': [[2150, 2700], [3950, 4800]],
  'Electric Kettle': [[950, 1250], [1950, 2500]],
  'Coffee Maker': [[4250, 5400], [18500, 22000]],
  'Cookware': [[3200, 4100], [5800, 7200]],
  'Dinner Set': [[4500, 5800], [8500, 10800]],

  // Books & Stationery
  'Books': [[450, 600], [850, 1100]],
  'Notebooks': [[280, 380], [550, 700]],
  'Pens': [[180, 250], [1450, 1900]],
  'Office Supplies': [[450, 600], [1200, 1550]],
  'Educational Materials': [[650, 850], [1350, 1750]],
  'Art Supplies': [[850, 1150], [2250, 2900]],

  // Sports & Fitness
  'Gym Equipment': [[1850, 2400], [4800, 6200]],
  'Sports Shoes': [[2950, 3800], [4950, 6200]],
  'Fitness Tracker': [[2450, 3200], [5800, 7200]],
  'Yoga Mat': [[850, 1150], [1650, 2100]],
  'Sports Accessories': [[450, 600], [1150, 1500]],
  'Bicycles': [[14500, 17500], [24500, 29000]],

  // Kids & Baby
  'Baby Clothes': [[750, 980], [1350, 1750]],
  'Toys': [[850, 1150], [2250, 2900]],
  'School Bags': [[1150, 1500], [1850, 2400]],
  'Baby Care Products': [[550, 720], [1650, 2100]],
  'Kids Accessories': [[450, 600], [950, 1250]],

  // Automotive
  'Car Accessories': [[1450, 1850], [2850, 3600]],
  'Bike Accessories': [[650, 850], [1850, 2400]],
  'Helmet': [[2450, 3100], [4850, 6200]],
  'Car Electronics': [[2850, 3600], [5400, 6800]],
  'Cleaning Products': [[450, 600], [1250, 1650]],

  // Pet Supplies
  'Pet Food': [[1250, 1600], [2450, 3100]],
  'Pet Toys': [[380, 500], [750, 980]],
  'Pet Accessories': [[550, 750], [1450, 1900]],
  'Pet Care Products': [[650, 850], [1250, 1600]],

  // Grocery & Food
  'Snacks': [[320, 400], [580, 720]],
  'Beverages': [[450, 580], [950, 1200]],
  'Dry Food': [[380, 480], [750, 950]],
  'Fresh Food': [[420, 520], [850, 1050]],
  'Cooking Ingredients': [[350, 450], [850, 1100]],

  // Digital Products
  'Software': [[1850, 2400], [4500, 5800]],
  'Online Courses': [[1450, 2200], [2950, 4500]],
  'E-books': [[350, 550], [650, 950]],
  'Subscriptions': [[1200, 1600], [2400, 3200]],
  'Templates': [[750, 1100], [1650, 2500]],

  // Others
  'Gifts': [[1250, 1650], [2850, 3600]],
  'Jewelry': [[1450, 1950], [3850, 4950]],
  'Handmade Products': [[1850, 2400], [4500, 5800]],
  'Travel Accessories': [[850, 1150], [1750, 2300]]
};

async function main() {
  console.log('Fetching all products and categories for realistic price update...');
  const res = await pool.query(`
    SELECT p.id, p.title, c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p.category_id = c.id
    ORDER BY p.category_id, p.id
  `);

  console.log(`Calculating realistic market prices for ${res.rows.length} products...`);
  const seenCounts: Record<string, number> = {};

  const productValues: string[] = [];
  const variantValues: string[] = [];
  const productParams: any[] = [];
  const variantParams: any[] = [];
  let pIdx = 1;
  let vIdx = 1;

  for (const row of res.rows) {
    const catName = row.category_name || 'Others';
    const count = seenCounts[catName] || 0;
    seenCounts[catName] = count + 1;

    const pairs = realisticPriceMap[catName] || [[1250, 1600], [2450, 3100]];
    const selectedPair = pairs[count % pairs.length];
    const price = selectedPair[0];
    const comparePrice = selectedPair[1];
    const discountPercent = Math.round(((comparePrice - price) / comparePrice) * 100);

    // Product update params: (id, base_price, discount_percent)
    productValues.push(`($${pIdx++}::text, $${pIdx++}::float8, $${pIdx++}::float8)`);
    productParams.push(row.id, price, discountPercent);

    // ProductVariant update params: (product_id, price, compare_price)
    variantValues.push(`($${vIdx++}::text, $${vIdx++}::numeric, $${vIdx++}::numeric)`);
    variantParams.push(row.id, price, comparePrice);
  }

  console.log('Updating Product table with realistic base prices...');
  const prodQuery = `
    UPDATE "Product" AS p
    SET base_price = vals.base_price, discount_percent = vals.discount_percent
    FROM (VALUES ${productValues.join(', ')}) AS vals(id, base_price, discount_percent)
    WHERE p.id = vals.id
  `;
  await pool.query(prodQuery, productParams);
  console.log('Product table updated successfully.');

  console.log('Updating ProductVariant table with realistic variant prices & compare prices...');
  const varQuery = `
    UPDATE "ProductVariant" AS pv
    SET price = vals.price, compare_price = vals.compare_price
    FROM (VALUES ${variantValues.join(', ')}) AS vals(product_id, price, compare_price)
    WHERE pv.product_id = vals.product_id
  `;
  await pool.query(varQuery, variantParams);
  console.log('ProductVariant table updated successfully.');

  // Invalidate Redis caches
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const keys = await redis.keys('cache:product*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared Redis keys: ${keys.join(', ')}`);
    }
    await redis.quit();
  } catch (err) {
    console.warn('Redis warning:', (err as Error).message);
  }

  console.log('Finished updating realistic product prices successfully!');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
