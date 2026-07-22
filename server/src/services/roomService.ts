import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { Room, RoomWithMeta, CreateRoomInput } from '../types/index.js';
import { generateInviteCode, buildInviteLink } from '../utils/inviteCode.js';
import { addMember, getRoomMemberCount, getRoomMembers } from './memberService.js';
import { recordActivity } from './activityService.js';

export function createRoom(input: CreateRoomInput, userId: string, userName: string): {
  room: RoomWithMeta;
  invite_link: string;
} {
  const id = uuidv4();
  const inviteCode = generateInviteCode();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + input.duration_days);

  db.prepare(`
    INSERT INTO rooms (id, name, occasion, max_members, duration_days, invite_code, created_by, status, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, input.name, input.occasion, input.max_members, input.duration_days, inviteCode, userId, now.toISOString(), expiresAt.toISOString());

  addMember(id, userId, 'owner');

  recordActivity(id, userId, 'room_created', { room_name: input.name });

  return {
    room: {
      id,
      name: input.name,
      occasion: input.occasion,
      max_members: input.max_members,
      duration_days: input.duration_days,
      invite_code: inviteCode,
      created_by: userId,
      status: 'active',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      member_count: 1,
      owner_name: userName,
      is_owner: true,
    },
    invite_link: buildInviteLink(inviteCode),
  };
}

export function getUserRooms(userId: string): RoomWithMeta[] {
  const rows = db.prepare(`
    SELECT r.*,
           (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count,
           u.name as owner_name
    FROM rooms r
    JOIN room_members rm ON r.id = rm.room_id
    JOIN users u ON r.created_by = u.id
    WHERE rm.user_id = ?
    ORDER BY r.created_at DESC
  `).all(userId) as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    max_members: row.max_members,
    duration_days: row.duration_days,
    invite_code: row.invite_code,
    created_by: row.created_by,
    status: row.status as 'active' | 'expired',
    created_at: row.created_at,
    expires_at: row.expires_at,
    member_count: row.member_count,
    owner_name: row.owner_name,
    is_owner: row.created_by === userId,
  }));
}

export function getRoomById(roomId: string, userId: string): RoomWithMeta | null {
  const row = db.prepare(`
    SELECT r.*,
           (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count,
           u.name as owner_name
    FROM rooms r
    JOIN users u ON r.created_by = u.id
    WHERE r.id = ?
  `).get(roomId) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    max_members: row.max_members,
    duration_days: row.duration_days,
    invite_code: row.invite_code,
    created_by: row.created_by,
    status: row.status as 'active' | 'expired',
    created_at: row.created_at,
    expires_at: row.expires_at,
    member_count: row.member_count,
    owner_name: row.owner_name,
    is_owner: row.created_by === userId,
  };
}

export function getRoomByInviteCode(code: string): Room | null {
  const row = db.prepare('SELECT * FROM rooms WHERE invite_code = ?').get(code) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    occasion: row.occasion,
    max_members: row.max_members,
    duration_days: row.duration_days,
    invite_code: row.invite_code,
    created_by: row.created_by,
    status: row.status,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
}

export function joinRoomByCode(code: string, userId: string): { room: RoomWithMeta; invite_link: string } | { error: string } {
  const room = getRoomByInviteCode(code);
  if (!room) return { error: 'Invalid invite code' };

  if (room.status !== 'active') return { error: 'Room is no longer valid' };

  if (new Date(room.expires_at) < new Date()) {
    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('expired', room.id);
    return { error: 'Room is no longer valid' };
  }

  if (isRoomMember(room.id, userId)) {
    return { error: 'Already a member of this room' };
  }

  const memberCount = getRoomMemberCount(room.id);
  if (memberCount >= room.max_members) {
    return { error: 'Room is full' };
  }

  const userRow = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;
  const userName = userRow.name;

  addMember(room.id, userId, 'member');

  recordActivity(room.id, userId, 'member_joined', { user_name: userName });

  const fullRoom = getRoomById(room.id, userId)!;

  return {
    room: fullRoom,
    invite_link: buildInviteLink(code),
  };
}

export function isRoomMember(roomId: string, userId: string): boolean {
  const row = db.prepare('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, userId);
  return !!row;
}
