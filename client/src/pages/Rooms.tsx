import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import InviteModal from '../components/InviteModal';
import { RoomCardSkeleton } from '../components/Skeleton';
import { MAX_ROOMS_PER_USER } from '../types';
import type { Room } from '../types';

export default function Rooms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteRoom, setInviteRoom] = useState<Room | null>(null);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadRooms();
  }, [user, navigate]);

  const loadRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = useCallback((room: Room, link: string) => {
    setShowCreateModal(false);
    setRooms((prev) => [room, ...prev]);
    setInviteRoom(room);
    setInviteLink(link);
  }, []);

  const handleInvite = useCallback((room: Room) => {
    const link = `${window.location.origin}/join?code=${room.invite_code}`;
    setInviteRoom(room);
    setInviteLink(link);
  }, []);

  const canCreate = rooms.length < MAX_ROOMS_PER_USER;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 bg-gray-100 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-24 mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <RoomCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fashion Rooms</h1>
          <p className="text-gray-600 mt-1">
            {rooms.length} of {MAX_ROOMS_PER_USER} rooms
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canCreate && rooms.length > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Room limit reached</span>
          )}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Join Room
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Room
            </button>
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
<div className="text-6xl mb-4">🏠</div>
          <p className="text-lg text-gray-600 mb-2">No fashion rooms yet</p>
          <p className="text-sm text-gray-600 mb-6">
            Create a room to start shopping with friends
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
            >
              Create Your First Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onInvite={handleInvite} />
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

      {inviteRoom && (
        <InviteModal
          room={inviteRoom}
          inviteLink={inviteLink}
          onClose={() => { setInviteRoom(null); setInviteLink(''); }}
        />
      )}
    </div>
  );
}

