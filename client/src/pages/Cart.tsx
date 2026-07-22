import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { CartItem } from '../types';

interface ItemSelection {
  checked: boolean;
  selectedColor: string;
  selectedSize: string;
}

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selections, setSelections] = useState<Record<string, ItemSelection>>({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/products/cart').then((res) => {
      const cartItems: CartItem[] = res.data.items;
      setItems(cartItems);
      const initial: Record<string, ItemSelection> = {};
      cartItems.forEach((item) => {
        initial[item.cartId] = {
          checked: false,
          selectedColor: item.product.colors?.[0] || '',
          selectedSize: item.product.sizes?.[0] || '',
        };
      });
      setSelections(initial);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  const removeItem = async (cartId: string) => {
    await api.delete(`/products/cart/${cartId}`);
    setItems(items.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;
    await api.put(`/products/cart/${cartId}`, { quantity: newQty });
    setItems(items.map((i) => i.cartId === cartId ? { ...i, quantity: newQty } : i));
  };

  const updateSelection = (cartId: string, partial: Partial<ItemSelection>) => {
    setSelections((prev) => ({
      ...prev,
      [cartId]: { ...prev[cartId], ...partial },
    }));
  };

  const handleCheckout = async () => {
    const selected = items.filter((i) => selections[i.cartId]?.checked);
    if (selected.length === 0) return;
    setCheckingOut(true);
    try {
      const cartIds = selected.map((i) => i.cartId);
      await api.post('/products/cart/checkout', { cartIds });
      showToast(`Order placed! ${selected.length} item${selected.length !== 1 ? 's' : ''} purchased.`, 'success');
      navigate('/orders');
    } catch {
      showToast('Checkout failed. Try again.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const selectedItems = items.filter((i) => selections[i.cartId]?.checked);
  const total = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
        <p className="text-lg mb-4">Your bag is empty</p>
        <Link to="/products" className="text-pink-600 hover:text-pink-600 font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Bag</h1>
      <p className="text-sm text-gray-500 mb-6">{items.length} item{items.length !== 1 ? 's' : ''}</p>

      <div className="space-y-4">
        {items.map((item) => {
          const sel = selections[item.cartId] || { checked: false, selectedColor: '', selectedSize: '' };
          return (
            <div
              key={item.cartId}
              className={`flex gap-4 bg-white p-4 rounded-xl shadow-sm border transition-colors ${
                sel.checked ? 'border-pink-300 bg-pink-50/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={sel.checked}
                  onChange={() => updateSelection(item.cartId, { checked: !sel.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                />
              </div>
              <Link to={`/products/${item.product.id}`} className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{item.product.brand}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">₹{item.product.price.toLocaleString()}</p>

                <div className="flex flex-wrap gap-3 mt-2">
                  {item.product.colors && item.product.colors.length > 0 && (
                    <select
                      value={sel.selectedColor}
                      onChange={(e) => updateSelection(item.cartId, { selectedColor: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
                    >
                      {item.product.colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                  {item.product.sizes && item.product.sizes.length > 0 && (
                    <select
                      value={sel.selectedSize}
                      onChange={(e) => updateSelection(item.cartId, { selectedSize: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
                    >
                      {item.product.sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500 mr-1">Qty:</span>
                  <button
                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >−</button>
                  <span className="text-xs font-semibold text-gray-900 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-gray-400 text-sm"
                  >+</button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="text-gray-400 hover:text-red-400 transition-colors self-start"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className={`mt-8 bg-white p-6 rounded-xl shadow-sm border transition-all ${
        selectedItems.length > 0 ? 'border-pink-200' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedItems.length > 0
                ? `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`
                : 'Select items to checkout'}
            </p>
          </div>
          <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
        </div>
        <button
          disabled={selectedItems.length === 0 || checkingOut}
          onClick={handleCheckout}
          className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
            selectedItems.length > 0 && !checkingOut
              ? 'bg-pink-500 text-white hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {checkingOut ? 'Processing...' : selectedItems.length > 0 ? 'Proceed to Checkout' : 'Select Items to Checkout'}
        </button>
      </div>
    </div>
  );
}
