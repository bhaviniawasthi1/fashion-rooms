export interface ProductData {
  name: string;
  brand: string;
  price: number;
  original_price: number;
  description: string;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
}

export const dummyProducts: ProductData[] = [
  // MEN (5)
  {
    name: "Classic Fit Blazer",
    brand: "H&M",
    price: 2999,
    original_price: 4999,
    description: "A timeless classic fit blazer perfect for office and formal occasions. Crafted from premium fabric with a smooth finish.",
    category: "Men",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400"
    ],
    colors: ["Navy Blue", "Black", "Charcoal Grey"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5
  },
  {
    name: "Slim Fit Chinos",
    brand: "USPA",
    price: 1799,
    original_price: 2499,
    description: "Comfortable slim fit chinos made from stretch cotton. Perfect for smart casual wear.",
    category: "Men",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=400"
    ],
    colors: ["Khaki", "Olive Green", "Navy Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.2
  },
  {
    name: "Denim Jacket",
    brand: "Levi's",
    price: 3499,
    original_price: 4499,
    description: "Iconic denim jacket with a classic button-down front. A wardrobe staple that never goes out of style.",
    category: "Men",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400"
    ],
    colors: ["Light Wash", "Dark Wash", "Black"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5
  },
  {
    name: "Graphic Print T-Shirt",
    brand: "Roadster",
    price: 699,
    original_price: 999,
    description: "Trendy graphic print t-shirt made from soft cotton. Great for casual everyday wear.",
    category: "Men",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
    ],
    colors: ["Black", "White", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.1
  },
  {
    name: "Cashmere Sweater",
    brand: "H&M",
    price: 4499,
    original_price: 5999,
    description: "Luxuriously soft cashmere sweater with a ribbed finish. Perfect for layering during colder months.",
    category: "Men",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"
    ],
    colors: ["Grey", "Cream", "Burgundy"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.3
  },

  // WOMEN (5)
  {
    name: "Floral Midi Dress",
    brand: "Zara",
    price: 2499,
    original_price: 3499,
    description: "Beautiful floral print midi dress with a flattering silhouette. Ideal for parties and casual outings.",
    category: "Women",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"
    ],
    colors: ["Rose Pink", "Sky Blue", "Lavender"],
    sizes: ["XS", "S", "M", "L"],
    rating: 4.3
  },
  {
    name: "Embroidered Kurta Set",
    brand: "BIBA",
    price: 1999,
    original_price: 2999,
    description: "Elegant embroidered kurta set with detailed thread work. A perfect choice for festive celebrations.",
    category: "Women",
    images: [
      "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?w=400"
    ],
    colors: ["Teal", "Maroon", "Mustard Yellow"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6
  },
  {
    name: "Silk Evening Gown",
    brand: "Mango",
    price: 5999,
    original_price: 7999,
    description: "Luxurious silk evening gown with a sleek silhouette. Designed for special occasions and red carpet events.",
    category: "Women",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400",
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400"
    ],
    colors: ["Burgundy", "Emerald Green", "Midnight Blue"],
    sizes: ["XS", "S", "M", "L"],
    rating: 4.8
  },
  {
    name: "Off-Shoulder Top",
    brand: "Zara",
    price: 1599,
    original_price: 2199,
    description: "Stylish off-shoulder top with ruffled detailing. Perfect for brunches and summer outings.",
    category: "Women",
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400",
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400"
    ],
    colors: ["White", "Striped Blue", "Pink"],
    sizes: ["XS", "S", "M", "L"],
    rating: 4.2
  },
  {
    name: "Printed Palazzo Pants",
    brand: "Global Desi",
    price: 1799,
    original_price: 2599,
    description: "Vibrant printed palazzo pants with a comfortable wide-leg fit. Ideal for festive and casual wear.",
    category: "Women",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400"
    ],
    colors: ["Multicolor", "Blue Print", "Green Print"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.1
  },

  // FOOTWEAR (5)
  {
    name: "Leather Sneakers",
    brand: "Puma",
    price: 3999,
    original_price: 5999,
    description: "Premium leather sneakers with cushioned sole for all-day comfort. Stylish and durable.",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"
    ],
    colors: ["White", "Black", "Grey"],
    sizes: ["7", "8", "9", "10", "11"],
    rating: 4.4
  },
  {
    name: "Sports Running Shoes",
    brand: "Nike",
    price: 5499,
    original_price: 7499,
    description: "High-performance running shoes with responsive cushioning and breathable mesh upper.",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
    ],
    colors: ["Black/White", "Blue/Orange", "Red/Black"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    rating: 4.7
  },
  {
    name: "Formal Oxford Shoes",
    brand: "Clarks",
    price: 4999,
    original_price: 6999,
    description: "Classic Oxford formal shoes made from premium leather. Timeless design for professional settings.",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400"
    ],
    colors: ["Black", "Brown", "Tan"],
    sizes: ["7", "8", "9", "10", "11"],
    rating: 4.6
  },
  {
    name: "Slip-On Loafers",
    brand: "Mochi",
    price: 2499,
    original_price: 3299,
    description: "Easy slip-on loafers with cushioned insole. Perfect blend of comfort and style for daily wear.",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400"
    ],
    colors: ["Tan Brown", "Navy", "Black"],
    sizes: ["7", "8", "9", "10"],
    rating: 4.0
  },
  {
    name: "Canvas Sneakers",
    brand: "Converse",
    price: 2999,
    original_price: 3999,
    description: "Classic canvas sneakers with a rubber sole. A timeless casual footwear choice for any wardrobe.",
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"
    ],
    colors: ["White", "Black", "Red"],
    sizes: ["7", "8", "9", "10", "11"],
    rating: 4.3
  },

  // ACCESSORIES (5)
  {
    name: "Aviator Sunglasses",
    brand: "Fastrack",
    price: 1499,
    original_price: 2499,
    description: "Classic aviator sunglasses with UV protection. Lightweight metal frame with adjustable nose pads.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400"
    ],
    colors: ["Gold/Green", "Silver/Blue", "Black/Grey"],
    sizes: ["One Size"],
    rating: 4.4
  },
  {
    name: "Leather Belt",
    brand: "Tommy Hilfiger",
    price: 1999,
    original_price: 2999,
    description: "Premium leather belt with a polished buckle. A refined accessory to complete any outfit.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400"
    ],
    colors: ["Black", "Brown", "Tan"],
    sizes: ["28", "30", "32", "34", "36"],
    rating: 4.5
  },
  {
    name: "Analog Watch",
    brand: "Titan",
    price: 3995,
    original_price: 5495,
    description: "Elegant analog watch with a stainless steel strap. Water-resistant with a date display function.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400"
    ],
    colors: ["Silver Dial", "Gold Dial", "Black Dial"],
    sizes: ["One Size"],
    rating: 4.6
  },
  {
    name: "Leather Wallet",
    brand: "WildHorn",
    price: 1299,
    original_price: 1999,
    description: "Genuine leather wallet with multiple card slots and a coin pocket. RFID blocking technology included.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
      "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=400"
    ],
    colors: ["Black", "Dark Brown", "Tan"],
    sizes: ["One Size"],
    rating: 4.2
  },
  {
    name: "Silk Tie Set",
    brand: "Van Heusen",
    price: 1499,
    original_price: 2299,
    description: "Premium silk tie set with matching pocket square. Adds a sophisticated touch to formal attire.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
      "https://images.unsplash.com/photo-1589756823698-1e2bf78e1f8e?w=400"
    ],
    colors: ["Navy", "Burgundy", "Charcoal"],
    sizes: ["One Size"],
    rating: 4.1
  },

  // KIDS (5)
  {
    name: "Colorful Dinosaur T-Shirt",
    brand: "Hopscotch",
    price: 699,
    original_price: 999,
    description: "Fun dinosaur print t-shirt in vibrant colors made from soft organic cotton. Perfect for playful everyday adventures.",
    category: "Kids",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"
    ],
    colors: ["Green", "Blue", "Orange"],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    rating: 4.3
  },
  {
    name: "Denim Dungaree Set",
    brand: "GAP Kids",
    price: 1799,
    original_price: 2599,
    description: "Classic denim dungaree set with adjustable straps and fun embroidery. Durable and comfortable for active kids.",
    category: "Kids",
    images: [
      "https://images.unsplash.com/photo-1608494284189-1d09e53ea9ec?w=400",
      "https://images.unsplash.com/photo-1593385896329-0d4ba1660865?w=400"
    ],
    colors: ["Light Wash", "Medium Wash"],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    rating: 4.5
  },
  {
    name: "Princess Tutu Dress",
    brand: "Disney",
    price: 1499,
    original_price: 2199,
    description: "Enchanted princess dress with layered tulle skirt and sparkly embellishments. Every little girl's dream outfit.",
    category: "Kids",
    images: [
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400"
    ],
    colors: ["Pink", "Lavender", "White"],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    rating: 4.7
  },
  {
    name: "Cartoon Print Pajama Set",
    brand: "Mothercare",
    price: 999,
    original_price: 1499,
    description: "Cozy cotton pajama set featuring popular cartoon characters. Soft elastic waistband for a comfortable night's sleep.",
    category: "Kids",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
      "https://images.unsplash.com/photo-1593385896329-0d4ba1660865?w=400"
    ],
    colors: ["Space Print", "Dino Print", "Unicorn Print"],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    rating: 4.4
  },
  {
    name: "Fleece Hoodie Jacket",
    brand: "USPA Kids",
    price: 1299,
    original_price: 1899,
    description: "Warm fleece hoodie jacket with a full front zip and kangaroo pocket. Perfect for chilly mornings and outdoor play.",
    category: "Kids",
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400",
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"
    ],
    colors: ["Red", "Navy Blue", "Forest Green"],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    rating: 4.2
  },

  // HOME (5)
  {
    name: "Premium Cotton Bedsheet Set",
    brand: "Bombay Dyeing",
    price: 2499,
    original_price: 3999,
    description: "Luxurious 300-thread count cotton bedsheet set with four pillow covers. Breathable and wrinkle-resistant fabric.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400",
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400"
    ],
    colors: ["White", "Beige", "Pastel Blue"],
    sizes: ["Single", "Double", "Queen", "King"],
    rating: 4.6
  },
  {
    name: "Scented Candle Collection",
    brand: "Bath & Body Works",
    price: 1799,
    original_price: 2499,
    description: "Set of 3 hand-poured soy wax candles in elegant glass jars. Long-lasting fragrances to transform your space.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400"
    ],
    colors: ["Vanilla Bean", "Lavender Dreams", "Ocean Breeze"],
    sizes: ["One Size"],
    rating: 4.5
  },
  {
    name: "Decorative Throw Pillow",
    brand: "Home Centre",
    price: 899,
    original_price: 1499,
    description: "Luxuriously soft decorative throw pillow with elegant embroidery. Adds a touch of sophistication to any sofa or bed.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
    ],
    colors: ["Cream", "Teal", "Dusty Rose"],
    sizes: ["16x16", "18x18", "20x20"],
    rating: 4.3
  },
  {
    name: "Bamboo Storage Basket",
    brand: "IKEA",
    price: 1299,
    original_price: 1799,
    description: "Handwoven bamboo storage basket with a natural finish. Perfect for organizing blankets, magazines, or toys.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400"
    ],
    colors: ["Natural Bamboo", "Dark Walnut", "White Wash"],
    sizes: ["Small", "Medium", "Large"],
    rating: 4.4
  },
  {
    name: "Table Lamp with Warm Glow",
    brand: "Philips",
    price: 2999,
    original_price: 3999,
    description: "Elegant ceramic table lamp with a warm LED glow and dimmable feature. USB charging port built into the base.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400"
    ],
    colors: ["Matte White", "Matte Black", "Terracotta"],
    sizes: ["One Size"],
    rating: 4.7
  },

  // BEAUTY (5)
  {
    name: "Vitamin C Face Serum",
    brand: "The Ordinary",
    price: 899,
    original_price: 1299,
    description: "Concentrated Vitamin C serum that brightens skin and reduces dark spots. Lightweight formula absorbs quickly for a radiant glow.",
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38c34?w=400"
    ],
    colors: [],
    sizes: ["30ml", "50ml"],
    rating: 4.6
  },
  {
    name: "Matte Liquid Lipstick",
    brand: "Maybelline",
    price: 599,
    original_price: 899,
    description: "Long-lasting matte liquid lipstick with a smooth, non-drying formula. Stays put for up to 12 hours without feathering.",
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400"
    ],
    colors: ["Ruby Red", "Nude Pink", "Berry Crush", "Coral Bliss"],
    sizes: ["One Size"],
    rating: 4.3
  },
  {
    name: "Volumizing Mascara",
    brand: "L'Oreal Paris",
    price: 799,
    original_price: 1199,
    description: "Intense black volumizing mascara with a curved brush for maximum lift. Clump-free formula for dramatic lashes.",
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400",
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400"
    ],
    colors: ["Intense Black", "Black Brown"],
    sizes: ["One Size"],
    rating: 4.4
  },
  {
    name: "Rose Water Face Mist",
    brand: "Forest Essentials",
    price: 449,
    original_price: 699,
    description: "Pure rose water face mist that hydrates and refreshes your skin. Made from hand-picked rose petals with no added chemicals.",
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400"
    ],
    colors: [],
    sizes: ["50ml", "100ml", "200ml"],
    rating: 4.5
  },
  {
    name: "Natural Lip Balm Trio",
    brand: "Nykaa",
    price: 499,
    original_price: 749,
    description: "Set of 3 nourishing lip balms made with shea butter and coconut oil. Tinted formulas that add a hint of color while moisturizing.",
    category: "Beauty",
    images: [
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=400",
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400"
    ],
    colors: ["Strawberry", "Mango", "Rose"],
    sizes: ["One Size"],
    rating: 4.2
  },

  // GENZ (5)
  {
    name: "Oversized Graphic Hoodie",
    brand: "H&M Divided",
    price: 2499,
    original_price: 3499,
    description: "Trendy oversized hoodie with bold graphic print. Ultra-soft fleece interior for maximum comfort and street-style appeal.",
    category: "GenZ",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=400"
    ],
    colors: ["Off White", "Black", "Pastel Yellow"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5
  },
  {
    name: "Baggy Cargo Pants",
    brand: "Zara TRF",
    price: 2999,
    original_price: 3999,
    description: "Y2K-inspired baggy cargo pants with multiple utility pockets. Loose fit with an adjustable drawstring waistband.",
    category: "GenZ",
    images: [
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"
    ],
    colors: ["Olive Green", "Black", "Beige"],
    sizes: ["XS", "S", "M", "L"],
    rating: 4.3
  },
  {
    name: "Chunky Sneakers",
    brand: "Puma",
    price: 4999,
    original_price: 6999,
    description: "Chunky platform sneakers with a thick sole and retro vibe. Cushioned insole for all-day comfort and bold street style.",
    category: "GenZ",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
    ],
    colors: ["White/Chunky Sole", "Black/Gum", "Cream/Pink"],
    sizes: ["6", "7", "8", "9", "10"],
    rating: 4.6
  },
  {
    name: "Crossbody Phone Bag",
    brand: "Mango",
    price: 1799,
    original_price: 2499,
    description: "Compact crossbody bag designed to fit your phone, cards, and keys. Adjustable strap with trendy hardware details.",
    category: "GenZ",
    images: [
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400"
    ],
    colors: ["Black", "Pink", "Silver"],
    sizes: ["One Size"],
    rating: 4.4
  },
  {
    name: "Aesthetic Polarized Sunglasses",
    brand: "Fastrack",
    price: 1299,
    original_price: 1999,
    description: "Trendy polarized sunglasses with a translucent frame and colored lenses. UV400 protection with a comfortable fit.",
    category: "GenZ",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400"
    ],
    colors: ["Clear Blue", "Tortoise Amber", "Matte Black"],
    sizes: ["One Size"],
    rating: 4.2
  }
];

export const categories = ["Men", "Women", "Footwear", "Accessories", "Kids", "Home", "Beauty", "GenZ"];
