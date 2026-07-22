import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { RoomMember } from '../../types';

interface MembersListProps {
  roomId: string;
  isOnline: (userId: string) => boolean;
}

export default function MembersList({ roomId, isOnline }: MembersListProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    api.get(`/rooms/${roomId}/members`).then((res) => setMembers(res.data.members));
  }, [roomId]);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <span>Members ({members.length})</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 py-1.5">
              <div className="relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-gray-900 ${
                  member.role === 'owner' ? 'bg-amber-400' : 'bg-purple-400'
                }`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isOnline(member.user_id) ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-600 truncate block">
                  {member.name}
                  {member.user_id === user?.id && <span className="text-gray-400 ml-1">(you)</span>}
                </span>
              </div>
              {member.role === 'owner' && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Owner</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
