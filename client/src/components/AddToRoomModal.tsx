import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Room } from '../types';

interface AddToRoomModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  onClose: () => void;
  onAdded: (roomName: string) => void;
}

export default function AddToRoomModal({ isOpen, productId, productName, onClose, onAdded }: AddToRoomModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/rooms').then((res) => setRooms(res.data.rooms));
      setSelectedRooms(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { showToast } = useToast();

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedRooms.size === 0) return;
    setAdding(true);
    let successCount = 0;
    for (const roomId of selectedRooms) {
      try {
        const room = rooms.find((r) => r.id === roomId);
        const res = await api.post(`/rooms/${roomId}/cart/add`, { productId });
        if (room) {
          if (res.data.alreadyExists) {
            showToast(`Quantity increased in ${room.name}`, 'warning');
          } else {
            showToast(`Added to ${room.name}`, 'success');
          }
          onAdded(room.name);
        }
        successCount++;
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Failed to add to room';
        showToast(msg, 'warning');
      }
    }
    setAdding(false);
    if (successCount > 0) onClose();
  };

  const activeRooms = rooms.filter((r) => r.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Add to Fashion Room</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Select rooms to add "{productName}"</p>
        </div>

        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {activeRooms.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active rooms. Create one first!</p>
          ) : (
            activeRooms.map((room) => (
              <label
                key={room.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRooms.has(room.id)
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRooms.has(room.id)}
                  onChange={() => toggleRoom(room.id)}
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                />
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-base shrink-0">
                  {room.occasion === 'Wedding' ? '💒' : room.occasion === 'Trip' ? '✈️' : room.occasion === 'Party' ? '🎉' : '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                  <p className="text-xs text-gray-500">{room.member_count} members · {room.occasion}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedRooms.size === 0 || adding}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              selectedRooms.size === 0 || adding
                ? 'bg-pink-200 text-white cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            {adding ? 'Adding...' : `Add (${selectedRooms.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
