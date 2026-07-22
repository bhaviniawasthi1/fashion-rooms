import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { RoomMember } from '../types/index.js';

export function addMember(roomId: string, userId: string, role: 'owner' | 'member' = 'member'): RoomMember {
  const id = uuidv4();
  const joinedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO room_members (id, room_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, roomId, userId, role, joinedAt);

  const member = db.prepare(`
    SELECT rm.*, u.name, u.email, u.avatar
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.id = ?
  `).get(id) as any;

  return {
    id: member.id,
    room_id: member.room_id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
  };
}

export function removeMember(roomId: string, userId: string): void {
  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(roomId, userId);
}

export function getRoomMembers(roomId: string): RoomMember[] {
  const rows = db.prepare(`
    SELECT rm.*, u.name, u.email, u.avatar
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = ?
    ORDER BY rm.joined_at ASC
  `).all(roomId) as any[];

  return rows.map(row => ({
    id: row.id,
    room_id: row.room_id,
    user_id: row.user_id,
    role: row.role as 'owner' | 'member',
    joined_at: row.joined_at,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
  }));
}

export function isRoomMember(roomId: string, userId: string): boolean {
  const row = db.prepare('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, userId);
  return !!row;
}

export function getUserRoomCount(userId: string): number {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM room_members rm
    JOIN rooms r ON rm.room_id = r.id
    WHERE rm.user_id = ? AND r.status = 'active'
  `).get(userId) as any;
  return row.count;
}

export function getRoomMemberCount(roomId: string): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM room_members WHERE room_id = ?').get(roomId) as any;
  return row.count;
}
