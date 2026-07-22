import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

interface Recommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number;
  image: string;
  category: string;
  rating: number;
  reason: string;
}

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    api.get('/products?sort=rating').then((res) => {
      setProducts(res.data.products.slice(0, 8));
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/recommendations').then((res) => {
      setRecommendations(res.data.recommendations);
    }).catch(() => {});
    api.get('/rooms/rewards').then((res) => {
      setCoins(typeof res.data?.total_coins === 'number' ? res.data.total_coins : 0);
    }).catch(() => {});
  }, [user]);

  const slides = [
    {
      tag: '🔥 New Feature',
      title: 'Fashion Rooms',
      subtitle: 'Shop Together, Decide Together',
      description: 'Create private rooms, invite friends, browse products in sync, chat in real-time, and build the perfect group cart. Fashion is better when it\'s shared.',
      cta: 'Create a Room',
      ctaLink: '/rooms',
      color: 'from-pink-600 to-purple-700',
      accent: 'text-pink-200',
      icon: '🛍️',
    },
    {
      tag: '🤖 AI Powered',
      title: 'Meet @Maya',
      subtitle: 'Your AI Fashion Stylist',
      description: 'Get real-time outfit recommendations, style advice, and trend tips from Maya — built on intelligent AI that learns your taste and helps your group decide faster.',
      cta: 'Try AI Stylist',
      ctaLink: '/rooms',
      color: 'from-violet-600 to-indigo-700',
      accent: 'text-violet-200',
      icon: '✨',
    },
    {
      tag: '🏆 Hackathon Edge',
      title: 'Vote & Earn',
      subtitle: 'Gamified Group Shopping',
      description: 'Vote on products as a room, build a shared cart with dupe detection, and earn MynCoins when your group purchases together. Collaborative commerce reimagined.',
      cta: 'Explore Products',
      ctaLink: '/products',
      color: 'from-rose-600 to-pink-700',
      accent: 'text-rose-200',
      icon: '💰',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <section className={`bg-gradient-to-r ${slides[currentSlide].color} text-white transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                {slides[currentSlide].icon} {slides[currentSlide].tag}
              </span>
              {user && coins > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold">
                  💰 {coins.toLocaleString('en-IN')} MynCoins
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {slides[currentSlide].title}<br />
              <span className={slides[currentSlide].accent}>{slides[currentSlide].subtitle}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80">
              {slides[currentSlide].description}
            </p>
            <div className="flex gap-3 mt-8">
              <Link
                to={slides[currentSlide].ctaLink}
                className="bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors shadow-lg"
              >
                {slides[currentSlide].cta}
              </Link>
              <Link
                to="/products"
                className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Browse All
              </Link>
            </div>
            <div className="flex gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {user && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Smart Picks For You</h2>
              <p className="text-sm text-gray-600 mt-1">
                Based on your fashion rooms ✨ {recommendations[0]?.reason?.toLowerCase()}
              </p>
            </div>
            <Link to="/products" className="text-pink-600 hover:text-pink-600 font-medium">
              View All 
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/products/${rec.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg hover:shadow-black/20 transition-all duration-300 overflow-hidden border border-gray-200"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">{rec.brand}</p>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">{rec.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{rec.price.toLocaleString()}</p>
                  <p className="text-xs text-pink-600 mt-1">{rec.reason}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Top Rated Products</h2>
          <Link to="/products" className="text-pink-600 hover:text-pink-600 font-medium transition-colors">
            View All 
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Create a Room', desc: 'Start a fashion room for any occasion and invite your friends.', icon: '🛍️' },
              { title: 'Add & Vote', desc: 'Browse products together, add them to the room, and vote as a group.', icon: '👍' },
{ title: 'AI Stylist', desc: 'Get real-time AI suggestions from @Maya, your personal fashion assistant.', icon: '🤖' },
              { title: 'Earn Rewards', desc: 'Shop together and earn MynCoins when your group purchases together.', icon: '💰' },
            ].map((step) => (
              <div key={step.title} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <span className="text-4xl">{step.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-4">{step.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

