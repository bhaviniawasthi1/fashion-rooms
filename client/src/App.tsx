import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ChatProvider, useChatContext } from './context/ChatContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import MynCoins from './pages/MynCoins';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import RoomCart from './pages/RoomCart';
import RoomAnalytics from './pages/RoomAnalytics';
import JoinRoom from './pages/JoinRoom';
import Studio from './pages/Studio';

function FloatingChatBubble() {
  const { minimized, activeRoomId, activeRoomName, toggleMinimize } = useChatContext();
  const navigate = useNavigate();
  if (!minimized || !activeRoomId) return null;
  return (
    <button
      onClick={() => { navigate(`/rooms/${activeRoomId}`); toggleMinimize(); }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-pink-500 text-white rounded-full shadow-xl hover:bg-pink-600 hover:scale-105 transition-all z-50 flex items-center justify-center group"
      title={`Open ${activeRoomName} chat`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
        {activeRoomName}
      </span>
    </button>
  );
}

function AppContent() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <ChatProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Home /> : <Login />} />
            <Route path="/products" element={
              <ErrorBoundary fallback={<PageError title="Failed to load products" />}><Products /></ErrorBoundary>
            } />
            <Route path="/products/:id" element={
              <ErrorBoundary fallback={<PageError title="Failed to load product" />}><ProductDetails /></ErrorBoundary>
            } />
            <Route path="/bag" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={
              <ErrorBoundary fallback={<PageError title="Failed to load orders" />}><Orders /></ErrorBoundary>
            } />
            <Route path="/myncoins" element={
              <ErrorBoundary fallback={<PageError title="Failed to load MynCoins" />}><MynCoins /></ErrorBoundary>
            } />
            <Route path="/rooms" element={
              <ErrorBoundary fallback={<PageError title="Failed to load rooms" />}><Rooms /></ErrorBoundary>
            } />
            <Route path="/rooms/:id" element={
              <ErrorBoundary fallback={<PageError title="Failed to load room" />}><RoomDetail /></ErrorBoundary>
            } />
            <Route path="/rooms/:id/cart" element={
              <ErrorBoundary fallback={<PageError title="Failed to load cart" />}><RoomCart /></ErrorBoundary>
            } />
            <Route path="/rooms/:id/analytics" element={
              <ErrorBoundary fallback={<PageError title="Failed to load analytics" />}><RoomAnalytics /></ErrorBoundary>
            } />
            <Route path="/studio" element={<Studio />} />
            <Route path="/join" element={<JoinRoom />} />
          </Routes>
          </main>
          <Footer />
        </div>
        <FloatingChatBubble />
      </ToastProvider>
      </ChatProvider>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function PageError({ title }: { title: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600 px-4">
      <span className="text-5xl mb-4">⚠️</span>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-400">Something went wrong. Try refreshing.</p>
    </div>
  );
}
