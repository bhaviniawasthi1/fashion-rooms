import db from '../db/index.js';

export interface RoomAnalytics {
  most_active_member: { name: string; actions: number } | null;
  most_loved_color: { color: string; votes: number } | null;
  favorite_brand: { brand: string; count: number } | null;
  most_voted_product: { name: string; total_votes: number } | null;
  activity_score: number;
  total_messages: number;
  total_votes: number;
  total_products: number;
}

export function getRoomAnalytics(roomId: string): RoomAnalytics {
  const mostActive = db.prepare(`
    SELECT u.name, COUNT(*) as actions
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.room_id = ?
    GROUP BY a.user_id
    ORDER BY actions DESC
    LIMIT 1
  `).get(roomId) as any;

  const favoriteColor = db.prepare(`
    SELECT vote_value as color, COUNT(*) as votes
    FROM votes
    WHERE room_id = ? AND vote_type = 'color'
    GROUP BY vote_value
    ORDER BY votes DESC
    LIMIT 1
  `).get(roomId) as any;

  const favoriteBrand = db.prepare(`
    SELECT p.brand, COUNT(*) as count
    FROM shared_cart_items sci
    JOIN products p ON sci.product_id = p.id
    WHERE sci.room_id = ?
    GROUP BY p.brand
    ORDER BY count DESC
    LIMIT 1
  `).get(roomId) as any;

  const mostVoted = db.prepare(`
    SELECT p.name, COUNT(*) as total_votes
    FROM votes v
    JOIN products p ON v.product_id = p.id
    WHERE v.room_id = ?
    GROUP BY v.product_id
    ORDER BY total_votes DESC
    LIMIT 1
  `).get(roomId) as any;

  const msgCount = (db.prepare('SELECT COUNT(*) as c FROM messages WHERE room_id = ? AND type = \'text\'').get(roomId) as any).c;
  const actCount = (db.prepare('SELECT COUNT(*) as c FROM activities WHERE room_id = ?').get(roomId) as any).c;
  const voteCount = (db.prepare('SELECT COUNT(*) as c FROM votes WHERE room_id = ?').get(roomId) as any).c;
  const prodCount = (db.prepare('SELECT COUNT(*) as c FROM shared_cart_items WHERE room_id = ?').get(roomId) as any).c;

  const room = db.prepare('SELECT created_at FROM rooms WHERE id = ?').get(roomId) as any;
  const daysSinceCreation = Math.max(1, Math.ceil((Date.now() - new Date(room?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));

  return {
    most_active_member: mostActive ? { name: mostActive.name, actions: mostActive.actions } : null,
    most_loved_color: favoriteColor ? { color: favoriteColor.color, votes: favoriteColor.votes } : null,
    favorite_brand: favoriteBrand ? { brand: favoriteBrand.brand, count: favoriteBrand.count } : null,
    most_voted_product: mostVoted ? { name: mostVoted.name, total_votes: mostVoted.total_votes } : null,
    activity_score: Math.round((msgCount + actCount) / daysSinceCreation),
    total_messages: msgCount,
    total_votes: voteCount,
    total_products: prodCount,
  };
}
