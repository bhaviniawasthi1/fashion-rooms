import { Router, Response } from 'express';
import type { Server } from 'socket.io';
import db from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { createRoom, getUserRooms, getRoomById, joinRoomByCode } from '../services/roomService.js';
import { getRoomMembers, getUserRoomCount } from '../services/memberService.js';
import { getRoomActivities } from '../services/activityService.js';
import { createSystemMessage } from '../services/messageService.js';

const router = Router();
const MAX_ROOMS_PER_USER = 5;

router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, occasion, max_members, duration_days } = req.body;

  if (!name || !occasion) {
    res.status(400).json({ error: 'Room name and occasion are required' });
    return;
  }

  if (name.length > 100) {
    res.status(400).json({ error: 'Room name must be 100 characters or less' });
    return;
  }

  const validOccasions = ['Wedding', 'Trip', 'Party', 'College', 'Office', 'Festival', 'Birthday', 'Casual', 'Date', 'Vacation'];
  if (!validOccasions.includes(occasion)) {
    res.status(400).json({ error: `Invalid occasion. Must be one of: ${validOccasions.join(', ')}` });
    return;
  }

  const validMaxMembers = [2, 5, 10, 15];
  if (!validMaxMembers.includes(max_members)) {
    res.status(400).json({ error: 'Max members must be 2, 5, 10, or 15' });
    return;
  }

  const validDurations = [1, 3, 7, 15, 30];
  if (!validDurations.includes(duration_days)) {
    res.status(400).json({ error: 'Duration must be 1, 3, 7, 15, or 30 days' });
    return;
  }

  const roomCount = getUserRoomCount(req.userId!);
  if (roomCount >= MAX_ROOMS_PER_USER) {
    res.status(400).json({ error: `You can only be in ${MAX_ROOMS_PER_USER} rooms at a time` });
    return;
  }

  const result = createRoom({ name, occasion, max_members, duration_days }, req.userId!, req.userName!);
  res.status(201).json(result);
});

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const rooms = getUserRooms(req.userId!);
  res.json({ rooms });
});

router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const room = getRoomById(String(req.params.id), req.userId!);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json({ room });
});

router.post('/join', authenticateToken, (req: AuthRequest, res: Response) => {
  const { invite_code } = req.body;

  if (!invite_code) {
    res.status(400).json({ error: 'Invite code is required' });
    return;
  }

  const roomCount = getUserRoomCount(req.userId!);
  if (roomCount >= MAX_ROOMS_PER_USER) {
    res.status(400).json({ error: `You can only be in ${MAX_ROOMS_PER_USER} rooms at a time` });
    return;
  }

  const result = joinRoomByCode(invite_code, req.userId!);

  if ('error' in result) {
    res.status(400).json(result);
    return;
  }

  const systemMsg = createSystemMessage(result.room.id, `${req.userName} joined the room.`);

  const io: Server = req.app.get('io');
  io.to(`room:${result.room.id}`).emit('chat:new_message', systemMsg);

  const members = getRoomMembers(result.room.id);
  io.to(`room:${result.room.id}`).emit('room:member_joined', {
    room_id: result.room.id,
    user_id: req.userId,
    user_name: req.userName,
    members,
  });

  res.json(result);
});

router.get('/:id/members', authenticateToken, (req: AuthRequest, res: Response) => {
  const room = getRoomById(String(req.params.id), req.userId!);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const members = getRoomMembers(String(req.params.id));
  res.json({ members });
});

router.get('/:id/activities', authenticateToken, (req: AuthRequest, res: Response) => {
  const room = getRoomById(String(req.params.id), req.userId!);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const activities = getRoomActivities(String(req.params.id));
  res.json({ activities });
});

router.post('/:id/leave', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.id);
  const userId = req.userId!;

  const room = getRoomById(roomId, userId);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, userId) as any;
  if (!member) {
    res.status(400).json({ error: 'You are not a member of this room' });
    return;
  }

  if (member.role === 'owner') {
    // Transfer ownership to next member or delete room
    const nextMember = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND role = ? ORDER BY joined_at ASC LIMIT 1').get(roomId, 'member') as any;
    if (nextMember) {
      db.prepare('UPDATE room_members SET role = ? WHERE id = ?').run('owner', nextMember.id);
      db.prepare('DELETE FROM room_members WHERE id = ?').run(member.id);
      db.prepare('UPDATE rooms SET created_by = ? WHERE id = ?').run(nextMember.user_id, roomId);
    } else {
      // No other members, delete the room
      db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
    }
  } else {
    db.prepare('DELETE FROM room_members WHERE id = ?').run(member.id);
  }

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('room:member_left', {
    room_id: roomId,
    user_id: userId,
  });

  res.json({ message: 'Left the room' });
});

router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.id);

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND created_by = ?').get(roomId, req.userId) as any;
  if (!room) {
    res.status(404).json({ error: 'Room not found or you are not the owner' });
    return;
  }

  db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('room:deleted', { room_id: roomId });

  res.json({ message: 'Room deleted' });
});

export default router;
