import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    name: 'Electronics & Gadgets',
    imageQuery: 'electronics',
    subcategories: ['Smartphone', 'Laptop', 'Desktop Computer', 'Tablet', 'Smart Watch', 'Headphone / Earbuds', 'Bluetooth Speaker', 'Camera', 'Gaming Console', 'Computer Accessories', 'Chargers & Cables']
  },
  {
    name: 'Fashion & Clothing',
    imageQuery: 'fashion',
    subcategories: ['T-shirt', 'Shirt', 'Jeans', 'Pants', 'Jacket', 'Hoodie', 'Shoes', 'Sandals', 'Bags', 'Watches', 'Sunglasses', 'Fashion Accessories']
  },
  {
    name: 'Beauty & Personal Care',
    imageQuery: 'beauty',
    subcategories: ['Skincare Products', 'Makeup Products', 'Perfume', 'Hair Care Products', 'Grooming Products', 'Beauty Tools']
  },
  {
    name: 'Home & Living',
    imageQuery: 'home-decor',
    subcategories: ['Furniture', 'Bed & Mattress', 'Sofa', 'Table & Chair', 'Home Decor', 'Lighting', 'Kitchen Tools', 'Storage Items', 'Curtains', 'Carpets']
  },
  {
    name: 'Kitchen & Appliances',
    imageQuery: 'kitchen',
    subcategories: ['Refrigerator', 'Microwave Oven', 'Blender', 'Rice Cooker', 'Electric Kettle', 'Coffee Maker', 'Cookware', 'Dinner Set']
  },
  {
    name: 'Books & Stationery',
    imageQuery: 'books',
    subcategories: ['Books', 'Notebooks', 'Pens', 'Office Supplies', 'Educational Materials', 'Art Supplies']
  },
  {
    name: 'Sports & Fitness',
    imageQuery: 'fitness',
    subcategories: ['Gym Equipment', 'Sports Shoes', 'Fitness Tracker', 'Yoga Mat', 'Sports Accessories', 'Bicycles']
  },
  {
    name: 'Kids & Baby Products',
    imageQuery: 'baby',
    subcategories: ['Baby Clothes', 'Toys', 'School Bags', 'Baby Care Products', 'Kids Accessories']
  },
  {
    name: 'Automotive',
    imageQuery: 'automotive',
    subcategories: ['Car Accessories', 'Bike Accessories', 'Helmet', 'Car Electronics', 'Cleaning Products']
  },
  {
    name: 'Pet Supplies',
    imageQuery: 'pets',
    subcategories: ['Pet Food', 'Pet Toys', 'Pet Accessories', 'Pet Care Products']
  },
  {
    name: 'Grocery & Food',
    imageQuery: 'grocery',
    subcategories: ['Snacks', 'Beverages', 'Dry Food', 'Fresh Food', 'Cooking Ingredients']
  },
  {
    name: 'Digital Products',
    imageQuery: 'digital',
    subcategories: ['Software', 'Online Courses', 'E-books', 'Subscriptions', 'Templates']
  },
  {
    name: 'Others',
    imageQuery: 'gift',
    subcategories: ['Gifts', 'Jewelry', 'Watches', 'Handmade Products', 'Travel Accessories']
  }
];

const BRANDS = ['Lumina', 'Aura', 'Nova', 'Zenith', 'Velora Collection'];

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function generateProductSlug(text: string) {
  return generateSlug(text) + '-' + Math.floor(Math.random() * 10000);
}

function getRandomPrice(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

async function main() {
  console.log('Cleaning up existing database...');
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  console.log('Seeding Brands...');
  const createdBrands = await Promise.all(
    BRANDS.map(name =>
      prisma.brand.create({
        data: { name, slug: generateSlug(name) }
      })
    )
  );

  console.log('Seeding Categories & Products...');
  for (const catData of CATEGORIES) {
    // Create Main Category
    const mainCategory = await prisma.category.create({
      data: {
        name: catData.name,
        slug: generateSlug(catData.name),
        image_url: `https://loremflickr.com/800/600/${catData.imageQuery}?random=0`
      }
    });

    for (const subName of catData.subcategories) {
      // Create Subcategory
      const subCategory = await prisma.category.create({
        data: {
          name: subName,
          slug: `${generateSlug(catData.name)}-${generateSlug(subName)}`,
          parent_id: mainCategory.id
        }
      });

      // Create 2 Products for this subcategory
      for (let i = 1; i <= 2; i++) {
        const brand = createdBrands[Math.floor(Math.random() * createdBrands.length)];
        const title = `Premium ${subName} - Model ${Math.floor(Math.random() * 1000)}`;
        const basePrice = getRandomPrice(20, 500);
        
        const product = await prisma.product.create({
          data: {
            title,
            slug: generateProductSlug(title),
            description: `This is a high-quality ${subName} designed for the modern lifestyle. Features premium materials and stunning aesthetics.`,
            brand_id: brand.id,
            category_id: subCategory.id,
            base_price: parseFloat(basePrice),
            is_active: true,
            
            variants: {
              create: [
                {
                  sku: generateProductSlug(title) + '-SKU',
                  price: parseFloat(basePrice),
                  compare_price: parseFloat(basePrice) * 1.2,
                  inventory: {
                    create: { quantity: 100 }
                  }
                }
              ]
            },
            images: {
              create: [
                { url: `https://loremflickr.com/800/1000/${subName.toLowerCase().replace(/[^a-z0-9]+/g, ',')}?random=${Math.floor(Math.random() * 10000)}`, alt_text: title, sort_order: 0 },
              ]
            }
          }
        });

        // Add 1-2 random reviews for the product
        // (Assuming we need to mock reviews if rating is needed. Actually, rating might not be an explicit field on Product, but computed from Reviews)
        // Wait, User is required for review. Let's skip reviews for now unless explicitly needed by the frontend.
      }
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
