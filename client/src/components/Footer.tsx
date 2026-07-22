import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              <span className="text-pink-500">Fashion</span> Rooms
            </h3>
            <p className="text-sm leading-relaxed">
              Collaborative fashion shopping reimagined. Create rooms, invite friends, vote on products, and shop together with AI-powered style recommendations.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/products?category=Men" className="block hover:text-white transition-colors">Men</Link>
              <Link to="/products?category=Women" className="block hover:text-white transition-colors">Women</Link>
              <Link to="/products?category=Kids" className="block hover:text-white transition-colors">Kids</Link>
              <Link to="/products?category=Home" className="block hover:text-white transition-colors">Home</Link>
              <Link to="/products?category=Beauty" className="block hover:text-white transition-colors">Beauty</Link>
              <Link to="/products?category=GenZ" className="block hover:text-white transition-colors">GenZ</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Features</h4>
            <div className="space-y-2 text-sm">
              <Link to="/rooms" className="block hover:text-white transition-colors">Fashion Rooms</Link>
              <Link to="/products" className="block hover:text-white transition-colors">Shop Products</Link>
              <Link to="/rooms" className="block hover:text-white transition-colors">AI Stylist @Maya</Link>
              <Link to="/studio" className="block hover:text-white transition-colors">Fashion Studio</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Team Hibiscus</h4>
            <p className="text-sm leading-relaxed mb-3">
              Built for a hackathon by <span className="text-white">Team Hibiscus</span>
            </p>
            <ul className="text-sm space-y-2">
              <li><p className="text-white">Bhavini Awasthi</p></li>
              <li><p className="text-white">Honey Priya</p></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; 2026 Team Hibiscus. Built for hackathon demonstration.</p>
          <p className="text-gray-500">
            This is a demo project for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
