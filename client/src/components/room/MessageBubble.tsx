import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

function renderContent(content: string, isOwn: boolean) {
  let text = content;
  let productRef: { id: string; name: string; brand: string; price: number; image: string } | null = null;

  const refIdx = content.indexOf(' ‣‣');
  if (refIdx !== -1) {
    text = content.slice(0, refIdx);
    const raw = content.slice(refIdx + 4);
    const parts = raw.split('|');
    if (parts.length >= 5) {
      productRef = { id: parts[0], name: parts[1], brand: parts[2], price: Number(parts[3]), image: parts.slice(4).join('|') };
    }
  }

  return (
    <>
      {productRef && (
        <div className={`flex items-stretch gap-2.5 mb-1.5 p-1.5 -mx-1 rounded-lg ${isOwn ? 'bg-pink-400/20' : 'bg-gray-50'}`}>
          <div className={`w-0.5 shrink-0 rounded-full ${isOwn ? 'bg-white/60' : 'bg-gray-300'}`} />
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={productRef.image}
              alt={productRef.name}
              className="w-8 h-8 rounded object-cover shrink-0 bg-gray-100"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="min-w-0">
              <p className={`text-xs font-semibold leading-tight truncate ${isOwn ? 'text-white/90' : 'text-gray-800'}`}>{productRef.name}</p>
              <p className={`text-[11px] leading-tight ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>{productRef.brand} &middot; ₹{productRef.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      {text && <span>{text}</span>}
    </>
  );
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
            {renderContent(message.content, false)}
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
          {renderContent(message.content, isOwn)}
        </div>
      </div>
    </div>
  );
}