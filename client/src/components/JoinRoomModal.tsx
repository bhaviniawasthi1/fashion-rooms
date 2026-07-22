import { useState } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    try {
      const res = await api.post('/rooms/join', { invite_code: code.trim() });
      showToast(`Joined "${res.data.room.name}"!`, 'success');
      onClose();
      setCode('');
      navigate(`/rooms/${res.data.room.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to join room', 'error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Join a Room</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Enter the invite code shared by your friend</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Invite Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC12345"
              maxLength={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={joining || !code.trim()}
            className="w-full py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-500-dark transition-colors disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
