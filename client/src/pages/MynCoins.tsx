import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { MynCoin } from '../types';

export default function MynCoins() {
  const { user } = useAuth();
  const [coins, setCoins] = useState<MynCoin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/myncoins').then((res) => {
      setTotal(typeof res.data?.total_coins === 'number' ? res.data.total_coins : 0);
      setCoins(Array.isArray(res.data?.coins) ? res.data.coins : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600 px-4">
        <span className="text-5xl mb-4">💰</span>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Login to view your MynCoins</h2>
        <p className="text-sm text-gray-400 mb-4">Sign in to see your rewards from group shopping.</p>
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

  const activeCoins = coins.filter((c) => !c.expired);
  const expiredCoins = coins.filter((c) => c.expired);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 md:p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm font-medium uppercase tracking-wider">Your Balance</p>
            <p className="text-4xl md:text-5xl font-bold mt-1">{total.toLocaleString('en-IN')}</p>
            <p className="text-pink-200 text-sm mt-1">MynCoins</p>
            <p className="text-pink-300 text-xs mt-0.5">≈ ₹{(total / 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })} value</p>
          </div>
          <span className="text-6xl opacity-60">💰</span>
        </div>
        <p className="text-pink-100 text-xs mt-4 border-t border-white/20 pt-3">
          10 MynCoins = ₹1 &middot; Coins expire 2 months after being awarded
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">How to earn</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Join a Fashion Room and add products to the shared cart.</span>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Purchase items from the cart — each member pays for what they want delivered to their address.</span>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>When <strong>75%+ of room members</strong> have purchased, each buying member earns <strong>1 MynCoin per rupee spent</strong> (e.g. ₹1,999 = 1,999 coins).</span>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
            <span>Coins are valid for <strong>2 months</strong> from the reward date. <strong>10 MynCoins = ₹1</strong> in value.</span>
          </div>
        </div>
      </div>

      {/* Active coins */}
      {activeCoins.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Active Coins ({activeCoins.length})</h3>
          <div className="space-y-2">
            {activeCoins.map((coin) => (
              <div key={coin.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{coin.room_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Expires {new Date(coin.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-lg font-bold text-pink-600">+{coin.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">coins</p>
                  <p className="text-xs text-pink-400">≈ ₹{(coin.amount / 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired coins */}
      {expiredCoins.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Expired ({expiredCoins.length})</h3>
          <div className="space-y-2">
            {expiredCoins.map((coin) => (
              <div key={coin.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between opacity-60">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-500 truncate">{coin.room_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Expired {new Date(coin.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-lg font-bold text-gray-400">{coin.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">coins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {coins.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-3">🛍️</span>
          <p className="text-sm">No MynCoins yet. Join a room and shop together to earn!</p>
          <Link to="/rooms" className="inline-block mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors">Browse Rooms</Link>
        </div>
      )}
    </div>
  );
}

