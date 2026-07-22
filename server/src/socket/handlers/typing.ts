import { Server, Socket } from 'socket.io';

interface TypingSocket extends Socket {
  userId?: string;
  userName?: string;
}

export function setupTypingHandlers(io: Server, socket: TypingSocket): void {
  socket.on('chat:typing_start', (data: { room_id: string }) => {
    if (!data.room_id || !socket.userId) return;

    socket.to(`room:${data.room_id}`).emit('chat:typing', {
      room_id: data.room_id,
      user_id: socket.userId,
      user_name: socket.userName,
      typing: true,
    });
  });

  socket.on('chat:typing_stop', (data: { room_id: string }) => {
    if (!data.room_id || !socket.userId) return;

    socket.to(`room:${data.room_id}`).emit('chat:typing', {
      room_id: data.room_id,
      user_id: socket.userId,
      user_name: socket.userName,
      typing: false,
    });
  });
}
