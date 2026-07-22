import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';
import type { Activity } from '../types';

export function useActivities(roomId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    setLoading(true);
    api.get(`/rooms/${roomId}/activities`)
      .then((res) => setActivities(res.data.activities))
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity: Activity) => {
      setActivities((prev) => [activity, ...prev]);
    };

    socket.on('room:activity', handleActivity);

    return () => {
      socket.off('room:activity', handleActivity);
    };
  }, [socket]);

  return { activities, loading };
}
