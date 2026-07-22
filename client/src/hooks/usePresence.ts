import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export function usePresence(roomId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('room:join', roomId);

    const handleOnline = (data: { online_users: string[] }) => {
      setOnlineUsers(data.online_users);
    };

    const handleOffline = (data: { online_users: string[] }) => {
      setOnlineUsers(data.online_users);
    };

    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);

    return () => {
      socket.emit('room:leave', roomId);
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
    };
  }, [socket, roomId, user]);

  const isOnline = (userId: string) => onlineUsers.includes(userId);

  return { onlineUsers, isOnline };
}
