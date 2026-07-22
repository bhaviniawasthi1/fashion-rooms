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

  let products: any[] = [];

  if (occasion) {
    const occasionCategories: Record<string, string[]> = {
      Wedding: ['Women', 'Men', 'Footwear'],
      Party: ['Women', 'Men', 'Footwear'],
      Trip: ['Men', 'Women', 'Footwear'],
      College: ['Men', 'Women'],
      Office: ['Men', 'Women'],
      Festival: ['Women', 'Men', 'Footwear'],
      Birthday: ['Women', 'Men', 'Footwear'],
      Casual: ['Men', 'Women', 'Footwear'],
      Date: ['Women', 'Men'],
      Vacation: ['Footwear', 'Men', 'Women'],
    };

    const categories = occasionCategories[occasion] || ['Men', 'Women', 'Footwear'];

    const placeholders = cartProductIds.map(() => '?').join(',');
    let query = `
      SELECT * FROM products
      WHERE category IN (${categories.map(() => '?').join(',')})
      AND in_stock = 1
    `;
    const params: any[] = [...categories];

    if (cartProductIds.length > 0) {
      query += ` AND id NOT IN (${placeholders})`;
      params.push(...cartProductIds);
    }

    query += ' ORDER BY rating DESC LIMIT ?';
    params.push(String(limit));

    const stmt = db.prepare(query);
    products = stmt.all(...(params as [string])) as any[];
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
