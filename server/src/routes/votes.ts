import { Router, Response } from 'express';
import type { Server } from 'socket.io';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { isRoomMember } from '../services/memberService.js';
import { castVote, getVoteCounts, getUserVotes, getProductVotes } from '../services/voteService.js';
import { createSystemMessage } from '../services/messageService.js';
import { recordActivity } from '../services/activityService.js';

const router = Router();

router.get('/:roomId/votes', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const votes = getProductVotes(roomId);
  res.json({ votes });
});

router.get('/:roomId/votes/:productId', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const productId = String(req.params.productId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const counts = getVoteCounts(roomId, productId);
  const userVotes = getUserVotes(roomId, productId, req.userId!);

  res.json({ counts, user_votes: userVotes });
});

router.post('/:roomId/vote', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const { productId, voteType, voteValue } = req.body;

  if (!productId || !voteType || !voteValue) {
    res.status(400).json({ error: 'Product ID, vote type, and vote value are required' });
    return;
  }

  const validTypes = ['approval', 'color', 'size', 'budget'];
  if (!validTypes.includes(voteType)) {
    res.status(400).json({ error: 'Invalid vote type' });
    return;
  }

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const result = castVote(roomId, productId, req.userId!, voteType, voteValue);

  const product = result.counts.find(c => c.vote_type === voteType);
  const voteLabel = voteType === 'approval' ? (voteValue.includes('👍') ? 'approved' : 'rejected') : `voted ${voteValue}`;
  const systemMsg = createSystemMessage(roomId, `${req.userName} ${voteLabel} this item.`);
  recordActivity(roomId, req.userId!, 'vote_cast', {
    product_id: productId,
    vote_type: voteType,
    vote_value: voteValue,
  });

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('chat:new_message', systemMsg);
  io.to(`room:${roomId}`).emit('vote:updated', {
    room_id: roomId,
    product_id: productId,
    counts: result.counts,
    user_id: req.userId,
  });

  res.json(result);
});

export default router;
