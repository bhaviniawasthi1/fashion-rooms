import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { isRoomMember } from '../services/memberService.js';
import { getRoomMessages } from '../services/messageService.js';

const router = Router();

router.get('/:roomId', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
  const before = req.query.before ? String(req.query.before) : undefined;

  const messages = getRoomMessages(roomId, limit, before);
  res.json({ messages });
});

export default router;
