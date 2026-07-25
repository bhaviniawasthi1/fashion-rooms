import { Router, Response } from 'express';
import type { Server } from 'socket.io';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { isRoomMember } from '../services/memberService.js';
import { purchaseItem, getRoomCheckoutStatus, getUserRewards } from '../services/checkoutService.js';
import { createSystemMessage } from '../services/messageService.js';
import { recordActivity } from '../services/activityService.js';

export const mynCoinsRouter = Router();

mynCoinsRouter.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const rewards = getUserRewards(req.userId!);
  res.json(rewards);
});

const router = Router();

router.post('/:roomId/checkout', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const { productId } = req.body;

  if (!productId) {
    res.status(400).json({ error: 'Product ID required' });
    return;
  }

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const result = purchaseItem(roomId, productId, req.userId!);

  const thresholdNeeded = Math.ceil(result.total_members * 0.75);
  const remainingNeeded = Math.max(0, thresholdNeeded - result.purchasers_count);

  let msgContent: string;
  if (result.coins_awarded > 0) {
    msgContent = `🎉 BOOM! ${result.purchasers_count}/${result.total_members} purchased = MynCoins UNLOCKED! Check your rewards besties! 💰✨`;
  } else if (remainingNeeded > 0) {
    msgContent = `🙌 ${req.userName} just copped! ${remainingNeeded} more to go — rewards unlock when ${thresholdNeeded} of ${result.total_members} members buy! Who's next? ⏳`;
  } else {
    msgContent = `🔥 ${req.userName} just copped! Squad rewards already unlocked — let's keep the party going! 🚀`;
  }

  const systemMsg = createSystemMessage(roomId, msgContent);
  const activity = recordActivity(roomId, req.userId!, 'checkout_completed', {
    product_id: productId,
    purchase_percentage: result.room_purchase_percentage,
    purchasers_count: result.purchasers_count,
    total_members: result.total_members,
  });

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('chat:new_message', systemMsg);
  io.to(`room:${roomId}`).emit('room:activity', {
    ...activity,
    user: { id: req.userId!, name: req.userName },
  });
  io.to(`room:${roomId}`).emit('checkout:updated', result);

  res.json(result);
});

router.get('/:roomId/checkout', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const status = getRoomCheckoutStatus(roomId);
  res.json(status);
});

router.get('/rewards', authenticateToken, (req: AuthRequest, res: Response) => {
  const rewards = getUserRewards(req.userId!);
  res.json(rewards);
});

export default router;
