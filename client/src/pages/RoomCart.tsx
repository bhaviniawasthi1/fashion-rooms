import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import VoteArea from '../components/room/VoteArea';
import type { Room } from '../types';

interface SharedCartItem {
  id: string;
  room_id: string;
  product_id: string;
  added_by: string;
  quantity: number;
  added_at: string;
  added_by_name: string;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    original_price: number;
    image: string;
    colors: string[];
    sizes: string[];
  };
}

interface CheckoutStatus {
  total_members: number;
  unique_purchasers: number;
  purchase_percentage: number;
  total_items: number;
  purchased_items: number;
  total_coins_awarded: number;
  purchases: Array<{
    user_name: string;
    product_name: string;
    purchased_at: string;
  }>;
}

interface ItemSelection {
  checked: boolean;
  selectedColor: string;
  selectedSize: string;
}

export default function RoomCart() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<SharedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setCheckoutStatus] = useState<CheckoutStatus | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [selections, setSelections] = useState<Record<string, ItemSelection>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [approvalVotes, setApprovalVotes] = useState<Record<string, { vote_type: string; vote_value: string }[]>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/rooms/${id}`).then((res) => setRoom(res.data.room)).catch(() => navigate('/rooms'));
    loadItems();
    loadCheckoutStatus();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!socket) return;
    const handleItemAdded = (item: SharedCartItem) => {
      setItems((prev) => [item, ...prev]);
      setSelections((prev) => ({
        ...prev,
        [item.id]: { checked: false, selectedColor: item.product.colors?.[0] || '', selectedSize: item.product.sizes?.[0] || '' },
      }));
    };
    const handleItemRemoved = (data: { item_id: string }) => {
      setItems((prev) => prev.filter((i) => i.id !== data.item_id));
      setSelections((prev) => {
        const next = { ...prev };
        delete next[data.item_id];
        return next;
      });
    };
    const handleCheckout = () => loadCheckoutStatus();
    const handleQuantityUpdated = (data: { item_id: string; quantity: number }) => {
      setItems((prev) => prev.map((i) => i.id === data.item_id ? { ...i, quantity: data.quantity } : i));
    };
    socket.on('cart:item_added', handleItemAdded);
    socket.on('cart:item_removed', handleItemRemoved);
    socket.on('cart:quantity_updated', handleQuantityUpdated);
    socket.on('checkout:updated', handleCheckout);
    return () => {
      socket.off('cart:item_added', handleItemAdded);
      socket.off('cart:item_removed', handleItemRemoved);
      socket.off('cart:quantity_updated', handleQuantityUpdated);
      socket.off('checkout:updated', handleCheckout);
    };
  }, [socket]);

  const loadItems = async () => {
    try {
      const res = await api.get(`/rooms/${id}/cart`);
      const cartItems: SharedCartItem[] = res.data.items;
      setItems(cartItems);
      const initial: Record<string, ItemSelection> = {};
      cartItems.forEach((item) => {
        initial[item.id] = {
          checked: false,
          selectedColor: item.product.colors?.[0] || '',
          selectedSize: item.product.sizes?.[0] || '',
        };
      });
      setSelections(initial);
      const votePromises = cartItems.map((item) =>
        api.get(`/rooms/${id}/votes/${item.product_id}`).then((res) => ({
          productId: item.product_id,
          votes: res.data.user_votes,
        })).catch(() => null)
      );
      const results = await Promise.all(votePromises);
      const votesMap: Record<string, { vote_type: string; vote_value: string }[]> = {};
      results.forEach((r) => { if (r) votesMap[r.productId] = r.votes; });
      setApprovalVotes(votesMap);
    } finally { setLoading(false); }
  };

  const loadCheckoutStatus = async () => {
    try {
      const res = await api.get(`/rooms/${id}/checkout`);
      setCheckoutStatus(res.data);
    } catch {}
  };

  const handleRemove = async (itemId: string) => {
    await api.delete(`/rooms/${id}/cart/${itemId}`);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from room cart', 'info');
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    await api.put(`/rooms/${id}/cart/${itemId}`, { quantity: newQty });
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: newQty } : i));
  };

  const updateSelection = (itemId: string, partial: Partial<ItemSelection>) => {
    setSelections((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...partial },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleCheck = (itemId: string) => {
    const sel = selections[itemId];
    if (!sel) return;
    if (!sel.selectedColor || !sel.selectedSize) {
      setErrors((prev) => ({
        ...prev,
        [itemId]: 'Please select color and size before selecting this item',
      }));
      return;
    }
    updateSelection(itemId, { checked: !sel.checked });
  };

  const handlePurchaseAll = async () => {
    const checkedItems = items.filter((i) => selections[i.id]?.checked);
    if (checkedItems.length === 0) return;
    setPurchasing(true);
    for (const item of checkedItems) {
      try {
        await api.post(`/rooms/${id}/checkout`, { productId: item.product_id });
      } catch {
        showToast(`Failed to purchase ${item.product.name}`, 'error');
      }
    }
    showToast(`${checkedItems.length} item${checkedItems.length !== 1 ? 's' : ''} purchased!`, 'success');
    await loadCheckoutStatus();
    setPurchasing(false);
  };

  if (loading || !room) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  const checkedCount = items.filter((i) => selections[i.id]?.checked).length;
  const checkedTotal = items
    .filter((i) => selections[i.id]?.checked)
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(`/rooms/${id}`)} className="text-gray-600 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Room Cart</h1>
          <p className="text-sm text-gray-600">{room.name} · {items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to={`/rooms/${id}/analytics`} className="text-sm text-pink-600 hover:text-pink-600 font-medium">
          View Analytics
        </Link>
      </div>



      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🛒</span>
          <p className="text-lg text-gray-600 mb-2">No products in room cart yet</p>
          <p className="text-sm text-gray-600 mb-6">Browse products and add them to this room</p>
          <Link to="/products" className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const sel = selections[item.id] || { checked: false, selectedColor: '', selectedSize: '' };
            const err = errors[item.id];
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-colors ${
                  sel.checked ? 'border-pink-300 bg-pink-50/50' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-3 p-3">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={sel.checked}
                      onChange={() => handleCheck(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 shrink-0"
                    />
                  </div>
                  <Link to={`/products/${item.product.id}`} className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">{item.product.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400">{item.product.brand}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">₹{item.product.price.toLocaleString()}</p>
                    {/* Personal color & size selection */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.product.colors && item.product.colors.length > 0 && (
                        <select
                          value={sel.selectedColor}
                          onChange={(e) => updateSelection(item.id, { selectedColor: e.target.value })}
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
                          onChange={(e) => updateSelection(item.id, { selectedSize: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
                        >
                          {item.product.sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {/* Room voting buttons */}
                    <div className="mt-2">
                      <VoteArea productId={item.product_id} roomId={id!} product={item.product} hideApproval />
                    </div>
                    {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 min-w-[60px]">
                    {(room.is_owner || item.added_by === user?.id) && (
                      <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors p-0.5 self-end">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 text-center whitespace-nowrap">Added by {item.added_by_name}</p>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                      >−</button>
                      <span className="text-xs font-semibold text-gray-900 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-300 text-xs"
                      >+</button>
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-400">Approve?</span>
                      <div className="flex gap-2">
                        {(['👍', '👎'] as const).map((emoji) => {
                          const voted = approvalVotes[item.product_id]?.some(v => v.vote_type === 'approval' && v.vote_value === emoji);
                          return (
                            <button
                              key={emoji}
                              onClick={async () => {
                                const res = await api.post(`/rooms/${id}/vote`, { productId: item.product_id, voteType: 'approval', voteValue: emoji });
                                setApprovalVotes((prev) => ({ ...prev, [item.product_id]: res.data.vote.votes }));
                              }}
                              className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg border-2 transition-all ${
                                voted
                                  ? emoji === '👍' ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-red-50 border-red-300 shadow-sm'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >{emoji}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkedCount > 0 && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-gray-900">Checkout Summary</span>
              <p className="text-xs text-gray-500 mt-0.5">{checkedCount} item{checkedCount !== 1 ? 's' : ''} selected</p>
            </div>
            <span className="text-2xl font-bold text-gray-900">₹{checkedTotal.toLocaleString()}</span>
          </div>
          <button
            onClick={handlePurchaseAll}
            disabled={purchasing}
            className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {purchasing ? 'Processing...' : `Purchase Selected (${checkedCount})`}
          </button>
        </div>
      )}
    </div>
  );
}
