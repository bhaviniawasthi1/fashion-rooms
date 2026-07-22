import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { getRecommendations } from '../services/recommendationService.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
  const recommendations = getRecommendations(req.userId!, limit);
  res.json({ recommendations });
});

export default router;
