import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

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
  phone?: string;
  businessEmail?: string;
  website?: string;
  address?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontColor: string;
    font: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  cost: number;
  inventory: number;
  category: string;
  sizes: string[];
  colors: string[];
  status: 'active' | 'draft' | 'archived';
  views: number;
  clicks: number;
  images: { imageUrl: string }[];
}

export default function ShopManagement() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShopAndProducts();
  }, [shopId]);

  const fetchShopAndProducts = async () => {
    setLoading(true);
    try {
      // 1. Fetch shop profile by ID
      const shopRes = await api.get(`/shops/${shopId}`);
      if (shopRes.data.success) {
        setShop(shopRes.data.data);
      }

      // 2. Fetch products by shop ID (manage mode displays all statuses)
      const productsRes = await api.get(`/products/shop/${shopId}?manage=true`);
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error loading shop inventory details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy Public Shop link to clipboard
  const handleCopyLink = () => {
    if (!shop) return;
    // Generate public URL
    const publicUrl = `${window.location.origin}/shop/${shop.shopSlug}`;
    navigator.clipboard.writeText(publicUrl);
    showToast('Public catalog link copied to clipboard!', 'success');
  };

  // Delete product
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete(`/products/${prodId}`);
      if (res.data.success) {
        showToast('Product successfully deleted!', 'success');
        setProducts(prev => prev.filter(p => p._id !== prodId));
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete product.', 'error');
    }
  };

  // Delete whole shop
  const handleDeleteShop = async () => {
    if (!shop) return;
    const confirmName = window.prompt(
      `WARNING: This will permanently delete the shop "${shop.shopName}" and all of its product catalogs. To confirm, type the shop name below:`
    );

    if (confirmName !== shop.shopName) {
      showToast('Shop deletion cancelled. Input name did not match.', 'info');
      return;
    }

    try {
      const res = await api.delete(`/shops/${shop._id}`);
      if (res.data.success) {
        showToast('Shop successfully deleted.', 'success');
        navigate('/my-shops');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete shop.', 'error');
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalItemClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);

  if (loading && !shop) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-8 bg-slate-300 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <span className="text-4xl block">🏬</span>
        <h2 className="text-slate-800 font-bold text-lg">Shop Catalog Not Found</h2>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          The requested shop does not exist or you do not have permission to view it.
        </p>
        <Link to="/my-shops" className="inline-block px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold">
          Back to My Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Shop Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
        
        {/* Banner Image */}
        <div className="h-44 bg-slate-100 relative">
          {shop.banner ? (
            <img src={shop.banner} alt={shop.shopName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-300 text-3xl font-black">
              CatalogAI Banner
            </div>
          )}
          <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            {shop.category}
          </span>
        </div>

        {/* Profile Details Area */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start md:items-center gap-4">
            {shop.logo ? (
              <img src={shop.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
                {shop.shopName[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{shop.shopName}</h1>
              <p className="text-xs text-slate-500 font-semibold line-clamp-1">{shop.about}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-400">
                {shop.website && <span>🌐 <a href={`https://${shop.website}`} target="_blank" rel="noreferrer" className="hover:underline">{shop.website}</a></span>}
                {shop.phone && <span>📞 {shop.phone}</span>}
                {shop.address && <span>📍 {shop.address}</span>}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔗</span> Copy Shop Link
            </button>
            <Link
              to={`/edit-shop/${shop.shopSlug}`}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition shadow-sm flex items-center gap-1.5"
            >
              <span>⚙️</span> Edit Settings
            </Link>
            <button
              onClick={handleDeleteShop}
              className="px-4 py-2 border border-rose-100 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-full transition cursor-pointer"
            >
              <span>🗑️</span> Delete Shop
            </button>
          </div>
        </div>

      </div>

      {/* 2. Shop Specific Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Views</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{shop.totalViews}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unique Visits</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{shop.totalVisits}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Products</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{activeProducts}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product Clicks</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{totalItemClicks}</p>
        </div>

      </div>

      {/* 3. Catalog Items Header and Search */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">Products Catalog ({filteredProducts.length})</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search items */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products in this shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            
            <Link
              to={`/manage-shop/${shop._id}/create-item`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shrink-0 flex items-center gap-1"
            >
              <span>➕</span> Add Item
            </Link>
          </div>
        </div>

        {/* Catalog Items Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center space-y-4">
            <span className="text-4xl block">🛍️</span>
            <h4 className="text-slate-800 font-bold text-base">Your Catalog is Empty</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              No products found. Start listing items for your customers and let our AI helper write catalog listings instantly.
            </p>
            <Link
              to={`/manage-shop/${shop._id}/create-item`}
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p._id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
                
                <div>
                  {/* Product image */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-slate-50">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-black">
                        NO IMAGE
                      </div>
                    )}
                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                        : p.status === 'draft'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate">{p.name}</h4>
                      <p className="font-extrabold text-indigo-600 text-sm">${p.cost.toFixed(2)}</p>
                    </div>
                    
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {p.description}
                    </p>

                    {/* Sizes and Colors */}
                    <div className="space-y-1.5 pt-1">
                      {p.sizes && p.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mr-1">Sizes:</span>
                          {p.sizes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-[9px] rounded font-semibold text-slate-600">{s}</span>
                          ))}
                        </div>
                      )}
                      
                      {p.colors && p.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mr-1">Colors:</span>
                          {p.colors.map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-slate-100 text-[9px] rounded font-semibold text-slate-600">{c}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1">
                        <span>📦 Stock: {p.inventory}</span>
                        <span>👁️ {p.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-50 flex gap-2">
                  <Link
                    to={`/manage-shop/${shop._id}/edit-item/${p._id}`}
                    className="flex-1 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg text-center transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(p._id)}
                    className="flex-1 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
