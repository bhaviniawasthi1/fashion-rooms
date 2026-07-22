import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AddToRoomModal from './AddToRoomModal';
import LoginPromptModal from './LoginPromptModal';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishId, setWishId] = useState<string | null>(null);
  const [wishToggling, setWishToggling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddToRoom, setShowAddToRoom] = useState(false);
  const [addedToRoom, setAddedToRoom] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const toggledRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    api.get('/products/wishlist').then((res) => {
      if (toggledRef.current) return;
      const found = res.data.items.find((i: any) => i.product.id === product.id);
      if (found) {
        setWishlisted(true);
        setWishId(found.wishId);
      }
    }).catch(() => {});
  }, [user, product.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (wishToggling) return;
    toggledRef.current = true;
    setWishToggling(true);
    try {
      if (wishlisted && wishId) {
        await api.delete(`/products/wishlist/${wishId}`);
        setWishlisted(false);
        setWishId(null);
        showToast('Removed from wishlist', 'info');
      } else {
        const res = await api.post('/products/wishlist/add', { productId: product.id });
        setWishlisted(true);
        setWishId(res.data.wishId);
        showToast('Added to wishlist', 'success');
      }
    } catch {
      showToast('Failed to update wishlist', 'error');
    } finally {
      setWishToggling(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setLoginAction('add items to your cart'); setShowLoginPrompt(true); return; }
    setAddingToCart(true);
    try {
      const res = await api.post('/products/cart/add', { productId: product.id });
      if (res.data.alreadyExists) {
        showToast('Already in cart — quantity increased!', 'warning');
      } else {
        showToast('Added to cart!', 'success');
      }
    } catch {
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToRoom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setLoginAction('add products to a fashion room'); setShowLoginPrompt(true); return; }
    setShowAddToRoom(true);
  };

  const discount = Math.round((1 - product.price / product.original_price) * 100);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 relative"
    >
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {user && (
          <button
            onClick={toggleWishlist}
            className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              wishlisted
                ? 'bg-pink-500 text-white scale-110'
                : 'bg-white/90 text-gray-600 hover:text-pink-600 hover:bg-white'
            }`}
          >
            <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 text-xs font-bold text-gray-900 bg-green-600 px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-base font-bold text-gray-900">{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">{product.original_price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-400 text-xs">⭐</span>
          <span className="text-[11px] text-gray-600">{product.rating}</span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {product.colors.slice(0, 3).map((color) => (
            <span key={color} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{color}</span>
          ))}
          {product.colors.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">+{product.colors.length - 3}</span>
          )}
        </div>
        {user && (
          <button
            onClick={handleAddToRoom}
            className="w-full mt-2 py-2 border border-pink-200 text-pink-600 rounded-lg text-xs font-semibold hover:bg-pink-100 transition-colors"
          >
            {addedToRoom ? ` Added to ${addedToRoom}` : '+ Add to Room'}
          </button>
        )}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="w-full mt-1.5 py-2 bg-pink-500 text-white rounded-lg text-xs font-semibold hover:bg-pink-500-dark transition-colors disabled:opacity-50"
        >
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={`Please login or create an account to ${loginAction}`}
      />
      <AddToRoomModal
        isOpen={showAddToRoom}
        productId={product.id}
        productName={product.name}
        onClose={() => setShowAddToRoom(false)}
        onAdded={(roomName) => {
          setAddedToRoom(roomName);
          setTimeout(() => setAddedToRoom(''), 3000);
          setShowAddToRoom(false);
        }}
      />
    </Link>
  );
}
