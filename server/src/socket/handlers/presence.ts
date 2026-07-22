import { Server, Socket } from 'socket.io';

interface PresenceSocket extends Socket {
  userId?: string;
  userName?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export function setupPresenceHandlers(io: Server, socket: PresenceSocket): void {
  socket.on('room:join', (roomId: string) => {
    if (!socket.userId) return;

    socket.join(`room:${roomId}`);

    if (!onlineUsers.has(roomId)) {
      onlineUsers.set(roomId, new Set());
    }
    onlineUsers.get(roomId)!.add(socket.userId);

    io.to(`room:${roomId}`).emit('presence:online', {
      room_id: roomId,
      user_id: socket.userId,
      user_name: socket.userName,
      online_users: Array.from(onlineUsers.get(roomId) || []),
    });
  });

  socket.on('room:leave', (roomId: string) => {
    if (!socket.userId) return;

    socket.leave(`room:${roomId}`);

    const users = onlineUsers.get(roomId);
    if (users) {
      users.delete(socket.userId);
      if (users.size === 0) onlineUsers.delete(roomId);
    }

    io.to(`room:${roomId}`).emit('presence:offline', {
      room_id: roomId,
      user_id: socket.userId,
      user_name: socket.userName,
      online_users: Array.from(onlineUsers.get(roomId) || []),
    });
  });

  socket.on('disconnect', () => {
    for (const [roomId, users] of onlineUsers.entries()) {
      if (users.has(socket.userId!)) {
        users.delete(socket.userId!);
        if (users.size === 0) onlineUsers.delete(roomId);

        io.to(`room:${roomId}`).emit('presence:offline', {
          room_id: roomId,
          user_id: socket.userId,
          user_name: socket.userName,
          online_users: Array.from(users),
        });
      }
    }
  });
}

export function getOnlineUsers(roomId: string): string[] {
  return Array.from(onlineUsers.get(roomId) || []);
}
