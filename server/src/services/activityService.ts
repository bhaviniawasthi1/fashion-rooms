import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { Activity, ActivityActionType } from '../types/index.js';

export function recordActivity(
  roomId: string,
  userId: string | null,
  actionType: ActivityActionType,
  data: Record<string, unknown> = {}
): Activity {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO activities (id, room_id, user_id, action_type, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, roomId, userId, actionType, JSON.stringify(data), createdAt);

  return {
    id,
    room_id: roomId,
    user_id: userId,
    action_type: actionType,
    data,
    created_at: createdAt,
  };
}

export function getRoomActivities(roomId: string, limit = 50): Activity[] {
  const rows = db.prepare(`
    SELECT a.*, u.name as user_name, u.avatar as user_avatar
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.room_id = ?
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(roomId, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    room_id: row.room_id,
    user_id: row.user_id,
    action_type: row.action_type as ActivityActionType,
    data: JSON.parse(row.data || '{}'),
    created_at: row.created_at,
    user: row.user_id ? {
      id: row.user_id,
      name: row.user_name,
      avatar: row.user_avatar,
    } : null,
  }));
}
