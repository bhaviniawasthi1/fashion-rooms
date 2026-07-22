import type { Message } from '../../types';

interface SystemMessageProps {
  message: Message;
}

export default function SystemMessage({ message }: SystemMessageProps) {
  const getIcon = () => {
    const content = message.content.toLowerCase();
    if (content.includes('joined')) return '';
    if (content.includes('left') || content.includes('removed')) return '';
    if (content.includes('created')) return '';
    if (content.includes('added')) return '';
    if (content.includes('vot')) return '';
    if (content.includes('checkout')) return '';
    if (content.includes('ai') || content.includes('suggest')) return '';
    return '';
  };

  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full">
        <span className="text-sm">{getIcon()}</span>
        <span className="text-xs text-gray-600 italic">{message.content}</span>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>
    </div>
  );
}
