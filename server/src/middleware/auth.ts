import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = rawSecret;

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
}

export function generateToken(userId: string, name: string): string {
  return jwt.sign({ userId, name }, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string; name: string };
    req.userId = decoded.userId;
    req.userName = decoded.name;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
