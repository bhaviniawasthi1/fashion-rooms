import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onInvite: (room: Room) => void;
}

const occasionEmojis: Record<string, string> = {
  Wedding: '💒',
  Trip: '✈️',
  Party: '🎉',
  College: '🎓',
  Office: '💼',
  Festival: '🎊',
  Birthday: '🎂',
  Casual: '👕',
  Date: '💕',
  Vacation: '🌴',
};

const occasionColors: Record<string, string> = {
  Wedding: 'from-pink-400 to-rose-500',
  Trip: 'from-sky-400 to-blue-500',
  Party: 'from-purple-400 to-violet-500',
  College: 'from-orange-400 to-amber-500',
  Office: 'from-slate-400 to-gray-500',
  Festival: 'from-green-400 to-emerald-500',
  Birthday: 'from-yellow-400 to-amber-500',
  Casual: 'from-teal-400 to-cyan-500',
  Date: 'from-red-400 to-pink-500',
  Vacation: 'from-indigo-400 to-purple-500',
};

export default function RoomCard({ room, onInvite }: RoomCardProps) {
  const navigate = useNavigate();
  const emoji = occasionEmojis[room.occasion] || '';
  const gradient = occasionColors[room.occasion] || 'from-gray-400 to-gray-500';
  const isExpired = room.status === 'expired';
  const daysLeft = Math.ceil((new Date(room.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleClick = () => {
    if (!isExpired) navigate(`/rooms/${room.id}`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${isExpired ? 'opacity-75' : 'hover:shadow-md cursor-pointer'}`}>
      <div onClick={handleClick} className={`bg-gradient-to-r ${gradient} p-4 text-gray-900`}>
        <div className="flex items-center justify-between">
          <span className="text-3xl">{emoji}</span>
          {isExpired ? (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Ended</span>
          ) : daysLeft <= 1 ? (
            <span className="text-xs bg-red-400/30 px-2 py-1 rounded-full">Ending Soon</span>
          ) : (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{daysLeft}d left</span>
          )}
        </div>
        <h3 className="text-lg font-bold mt-2">{room.name}</h3>
        <p className="text-sm text-gray-900/80">{room.occasion}</p>
      </div>

      <div className="p-4 space-y-3">
        <div onClick={handleClick} className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{room.member_count}</span> member{room.member_count !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-600">
            by <span className="font-medium text-gray-600">{room.owner_name}</span>
          </span>
        </div>

        <div onClick={handleClick} className="flex items-center justify-between text-xs text-gray-400">
          <span>Created {new Date(room.created_at).toLocaleDateString()}</span>
          <span>Valid till {new Date(room.expires_at).toLocaleDateString()}</span>
        </div>

        {!isExpired && room.is_owner && (
          <button
            onClick={(e) => { e.stopPropagation(); onInvite(room); }}
            className="w-full mt-2 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
          >
            Share Invite
          </button>
        )}

        {!isExpired && !room.is_owner && (
          <button
            onClick={handleClick}
            className="w-full mt-2 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-500-dark transition-colors"
          >
            Open Room
          </button>
        )}
      </div>
    </div>
  );
}
