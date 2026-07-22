import { Router, Response } from 'express';
import type { Server } from 'socket.io';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import db from '../db/index.js';
import { isRoomMember } from '../services/memberService.js';
import { addToSharedCart, removeFromSharedCart, getSharedCartItems } from '../services/sharedCartService.js';
import { createSystemMessage } from '../services/messageService.js';
import { recordActivity } from '../services/activityService.js';

const router = Router();

router.get('/:roomId/cart', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const items = getSharedCartItems(roomId);
  res.json({ items });
});

router.post('/:roomId/cart/add', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const { productId } = req.body;

  if (!productId) {
    res.status(400).json({ error: 'Product ID is required' });
    return;
  }

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const result = addToSharedCart(roomId, productId, req.userId!);

  if (!result) {
    res.status(400).json({ error: 'Product not found' });
    return;
  }

  const { item, alreadyExists } = result;

  if (alreadyExists) {
    const io: Server = req.app.get('io');
    io.to(`room:${roomId}`).emit('cart:item_added', item);
    res.json({ item, alreadyExists: true });
    return;
  }

  const systemMsg = createSystemMessage(roomId, `${req.userName} added ${item.product.name} to the shared cart.`);
  recordActivity(roomId, req.userId!, 'product_added', {
    product_id: productId,
    product_name: item.product.name,
  });

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('chat:new_message', systemMsg);
  io.to(`room:${roomId}`).emit('cart:item_added', item);

  res.status(201).json({ item });
});

router.put('/:roomId/cart/:itemId', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const itemId = String(req.params.itemId);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Quantity must be at least 1' });
    return;
  }

  db.prepare('UPDATE shared_cart_items SET quantity = ? WHERE id = ? AND room_id = ?').run(quantity, itemId, roomId);

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('cart:quantity_updated', { item_id: itemId, quantity });

  res.json({ message: 'Quantity updated' });
});

router.delete('/:roomId/cart/:itemId', authenticateToken, (req: AuthRequest, res: Response) => {
  const roomId = String(req.params.roomId);
  const itemId = String(req.params.itemId);

  if (!isRoomMember(roomId, req.userId!)) {
    res.status(403).json({ error: 'Not a member of this room' });
    return;
  }

  const removed = removeFromSharedCart(itemId, roomId);

  if (!removed) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const io: Server = req.app.get('io');
  io.to(`room:${roomId}`).emit('cart:item_removed', { item_id: itemId, room_id: roomId });

  res.json({ message: 'Removed from shared cart' });
});

export default router;
