import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { setupPresenceHandlers } from './handlers/presence.js';
import { setupTypingHandlers } from './handlers/typing.js';
import { setupAIHandlers } from './handlers/ai.js';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET: string = rawSecret;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

export function setupSocketHandlers(io: Server): void {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (token) {
        const decoded = jwt.verify(token as string, JWT_SECRET) as unknown as { userId: string; name: string };
        socket.userId = decoded.userId;
        socket.userName = decoded.name;
      }
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    setupPresenceHandlers(io, socket);
    setupTypingHandlers(io, socket);
    setupAIHandlers(io, socket);
  });
}
