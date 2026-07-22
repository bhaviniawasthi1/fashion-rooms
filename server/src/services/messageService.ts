import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { Message } from '../types/index.js';

export function createMessage(
  roomId: string,
  userId: string | null,
  content: string,
  type: 'text' | 'system' = 'text'
): Message {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, room_id, user_id, content, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, roomId, userId, content, type, createdAt);

  const row = db.prepare(`
    SELECT m.*, u.name as user_name, u.avatar as user_avatar
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `).get(id) as any;

  return {
    id: row.id,
    room_id: row.room_id,
    user_id: row.user_id,
    content: row.content,
    type: row.type as 'text' | 'system',
    created_at: row.created_at,
    user: row.user_id ? {
      id: row.user_id,
      name: row.user_name,
      avatar: row.user_avatar,
    } : null,
  };
}

export function createSystemMessage(roomId: string, content: string): Message {
  return createMessage(roomId, null, content, 'system');
}

export function getRoomMessages(roomId: string, limit = 100, before?: string): Message[] {
  let query: string;
  let params: any[];

  if (before) {
    query = `
      SELECT m.*, u.name as user_name, u.avatar as user_avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ? AND m.created_at < (SELECT created_at FROM messages WHERE id = ?)
      ORDER BY m.created_at DESC
      LIMIT ?
    `;
    params = [roomId, before, limit];
  } else {
    query = `
      SELECT m.*, u.name as user_name, u.avatar as user_avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `;
    params = [roomId, limit];
  }

  const rows = db.prepare(query).all(...params) as any[];

  return rows.reverse().map(row => ({
    id: row.id,
    room_id: row.room_id,
    user_id: row.user_id,
    content: row.content,
    type: row.type as 'text' | 'system',
    created_at: row.created_at,
    user: row.user_id ? {
      id: row.user_id,
      name: row.user_name,
      avatar: row.user_avatar,
    } : null,
  }));
}
