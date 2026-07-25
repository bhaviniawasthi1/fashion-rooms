import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../../lib/api';

interface ProductRefItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
  };
}

interface MessageInputProps {
  roomId: string;
  onSend: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '✨', '🙌', '💯', '🙏', '🎊', '💪', '😎', '🤞', '🌸', '⭐', '🎈'];

export default function MessageInput({ roomId, onSend, onTypingStart, onTypingStop }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [cartItems, setCartItems] = useState<ProductRefItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setShowProductPicker(false);
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
    setShowProductPicker(false);
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

  const openProductPicker = useCallback(async () => {
    if (cartItems.length > 0) {
      setShowProductPicker((prev) => !prev);
      return;
    }
    setLoadingProducts(true);
    try {
      const res = await api.get(`/rooms/${roomId}/cart`);
      setCartItems(res.data.items || []);
      setShowProductPicker(true);
    } catch {
      // silent
    } finally {
      setLoadingProducts(false);
    }
  }, [roomId, cartItems]);

  const insertProductRef = useCallback((item: ProductRefItem) => {
    const p = item.product;
    const ref = `@@${p.id}|${p.name}|${p.brand}|${p.price}|${p.image}@@`;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? content.length;
      const end = input.selectionEnd ?? content.length;
      const next = content.slice(0, start) + ref + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        input.focus();
        const pos = start + ref.length;
        input.selectionStart = input.selectionEnd = pos;
      });
    } else {
      setContent((prev) => prev + ref);
    }
    setShowProductPicker(false);
    onTypingStart();
  }, [content, onTypingStart]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={openProductPicker}
            className="text-gray-400 hover:text-pink-500 transition-colors p-1"
            title="Tag a product from the room cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
          {showProductPicker && (
            <div ref={productRef} className="absolute bottom-10 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72 z-50">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tag a product</p>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500" />
                </div>
              ) : cartItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No products in the room cart yet</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {cartItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => insertProductRef(item)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 transition-colors text-left"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.brand} &middot; ₹{item.product.price.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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