import db from '../db/index.js';

export function getUserOrders(userId: string) {
  const roomCheckouts = db.prepare(`
    SELECT
      c.id as checkout_id,
      c.room_id,
      c.product_id,
      c.quantity,
      c.purchased_at,
      rm.name as room_name,
      rm.occasion as room_occasion,
      p.name as product_name,
      p.brand,
      p.price,
      p.original_price,
      p.images,
      p.category
    FROM checkouts c
    JOIN products p ON c.product_id = p.id
    LEFT JOIN rooms rm ON c.room_id = rm.id
    WHERE c.user_id = ?
  `).all(userId) as any[];

  const personalCheckouts = db.prepare(`
    SELECT
      pc.id as checkout_id,
      NULL as room_id,
      pc.product_id,
      pc.quantity,
      pc.purchased_at,
      NULL as room_name,
      NULL as room_occasion,
      p.name as product_name,
      p.brand,
      p.price,
      p.original_price,
      p.images,
      p.category
    FROM personal_checkouts pc
    JOIN products p ON pc.product_id = p.id
    WHERE pc.user_id = ?
  `).all(userId) as any[];

  const coinsByRoom = new Map<string, { amount: number; expiry_date: string }>();
  const coinRows = db.prepare(`
    SELECT room_id, SUM(amount) as amount, MAX(expiry_date) as expiry_date
    FROM myncoins WHERE user_id = ?
    GROUP BY room_id
  `).all(userId) as any[];
  for (const row of coinRows) {
    coinsByRoom.set(row.room_id, { amount: row.amount, expiry_date: row.expiry_date });
  }

  const all = [...roomCheckouts, ...personalCheckouts].sort(
    (a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
  );

  const items = all.map((row) => {
    const images = safeParse(row.images);
    const coinInfo = row.room_id ? coinsByRoom.get(row.room_id) : null;
    return {
      checkout_id: row.checkout_id,
      product_id: row.product_id,
      name: row.product_name,
      brand: row.brand,
      price: row.price,
      original_price: row.original_price,
      image: Array.isArray(images) && images.length > 0 ? images[0] : null,
      category: row.category,
      quantity: row.quantity,
      purchased_at: row.purchased_at,
      room_id: row.room_id ?? null,
      room_name: row.room_name ?? null,
      room_occasion: row.room_occasion ?? null,
      coins_awarded: coinInfo?.amount ?? 0,
      coins_expiry: coinInfo?.expiry_date ?? null,
    };
  });

  return { items };
}

function safeParse(val: any): any {
  try { return JSON.parse(val); } catch { return []; }
}
