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

  const systemMsg = createSystemMessage(roomId, `${req.userName} purchased an item!`);
  recordActivity(roomId, req.userId!, 'checkout_completed', {
    product_id: productId,
    purchase_percentage: result.room_purchase_percentage,
  });

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('chat:new_message', systemMsg);

  if (result.coins_awarded > 0) {
    const rewardMsg = createSystemMessage(roomId, `🎉 ${result.room_purchase_percentage}% of members purchased! Each purchasing member earned 1 MynCoin per rupee spent (valid 2 months)!`);
    io.to(`room:${roomId}`).emit('chat:new_message', rewardMsg);
  }

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
