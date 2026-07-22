import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';

export interface CheckoutResult {
  purchased: boolean;
  room_purchase_percentage: number;
  coins_awarded: number;
}

export function purchaseItem(roomId: string, productId: string, userId: string): CheckoutResult {
  const existing = db.prepare('SELECT id FROM checkouts WHERE room_id = ? AND user_id = ? AND product_id = ?').get(roomId, userId, productId) as any;

  if (!existing) {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO checkouts (id, room_id, user_id, product_id)
      VALUES (?, ?, ?, ?)
    `).run(id, roomId, userId, productId);
  }

  const totalMembers = (db.prepare('SELECT COUNT(*) as c FROM room_members WHERE room_id = ?').get(roomId) as any).c;
  const purchasers = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM checkouts WHERE room_id = ?').get(roomId) as any;
  const percentage = totalMembers > 0 ? Math.round((purchasers.c / totalMembers) * 100) : 0;

  let coinsAwarded = 0;

  if (percentage >= 75) {
    const alreadyAwarded = db.prepare('SELECT id FROM myncoins WHERE room_id = ?').get(roomId) as any;
    if (!alreadyAwarded) {
      const payingMembers = db.prepare(`
        SELECT c.user_id, SUM(c.quantity * p.price) as total_paid
        FROM checkouts c
        JOIN products p ON c.product_id = p.id
        WHERE c.room_id = ?
        GROUP BY c.user_id
      `).all(roomId) as any[];

      const now = new Date();
      const expiryDate = new Date(now.setMonth(now.getMonth() + 2)).toISOString();

      for (const member of payingMembers) {
        const coins = Math.floor(member.total_paid);
        if (coins <= 0) continue;
        const id = uuidv4();
        db.prepare('INSERT INTO myncoins (id, user_id, room_id, amount, expiry_date) VALUES (?, ?, ?, ?, ?)').run(id, member.user_id, roomId, coins, expiryDate);
        coinsAwarded += coins;
      }
    }
  }

  return {
    purchased: true,
    room_purchase_percentage: percentage,
    coins_awarded: coinsAwarded,
  };
}

export function getRoomCheckoutStatus(roomId: string) {
  const totalMembers = (db.prepare('SELECT COUNT(*) as c FROM room_members WHERE room_id = ?').get(roomId) as any).c;
  const purchasers = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM checkouts WHERE room_id = ?').get(roomId) as any;
  const totalItems = (db.prepare('SELECT COUNT(*) as c FROM shared_cart_items WHERE room_id = ?').get(roomId) as any).c;
  const purchasedItems = (db.prepare('SELECT COUNT(DISTINCT product_id) as c FROM checkouts WHERE room_id = ?').get(roomId) as any).c;
  const coins = (db.prepare('SELECT SUM(amount) as c FROM myncoins WHERE room_id = ?').get(roomId) as any).c || 0;

  const purchases = db.prepare(`
    SELECT c.*, u.name as user_name, p.name as product_name, p.price
    FROM checkouts c
    JOIN users u ON c.user_id = u.id
    JOIN products p ON c.product_id = p.id
    WHERE c.room_id = ?
    ORDER BY c.purchased_at DESC
  `).all(roomId) as any[];

  return {
    total_members: totalMembers,
    unique_purchasers: purchasers.c,
    purchase_percentage: totalMembers > 0 ? Math.round((purchasers.c / totalMembers) * 100) : 0,
    total_items: totalItems,
    purchased_items: purchasedItems,
    total_coins_awarded: coins,
    purchases,
  };
}

export function getUserRewards(userId: string) {
  const rows = db.prepare(`
    SELECT fc.*, rm.name as room_name
    FROM myncoins fc
    JOIN rooms rm ON fc.room_id = rm.id
    WHERE fc.user_id = ?
    ORDER BY fc.awarded_at DESC
  `).all(userId) as any[];

  const now = new Date().toISOString();
  const total = rows.reduce((sum: number, r: any) => sum + (r.expiry_date > now ? r.amount : 0), 0);

  return {
    total_coins: total,
    coins: rows.map((r: any) => ({
      id: r.id,
      room_id: r.room_id,
      room_name: r.room_name,
      amount: r.amount,
      expiry_date: r.expiry_date,
      awarded_at: r.awarded_at,
      expired: r.expiry_date <= now,
    })),
  };
}
