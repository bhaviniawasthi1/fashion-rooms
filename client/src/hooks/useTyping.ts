import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface TypingUser {
  user_id: string;
  user_name: string;
  typing: boolean;
}

export function useTyping(roomId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: TypingUser) => {
      if (data.user_id === user?.id) return;

      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.user_id !== data.user_id);
        if (data.typing) {
          return [...filtered, data];
        }
        return filtered;
      });
    };

    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, user]);

  const startTyping = useCallback(() => {
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit('chat:typing_start', { room_id: roomId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('chat:typing_stop', { room_id: roomId });
    }, 3000);
  }, [socket, roomId]);

  const stopTyping = useCallback(() => {
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    socket.emit('chat:typing_stop', { room_id: roomId });
  }, [socket, roomId]);

  return { typingUsers, startTyping, stopTyping };
}
