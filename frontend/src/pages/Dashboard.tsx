import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface Shop {
  _id: string;
  shopName: string;
  shopSlug: string;
  about: string;
  category: string;
  logo?: string;
  banner?: string;
  totalViews: number;
  totalVisits: number;
  isFeatured: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  cost: number;
  description: string;
  views: number;
  clicks: number;
  images: { imageUrl: string }[];
  shopId: string;
  category: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Category State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public/all shops for directory search
      const shopsRes = await api.get('/shops');
      if (shopsRes.data.success) {
        setAllShops(shopsRes.data.data);
      }

      // 2. Fetch merchant's own shops
      const myShopsRes = await api.get('/shops/my');
      if (myShopsRes.data.success) {
        const ownedShops = myShopsRes.data.data;
        setMyShops(ownedShops);

        // 3. Fetch products for their owned shops to calculate analytics
        const productsList: Product[] = [];
        for (const shop of ownedShops) {
          const prodRes = await api.get(`/products/shop/${shop._id}?manage=true`);
          if (prodRes.data.success) {
            productsList.push(...prodRes.data.data);
          }
        }
        setMyProducts(productsList);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to fetch dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered shops based on category & search query
  const filteredShops = allShops.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.about.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Others') {
        matchesCategory = !['Jewellery', 'Dresses', 'Fancy Items'].includes(shop.category);
      } else {
        matchesCategory = shop.category === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // Most viewed shops (sorted by views descending)
  const mostViewedShops = [...allShops]
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 3);

  // Recent shops added in the network
  const recentShops = [...allShops]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Merchant's top products (sorted by views descending)
  const merchantTopProducts = [...myProducts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Calculate Merchant Stats
  const totalItemsCount = myProducts.length;
  const totalViewsCount = myShops.reduce((sum, shop) => sum + (shop.totalViews || 0), 0);
  const totalVisitsCount = myShops.reduce((sum, shop) => sum + (shop.totalVisits || 0), 0);

  // Category cards configuration
  const categories = [
    { name: 'All', icon: '🌐', count: allShops.length },
    { name: 'Jewellery', icon: '✨', count: allShops.filter(s => s.category === 'Jewellery').length },
    { name: 'Dresses', icon: '👗', count: allShops.filter(s => s.category === 'Dresses').length },
    { name: 'Fancy Items', icon: '🎀', count: allShops.filter(s => s.category === 'Fancy Items').length },
    { name: 'Others', icon: '📦', count: allShops.filter(s => !['Jewellery', 'Dresses', 'Fancy Items'].includes(s.category)).length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcoming Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 md:p-10 shadow-lg border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            Merchant Console
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Partner'}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Manage your store catalogs, generate descriptions with AI, or explore featured shops around the network.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/create-shop" className="px-5 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 text-xs font-extrabold rounded-full transition shadow-md flex items-center gap-1.5">
              <span>➕</span> Create New Shop
            </Link>
            <Link to="/my-shops" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-full transition shadow-md border border-indigo-500/30">
              📂 Manage My Shops
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Global Analytics Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">My Shops Analytics Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Products Listed</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-extrabold text-slate-800">{totalItemsCount}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              📦
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Page Views</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-extrabold text-slate-800">{totalViewsCount.toLocaleString()}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              👁️
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Unique Visits</p>
              {loading ? (
                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-extrabold text-slate-800">{totalVisitsCount.toLocaleString()}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              👣
            </div>
          </div>

        </div>
      </div>

      {/* 3. Search and Category Filtration */}
      <div className="space-y-6 pt-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore the Shop Catalog Directory</h2>
          
          {/* Large Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search shops, services, or product categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 shadow-md text-sm transition"
            />
          </div>
        </div>

        {/* Category cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 cursor-pointer hover:shadow-md ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider">{cat.name}</p>
                <p className={`text-[10px] ${selectedCategory === cat.name ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {cat.count} {cat.count === 1 ? 'shop' : 'shops'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Directory Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              {selectedCategory} Shops {searchQuery && `matching "${searchQuery}"`} ({filteredShops.length})
            </h3>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse shadow-sm">
                  <div className="h-40 bg-slate-100 rounded-xl" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-8 bg-slate-200 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-4xl block">🔍</span>
              <h4 className="text-slate-800 font-bold text-base">No Shops Found</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                We couldn't find any shops matching your criteria. Try adjusting your search query or choosing another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <div key={shop._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition duration-200 flex flex-col justify-between shadow-sm group">
                  <div>
                    {/* Shop Banner */}
                    <div className="bg-slate-100 h-36 relative overflow-hidden border-b border-slate-50">
                      {shop.banner ? (
                        <img src={shop.banner} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black">
                          {shop.shopName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                        {shop.category}
                      </span>
                    </div>

                    {/* Shop details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-3">
                        {shop.logo ? (
                          <img src={shop.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-150" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 shrink-0">
                            {shop.shopName[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug">{shop.shopName}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                            <span>⭐ 4.8</span>
                            <span>•</span>
                            <span>{shop.totalViews} views</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 pt-1">
                        {shop.about}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1">
                    <Link
                      to={`/shop/${shop.shopSlug}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-center block text-xs transition shadow-sm hover:shadow"
                    >
                      Open Catalog Page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Split Analytics & Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Left Col: Most Viewed Shops & Recent Shops */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Most Viewed Shops Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">🔥 Trending Shops on the Platform</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-2xl" />)
              ) : mostViewedShops.map((shop, i) => (
                <Link
                  to={`/shop/${shop.shopSlug}`}
                  key={shop._id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group shadow-sm"
                >
                  <span className="absolute -top-3 -right-3 text-7xl text-slate-50 font-black tracking-tight select-none">
                    #{i + 1}
                  </span>
                  <div className="relative z-10 space-y-3">
                    <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded">
                      Trending #{i + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-1">{shop.shopName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{shop.category}</p>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {shop.about}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center relative z-10 text-[10px] font-bold text-indigo-600">
                    <span>{shop.totalViews} views</span>
                    <span className="group-hover:translate-x-1 transition duration-150">Open Catalog →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">📋 Latest System Activity</h3>
            <div className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded my-3" />)
              ) : recentShops.map((shop) => (
                <div key={shop._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                      🛒
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold">
                        New Shop Registered: <span className="text-indigo-600">{shop.shopName}</span>
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Business Category: {shop.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-[10px] font-semibold shrink-0">
                    {new Date(shop.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Top Selling/Viewed Products Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">⭐ Top Performing Products</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Items in your active inventories that generated the highest visual views and click rates.
            </p>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)
            ) : myShops.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <span>📦</span>
                <p>No active shops. Create a shop to track product analytics.</p>
              </div>
            ) : merchantTopProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <span>📦</span>
                <p>No products listed yet. Go to your shop management page to add items.</p>
              </div>
            ) : (
              merchantTopProducts.map((prod) => (
                <div key={prod._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    {prod.images && prod.images[0] ? (
                      <img src={prod.images[0].imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-150 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                        IMG
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate leading-snug">{prod.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">{prod.category} • ${prod.cost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-800 font-extrabold text-xs">{prod.views} views</p>
                    <p className="text-[10px] text-indigo-500 font-semibold">{prod.clicks} clicks</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {myShops.length > 0 && (
            <Link
              to="/my-shops"
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-center block text-xs transition border border-indigo-100"
            >
              Go to Shops Inventory Manager
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
