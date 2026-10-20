import 'dotenv/config';
import { Pool } from 'pg';
import Redis from 'ioredis';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface RealProductDef {
  title: string;
  slug: string;
  description: string;
  brandName: string;
  price: number;
  comparePrice: number;
  imageUrl: string;
}

// 87 Subcategories -> Each has 2 distinct real products
const realProductsCatalog: Record<string, [RealProductDef, RealProductDef]> = {
  // ==================== ELECTRONICS & GADGETS ====================
  'Smartphone': [
    {
      title: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB Titanium)',
      slug: 'samsung-galaxy-s24-ultra-5g-titanium-256gb',
      description: 'Flagship smartphone featuring Galaxy AI, 200MP pro-grade camera with 100x Space Zoom, Snapdragon 8 Gen 3 processor, and built-in S Pen stylus.',
      brandName: 'Nova',
      price: 115000,
      comparePrice: 125000,
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Apple iPhone 15 Pro Max (256GB Natural Titanium)',
      slug: 'apple-iphone-15-pro-max-natural-titanium-256gb',
      description: 'Forged in titanium with aerospace-grade strength. Powered by the groundbreaking A17 Pro chip, customizable Action button, and 5x optical Telephoto zoom.',
      brandName: 'Lumina',
      price: 135000,
      comparePrice: 145000,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Laptop': [
    {
      title: 'Apple MacBook Air M2 13.6-inch (8GB Unified RAM, 256GB SSD)',
      slug: 'apple-macbook-air-m2-13-6-inch-space-gray',
      description: 'Incredibly thin and fast ultrabook with Apple M2 silicon, Liquid Retina display, 1080p FaceTime HD camera, and up to 18 hours of all-day battery life.',
      brandName: 'Nova',
      price: 118000,
      comparePrice: 128000,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Dell Inspiron 15 3520 Core i5-1235U (16GB RAM, 512GB SSD)',
      slug: 'dell-inspiron-15-3520-core-i5-12th-gen-16gb',
      description: 'Versatile 15.6-inch FHD 120Hz business laptop equipped with 12th Gen Intel Core i5 processor, fast PCIe NVMe storage, and responsive carbon black chassis.',
      brandName: 'Velora Collection',
      price: 65000,
      comparePrice: 72000,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Desktop Computer': [
    {
      title: 'Apple iMac 24-inch 4.5K Retina (M3 Chip, 8-Core CPU, 256GB SSD)',
      slug: 'apple-imac-24-inch-4-5k-retina-m3-chip-silver',
      description: 'The world best all-in-one desktop computer, supercharged by the Apple M3 chip. Strikingly slim 11.5mm design with a brilliant 4.5K Retina display.',
      brandName: 'Nova',
      price: 165000,
      comparePrice: 178000,
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'HP ProDesk 400 G9 Mini PC (Intel Core i5-13500T, 16GB, 512GB)',
      slug: 'hp-prodesk-400-g9-mini-pc-intel-i5-13th-gen',
      description: 'Ultra-compact business desktop designed for space-constrained office workspaces, delivering robust performance, multi-display support, and enterprise security.',
      brandName: 'Zenith',
      price: 55000,
      comparePrice: 62000,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Tablet': [
    {
      title: 'Apple iPad Air 11-inch M2 (WiFi, 128GB, Space Gray)',
      slug: 'apple-ipad-air-11-inch-m2-wifi-128gb-space-gray',
      description: 'Supercharged by the lightning-fast Apple M2 chip. Features a Liquid Retina display, landscape 12MP front camera with Center Stage, and Wi-Fi 6E.',
      brandName: 'Lumina',
      price: 78000,
      comparePrice: 85000,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Samsung Galaxy Tab S9 FE (6GB RAM, 128GB, IP68 S-Pen Included)',
      slug: 'samsung-galaxy-tab-s9-fe-6gb-128gb-spen',
      description: 'Water and dust resistant IP68 tablet featuring a responsive 10.9-inch 90Hz display, dual AKG speakers, and bundled low-latency S Pen for notes and sketching.',
      brandName: 'Velora Collection',
      price: 48500,
      comparePrice: 54000,
      imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Smart Watch': [
    {
      title: 'Apple Watch Series 9 GPS 45mm (Midnight Aluminum Case)',
      slug: 'apple-watch-series-9-gps-45mm-midnight-aluminum',
      description: 'Advanced health sensors with Blood Oxygen and ECG monitoring, S9 SiP dual-core processor, Double Tap gesture control, and up to 2000 nits edge-to-edge display.',
      brandName: 'Aura',
      price: 48500,
      comparePrice: 53000,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Amazfit GTR 4 Classic Smartwatch (Dual-Band GPS, AMOLED Display)',
      slug: 'amazfit-gtr-4-classic-smartwatch-dual-band-gps',
      description: 'Classic round smartwatch with 1.43-inch HD AMOLED screen, 150+ sports modes, 14-day battery life, dual-band circularly-polarized GPS tracking.',
      brandName: 'Nova',
      price: 18500,
      comparePrice: 21500,
      imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Headphone / Earbuds': [
    {
      title: 'Sony WH-1000XM5 Noise-Canceling Wireless Over-Ear Headphones',
      slug: 'sony-wh-1000xm5-wireless-noise-canceling-headphones',
      description: 'Industry-leading noise cancellation powered by dual processors and 8 microphones. Enjoy 30 hours of battery life, crystal clear hands-free calls, and LDAC audio.',
      brandName: 'Zenith',
      price: 38500,
      comparePrice: 43000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Apple AirPods Pro 2nd Gen with MagSafe Case (USB-C)',
      slug: 'apple-airpods-pro-2nd-gen-magsafe-case-usb-c',
      description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and IP54 dust, sweat, and water resistance.',
      brandName: 'Aura',
      price: 28500,
      comparePrice: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Bluetooth Speaker': [
    {
      title: 'JBL Charge 5 Portable Waterproof Bluetooth Speaker (Original Pro Sound)',
      slug: 'jbl-charge-5-portable-waterproof-bluetooth-speaker',
      description: 'IP67 waterproof and dustproof wireless speaker with an optimized long-excursion driver, separate tweeter, dual passive bass radiators, and 20 hours playtime.',
      brandName: 'Nova',
      price: 16500,
      comparePrice: 19000,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Marshall Emberton II Compact Portable Stereo Speaker (Cream)',
      slug: 'marshall-emberton-ii-compact-portable-speaker-cream',
      description: 'Iconic vintage Marshall styling delivering 30+ hours of portable playtime on a single charge with True Stereophonic 360-degree multidirectional sound.',
      brandName: 'Velora Collection',
      price: 21500,
      comparePrice: 24500,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Camera': [
    {
      title: 'Sony Alpha A7 IV Full-Frame Mirrorless Digital Camera (Body)',
      slug: 'sony-alpha-a7-iv-full-frame-mirrorless-camera',
      description: '33MP full-frame Exmor R CMOS sensor, 4K 60p 10-bit video recording, real-time Eye AF for humans/animals/birds, and 5-axis in-body image stabilization.',
      brandName: 'Lumina',
      price: 245000,
      comparePrice: 265000,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Canon EOS R50 Mirrorless Camera with 18-45mm IS STM Lens Kit',
      slug: 'canon-eos-r50-mirrorless-camera-18-45mm-lens-kit',
      description: 'Compact and lightweight 24.2MP APS-C camera designed for content creators, featuring Dual Pixel CMOS AF II, uncropped 4K 30p, and vari-angle touchscreen.',
      brandName: 'Nova',
      price: 82000,
      comparePrice: 89000,
      imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Gaming Console': [
    {
      title: 'Sony PlayStation 5 Slim Edition Console (1TB SSD, DualSense)',
      slug: 'sony-playstation-5-slim-edition-console-1tb-dualsense',
      description: 'Slimmer PS5 console equipped with 1TB high-speed NVMe SSD, Ray Tracing, 4K-TV gaming, up to 120fps with 120Hz output, Tempest 3D AudioTech, and DualSense controller.',
      brandName: 'Zenith',
      price: 68500,
      comparePrice: 75000,
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Nintendo Switch OLED Model with White Joy-Con',
      slug: 'nintendo-switch-oled-model-white-joy-con',
      description: 'Features a vibrant 7-inch OLED screen with vivid colors and crisp contrast, wide adjustable tabletop stand, dock with wired LAN port, and 64GB storage.',
      brandName: 'Aura',
      price: 36500,
      comparePrice: 41000,
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Computer Accessories': [
    {
      title: 'Logitech MX Master 3S Wireless Performance Ergonomic Mouse',
      slug: 'logitech-mx-master-3s-wireless-performance-mouse',
      description: 'Quiet Click technology, 8000 DPI track-on-glass optical sensor, MagSpeed electromagnetic scrolling wheel, and seamless multi-device flow control.',
      brandName: 'Nova',
      price: 11500,
      comparePrice: 13500,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Keychron K2 Pro Wireless Custom Mechanical Keyboard (RGB Hot-Swap)',
      slug: 'keychron-k2-pro-wireless-custom-mechanical-keyboard',
      description: '75% compact layout QMK/VIA programmable mechanical keyboard with hot-swappable Keychron K Pro switches, acoustic sound-absorbing foam, and macOS/Windows layout.',
      brandName: 'Velora Collection',
      price: 9800,
      comparePrice: 11500,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Chargers & Cables': [
    {
      title: 'Anker 735 GaNPrime 65W Fast Wall Charger (3-Port USB-C/A)',
      slug: 'anker-735-ganprime-65w-fast-wall-charger',
      description: 'Ultra-compact GaNPrime fast charger capable of powering your laptop, smartphone, and earbuds simultaneously with intelligent Dynamic Power Distribution.',
      brandName: 'Aura',
      price: 4200,
      comparePrice: 4900,
      imageUrl: '/products/anker-735-ganprime-65w-fast-wall-charger.jpg'
    },
    {
      title: 'Baseus 100W Braided USB-C to USB-C Fast Charging Cable (2M)',
      slug: 'baseus-100w-braided-usb-c-to-usb-c-cable-2m',
      description: 'High-density braided nylon cable with reinforced aluminum alloy connectors and built-in E-marker chip supporting up to 100W Power Delivery and 480Mbps data.',
      brandName: 'Nova',
      price: 850,
      comparePrice: 1150,
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== FASHION & CLOTHING ====================
  'T-shirt': [
    {
      title: 'Heavyweight 240 GSM Pure Combed Cotton Oversized T-Shirt',
      slug: 'heavyweight-240-gsm-pure-cotton-oversized-t-shirt-black',
      description: 'Crafted from 100% pre-shrunk combed organic cotton with a durable ribbed crewneck collar, drop-shoulder relaxed silhouette, and breathable soft texture.',
      brandName: 'Velora Collection',
      price: 850,
      comparePrice: 1100,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Vintage Acid Washed Graphic Skate Cotton T-Shirt',
      slug: 'vintage-acid-washed-graphic-skate-t-shirt-charcoal',
      description: 'Distressed vintage mineral-washed streetwear t-shirt featuring high-density screen printed artwork, twin-needle stitching, and a comfortable relaxed drape.',
      brandName: 'Aura',
      price: 950,
      comparePrice: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Shirt': [
    {
      title: 'Premium Royal Oxford Cotton Slim-Fit Formal Dress Shirt',
      slug: 'premium-royal-oxford-cotton-slim-fit-formal-shirt-white',
      description: 'Tailored from two-ply 100% Egyptian long-staple cotton with a semi-spread collar, mother-of-pearl style buttons, and easy-iron anti-crease finish.',
      brandName: 'Zenith',
      price: 2250,
      comparePrice: 2800,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Casual Breathable Pure Linen Button-Down Summer Shirt',
      slug: 'casual-breathable-pure-linen-button-down-shirt-olive',
      description: 'Natural pure European flax linen casual shirt offering superior breathability and effortless drape in warm climates. Features curved hem and chest pocket.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Jeans': [
    {
      title: 'Levi’s 511 Slim Fit Stretch Denim Jeans (Clean Dark Indigo)',
      slug: 'levis-511-slim-fit-stretch-denim-jeans-indigo',
      description: 'Modern slim-fit jeans with room to move. Cut from premium ring-spun denim with built-in stretch for flexible all-day comfort and signature 5-pocket styling.',
      brandName: 'Nova',
      price: 2950,
      comparePrice: 3600,
      imageUrl: '/products/levis-511-slim-fit-stretch-denim-jeans.jpg'
    },
    {
      title: 'Straight Leg Vintage Washed Selvedge Denim Jeans',
      slug: 'straight-leg-vintage-washed-selvedge-denim-jeans',
      description: 'Heavyweight authentic 13.5 oz red-line selvedge denim woven on traditional shuttle looms. Features hand-sanded whiskering and durable brass rivets.',
      brandName: 'Aura',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Pants': [
    {
      title: 'Tailored Smart Stretch Cotton Chino Trousers (Khaki Sand)',
      slug: 'tailored-smart-stretch-cotton-chino-trousers-khaki',
      description: 'Crisp, versatile slim-straight chino trousers woven from high-count combed twill with 3% elastane. Perfect for smart-casual office and weekend wear.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2300,
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Tactical Multi-Pocket Cotton Canvas Cargo Pants (Olive)',
      slug: 'tactical-multi-pocket-cotton-canvas-cargo-pants-olive',
      description: 'Durable ripstop cotton canvas utility cargo pants featuring reinforced knees, deep bellows pockets with snap flaps, and adjustable drawstring cuffs.',
      brandName: 'Nova',
      price: 1650,
      comparePrice: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Jacket': [
    {
      title: 'Genuine Full-Grain Leather Asymmetrical Biker Jacket',
      slug: 'genuine-full-grain-leather-asymmetrical-biker-jacket-black',
      description: 'Handcrafted from supple full-grain lambskin leather with heavy-duty YKK metal zippers, satin thermal lining, snap-down lapels, and tailored biker fit.',
      brandName: 'Zenith',
      price: 5800,
      comparePrice: 7200,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Water-Resistant Lightweight Down Puffer Jacket with Hood',
      slug: 'water-resistant-lightweight-down-puffer-jacket-navy',
      description: 'Quilted windproof shell insulated with 700-fill power responsibly sourced duck down, packable design with zippered hand-warmer pockets and bungee storm hood.',
      brandName: 'Velora Collection',
      price: 3850,
      comparePrice: 4800,
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Hoodie': [
    {
      title: 'Heavyweight 400 GSM Fleece Kangaroo Pocket Pullover Hoodie',
      slug: 'heavyweight-400-gsm-fleece-pullover-hoodie-oatmeal',
      description: 'Thick, ultra-soft brushed French terry fleece hoodie with double-layer drawstring hood, ribbed side gussets, seamless cuffs, and kangaroo pouch pocket.',
      brandName: 'Aura',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Athletic Tech-Fleece Full-Zip Training Hoodie (Charcoal)',
      slug: 'athletic-tech-fleece-full-zip-training-hoodie-charcoal',
      description: 'Engineered double-sided spacer cotton fabric offering lightweight thermal warmth without bulk. Features zippered sleeve key pocket and ergonomic articulated sleeves.',
      brandName: 'Nova',
      price: 2150,
      comparePrice: 2700,
      imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Shoes': [
    {
      title: 'Nike Air Max 270 Athletic Cushion Walking Sneakers (Triple White)',
      slug: 'nike-air-max-270-athletic-cushion-sneakers-white',
      description: 'Showcases Nike tallest Max Air heel unit for exceptional bouncy cushion, flexible circular-knit breathable mesh upper, and dual-density durable foam sole.',
      brandName: 'Nova',
      price: 4950,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Handcrafted Full-Grain Leather Cap-Toe Oxford Formal Shoes',
      slug: 'handcrafted-leather-cap-toe-oxford-dress-shoes-brown',
      description: 'Timeless formal footwear constructed from hand-burnished Italian calfskin leather with Goodyear welted construction, cushioned insole, and stacked leather heel.',
      brandName: 'Zenith',
      price: 3650,
      comparePrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Sandals': [
    {
      title: 'Birkenstock Arizona Two-Strap Anatomical Cork Footbed Slide Sandals',
      slug: 'birkenstock-arizona-two-strap-cork-footbed-sandals',
      description: 'The legendary two-strap sandal design with an anatomical cork-latex footbed that contours to the foot over time, soft suede lining, and lightweight EVA shock-absorbing sole.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2300,
      imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Cushioned Genuine Leather Comfort Strap Casual Walking Slides',
      slug: 'cushioned-genuine-leather-comfort-strap-casual-slides',
      description: 'Ergonomic dual-strap leather slides crafted with padded arch support, slip-resistant rubber tread, and moisture-wicking microfiber top layer for casual ease.',
      brandName: 'Aura',
      price: 1150,
      comparePrice: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Bags': [
    {
      title: 'Full-Grain Leather 15.6-inch Professional Laptop Messenger Briefcase',
      slug: 'full-grain-leather-15-6-inch-laptop-messenger-briefcase',
      description: 'Handmade vegetable-tanned leather briefcase featuring padded laptop compartment, brass hardware, detachable padded shoulder strap, and organized interior pockets.',
      brandName: 'Zenith',
      price: 3850,
      comparePrice: 4800,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Waterproof Minimalist Anti-Theft Commuter Backpack (25L Capacity)',
      slug: 'waterproof-minimalist-anti-theft-commuter-backpack-25l',
      description: 'Sleek urban backpack built with water-resistant 900D coated polyester, hidden anti-theft back pocket, integrated USB charging port, and breathable ergonomic straps.',
      brandName: 'Nova',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Watches': [
    {
      title: 'Tissot PRX Powermatic 80 Automatic Stainless Steel Luxury Watch',
      slug: 'tissot-prx-powermatic-80-automatic-stainless-steel-watch',
      description: 'Iconic 1978 retro integrated bracelet timepiece equipped with the Swiss Powermatic 80 automatic movement, sapphire crystal with anti-reflective coating, and 100m water resistance.',
      brandName: 'Zenith',
      price: 5850,
      comparePrice: 7500,
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Seiko 5 Sports Automatic Mechanical Watch (Sunburst Navy Dial)',
      slug: 'seiko-5-sports-automatic-mechanical-watch-navy-dial',
      description: 'Renowned Japanese 4R36 automatic self-winding movement with manual winding capability, unidirectional rotating dive bezel, Lumibrite hands, and day-date calendar display.',
      brandName: 'Velora Collection',
      price: 4250,
      comparePrice: 5400,
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Sunglasses': [
    {
      title: 'Ray-Ban Classic Wayfarer Polarized Sunglasses (Tortoise Acetate Frame)',
      slug: 'ray-ban-classic-wayfarer-polarized-sunglasses-tortoise',
      description: 'Legendary hand-polished Italian acetate frame with crystal green G-15 polarized mineral glass lenses providing 100% UVA/UVB protection and glare elimination.',
      brandName: 'Nova',
      price: 2450,
      comparePrice: 3200,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Aviator Gold Metal Frame Mirrored Lens UV400 Sunglasses',
      slug: 'aviator-gold-metal-frame-mirrored-lens-uv400-sunglasses',
      description: 'Ultralight stainless steel pilot frame with soft silicone nose pads, scratch-resistant gradient mirrored lenses, and spring-hinged temples for custom comfort.',
      brandName: 'Aura',
      price: 1350,
      comparePrice: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Fashion Accessories': [
    {
      title: 'Full-Grain Italian Calfskin Leather Reversible Dress Belt (Black/Brown)',
      slug: 'full-grain-italian-calfskin-leather-reversible-belt',
      description: 'Reversible dual-tone genuine leather belt with a solid brushed silver swivel pin buckle. Handcrafted with beveled edges and reinforced stitching.',
      brandName: 'Zenith',
      price: 1250,
      comparePrice: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: '100% Pure Mulberry Silk Hand-Rolled Floral Pocket Square & Scarf',
      slug: '100-pure-mulberry-silk-hand-rolled-floral-pocket-square',
      description: 'Luxurious 16 momme twill weave pure mulberry silk scarf with exquisite hand-rolled edges, vibrant botanical motif, and silky gentle skin touch.',
      brandName: 'Aura',
      price: 850,
      comparePrice: 1150,
      imageUrl: '/products/mulberry-silk-floral-pocket-square-scarf.jpg'
    }
  ],

  // ==================== BEAUTY & PERSONAL CARE ====================
  'Skincare Products': [
    {
      title: 'COSRX Advanced Snail 96 Mucin Power Repairing Essence (100ml)',
      slug: 'cosrx-advanced-snail-96-mucin-power-essence-100ml',
      description: 'Formulated with 96.3% snail secretion filtrate to deeply hydrate, repair damaged skin barrier, improve elasticity, and restore a radiant healthy glass skin glow.',
      brandName: 'Lumina',
      price: 1650,
      comparePrice: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'The Ordinary Niacinamide 10% + Zinc 1% Oil Control Serum (30ml)',
      slug: 'the-ordinary-niacinamide-10-zinc-1-serum-30ml',
      description: 'High-strength vitamin and mineral blemish formula that visibly targets enlarged pores, regulates sebum production, and evens out irregular skin tone.',
      brandName: 'Aura',
      price: 1250,
      comparePrice: 1600,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Makeup Products': [
    {
      title: 'Maybelline Super Stay Matte Ink Longwear Liquid Lipstick (Seductress)',
      slug: 'maybelline-super-stay-matte-ink-liquid-lipstick-seductress',
      description: 'Up to 16-hour saturated liquid matte lipstick with a unique precision arrow applicator for a flawless, transfer-proof finish in a flattering warm nude shade.',
      brandName: 'Lumina',
      price: 850,
      comparePrice: 1100,
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Huda Beauty Matte Obsessions Warm Nude Eyeshadow Palette (9 Shades)',
      slug: 'huda-beauty-matte-obsessions-warm-nude-eyeshadow-palette',
      description: 'Nine ultra-pigmented, velvety matte eyeshadows ranging from terracotta peaches to deep chocolate browns, offering seamless blending and zero fallout.',
      brandName: 'Zenith',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Perfume': [
    {
      title: 'Dior Sauvage Eau De Parfum Natural Spray for Men (100ml)',
      slug: 'dior-sauvage-eau-de-parfum-spray-100ml',
      description: 'A powerful, mysterious fragrance blending juicy Calabrian bergamot, sensual Papua New Guinean vanilla absolute, and smoky ambery facets for an unforgettable trail.',
      brandName: 'Zenith',
      price: 8500,
      comparePrice: 9800,
      imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Yves Saint Laurent Black Opium Eau De Parfum for Women (90ml)',
      slug: 'yves-saint-laurent-black-opium-eau-de-parfum-90ml',
      description: 'A seductively intoxicating gourmand floral perfume opening with black coffee and white flowers, enriched by sweet sensual vanilla and comforting white cedar.',
      brandName: 'Aura',
      price: 7900,
      comparePrice: 9200,
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Hair Care Products': [
    {
      title: 'Olaplex No. 3 Hair Perfector Deep Bond Repairing Treatment (100ml)',
      slug: 'olaplex-no-3-hair-perfector-bond-repair-treatment-100ml',
      description: 'At-home patented bond-building treatment that repairs internal hair breakage caused by heat, chemicals, and mechanical styling, restoring strength and soft shine.',
      brandName: 'Lumina',
      price: 2850,
      comparePrice: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Moroccanoil Treatment Original Pure Argan Oil Hair Serum (100ml)',
      slug: 'moroccanoil-treatment-original-argan-oil-hair-serum-100ml',
      description: 'Infused with antioxidant-rich argan oil and shine-boosting vitamins. Detangles, speeds up blow-drying time, and leaves hair smooth, nourished, and manageable.',
      brandName: 'Velora Collection',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Grooming Products': [
    {
      title: 'Philips Norelco Multigroom 7000 All-in-One Trimmer (19-Piece Kit)',
      slug: 'philips-norelco-multigroom-7000-trimmer-kit',
      description: 'DualCut self-sharpening stainless steel blades with an all-metal motor and reinforced chassis. Delivers up to 5 hours of cordless runtime on a lithium-ion battery.',
      brandName: 'Zenith',
      price: 3650,
      comparePrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Braun Series 8 Electric Wet & Dry Foil Shaver with Smart Sonic Tech',
      slug: 'braun-series-8-electric-wet-dry-foil-shaver',
      description: 'Engineered with 10,000 sonic micro-vibrations per minute and auto-sensing motor that adapts to your beard density for an ultra-close, skin-friendly shave.',
      brandName: 'Nova',
      price: 8500,
      comparePrice: 9800,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Beauty Tools': [
    {
      title: 'Natural Brazilian Rose Quartz Facial Roller & Gua Sha Sculpting Set',
      slug: 'natural-brazilian-rose-quartz-facial-roller-gua-sha-set',
      description: 'Hand-carved from 100% genuine healing rose quartz. Relieves facial muscle tension, boosts lymphatic drainage, and enhances skincare absorption with cooling touch.',
      brandName: 'Lumina',
      price: 950,
      comparePrice: 1300,
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Sonic Silicone Electric Facial Cleansing & Anti-Aging Massager Brush',
      slug: 'sonic-silicone-electric-facial-cleansing-brush',
      description: 'Waterproof IPX7 silicone facial cleansing brush with 8 adjustable T-Sonic pulsation intensities, thermal massage mode, and antibacterial ultra-soft bristles.',
      brandName: 'Aura',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== HOME & LIVING ====================
  'Furniture': [
    {
      title: 'Mid-Century Velvet Upholstered Accent Armchair with Solid Oak Legs',
      slug: 'mid-century-velvet-accent-armchair-solid-oak-legs-emerald',
      description: 'Timeless accent chair upholstered in stain-resistant emerald green velvet with high-density foam cushioning, ergonomic curved backrest, and tapered solid oak legs.',
      brandName: 'Velora Collection',
      price: 14500,
      comparePrice: 17500,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Scandinavian Solid Teak Wood Minimalist Coffee Table with Shelf',
      slug: 'scandinavian-solid-teak-wood-minimalist-coffee-table',
      description: 'Expertly handcrafted from sustainable seasoned solid teak wood with water-based polyurethane matte finish and convenient slatted open storage shelf below.',
      brandName: 'Lumina',
      price: 12500,
      comparePrice: 15500,
      imageUrl: '/products/scandinavian-solid-teak-wood-coffee-table.jpg'
    }
  ],
  'Bed & Mattress': [
    {
      title: 'Orthopedic 7-Zone Pocket Spring & Memory Foam King Mattress (10-inch)',
      slug: 'orthopedic-7-zone-pocket-spring-memory-foam-king-mattress',
      description: 'Zero motion transfer mattress combining individually encased tempered pocket coils with cooling gel memory foam and breathable hypoallergenic bamboo fabric cover.',
      brandName: 'Velora Collection',
      price: 28500,
      comparePrice: 34000,
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Modern Upholstered Queen Platform Bed Frame with Channel Tufted Headboard',
      slug: 'modern-upholstered-queen-platform-bed-frame-headboard-gray',
      description: 'Sturdy steel and solid wood frame reinforced with wooden slats (no box spring required), wrapped in durable woven linen upholstery with sound-dampening feet.',
      brandName: 'Nova',
      price: 22500,
      comparePrice: 27000,
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Sofa': [
    {
      title: 'Contemporary L-Shaped Sectional Fabric Sofa with Reversible Chaise',
      slug: 'contemporary-l-shaped-sectional-fabric-sofa-charcoal',
      description: 'Generously proportioned 4-seater sectional sofa with deep pocket-coil cushioned seating, stain-resistant linen textured fabric, and solid wood block feet.',
      brandName: 'Velora Collection',
      price: 38500,
      comparePrice: 46000,
      imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Luxury Chesterfield 3-Seater Button-Tufted Leather Couch (Cognac)',
      slug: 'luxury-chesterfield-3-seater-button-tufted-leather-couch',
      description: 'Classic British silhouette featuring deep button-tufting, rolled arms with antiqued brass nailhead trim, and top-grain Italian leather with hand-rubbed patina.',
      brandName: 'Zenith',
      price: 48500,
      comparePrice: 58000,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Table & Chair': [
    {
      title: 'Ergonomic High-Back Breathable Mesh Office Desk Chair with Lumbar Support',
      slug: 'ergonomic-high-back-breathable-mesh-office-desk-chair',
      description: 'Dynamic 3D adjustable lumbar support, 4D armrests, breathable Korean mesh back, multi-angle tilt lock mechanism, and smooth-rolling silent PU caster wheels.',
      brandName: 'Nova',
      price: 14500,
      comparePrice: 17500,
      imageUrl: '/products/ergonomic-high-back-mesh-office-desk-chair.jpg'
    },
    {
      title: 'Solid Oak Wood 6-Seater Expandable Dining Table with Dining Chairs',
      slug: 'solid-oak-wood-6-seater-expandable-dining-table-set',
      description: 'Handcrafted solid European white oak dining table with a butterfly leaf extension mechanism, accompanied by ergonomic contoured curved backrest dining chairs.',
      brandName: 'Velora Collection',
      price: 45000,
      comparePrice: 54000,
      imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Home Decor': [
    {
      title: 'Handcrafted Minimalist Ceramic Fluted Flower Vase (Nordic White)',
      slug: 'handcrafted-minimalist-ceramic-fluted-flower-vase-white',
      description: 'Artistic stoneware vase with matte unglazed tactile texture and waterproof interior, perfect for fresh floral bouquets or dried pampas grass arrangements.',
      brandName: 'Lumina',
      price: 1250,
      comparePrice: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Bohemian Hand-Woven Cotton Macrame Wall Hanging Tapestry',
      slug: 'bohemian-hand-woven-cotton-macrame-wall-hanging-tapestry',
      description: 'Intricately knotted from 100% natural cotton cord mounted on a solid wooden dowel, adding warm geometric texture and bohemian charm to any room.',
      brandName: 'Aura',
      price: 950,
      comparePrice: 1300,
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Lighting': [
    {
      title: 'Nordic Dimmable LED Spiral Arc Floor Lamp with Remote Control',
      slug: 'nordic-dimmable-led-spiral-arc-floor-lamp-remote',
      description: 'Contemporary sculptural floor lamp with stepless dimming, 3 color temperatures (3000K-6000K), memory function, and heavy weighted anti-tip metal base.',
      brandName: 'Nova',
      price: 4850,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Modern Industrial Brass Pendant Light Ceiling Chandelier (Matte Black)',
      slug: 'modern-industrial-brass-pendant-light-chandelier',
      description: 'Multi-arm architectural ceiling fixture with brushed brass accents and heat-resistant ceramic E27 bulb sockets, designed for dining rooms and kitchen islands.',
      brandName: 'Velora Collection',
      price: 3450,
      comparePrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Kitchen Tools': [
    {
      title: 'Japanese High-Carbon Damascus Steel Chef Knife Set with Wooden Block (6-Piece)',
      slug: 'japanese-damascus-steel-chef-knife-set-block',
      description: 'Forged with 67 layers of VG-10 Japanese stainless Damascus steel rated at 60±2 HRC. Features ergonomic Pakkawood handles and razor-sharp 15-degree edge.',
      brandName: 'Zenith',
      price: 4850,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Organic Moso Bamboo Extra Large Cutting Board with Juice Groove',
      slug: 'organic-moso-bamboo-extra-large-cutting-board-juice-groove',
      description: 'Eco-friendly knife-friendly bamboo butcher block board with deep perimeter juice groove to catch drips, carved side handles, and dual-sided prep surface.',
      brandName: 'Velora Collection',
      price: 1250,
      comparePrice: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Storage Items': [
    {
      title: 'Stackable Clear Acrylic Shoe & Closet Storage Display Bins (6-Pack)',
      slug: 'stackable-clear-acrylic-shoe-closet-storage-bins-6-pack',
      description: 'Magnetic drop-front dustproof organizer boxes built from shatter-resistant high-transparency acrylic, accommodating up to US Men size 14 high-top sneakers.',
      brandName: 'Nova',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Natural Woven Cotton Rope Extra Large Laundry & Toy Storage Basket',
      slug: 'natural-woven-cotton-rope-extra-large-laundry-storage-basket',
      description: 'Chemical-free durable woven rope basket with reinforced slit handles, holding blankets, pillows, or laundry while maintaining a soft, freestanding shape.',
      brandName: 'Aura',
      price: 1450,
      comparePrice: 1850,
      imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Curtains': [
    {
      title: 'Thermal Insulated 100% Blackout Grommet Window Drapes (Pair, Navy Blue)',
      slug: 'thermal-insulated-100-blackout-grommet-window-drapes-navy',
      description: 'Triple-weave heavyweight polyester fabric with white liner backing, blocking 100% of sunlight, balancing room temperature, and reducing outside noise.',
      brandName: 'Velora Collection',
      price: 2250,
      comparePrice: 2850,
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Semi-Sheer Natural Linen Textured Light Filtering Window Curtains (Ivory)',
      slug: 'semi-sheer-natural-linen-textured-window-curtains-ivory',
      description: 'Airy, billowy linen-blend drapery panels providing gentle soft light diffusion while preserving indoor privacy with rustic farmhouse texture.',
      brandName: 'Aura',
      price: 1650,
      comparePrice: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Carpets': [
    {
      title: 'Plush Moroccan Geometric Soft Shag Area Rug (5x7 Ft, Cream/Grey)',
      slug: 'plush-moroccan-geometric-soft-shag-area-rug-5x7',
      description: 'High-pile 1.5-inch micro-plush polypropylene shag rug with classic Berber trellis pattern, non-shedding fibers, and non-slip jute backing.',
      brandName: 'Velora Collection',
      price: 5800,
      comparePrice: 7200,
      imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Vintage Traditional Distressed Persian Border Area Carpet (6x9 Ft)',
      slug: 'vintage-traditional-distressed-persian-border-area-carpet',
      description: 'Printed vintage medallion motif with purposeful antique distressed patina, stain-resistant low pile suitable for robot vacuums and high-traffic areas.',
      brandName: 'Zenith',
      price: 4850,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== KITCHEN & APPLIANCES ====================
  'Refrigerator': [
    {
      title: 'Samsung 345L Digital Inverter Double Door Frost-Free Refrigerator',
      slug: 'samsung-345l-digital-inverter-double-door-refrigerator',
      description: 'Twin Cooling Plus technology with 5 conversion modes, digital inverter compressor delivering 50% energy savings, and deodorizing odor-eliminating filter.',
      brandName: 'Nova',
      price: 58500,
      comparePrice: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Walton Inverter Non-Frost Smart Refrigerator (380L, Black Mirror Glass)',
      slug: 'walton-inverter-non-frost-smart-refrigerator-380l-mirror-glass',
      description: 'Intelligent inverter technology with rapid cooling, tempered black mirror glass door finish, LED interior lighting, and eco-friendly R600a refrigerant gas.',
      brandName: 'Velora Collection',
      price: 46500,
      comparePrice: 52000,
      imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Microwave Oven': [
    {
      title: 'Panasonic 27L Convection Microwave Oven with Auto-Cook Menu (900W)',
      slug: 'panasonic-27l-convection-microwave-oven-900w',
      description: 'All-in-one convection microwave capable of baking, grilling, reheating, and defrosting with 101 pre-programmed auto-cook recipes and touch control panel.',
      brandName: 'Nova',
      price: 18500,
      comparePrice: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Sharp 25L Digital Solo Microwave Oven with Turntable (Black)',
      slug: 'sharp-25l-digital-solo-microwave-oven-black',
      description: 'Reliable 900W microwave with 11 power levels, express defrost function, child safety lock, and easy-to-clean scratch-resistant ceramic enamel cavity.',
      brandName: 'Zenith',
      price: 11500,
      comparePrice: 13800,
      imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Blender': [
    {
      title: 'NutriBullet Pro 900W High-Speed Personal Nutrient Extractor Blender',
      slug: 'nutribullet-pro-900w-high-speed-personal-blender',
      description: 'Compact powerhouse extractor blade breaks down tough seeds, stems, and fibrous greens into silky-smooth superfood smoothies in under 60 seconds.',
      brandName: 'Nova',
      price: 4850,
      comparePrice: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Philips 800W Heavy Duty Multi-Mill Glass Blender & Grinder Jar Set',
      slug: 'philips-800w-heavy-duty-glass-blender-grinder-set',
      description: 'ProBlend Crush technology with 4-star stainless steel serrated blades, 2L thermal shock-resistant glass jar, and dedicated dry mill for coffee and spices.',
      brandName: 'Velora Collection',
      price: 3650,
      comparePrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Rice Cooker': [
    {
      title: 'Zojirushi Micom Neuro-Fuzzy Logic Automatic Rice Cooker (1.8L)',
      slug: 'zojirushi-micom-neuro-fuzzy-automatic-rice-cooker-1-8l',
      description: 'Micro-computerized Fuzzy logic technology adjusts cooking time and temperature for white, sushi, porridge, sweet, semi-brown, and brown rice perfection.',
      brandName: 'Zenith',
      price: 4950,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Panasonic 2.2L Automatic Thermal Fuse Non-Stick Rice Cooker with Steamer',
      slug: 'panasonic-2-2l-automatic-non-stick-rice-cooker-steamer',
      description: 'Heavy-gauge aluminum inner pan with durable non-stick coating, automatic keep-warm cycle up to 5 hours, and BPA-free steaming basket for vegetables.',
      brandName: 'Nova',
      price: 3200,
      comparePrice: 3950,
      imageUrl: '/products/panasonic-automatic-rice-cooker-with-steamer.jpg'
    }
  ],
  'Electric Kettle': [
    {
      title: 'Fellow Stagg EKG Precision Gooseneck Pour-Over Electric Kettle (0.9L)',
      slug: 'fellow-stagg-ekg-precision-gooseneck-electric-kettle',
      description: 'Variable temperature control from 135°F to 212°F with real-time LCD screen, 60-minute temperature hold mode, and counterbalanced fluted spout.',
      brandName: 'Zenith',
      price: 3850,
      comparePrice: 4800,
      imageUrl: '/products/fellow-stagg-ekg-precision-gooseneck-electric-kettle.jpg'
    },
    {
      title: 'Philips Daily Collection 1.7L Stainless Steel Rapid Boil Kettle',
      slug: 'philips-daily-collection-1-7l-stainless-steel-kettle',
      description: 'Durable food-grade brushed stainless steel kettle with flat heating element for rapid boiling, micro-mesh scale filter, and multi-safety boil-dry protection.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Coffee Maker': [
    {
      title: 'De’Longhi Dedica Deluxe Pump Espresso & Cappuccino Machine (15-Bar)',
      slug: 'delonghi-dedica-deluxe-pump-espresso-machine-15-bar',
      description: 'Ultra-slim 6-inch stainless steel espresso machine with 15-bar professional pressure, adjustable manual milk frothing wand, and thermo-block rapid heating.',
      brandName: 'Zenith',
      price: 24500,
      comparePrice: 29000,
      imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Bialetti Moka Express 6-Cup Stovetop Italian Espresso Maker',
      slug: 'bialetti-moka-express-6-cup-stovetop-espresso-maker',
      description: 'The authentic original Italian octagonal aluminum stovetop moka pot that brews rich, aromatic, velvety espresso with patented safety inspection valve.',
      brandName: 'Velora Collection',
      price: 3450,
      comparePrice: 4200,
      imageUrl: 'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Cookware': [
    {
      title: 'T-fal Ultimate Hard Anodized Nonstick 12-Piece Cookware Pots & Pans Set',
      slug: 't-fal-ultimate-hard-anodized-nonstick-12-piece-cookware-set',
      description: 'Heavy-gauge hard-anodized aluminum with Thermo-Spot heat indicator, titanium-reinforced nonstick cooking surface, and riveted silicone stay-cool handles.',
      brandName: 'Velora Collection',
      price: 6800,
      comparePrice: 8500,
      imageUrl: '/products/t-fal-ultimate-hard-anodized-nonstick-cookware-set.jpg'
    },
    {
      title: 'Lodge Seasoned Heavy-Duty Cast Iron Skillet Pan (10.25-inch)',
      slug: 'lodge-seasoned-cast-iron-skillet-pan-10-inch',
      description: 'Pre-seasoned with 100% natural vegetable oil for a natural, easy-release finish. Provides unmatched heat retention and even heating on stove, oven, or grill.',
      brandName: 'Nova',
      price: 2850,
      comparePrice: 3600,
      imageUrl: '/products/lodge-seasoned-cast-iron-skillet-pan.jpg'
    }
  ],
  'Dinner Set': [
    {
      title: 'Fine Bone China Gold Rim 32-Piece Luxury Dinnerware Set for 6',
      slug: 'fine-bone-china-gold-rim-32-piece-luxury-dinnerware-set',
      description: 'Exquisite translucent bone china tableware adorned with hand-painted 24K gold rim detailing, including dinner plates, soup bowls, side plates, and tea cups.',
      brandName: 'Zenith',
      price: 8500,
      comparePrice: 10800,
      imageUrl: '/products/fine-bone-china-gold-rim-32-piece-luxury-dinnerware-set.jpg'
    },
    {
      title: 'Matte Stoneware Coupe Dinner Set for 4 (16-Piece, Slate Charcoal)',
      slug: 'matte-stoneware-coupe-dinner-set-16-piece-slate',
      description: 'Modern organic minimalist tableware with a tactile satin-matte glaze, microwave and dishwasher safe durable stoneware body with high-rim coupe edges.',
      brandName: 'Velora Collection',
      price: 4950,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== BOOKS & STATIONERY ====================
  'Books': [
    {
      title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear',
      slug: 'atomic-habits-james-clear-hardcover-bestseller',
      description: 'The definitive revolutionary guide that reveals how tiny changes can lead to remarkable results. Features actionable frameworks to master everyday behaviors.',
      brandName: 'Velora Collection',
      price: 750,
      comparePrice: 950,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Thinking, Fast and Slow by Daniel Kahneman (International Edition)',
      slug: 'thinking-fast-and-slow-daniel-kahneman-paperback',
      description: 'Nobel Memorial Prize winner Daniel Kahneman takes us on a groundbreaking tour of the mind, explaining the two systems that drive the way we think and decide.',
      brandName: 'Aura',
      price: 650,
      comparePrice: 850,
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Notebooks': [
    {
      title: 'Moleskine Classic Hardcover Dotted Journal Notebook (Large, Sapphire Blue)',
      slug: 'moleskine-classic-hardcover-dotted-journal-notebook-large',
      description: 'Legendary bound notebook with rounded corners, acid-free ivory pages, elastic closure band, matching ribbon bookmark, and expandable inner storage pocket.',
      brandName: 'Velora Collection',
      price: 1450,
      comparePrice: 1850,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Leuchtturm1917 Medium A5 Hardcover 251-Page Numbered Bullet Journal',
      slug: 'leuchtturm1917-medium-a5-hardcover-numbered-journal',
      description: 'German-engineered bullet journal featuring ink-proof 80 GSM paper, 8 perforated sheets, blank table of contents, and dual page marker ribbons.',
      brandName: 'Aura',
      price: 1650,
      comparePrice: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Pens': [
    {
      title: 'Parker Sonnet Stainless Steel Gold Trim Medium Nib Fountain Pen',
      slug: 'parker-sonnet-stainless-steel-gold-trim-fountain-pen',
      description: 'Handcrafted luxury fountain pen featuring brushed stainless steel finish with 23K gold plated trim, stainless steel nib, and smooth twin-channel ink feed.',
      brandName: 'Zenith',
      price: 4850,
      comparePrice: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Lamy Safari Ergonomic Charcoal Fountain Pen with Z50 Medium Nib',
      slug: 'lamy-safari-ergonomic-charcoal-fountain-pen',
      description: 'Timeless modern writing instrument designed by Wolfgang Fabian with sturdy ABS plastic body, ergonomic triangular grip section, and spring-loaded metal clip.',
      brandName: 'Nova',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Office Supplies': [
    {
      title: 'All-in-One Mesh Steel 6-Compartment Desktop Document Organizer Caddy',
      slug: 'all-in-one-mesh-steel-desktop-document-organizer-caddy',
      description: 'Industrial-strength powder-coated mesh steel desktop organizer featuring letter tray, mail sorters, pull-out drawer, and dual pen holder canisters.',
      brandName: 'Velora Collection',
      price: 1150,
      comparePrice: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Heavy-Duty Ergonomic Effortless 40-Sheet Desktop Stapler Kit',
      slug: 'heavy-duty-ergonomic-effortless-desktop-stapler-kit',
      description: 'Spring-powered one-finger easy-press stapler with jam-free mechanism, integrated staple remover, and full strip capacity including 1,000 standard staples.',
      brandName: 'Aura',
      price: 650,
      comparePrice: 850,
      imageUrl: '/products/heavy-duty-ergonomic-effortless-desktop-stapler-kit.jpg'
    }
  ],
  'Educational Materials': [
    {
      title: 'Interactive 12-inch Illuminated World Globe with Educational AR App',
      slug: 'interactive-12-inch-illuminated-world-globe-ar-app',
      description: 'Dual-map political and topographic illuminated globe with built-in warm LED light and companion smartphone AR app discovering continents, animals, and cultures.',
      brandName: 'Lumina',
      price: 2450,
      comparePrice: 3200,
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'STEM Discovery Deluxe Kids 1200x Optical Compound Microscope Kit',
      slug: 'stem-discovery-deluxe-kids-1200x-optical-microscope-kit',
      description: 'All-metal frame microscope with precision ground glass optics (100x to 1200x magnification), dual LED illumination, prepared slides, and specimen collection tools.',
      brandName: 'Nova',
      price: 2850,
      comparePrice: 3600,
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Art Supplies': [
    {
      title: 'Winsor & Newton Cotman Watercolor Compact Field Pocket Box (14 Half Pans)',
      slug: 'winsor-newton-cotman-watercolor-compact-field-pocket-box',
      description: 'Professional-grade pocket watercolor set with 14 Cotman half pans, travel pocket brush, water bottle, integrated mixing palettes, and sponge.',
      brandName: 'Zenith',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Faber-Castell Polychromos Artists’ Color Pencils Metal Tin (36 Colors)',
      slug: 'faber-castell-polychromos-artists-color-pencils-36-tin',
      description: 'Oil-based round colored pencil leads with extraordinary break-resistance, maximum lightfastness ratings, and vibrant smudge-proof blending performance.',
      brandName: 'Velora Collection',
      price: 3850,
      comparePrice: 4800,
      imageUrl: '/products/faber-castell-polychromos-artists-color-pencils-tin.jpg'
    }
  ],

  // ==================== SPORTS & FITNESS ====================
  'Gym Equipment': [
    {
      title: 'Bowflex SelectTech 552 Quick Adjustable Dumbbells (Pair, 5 to 52.5 lbs)',
      slug: 'bowflex-selecttech-552-adjustable-dumbbells-pair',
      description: 'Replaces 15 pairs of traditional weights with a turn of a dial. Smooth selection mechanism, durable molding around metal plates, and compact storage trays.',
      brandName: 'Nova',
      price: 18500,
      comparePrice: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Heavy-Duty Multi-Grip Wall Mount Pull-Up and Chin-Up Bar',
      slug: 'heavy-duty-multi-grip-wall-mount-pull-up-bar',
      description: 'Solid steel construction rated up to 400 lbs with high-density foam padded grips supporting narrow, wide, and neutral hand placements for complete upper body workouts.',
      brandName: 'Zenith',
      price: 2850,
      comparePrice: 3600,
      imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Sports Shoes': [
    {
      title: 'Nike Air Zoom Pegasus 40 Road Running Athletic Shoes (Black/Volt)',
      slug: 'nike-air-zoom-pegasus-40-road-running-shoes',
      description: 'A responsive workhorse with wings. Features Nike React foam technology with two Zoom Air units, engineered single-layer mesh upper, and redesigned midfoot strap.',
      brandName: 'Nova',
      price: 5850,
      comparePrice: 7200,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Adidas Ultraboost Light Running Shoes (Cloud White / Core Black)',
      slug: 'adidas-ultraboost-light-running-shoes-white',
      description: 'Crafted with 30% lighter BOOST foam material for epic energy return, Linear Energy Push system for propulsion, and snug foot-hugging PRIMEKNIT+ textile upper.',
      brandName: 'Velora Collection',
      price: 6500,
      comparePrice: 7800,
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Fitness Tracker': [
    {
      title: 'Fitbit Charge 6 Advanced Health & Fitness Tracker with Heart Rate & GPS',
      slug: 'fitbit-charge-6-advanced-fitness-tracker-gps',
      description: '60% more accurate heart rate tracking on workouts, built-in GPS, EDA sensor for stress management, ECG app, YouTube Music controls, and 7 days battery life.',
      brandName: 'Nova',
      price: 18500,
      comparePrice: 21500,
      imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Garmin Vivosmart 5 Slim Fitness Band with Pulse Ox & Sleep Monitoring',
      slug: 'garmin-vivosmart-5-slim-fitness-band-black',
      description: 'Comfortable, easy-to-read touchscreen smart band tracking Body Battery energy levels, respiration, hydration, women health tracking, and connected GPS.',
      brandName: 'Aura',
      price: 14500,
      comparePrice: 17500,
      imageUrl: 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Yoga Mat': [
    {
      title: 'Manduka PRO 6mm Non-Slip High-Density Extra Thick Yoga Mat (Black Mat PRO)',
      slug: 'manduka-pro-6mm-non-slip-high-density-yoga-mat',
      description: 'The standard of performance yoga mats with lifetime durability, closed-cell hygienic surface locking out moisture and sweat, and superior joint cushioning.',
      brandName: 'Velora Collection',
      price: 3850,
      comparePrice: 4800,
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Eco-Friendly Non-Slip Natural Tree Rubber Alignment Yoga Mat (Pink Marble)',
      slug: 'eco-friendly-natural-rubber-alignment-yoga-mat',
      description: 'Biodegradable natural tree rubber base with moisture-wicking vegan polyurethane top surface and laser-etched body alignment guide lines.',
      brandName: 'Aura',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Sports Accessories': [
    {
      title: 'Hydro Flask 32 oz Wide Mouth Vacuum Insulated Stainless Steel Bottle',
      slug: 'hydro-flask-32-oz-wide-mouth-insulated-water-bottle',
      description: 'TempShield double-wall vacuum insulation keeps cold beverages ice cold for up to 24 hours. Features 18/8 pro-grade stainless steel and leakproof Flex Straw cap.',
      brandName: 'Velora Collection',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Adjustable Weighted Speed Jump Rope with 360-Degree Ball Bearings',
      slug: 'adjustable-weighted-speed-jump-rope-ball-bearings',
      description: 'Tangle-free steel wire coated in protective PVC with ergonomic aluminum alloy non-slip handles and removable weighted iron bars for cardio workouts.',
      brandName: 'Nova',
      price: 750,
      comparePrice: 1050,
      imageUrl: '/products/adjustable-weighted-speed-jump-rope.jpg'
    }
  ],
  'Bicycles': [
    {
      title: 'Trek Marlin 5 Gen 2 Lightweight Aluminum Mountain Bike (29-inch Wheels)',
      slug: 'trek-marlin-5-gen-2-aluminum-mountain-bike-29',
      description: 'Trail-ready mountain bike with a lightweight Alpha Silver Aluminum frame, SR Suntour suspension fork with lockout, Shimano 2x8 speed drivetrain, and hydraulic disc brakes.',
      brandName: 'Nova',
      price: 36500,
      comparePrice: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Giant Escape 3 Disc Hybrid City Commuter Road Bicycle (Metallic Blue)',
      slug: 'giant-escape-3-disc-hybrid-city-commuter-bicycle',
      description: 'Lightweight ALUXX aluminum frame with upright flat-bar road bike geometry, puncture-resistant 700x38c all-condition tires, and confident mechanical disc brakes.',
      brandName: 'Zenith',
      price: 28500,
      comparePrice: 34000,
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== KIDS & BABY ====================
  'Baby Clothes': [
    {
      title: '100% Organic Combed Cotton Newborn Footed Romper Sleepers (3-Pack)',
      slug: 'organic-cotton-newborn-footed-romper-sleepers-3-pack',
      description: 'Ultra-gentle breathable organic cotton baby onesies featuring two-way safety zipper with chin guard, fold-over mitten cuffs, and non-slip gripper footies.',
      brandName: 'Velora Collection',
      price: 1350,
      comparePrice: 1750,
      imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Cozy Sherpa Fleece Hooded Bear Pram Baby Winter Jumpsuit (Warm Ivory)',
      slug: 'cozy-sherpa-fleece-hooded-bear-pram-baby-jumpsuit',
      description: 'Adorable bear ear hooded pram snowsuit lined in 100% natural cotton jersey with full-body snap closure to keep infants cozy in chilly weather.',
      brandName: 'Aura',
      price: 1650,
      comparePrice: 2100,
      imageUrl: '/products/cozy-sherpa-fleece-hooded-bear-baby-winter-jumpsuit.jpg'
    }
  ],
  'Toys': [
    {
      title: 'LEGO Classic Large Creative Brick Box Construction Building Set (790 Pieces)',
      slug: 'lego-classic-large-creative-brick-box-790-pieces',
      description: 'Contains 33 different colors of LEGO bricks, 8 types of windows and doors, 6 tires and wheel rims, and 2 green baseplates for open-ended imaginative creativity.',
      brandName: 'Velora Collection',
      price: 4950,
      comparePrice: 6200,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Melissa & Doug Deluxe Solid Wooden Railway Train Track Starter Set',
      slug: 'melissa-doug-deluxe-wooden-railway-train-track-set',
      description: 'Classic heirloom-quality beechwood railway set with magnetic passenger and cargo trains, suspension bridge, swivel crane, track switches, and crossing gates.',
      brandName: 'Nova',
      price: 3650,
      comparePrice: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'School Bags': [
    {
      title: 'Ergonomic Waterproof Orthopedic Kids School Backpack with Safety Reflectors',
      slug: 'ergonomic-waterproof-orthopedic-kids-school-backpack',
      description: 'Spine-protecting lightweight orthopedic bookbag with ventilated honeycomb back padding, chest stabilizer clip, multiple stationery compartments, and water bottle pockets.',
      brandName: 'Nova',
      price: 2150,
      comparePrice: 2700,
      imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'JanSport SuperBreak Lightweight Multi-Pocket Student Daypack (Navy Blue)',
      slug: 'jansport-superbreak-lightweight-student-daypack-navy',
      description: 'The iconic school backpack with straight-cut padded shoulder straps, one large main compartment, front utility pocket with organizer, and web haul loop.',
      brandName: 'Aura',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Baby Care Products': [
    {
      title: 'Mustela Gentle Cleansing Gel & Hydra Bebe Daily Body Lotion Set (500ml x 2)',
      slug: 'mustela-gentle-cleansing-gel-hydra-bebe-lotion-set',
      description: 'Formulated with 97% natural ingredients including Avocado Perseose. Tear-free, hypoallergenic, and dermatologically tested for daily infant bath care.',
      brandName: 'Lumina',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Philips Avent Natural Baby Bottle Newborn Starter Gift Set (Anti-Colic, 4-Pack)',
      slug: 'philips-avent-natural-baby-bottle-starter-gift-set',
      description: 'BPA-free bottles with natural breast-shaped wide nipples and innovative anti-colic Airflex vent technology that reduces infant fussing and colic.',
      brandName: 'Aura',
      price: 2950,
      comparePrice: 3800,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Kids Accessories': [
    {
      title: 'Waterproof Food-Grade Silicone Weaning Bibs with Catch Tray (3-Pack)',
      slug: 'waterproof-silicone-weaning-baby-bibs-3-pack',
      description: '100% food-grade silicone bibs with wide, deep stay-open crumb catcher pockets, adjustable button neck closure, and effortless wipe-clean dishwasher safe material.',
      brandName: 'Velora Collection',
      price: 850,
      comparePrice: 1150,
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Skip Hop Zoo Stainless Steel Insulated Sippy Straw Bottle (Fox)',
      slug: 'skip-hop-zoo-stainless-steel-sippy-straw-bottle-fox',
      description: 'Double-wall stainless steel toddler water bottle keeping drinks cool, with no-slip silicone grip sleeve, flexible flip-up straw, and handy velcro grab-strap.',
      brandName: 'Aura',
      price: 1150,
      comparePrice: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== AUTOMOTIVE ====================
  'Car Accessories': [
    {
      title: 'Baseus Magnetic 15W Qi Fast Wireless Car Charger Air Vent Mount Holder',
      slug: 'baseus-magnetic-15w-fast-wireless-car-charger-mount',
      description: 'Strong built-in N52 neodymium magnets securely hold iPhone and Android smartphones through road bumps, delivering up to 15W intelligent fast wireless charging.',
      brandName: 'Nova',
      price: 2450,
      comparePrice: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'High-Density Memory Foam Car Neck & Lumbar Ergonomic Pillow Set (Black)',
      slug: 'high-density-memory-foam-car-neck-lumbar-pillow-set',
      description: 'Contoured orthopedic support pillows engineered to alleviate lower back pain and neck fatigue during long traffic commutes and road trips.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Bike Accessories': [
    {
      title: 'Kryptonite New York Fahgettaboudit Heavy Duty Bicycle U-Lock (18mm)',
      slug: 'kryptonite-new-york-fahgettaboudit-heavy-duty-u-lock',
      description: '18mm hardened MAX-Performance steel shackle resists bolt cutters and leverage attacks, featuring a double deadbolt locking mechanism and sliding dust cover.',
      brandName: 'Zenith',
      price: 4850,
      comparePrice: 6200,
      imageUrl: '/products/kryptonite-heavy-duty-bicycle-u-lock.jpg'
    },
    {
      title: 'Rockbros Waterproof Touchscreen Top Tube Cycling Phone Bag with Sun Visor',
      slug: 'rockbros-waterproof-touchscreen-top-tube-cycling-phone-bag',
      description: 'Carbon fiber grain EVA hard-shell bike frame bag with high-sensitivity TPU touchscreen window fitting up to 6.8-inch smartphones and sealed dual zippers.',
      brandName: 'Nova',
      price: 1350,
      comparePrice: 1750,
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Helmet': [
    {
      title: 'Shoei RF-1400 Dedicated Aerodynamic Full-Face Motorcycle Helmet (Matte Black)',
      slug: 'shoei-rf-1400-aerodynamic-full-face-motorcycle-helmet',
      description: 'DOT and SNELL M2020D certified hand-laid multi-ply matrix AIM+ shell offering superior impact absorption, wind-tunnel tuned aerodynamics, and CWR-F2 Pinlock shield.',
      brandName: 'Zenith',
      price: 18500,
      comparePrice: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'AGV K1 S E2206 Solid Street Racing Motorcycle Helmet (Gloss Black)',
      slug: 'agv-k1-s-e2206-solid-street-motorcycle-helmet',
      description: 'Aerodynamic spoiler inspired by MotoGP, high-resistance thermoplastic resin shell, 190-degree panoramic horizontal field of vision, and sanitized Dry-Comfort fabric.',
      brandName: 'Nova',
      price: 12500,
      comparePrice: 15500,
      imageUrl: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Car Electronics': [
    {
      title: '70mai Dash Cam Pro Plus+ A500S Front & Rear Dual 2.7K Vehicle Camera Kit',
      slug: '70mai-dash-cam-pro-plus-a500s-dual-camera-kit',
      description: 'Crystal-clear 1944P resolution with Sony IMX335 sensor, built-in GPS with ADAS driver assistance, 24-hour parking surveillance, and app-based footage access.',
      brandName: 'Nova',
      price: 8500,
      comparePrice: 10500,
      imageUrl: '/products/70mai-dash-cam-pro-plus-dual-vehicle-camera.jpg'
    },
    {
      title: 'NOCO Boost Plus GB40 1000A 12V UltraSafe Portable Lithium Jump Starter',
      slug: 'noco-boost-plus-gb40-1000a-lithium-car-jump-starter',
      description: 'Jump starts dead car batteries in seconds up to 20 times on a single charge. Features spark-proof technology, reverse polarity protection, and 100-lumen LED flashlight.',
      brandName: 'Zenith',
      price: 7800,
      comparePrice: 9500,
      imageUrl: '/products/noco-boost-plus-portable-lithium-jump-starter.jpg'
    }
  ],
  'Cleaning Products': [
    {
      title: 'Chemical Guys Complete 16-Piece Ultimate Car Wash & Foam Cannon Detailing Kit',
      slug: 'chemical-guys-16-piece-car-wash-foam-cannon-kit',
      description: 'Professional-level auto detailing arsenal including Citrus Wash & Gloss soap, TORQ foam blaster, chenille wash mitt, wheel cleaner, and ultra-plush microfiber towels.',
      brandName: 'Velora Collection',
      price: 3850,
      comparePrice: 4800,
      imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Meguiar’s Gold Class Carnauba Plus Premium Liquid Car Wax & Sealant (473ml)',
      slug: 'meguiars-gold-class-carnauba-plus-liquid-car-wax',
      description: 'Combines pure carnauba with protective clear-coat-safe polymers to deliver deep, dark reflective gloss and long-lasting protection against water spots and road contaminants.',
      brandName: 'Aura',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=75'
    }
  ],

  // ==================== PET SUPPLIES ====================
  'Pet Food': [
    {
      title: 'Royal Canin Mini Adult Balanced Nutrition Dry Dog Food (4kg Bag)',
      slug: 'royal-canin-mini-adult-dry-dog-food-4kg',
      description: 'Tailored nutrition for small breed adult dogs (up to 10kg) with adapted energy content, EPA/DHA for coat health, and enhanced palatability for fussy appetites.',
      brandName: 'Velora Collection',
      price: 3450,
      comparePrice: 4200,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Purina Pro Plan High Protein Real Salmon & Rice Adult Cat Food (3.2kg)',
      slug: 'purina-pro-plan-salmon-rice-adult-cat-food-3-2kg',
      description: 'High-protein dry cat food with real salmon as the first ingredient, fortified with live probiotics for digestive and immune health, and omega-6 fatty acids for coat luster.',
      brandName: 'Aura',
      price: 2850,
      comparePrice: 3600,
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Pet Toys': [
    {
      title: 'KONG Classic Ultra-Durable Natural Rubber Interactive Dog Chew Toy (Large)',
      slug: 'kong-classic-ultra-durable-rubber-dog-chew-toy-large',
      description: 'Made from all-natural red rubber formula designed for typical chewers. Mentally stimulating puzzle toy that can be stuffed with peanut butter, treats, or kibble.',
      brandName: 'Nova',
      price: 950,
      comparePrice: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Automated 360-Degree Rotating Interactive Laser Beam Cat Toy',
      slug: 'automated-360-degree-rotating-laser-cat-toy',
      description: 'Unpredictable random laser flight paths across floors and walls keep cats active and engaged with 3 speed settings and an automatic 15-minute shutoff timer.',
      brandName: 'Aura',
      price: 1250,
      comparePrice: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Pet Accessories': [
    {
      title: 'Rabbitgoo No-Pull Breathable Padded Adjustable Dog Harness with Leash Clips',
      slug: 'rabbitgoo-no-pull-breathable-padded-dog-harness',
      description: 'Easy on-and-off vest harness with two sturdy metal leash rings, reinforced nylon webbing, reflective safety stitching, and breathable soft air mesh padding.',
      brandName: 'Velora Collection',
      price: 1650,
      comparePrice: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Catit Flower 3L LED Electric Cat Drinking Water Fountain with Triple Filter',
      slug: 'catit-flower-3l-led-electric-cat-drinking-fountain',
      description: 'Provides continuously filtered running water with 3 water flow settings to encourage hydration. Includes dual-action softening filter and nighttime LED indicator.',
      brandName: 'Nova',
      price: 2450,
      comparePrice: 3200,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Pet Care Products': [
    {
      title: 'FURminator Undercoat De-Shedding Tool for Medium/Large Dogs',
      slug: 'furminator-undercoat-de-shedding-tool-medium-large-dogs',
      description: 'Stainless steel deShedding edge reaches deep beneath topcoat to safely remove loose undercoat hair up to 90% without cutting the skin or damaging the topcoat.',
      brandName: 'Zenith',
      price: 1850,
      comparePrice: 2400,
      imageUrl: '/products/furminator-undercoat-de-shedding-tool-dogs.jpg'
    },
    {
      title: 'Wahl Deluxe Cordless Rechargeable Professional Pet Grooming Clipper Kit',
      slug: 'wahl-deluxe-cordless-rechargeable-pet-grooming-clipper-kit',
      description: 'Whisper-quiet low-vibration precision ground blades prevent pet anxiety during trims. Includes 4 guide comb attachments, lubricating oil, and cleaning brush.',
      brandName: 'Nova',
      price: 2950,
      comparePrice: 3800,
      imageUrl: '/products/wahl-deluxe-cordless-professional-pet-grooming-clipper.jpg'
    }
  ],

  // ==================== GROCERY & FOOD ====================
  'Snacks': [
    {
      title: 'Ferrero Rocher Fine Hazelnut Milk Chocolates Gift Box (24 Pieces, 300g)',
      slug: 'ferrero-rocher-fine-hazelnut-chocolates-gift-box-24-pieces',
      description: 'A tempting combination of smooth chocolaty cream surrounding a whole hazelnut within a delicate, crisp wafer covered in milk chocolate and finely chopped hazelnuts.',
      brandName: 'Velora Collection',
      price: 950,
      comparePrice: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Pringles Sour Cream & Onion Savory Potato Crisps (158g Canister x 2)',
      slug: 'pringles-sour-cream-onion-savory-crisps-bundle',
      description: 'The delightfully tangy and zesty blend of sour cream and savory onion flavor packed in the iconic resealable canister for stackable, crispy snacking.',
      brandName: 'Aura',
      price: 480,
      comparePrice: 600,
      imageUrl: '/products/pringles-sour-cream-onion-crisps-158g.jpg'
    }
  ],
  'Beverages': [
    {
      title: 'Nescafé Gold Rich & Smooth Freeze-Dried Soluble Blend Coffee (200g Jar)',
      slug: 'nescafe-gold-rich-smooth-freeze-dried-blend-coffee-200g',
      description: 'Crafted from premium golden-roasted Arabica and Robusta beans, freeze-dried to lock in a rich aroma and exceptionally smooth, balanced coffee flavor.',
      brandName: 'Velora Collection',
      price: 1150,
      comparePrice: 1450,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Twinings of London Pure Peppermint Soothing Herbal Infusion Tea (50 Tea Bags)',
      slug: 'twinings-pure-peppermint-soothing-herbal-tea-50-bags',
      description: 'Naturally caffeine-free pure peppermint tea made with carefully selected leaves for a crisp, invigorating aroma and naturally refreshing digestive finish.',
      brandName: 'Aura',
      price: 650,
      comparePrice: 850,
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Dry Food': [
    {
      title: 'Pran Premium Fragrant Kalijira Polao Rice Aromatic (5kg Sealed Bag)',
      slug: 'pran-premium-fragrant-kalijira-polao-rice-5kg',
      description: 'Authentic Bangladeshi short-grain aromatic Kalijira rice, carefully aged and sorted for preparing traditional fragrant biryani, polao, and festive desserts.',
      brandName: 'Velora Collection',
      price: 850,
      comparePrice: 1050,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Quaker Rolled 100% Wholegrain Oats Heart-Healthy Breakfast (1kg Container)',
      slug: 'quaker-rolled-wholegrain-oats-breakfast-1kg',
      description: 'Good source of soluble beta-glucan fiber supporting heart health, providing long-lasting energy for morning oatmeal bowls, baking, and healthy smoothies.',
      brandName: 'Aura',
      price: 450,
      comparePrice: 580,
      imageUrl: '/products/quaker-rolled-100-wholegrain-oats-1kg.jpg'
    }
  ],
  'Fresh Food': [
    {
      title: 'Fresh Crisp Farm-Picked Honeycrisp Red Apples (1kg Premium Pack)',
      slug: 'fresh-farm-picked-honeycrisp-red-apples-1kg',
      description: 'Juicy, sweet, and satisfyingly crisp orchard apples rich in dietary fiber and essential vitamin C, hand-selected at peak ripeness for snacking and salads.',
      brandName: 'Velora Collection',
      price: 450,
      comparePrice: 580,
      imageUrl: '/products/fresh-crisp-honeycrisp-red-apples-1kg.jpg'
    },
    {
      title: 'Fresh Sweet Seedless California Green Grapes (500g Clamshell Box)',
      slug: 'fresh-sweet-seedless-green-grapes-500g',
      description: 'Plump, crisp, and naturally refreshing green seedless table grapes bursting with hydrating sweetness. Washed and packed in protective ventilated clamshells.',
      brandName: 'Aura',
      price: 380,
      comparePrice: 480,
      imageUrl: '/products/fresh-sweet-seedless-green-grapes-500g.jpg'
    }
  ],
  'Cooking Ingredients': [
    {
      title: 'Olitalia Extra Virgin Cold-Pressed Olive Oil (1 Liter Glass Bottle)',
      slug: 'olitalia-extra-virgin-cold-pressed-olive-oil-1-liter',
      description: 'First cold-pressed Italian extra virgin olive oil with low acidity, offering a rich fruity olive aroma with subtle peppery notes for salads, pastas, and dressings.',
      brandName: 'Velora Collection',
      price: 1650,
      comparePrice: 2100,
      imageUrl: '/products/olitalia-extra-virgin-cold-pressed-olive-oil-1-liter.jpg'
    },
    {
      title: 'Kikkoman Naturally Brewed Japanese Soy Sauce Bottle (500ml)',
      slug: 'kikkoman-naturally-brewed-japanese-soy-sauce-500ml',
      description: 'Traditional naturally brewed seasoning fermented from 4 natural ingredients: water, wheat, soybeans, and salt. Deep reddish-brown umami enhancer.',
      brandName: 'Aura',
      price: 550,
      comparePrice: 720,
      imageUrl: '/products/kikkoman-naturally-brewed-japanese-soy-sauce-500ml.jpg'
    }
  ],

  // ==================== OTHERS ====================
  'Gifts': [
    {
      title: 'Luxury Hand-Poured French Lavender & Madagascar Vanilla Soy Candle (300g)',
      slug: 'luxury-french-lavender-vanilla-soy-candle-ceramic-jar',
      description: 'Hand-poured 100% natural soy wax candle in a reusable ribbed ceramic vessel with lead-free cotton wick, burning cleanly for over 65 hours of calming aroma.',
      brandName: 'Velora Collection',
      price: 1650,
      comparePrice: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Personalized Engraved Solid Walnut Keepsake Memory & Watch Box',
      slug: 'personalized-engraved-solid-walnut-keepsake-box',
      description: 'Handcrafted seasoned walnut wood gift box with brass quadrant hinges, soft velvet lined interior compartments, and magnetic closure for precious keepsakes.',
      brandName: 'Aura',
      price: 2450,
      comparePrice: 3200,
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Jewelry': [
    {
      title: '18K Gold Plated Zirconia Celestial Crescent Moon & Star Pendant Necklace',
      slug: '18k-gold-plated-celestial-crescent-moon-star-necklace',
      description: 'Cast in nickel-free brass dipped in rich 18K yellow gold with pavé set AAA cubic zirconia crystals, suspended on a 16-inch delicate box chain with 2-inch extender.',
      brandName: 'Aura',
      price: 2850,
      comparePrice: 3800,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Freshwater Cultured White Pearl Strand Choker Necklace with 925 Silver Clasp',
      slug: 'freshwater-cultured-white-pearl-strand-choker-necklace',
      description: 'Selected near-round 6-7mm natural white freshwater cultured pearls hand-knotted on silk thread, completed with a secure rhodium-plated sterling silver filigree clasp.',
      brandName: 'Zenith',
      price: 3650,
      comparePrice: 4800,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Handmade Products': [
    {
      title: 'Handcrafted Terracotta Ceramic Tea Cups with Bamboo Saucers (Set of 4)',
      slug: 'handcrafted-terracotta-ceramic-tea-cups-bamboo-saucers-set-of-4',
      description: 'Wheel-thrown artisanal red clay cups fired at high temperatures with lead-free glaze, complemented by natural carbonized bamboo saucers for authentic tea ceremonies.',
      brandName: 'Velora Collection',
      price: 1850,
      comparePrice: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=75'
    },
    {
      title: 'Artisan Hand-Woven Natural Jute & Seagrass Hanging Planter Basket (Set of 2)',
      slug: 'artisan-hand-woven-natural-jute-hanging-planter-basket',
      description: 'Fair-trade sustainable jute and seagrass baskets woven by village artisans with built-in waterproof plastic lining and durable twisted jute rope hangers.',
      brandName: 'Lumina',
      price: 1450,
      comparePrice: 1950,
      imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=75'
    }
  ],
  'Travel Accessories': [
    {
      title: 'Vintage Waxed Canvas & Full-Grain Leather Weekender Travel Duffle Bag (45L)',
      slug: 'vintage-waxed-canvas-leather-weekender-travel-duffle-bag-45l',
      description: 'Heavy-duty 16 oz water-resistant waxed canvas duffle trimmed in thick crazy-horse leather, featuring separate shoe compartment, brass feet, and TSA luggage trolley strap.',
      brandName: 'Velora Collection',
      price: 3850,
      comparePrice: 4800,
      imageUrl: '/products/vintage-waxed-canvas-leather-weekender-duffle-bag.jpg'
    },
    {
      title: 'Waterproof Dual-Layer Travel Electronics Cable Organizer & Tech Kit Pouch',
      slug: 'waterproof-dual-layer-travel-electronics-cable-organizer-pouch',
      description: 'Water-repellent cationic fabric travel case with elastic loops, mesh pockets, and padded adjustable dividers for power banks, chargers, mice, and memory cards.',
      brandName: 'Nova',
      price: 1250,
      comparePrice: 1650,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=75'
    }
  ]
};

async function main() {
  console.log('--- Step 1: Checking and removing duplicate products & categories ---');
  // Find duplicate 'others-watches' category
  const dupCatRes = await pool.query(`SELECT id FROM "Category" WHERE slug = 'others-watches'`);
  if (dupCatRes.rows.length > 0) {
    const dupCatId = dupCatRes.rows[0].id;
    console.log(`Found duplicate category 'others-watches' (ID: ${dupCatId}). Removing duplicate products...`);

    // Get product IDs in this duplicate category
    const prodsInDup = await pool.query(`SELECT id FROM "Product" WHERE category_id = $1`, [dupCatId]);
    const dupProdIds = prodsInDup.rows.map(r => r.id);

    if (dupProdIds.length > 0) {
      console.log(`Deleting ${dupProdIds.length} duplicate products and their related data...`);
      // Delete images
      await pool.query(`DELETE FROM "ProductImage" WHERE product_id = ANY($1::text[])`, [dupProdIds]);
      // Delete variants (this cascades to inventory and cartItems)
      await pool.query(`DELETE FROM "ProductVariant" WHERE product_id = ANY($1::text[])`, [dupProdIds]);
      // Delete reviews and wishlist if any
      await pool.query(`DELETE FROM "Review" WHERE product_id = ANY($1::text[])`, [dupProdIds]);
      await pool.query(`DELETE FROM "Wishlist" WHERE product_id = ANY($1::text[])`, [dupProdIds]);
      // Delete products
      await pool.query(`DELETE FROM "Product" WHERE id = ANY($1::text[])`, [dupProdIds]);
      console.log('Duplicate products deleted successfully.');
    }

    // Delete the duplicate category
    await pool.query(`DELETE FROM "Category" WHERE id = $1`, [dupCatId]);
    console.log(`Duplicate category 'others-watches' deleted successfully.`);
  } else {
    console.log('No duplicate category found.');
  }

  console.log('\n--- Step 2: Fetching Brands for ID resolution ---');
  const brandsRes = await pool.query(`SELECT id, name FROM "Brand"`);
  const brandMap: Record<string, string> = {};
  for (const b of brandsRes.rows) {
    brandMap[b.name] = b.id;
  }
  const defaultBrandId = brandsRes.rows[0]?.id;

  console.log('\n--- Step 3: Fetching all products to apply real, unique names & details ---');
  const prodsRes = await pool.query(`
    SELECT p.id, p.title, p.category_id, c.name as category_name
    FROM "Product" p
    JOIN "Category" c ON p.category_id = c.id
    ORDER BY c.name, p.id
  `);

  console.log(`Total active products to update: ${prodsRes.rows.length}`);

  const categorySeenCounts: Record<string, number> = {};
  
  // Product batch arrays
  const prodValues: string[] = [];
  const prodParams: any[] = [];
  let pIdx = 1;

  // Variant batch arrays
  const varValues: string[] = [];
  const varParams: any[] = [];
  let vIdx = 1;

  // Image batch arrays
  const imgValues: string[] = [];
  const imgParams: any[] = [];
  let iIdx = 1;

  for (const row of prodsRes.rows) {
    const catName = row.category_name;
    const count = categorySeenCounts[catName] || 0;
    categorySeenCounts[catName] = count + 1;

    const catalogDefs = realProductsCatalog[catName];
    if (!catalogDefs) {
      console.warn(`Warning: No catalog definition for category "${catName}"!`);
      continue;
    }

    const itemDef = catalogDefs[count % catalogDefs.length];
    const brandId = brandMap[itemDef.brandName] || defaultBrandId;
    const discountPercent = Math.round(((itemDef.comparePrice - itemDef.price) / itemDef.comparePrice) * 100);

    // Product update: (id, title, slug, description, brand_id, base_price, discount_percent)
    prodValues.push(`($${pIdx++}::text, $${pIdx++}::text, $${pIdx++}::text, $${pIdx++}::text, $${pIdx++}::text, $${pIdx++}::float8, $${pIdx++}::float8)`);
    prodParams.push(row.id, itemDef.title, itemDef.slug, itemDef.description, brandId, itemDef.price, discountPercent);

    // Variant update: (product_id, price, compare_price)
    varValues.push(`($${vIdx++}::text, $${vIdx++}::numeric, $${vIdx++}::numeric)`);
    varParams.push(row.id, itemDef.price, itemDef.comparePrice);

    // Image update: (product_id, url, alt_text)
    imgValues.push(`($${iIdx++}::text, $${iIdx++}::text, $${iIdx++}::text)`);
    imgParams.push(row.id, itemDef.imageUrl, itemDef.title);
  }

  console.log('\n--- Step 4: Executing atomic batch updates in database ---');

  // 1. Update Product
  console.log('Updating Product titles, slugs, descriptions, brands, prices...');
  const prodQuery = `
    UPDATE "Product" AS p
    SET 
      title = vals.title,
      slug = vals.slug,
      description = vals.description,
      brand_id = vals.brand_id,
      base_price = vals.base_price,
      discount_percent = vals.discount_percent,
      updated_at = NOW()
    FROM (VALUES ${prodValues.join(', ')}) AS vals(id, title, slug, description, brand_id, base_price, discount_percent)
    WHERE p.id = vals.id
  `;
  await pool.query(prodQuery, prodParams);
  console.log('Product table updated successfully!');

  // 2. Update ProductVariant
  console.log('Updating ProductVariant prices and compare prices...');
  const varQuery = `
    UPDATE "ProductVariant" AS pv
    SET 
      price = vals.price,
      compare_price = vals.compare_price,
      updated_at = NOW()
    FROM (VALUES ${varValues.join(', ')}) AS vals(product_id, price, compare_price)
    WHERE pv.product_id = vals.product_id
  `;
  await pool.query(varQuery, varParams);
  console.log('ProductVariant table updated successfully!');

  // 3. Update ProductImage
  console.log('Updating ProductImage URLs and alt text...');
  const imgQuery = `
    UPDATE "ProductImage" AS pi
    SET 
      url = vals.url,
      alt_text = vals.alt_text
    FROM (VALUES ${imgValues.join(', ')}) AS vals(product_id, url, alt_text)
    WHERE pi.product_id = vals.product_id
  `;
  await pool.query(imgQuery, imgParams);
  console.log('ProductImage table updated successfully!');

  console.log('\n--- Step 5: Clearing Redis caches ---');
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const prodKeys = await redis.keys('cache:product*');
    const catKeys = await redis.keys('cache:categor*');
    const allKeys = [...prodKeys, ...catKeys];
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
      console.log(`Cleared ${allKeys.length} Redis cache keys.`);
    } else {
      console.log('No cache keys needed clearing.');
    }
    await redis.quit();
  } catch (err) {
    console.warn('Redis notice:', (err as Error).message);
  }

  console.log('\n=== All 174 Products Updated with Real, Unique Names and Market Details! ===');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
