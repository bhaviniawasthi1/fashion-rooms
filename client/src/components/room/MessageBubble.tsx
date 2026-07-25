import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

function renderContent(content: string) {
  const parts = content.split(/(@@[^@]+@@)/g);
  return parts.map((part, i) => {
    const match = part.match(/^@@([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^@]+)@@$/);
    if (match) {
      const [, id, name, brand, price, image] = match;
      return (
        <div key={i} className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 my-0.5 border border-gray-200/60">
          <img
            src={image}
            alt={name}
            className="w-8 h-8 rounded object-cover shrink-0 bg-gray-100"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <p className="text-xs font-medium leading-tight text-gray-900">{name}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{brand} &middot; ₹{Number(price).toLocaleString()}</p>
          </div>
        </div>
      );
    }
    if (!part) return null;
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwn = message.user?.id === user?.id;
  const isAI = message.user?.id === 'ai-maya';

  if (isAI) {
    return (
      <div className="flex gap-2">
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
            <span className="text-xs text-gray-900 font-bold">AI</span>
          </div>
        </div>
        <div className="max-w-[75%]">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-xs font-semibold bg-pink-500 bg-clip-text text-transparent">
              @Maya
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full font-medium">
              AI Assistant
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-pink-200 text-sm text-gray-900 leading-relaxed rounded-tl-sm">
            {renderContent(message.content)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="shrink-0">
        {message.user?.avatar ? (
          <img src={message.user.avatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-gray-900 ${
            isOwn ? 'bg-pink-400' : 'bg-purple-400'
          }`}>
            {message.user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-baseline gap-2 mb-0.5">
          {!isOwn && (
            <span className="text-xs text-gray-600 font-medium">{message.user?.name}</span>
          )}
          <span className="text-[10px] text-gray-400">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-pink-500 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm'
        }`}>
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  );
}