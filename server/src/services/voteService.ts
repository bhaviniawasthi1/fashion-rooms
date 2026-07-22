import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { VoteType, VoteCount } from '../types/index.js';

export function castVote(
  roomId: string,
  productId: string,
  userId: string,
  voteType: VoteType,
  voteValue: string
): { vote: any; counts: VoteCount[] } {
  const existing = db.prepare(
    'SELECT id, vote_value FROM votes WHERE room_id = ? AND product_id = ? AND user_id = ? AND vote_type = ?'
  ).get(roomId, productId, userId, voteType) as any;

  if (existing) {
    if (existing.vote_value === voteValue) {
      db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
    } else {
      db.prepare('UPDATE votes SET vote_value = ?, created_at = datetime(\'now\') WHERE id = ?').run(voteValue, existing.id);
    }
  } else {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO votes (id, room_id, product_id, user_id, vote_type, vote_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, roomId, productId, userId, voteType, voteValue);
  }

  const counts = getVoteCounts(roomId, productId);

  const userVote = db.prepare(
    'SELECT vote_type, vote_value FROM votes WHERE room_id = ? AND product_id = ? AND user_id = ?'
  ).all(roomId, productId, userId) as any[];

  return {
    vote: { user_id: userId, votes: userVote },
    counts,
  };
}

export function getVoteCounts(roomId: string, productId: string): VoteCount[] {
  const rows = db.prepare(`
    SELECT vote_type, vote_value, COUNT(*) as count
    FROM votes
    WHERE room_id = ? AND product_id = ?
    GROUP BY vote_type, vote_value
  `).all(roomId, productId) as any[];

  const grouped = new Map<string, Record<string, number>>();

  for (const row of rows) {
    if (!grouped.has(row.vote_type)) {
      grouped.set(row.vote_type, {});
    }
    grouped.get(row.vote_type)![row.vote_value] = row.count;
  }

  const result: VoteCount[] = [];
  for (const [voteType, values] of grouped) {
    const total = Object.values(values).reduce((a, b) => a + b, 0);
    result.push({ vote_type: voteType as VoteType, values, total });
  }

  return result;
}

export function getUserVotes(roomId: string, productId: string, userId: string): { vote_type: VoteType; vote_value: string }[] {
  const rows = db.prepare(
    'SELECT vote_type, vote_value FROM votes WHERE room_id = ? AND product_id = ? AND user_id = ?'
  ).all(roomId, productId, userId) as any[];
  return rows.map(r => ({ vote_type: r.vote_type as VoteType, vote_value: r.vote_value }));
}

export function getProductVotes(roomId: string): Record<string, VoteCount[]> {
  const rows = db.prepare(`
    SELECT product_id, vote_type, vote_value, COUNT(*) as count
    FROM votes
    WHERE room_id = ?
    GROUP BY product_id, vote_type, vote_value
  `).all(roomId) as any[];

  const result: Record<string, VoteCount[]> = {};

  for (const row of rows) {
    if (!result[row.product_id]) result[row.product_id] = [];
    let group = result[row.product_id].find(v => v.vote_type === row.vote_type);
    if (!group) {
      group = { vote_type: row.vote_type as VoteType, values: {}, total: 0 };
      result[row.product_id].push(group);
    }
    group.values[row.vote_value] = row.count;
    group.total += row.count;
  }

  return result;
}
