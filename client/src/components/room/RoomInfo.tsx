import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Room } from '../../types';

interface RoomInfoProps {
  room: Room;
  onRoomUpdated: () => void;
}

const occasionEmojis: Record<string, string> = {
  Wedding: '💒', Trip: '✈️', Party: '🎉', College: '🎓', Office: '💼',
  Festival: '🎊', Birthday: '🎂', Casual: '👕', Date: '💕', Vacation: '🌴',
};

export default function RoomInfo({ room, onRoomUpdated: _onRoomUpdated }: RoomInfoProps) {
  const { user: _user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exiting, setExiting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const daysLeft = Math.max(0, Math.ceil((new Date(room.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isExpired = room.status === 'expired';

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this room?')) return;
    setExiting(true);
    try {
      await api.post(`/rooms/${room.id}/leave`);
      showToast('Left the room', 'info');
      navigate('/rooms');
    } catch {
      showToast('Failed to leave room', 'error');
    } finally {
      setExiting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/rooms/${room.id}`);
      showToast('Room deleted', 'info');
      navigate('/rooms');
    } catch {
      showToast('Failed to delete room', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{occasionEmojis[room.occasion] || ''}</span>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{room.name}</h2>
          <p className="text-xs text-gray-600">{room.occasion} · {room.member_count} members</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <span className="text-gray-400 block">Status</span>
          <span className={`font-semibold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
            {isExpired ? 'Ended' : 'Active'}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <span className="text-gray-400 block">Valid till</span>
          <span className="font-semibold text-gray-600">{isExpired ? '' : `${daysLeft}d`}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <span className="text-gray-400 block">Capacity</span>
          <span className="font-semibold text-gray-600">{room.member_count}/{room.max_members}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <span className="text-gray-400 block">Created</span>
          <span className="font-semibold text-gray-600">{new Date(room.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {!isExpired && (
        <div className="mt-4 space-y-2">
          {room.is_owner ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Room'}
            </button>
          ) : (
            <button
              onClick={handleLeave}
              disabled={exiting}
              className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {exiting ? 'Leaving...' : 'Exit Room'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
