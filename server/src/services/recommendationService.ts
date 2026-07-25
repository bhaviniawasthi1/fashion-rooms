import db from '../db/index.js';

export interface Recommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number;
  image: string;
  category: string;
  rating: number;
  reason: string;
}

const OCCASION_CATEGORIES: Record<string, string[]> = {
  Wedding: ['Women', 'Men', 'Footwear', 'Accessories'],
  Party: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Trip: ['Men', 'Women', 'Footwear', 'Accessories', 'Beauty'],
  College: ['Men', 'Women', 'Footwear', 'Accessories'],
  Office: ['Men', 'Women', 'Accessories'],
  Festival: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Birthday: ['Women', 'Men', 'Footwear', 'Accessories'],
  Casual: ['Men', 'Women', 'Footwear', 'Accessories', 'Kids', 'GenZ'],
  Date: ['Women', 'Men', 'Footwear', 'Accessories', 'Beauty'],
  Vacation: ['Footwear', 'Women', 'Men', 'Accessories', 'Beauty', 'Kids'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Women: ['women', 'girl', 'female', 'dress', 'skirt', 'top', 'blouse', 'saree', 'salwar'],
  Men: ['men', 'guy', 'male', 'shirt', 'trouser', 'pant', 'blazer', 'suit'],
  Footwear: ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'footwear'],
  Accessories: ['accessor', 'bag', 'watch', 'belt', 'sunglass', 'jewelry', 'necklace'],
  Beauty: ['beauty', 'makeup', 'skincare', 'perfume', 'cosmetic'],
  Kids: ['kids', 'child', 'baby', 'toddler'],
  GenZ: ['genz', 'streetwear', 'hoodie', 'jogger', 'trendy'],
};

function extractChatCategories(userId: string): Map<string, number> {
  const chatMessages = db.prepare(`
    SELECT m.content FROM messages m
    JOIN room_members rm ON m.room_id = rm.room_id
    JOIN rooms r ON m.room_id = r.id
    WHERE rm.user_id = ? AND r.status = 'active' AND m.type = 'text'
    ORDER BY m.created_at DESC LIMIT 100
  `).all(userId) as { content: string }[];

  const categoryScores = new Map<string, number>();

  for (const msg of chatMessages) {
    const content = msg.content.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (content.includes(kw)) {
          categoryScores.set(category, (categoryScores.get(category) || 0) + 1);
          break;
        }
      }
    }
  }

  return categoryScores;
}

export function getRecommendations(userId: string, limit = 8): Recommendation[] {
  const userRooms = db.prepare(`
    SELECT DISTINCT r.id, r.occasion
    FROM rooms r
    JOIN room_members rm ON r.id = rm.room_id
    WHERE rm.user_id = ? AND r.status = 'active'
  `).all(userId) as any[];

  if (userRooms.length === 0) {
    return getPopularProducts(limit);
  }

  const occasions = userRooms.map((r: any) => r.occasion).filter(Boolean);
  const occasion = occasions[0];

  const cartProductIds = db.prepare(`
    SELECT DISTINCT sci.product_id
    FROM shared_cart_items sci
    JOIN rooms r ON sci.room_id = r.id
    JOIN room_members rm ON r.id = rm.room_id
    WHERE rm.user_id = ?
  `).all(userId).map((r: any) => r.product_id);

  const chatCategoryScores = extractChatCategories(userId);

  let products: any[] = [];

  if (occasion) {
    const baseCategories = OCCASION_CATEGORIES[occasion] || ['Men', 'Women', 'Footwear'];

    const sortedCategories = [...baseCategories].sort((a, b) => {
      const scoreA = chatCategoryScores.get(a) || 0;
      const scoreB = chatCategoryScores.get(b) || 0;
      return scoreB - scoreA;
    });

    const placeholders = sortedCategories.map(() => '?').join(',');
    let query = `
      SELECT * FROM products
      WHERE category IN (${placeholders})
      AND in_stock = 1
    `;
    const params: any[] = [...sortedCategories];

    if (cartProductIds.length > 0) {
      const cartPlaceholders = cartProductIds.map(() => '?').join(',');
      query += ` AND id NOT IN (${cartPlaceholders})`;
      params.push(...cartProductIds);
    }

    query += ' ORDER BY rating DESC LIMIT ?';
    params.push(String(limit));

    products = db.prepare(query).all(...(params as [string])) as any[];
  }

  if (products.length === 0) {
    return getPopularProducts(limit);
  }

  const reason = getReasonForOccasion(occasion);

  return products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    original_price: p.original_price,
    image: JSON.parse(p.images)[0] || '',
    category: p.category,
    rating: p.rating,
    reason,
  }));
}

function getPopularProducts(limit: number): Recommendation[] {
  const products = db.prepare('SELECT * FROM products WHERE in_stock = 1 ORDER BY rating DESC LIMIT ?').all(limit) as any[];
  return products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    original_price: p.original_price,
    image: JSON.parse(p.images)[0] || '',
    category: p.category,
    rating: p.rating,
    reason: 'Popular choice',
  }));
}

function getReasonForOccasion(occasion: string): string {
  const reasons: Record<string, string> = {
    Wedding: 'Perfect for your wedding plans',
    Party: 'Great for your party vibe',
    Trip: 'Ideal for your upcoming trip',
    College: 'Fits your college style',
    Office: 'Perfect for the office',
    Festival: 'Festival-ready style',
    Birthday: 'Birthday celebration picks',
    Casual: 'Casual everyday wear',
    Date: 'Date night approved',
    Vacation: 'Vacation must-haves',
  };
  return reasons[occasion] || 'Recommended for you';
}
