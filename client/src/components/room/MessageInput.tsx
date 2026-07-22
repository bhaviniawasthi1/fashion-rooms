import { useState, useRef, useCallback, useEffect } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '✨', '🙌', '💯', '🙏', '🎊', '💪', '😎', '🤞', '🌸', '⭐', '🎈'];

export default function MessageInput({ onSend, onTypingStart, onTypingStop }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content);
    setContent('');
    onTypingStop();
    setShowEmoji(false);
    inputRef.current?.focus();
  }, [content, onSend, onTypingStop]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (e.target.value) {
      onTypingStart();
    } else {
      onTypingStop();
    }
  }, [onTypingStart, onTypingStop]);

  const addEmoji = useCallback((emoji: string) => {
    setContent((prev) => prev + emoji);
    inputRef.current?.focus();
    onTypingStart();
  }, [onTypingStart]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-10 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64 z-50">
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="hover:bg-gray-100 rounded-lg p-1.5 text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-pink-500 text-white p-2.5 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
