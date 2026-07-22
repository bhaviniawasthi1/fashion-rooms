import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { isRoomMember } from '../services/memberService.js';
import { getRoomAnalytics } from '../services/analyticsService.js';

const router = Router();

router.get('/:roomId/analytics', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const analytics = getRoomAnalytics(roomId);
  res.json({ analytics });
});

export default router;
