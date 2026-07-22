import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import type { Product } from '../types';

const SKELETON_COUNT = 8;

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params: any = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;

    api.get('/products', { params }).then((res) => {
      setProducts(res.data.products);
    }).catch(() => {
      setError(true);
    }).finally(() => setLoading(false));
  }, [category, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-end gap-4 mb-8">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {error ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-lg text-gray-600 mb-2">Failed to load products</p>
          <button onClick={() => window.location.reload()} className="text-pink-600 hover:text-pink-600 font-medium text-sm">
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">📦</span>
          <p className="text-lg text-gray-600 mb-2">No products found</p>
          <p className="text-sm text-gray-600">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

