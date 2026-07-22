import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { OrderItem } from '../types';

export default function Orders() {
  const { user } = useAuth();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/orders').then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600 px-4">
        <span className="text-5xl mb-4">📋</span>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Login to view your Orders</h2>
        <p className="text-sm text-gray-400 mb-4">Sign in to see your purchases.</p>
        <Link to="/login" className="bg-pink-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 px-4">
        <span className="text-5xl block mb-3">🛍️</span>
        <p className="text-sm mb-1">No orders yet.</p>
        <p className="text-xs text-gray-400 mb-4">Purchases made from shared carts will appear here.</p>
        <Link to="/rooms" className="bg-pink-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors">Browse Rooms</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.checkout_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Top bar — room context */}
            {item.room_name && (
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50/50 flex items-center gap-2 text-xs text-gray-500">
                <span>🛒</span>
                <Link to={`/rooms/${item.room_id}`} className="font-medium text-gray-700 hover:text-pink-600 hover:underline">
                  {item.room_name}
                </Link>
                {item.room_occasion && (
                  <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">{item.room_occasion}</span>
                )}
              </div>
            )}

            {/* Item row */}
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${item.product_id}`} className="text-sm font-semibold text-gray-900 hover:text-pink-600 transition-colors line-clamp-1">{item.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                  {item.original_price > item.price && (
                    <span className="text-xs text-gray-400 line-through">₹{item.original_price.toLocaleString('en-IN')}</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">Qty: {item.quantity}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">
                    {new Date(item.purchased_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {item.coins_awarded > 0 && (
                    <span className="text-xs font-medium text-pink-600">
                      💰 +{item.coins_awarded.toLocaleString('en-IN')} coins
                      {item.coins_expiry && (
                        <span className="text-gray-400 font-normal">
                          {' '}exp {new Date(item.coins_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
