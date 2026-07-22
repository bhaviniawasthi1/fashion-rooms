import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getUserOrders } from '../services/orderService.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const orders = getUserOrders(req.userId!);
  res.json(orders);
});

export default router;
