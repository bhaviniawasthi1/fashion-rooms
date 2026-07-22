import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/messages/${roomId}`, { params: { limit: 100 } })
      .then((res) => setMessages(res.data.messages))
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('chat:new_message', handleNewMessage);

    return () => {
      socket.off('chat:new_message', handleNewMessage);
    };
  }, [socket]);

  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !content.trim() || !user) return;
    socket.emit('chat:send_message', { room_id: roomId, content: content.trim() });
  }, [socket, roomId, user]);

  return { messages, loading, sendMessage, messagesEndRef, scrollToBottom };
}
