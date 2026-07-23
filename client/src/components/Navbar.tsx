import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Men', path: '/products?category=Men' },
  { name: 'Women', path: '/products?category=Women' },
  { name: 'Kids', path: '/products?category=Kids' },
  { name: 'Home', path: '/products?category=Home' },
  { name: 'Beauty', path: '/products?category=Beauty' },
  { name: 'GenZ', path: '/products?category=GenZ' },
  { name: 'Studio', path: '/studio' },
  { name: 'Rooms', path: '/rooms' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const roomsActive = location.pathname.startsWith('/rooms');
  const isCategoryActive = (name: string) => {
    if (name === 'Rooms') return roomsActive;
    return location.search.includes(`category=${name}`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="Fashion Rooms" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-pink-600">Fashion</span>
              <span className="text-gray-900"> Rooms</span>
            </span>
          </Link>

          {/* Categories - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`px-3 py-1.5 text-sm font-semibold uppercase tracking-wider rounded transition-colors ${
                  isCategoryActive(cat.name)
                    ? 'text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.name === 'Rooms' ? <>Rooms<sup className="text-[8px] text-pink-600 ml-0.5">NEW</sup></> : cat.name}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className={`hidden sm:block ${user ? 'max-w-lg' : 'flex-1 max-w-lg ml-auto'}`}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-gray-100 text-gray-900 text-sm rounded-md pl-9 pr-3 py-2 border border-gray-200 focus:border-pink-500 outline-none transition-colors placeholder:text-gray-400"
              />
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right icons */}
          <div className={`flex items-center ${user ? 'gap-1 ml-auto' : 'gap-3 ml-auto'}`}>
            {user ? (
              <>
                {/* Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex flex-col items-center gap-0.5 px-3 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-semibold tracking-wider">PROFILE</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">Hello <span className="text-pink-600">{user.name}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5">9876543210</p>
                      </div>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Wishlist
                      </Link>
                      <Link to="/myncoins" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        MynCoins
                      </Link>
                      <div className="border-t border-gray-200 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-100 transition-colors w-full text-left">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <Link to="/wishlist" className="flex flex-col items-center gap-0.5 px-3 text-gray-600 hover:text-gray-900 transition-colors" title="Wishlist">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs font-semibold tracking-wider">WISHLIST</span>
                </Link>

                {/* Bag */}
                <Link to="/bag" className="flex flex-col items-center gap-0.5 px-3 text-gray-600 hover:text-gray-900 transition-colors" title="Bag">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs font-semibold tracking-wider">BAG</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/wishlist" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors" title="Wishlist">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs font-semibold tracking-wider">WISHLIST</span>
                </Link>
                <Link to="/login" className="text-sm font-semibold text-white bg-pink-500 px-4 py-1.5 rounded hover:bg-pink-500-dark transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="sm:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full bg-gray-100 text-gray-900 text-sm rounded-md pl-9 pr-3 py-2 border border-gray-200 focus:border-pink-500 outline-none transition-colors placeholder:text-gray-400"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden pb-3 space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2 text-sm font-medium rounded transition-colors ${
                  isCategoryActive(cat.name)
                    ? 'text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat.name === 'Rooms' ? <>Rooms<sup className="text-[8px] text-pink-600 ml-0.5">NEW</sup></> : cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
