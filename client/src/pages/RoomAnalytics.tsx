import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Room } from '../types';

interface Analytics {
  most_active_member: { name: string; actions: number } | null;
  most_loved_color: { color: string; votes: number } | null;
  favorite_brand: { brand: string; count: number } | null;
  most_voted_product: { name: string; total_votes: number } | null;
  activity_score: number;
  total_messages: number;
  total_votes: number;
  total_products: number;
}

export default function RoomAnalytics() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/rooms/${id}`).then((res) => setRoom(res.data.room)).catch(() => navigate('/rooms'));
    api.get(`/rooms/${id}/analytics`).then((res) => setAnalytics(res.data.analytics)).finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading || !room || !analytics) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Activity Score', value: analytics.activity_score, icon: '⚡', desc: 'actions per day' },
    { label: 'Messages', value: analytics.total_messages, icon: '💬', desc: 'total chat messages' },
    { label: 'Votes Cast', value: analytics.total_votes, icon: '🗳️', desc: 'total votes' },
    { label: 'Products', value: analytics.total_products, icon: '🛒', desc: 'in room cart' },
  ];

  const insights = [
    { label: 'Most Active Member', value: analytics.most_active_member?.name || 'N/A', detail: `${analytics.most_active_member?.actions || 0} actions`, icon: '👑' },
    { label: 'Most Loved Color', value: analytics.most_loved_color?.color || 'N/A', detail: `${analytics.most_loved_color?.votes || 0} votes`, icon: '🎨' },
    { label: 'Favorite Brand', value: analytics.favorite_brand?.brand || 'N/A', detail: `${analytics.favorite_brand?.count || 0} items added`, icon: '🏷️' },
    { label: 'Most Voted Product', value: analytics.most_voted_product?.name || 'N/A', detail: `${analytics.most_voted_product?.total_votes || 0} total votes`, icon: '⭐' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(`/rooms/${id}`)} className="text-gray-600 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Analytics</h1>
          <p className="text-sm text-gray-600">{room.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-600">{stat.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div key={insight.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">{insight.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{insight.value}</p>
                <p className="text-sm text-gray-600">{insight.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

