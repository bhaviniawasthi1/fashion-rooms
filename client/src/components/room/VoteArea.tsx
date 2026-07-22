import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { VoteType, VoteCount } from '../../types';

interface VoteAreaProps {
  roomId: string;
  productId: string;
  product: {
    colors: string[];
    sizes: string[];
  };
  hideApproval?: boolean;
}


export default function VoteArea({ roomId, productId, product, hideApproval }: VoteAreaProps) {
  const { user: _user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [counts, setCounts] = useState<VoteCount[]>([]);
  const [userVotes, setUserVotes] = useState<{ vote_type: VoteType; vote_value: string }[]>([]);

  useEffect(() => {
    api.get(`/rooms/${roomId}/votes/${productId}`).then((res) => {
      setCounts(res.data.counts);
      setUserVotes(res.data.user_votes);
    });
  }, [roomId, productId]);

  useEffect(() => {
    if (!socket) return;

    const handleVoteUpdated = (data: { product_id: string; counts: VoteCount[] }) => {
      if (data.product_id === productId) {
        setCounts(data.counts);
      }
    };

    socket.on('vote:updated', handleVoteUpdated);
    return () => { socket.off('vote:updated', handleVoteUpdated); };
  }, [socket, productId]);

  const castVote = useCallback(async (voteType: VoteType, voteValue: string) => {
    try {
      const res = await api.post(`/rooms/${roomId}/vote`, { productId, voteType, voteValue });
      const wasToggled = userVotes.some(v => v.vote_type === voteType && v.vote_value === voteValue);
      showToast(wasToggled ? 'Vote removed' : `Voted ${voteValue}`, 'success');
      setCounts(res.data.counts);
      setUserVotes(res.data.vote.votes);
    } catch {
      showToast('Failed to cast vote', 'error');
    }
  }, [roomId, productId, userVotes, showToast]);

  const hasVoted = (voteType: VoteType, value: string) =>
    userVotes.some(v => v.vote_type === voteType && v.vote_value === value);

  const getCountFor = (voteType: VoteType, value: string): number => {
    const typeCount = counts.find(c => c.vote_type === voteType);
    return typeCount?.values[value] || 0;
  };

  return (
    <div className="mt-3 space-y-2">
      {!hideApproval && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-16 shrink-0">Approval</span>
          {['👍', '👎'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => castVote('approval', emoji)}
              className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                hasVoted('approval', emoji)
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-200'
              }`}
            >
              {emoji} {getCountFor('approval', emoji) > 0 && getCountFor('approval', emoji)}
            </button>
          ))}
        </div>
      )}

      {/* Color Voting */}
      {product.colors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-16 shrink-0">Color</span>
          <div className="flex gap-1.5 flex-wrap">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => castVote('color', color)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  hasVoted('color', color)
? 'bg-pink-50 border-pink-200 text-pink-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-200'
                }`}
              >
                {color} {getCountFor('color', color) > 0 && `(${getCountFor('color', color)})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Voting */}
      {product.sizes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-16 shrink-0">Size</span>
          <div className="flex gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => castVote('size', size)}
                className={`w-9 h-9 rounded-lg text-xs font-medium border transition-all ${
                  hasVoted('size', size)
? 'bg-pink-50 border-pink-200 text-pink-600'
                : 'border-gray-200 text-gray-600 hover:border-gray-200'
                }`}
              >
                {size}
                {getCountFor('size', size) > 0 && (
                  <span className="block text-[9px]">{getCountFor('size', size)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
