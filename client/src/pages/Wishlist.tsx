import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { WishlistItem } from '../types';

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/products/wishlist').then((res) => {
      setItems(res.data.items);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  const removeItem = async (wishId: string) => {
    await api.delete(`/products/wishlist/${wishId}`);
    setItems(items.filter((i) => i.wishId !== wishId));
  };

  const moveToCart = async (productId: string) => {
    await api.post('/products/cart/add', { productId });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-gray-600">
        <p className="text-lg mb-4">Your wishlist is empty</p>
        <Link to="/products" className="text-pink-600 hover:text-pink-600 font-medium">
          Browse Products 
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.wishId} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <Link to={`/products/${item.product.id}`} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.product.id}`}>
                <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
              </Link>
              <p className="text-sm text-gray-600">{item.product.brand}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">₹{item.product.price.toLocaleString()}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => moveToCart(item.product.id)}
                  className="text-sm text-pink-600 hover:text-pink-600 font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.wishId)}
                  className="text-sm text-red-400 hover:text-red-400 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

