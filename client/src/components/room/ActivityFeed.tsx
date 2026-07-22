import { useActivities } from '../../hooks/useActivities';

interface ActivityFeedProps {
  roomId: string;
}

const actionLabels: Record<string, string> = {
  room_created: 'created the room',
  member_joined: 'joined the room',
  member_left: 'left the room',
  product_added: 'added a product',
  product_removed: 'removed a product',
  vote_cast: 'voted',
  ai_suggestion: 'AI suggested',
  checkout_completed: 'completed checkout',
  room_expired: 'room ended',
  message_sent: 'sent a message',
};

const actionIcons: Record<string, string> = {
  room_created: '🎉',
  member_joined: '👋',
  member_left: '👋',
  product_added: '➕',
  product_removed: '➖',
  vote_cast: '👍',
  ai_suggestion: '🤖',
  checkout_completed: '✅',
  room_expired: '⏰',
  message_sent: '💬',
};

export default function ActivityFeed({ roomId }: ActivityFeedProps) {
  const { activities, loading } = useActivities(roomId);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4">
              {activities.slice(0, 30).map((activity, idx) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className="relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm ${
                      idx === 0 ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {actionIcons[activity.action_type] || ''}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-gray-600">
                      {activity.user && (
                        <span className="font-semibold text-gray-900">{activity.user.name} </span>
                      )}
                      <span className="text-gray-600">{actionLabels[activity.action_type] || activity.action_type}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
