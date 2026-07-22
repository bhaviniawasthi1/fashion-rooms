import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AddToRoomModal from '../components/AddToRoomModal';
import LoginPromptModal from '../components/LoginPromptModal';
import type { Product } from '../types';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAddToRoom, setShowAddToRoom] = useState(false);
  const [addedToRoom, setAddedToRoom] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data.product);
      if (res.data.product.colors.length > 0) setSelectedColor(res.data.product.colors[0]);
      if (res.data.product.sizes.length > 0) setSelectedSize(res.data.product.sizes[0]);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { setLoginAction('add items to your cart'); setShowLoginPrompt(true); return; }
    try {
      const res = await api.post('/products/cart/add', { productId: id });
      setAddedToCart(true);
      if (res.data.alreadyExists) {
        showToast('Already in cart — quantity increased!', 'warning');
      } else {
        showToast('Added to cart!', 'success');
      }
      setTimeout(() => setAddedToCart(false), 3000);
    } catch {
      showToast('Failed to add to cart', 'error');
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  const discount = Math.round((1 - product.price / product.original_price) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-600 mb-4 flex items-center gap-1">
        ← Back
      </button>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedImage ? 'border-pink-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              <span className="text-lg text-gray-600 line-through">₹{product.original_price.toLocaleString()}</span>
              {discount > 0 && (
                <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded">{discount}% OFF</span>
              )}
            </div>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

          {product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Colors: <span className="font-normal text-gray-600">{selectedColor}</span></h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      selectedColor === color
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Size: <span className="font-normal text-gray-600">{selectedSize}</span></h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-sm font-medium border transition-all ${
                      selectedSize === size
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-pink-500 text-white hover:bg-pink-700'
              }`}
            >
              {addedToCart ? '✅ Added to Cart' : 'Add to Cart'}
            </button>
            {user && (
              <button
                onClick={() => setShowAddToRoom(true)}
                className="flex-1 py-3 rounded-xl font-semibold border-2 border-pink-200 text-pink-600 hover:bg-pink-50 transition-all"
              >
                {addedToRoom ? `✅ Added to ${addedToRoom}` : 'Add to Fashion Room'}
              </button>
            )}
          </div>
        </div>
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
        }}
      />
    </div>
  );
}

