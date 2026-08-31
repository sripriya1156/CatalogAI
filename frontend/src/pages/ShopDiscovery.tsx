import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  phone?: string;
  businessEmail?: string;
  website?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
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
  status: string;
  views: number;
  clicks: number;
  images: { imageUrl: string }[];
}

export default function ShopDiscovery() {
  const { slug } = useParams();
  const { showToast } = useToast();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Selected Product details modal
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  useEffect(() => {
    fetchShopAndProducts();
  }, [slug]);

  const fetchShopAndProducts = async () => {
    setLoading(true);
    try {
      // 1. Fetch shop profile by slug (this also increments visits/views in backend)
      const shopRes = await api.get(`/shops/slug/${slug}`);
      if (shopRes.data.success) {
        const shopData = shopRes.data.data;
        setShop(shopData);
        
        // Dynamic OpenGraph Headers Injection
        updateMetaTags(
          shopData.seoTitle || `${shopData.shopName} | CatalogAI Shop`,
          shopData.metaDescription || shopData.about,
          shopData.banner || shopData.logo || ''
        );

        // 2. Fetch products by shop ID
        const productsRes = await api.get(`/products/shop/${shopData._id}`);
        if (productsRes.data.success) {
          const prods = productsRes.data.data;
          setProducts(prods);
          
          // Determine max price dynamically
          if (prods.length > 0) {
            const prices = prods.map((p: Product) => p.cost);
            setMaxPrice(Math.max(...prices, 100));
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Shop catalog not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to dynamically update HTML meta tags for social crawlers (og tags)
  const updateMetaTags = (title: string, desc: string, img: string) => {
    document.title = title;
    
    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('og:title', title);
    setMeta('og:description', desc.slice(0, 150));
    setMeta('og:image', img);
    setMeta('og:type', 'website');
    setMeta('og:url', window.location.href);
  };

  // Triggered when a product is clicked (increases click count and opens modal)
  const handleProductClick = async (product: Product) => {
    setActiveProductModal(product);
    try {
      // Increment views count and clicks count in backend
      await api.post(`/products/${product._id}/click`);
      await api.post(`/products/${product._id}/view`);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  // Copy Catalog Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Catalog link copied! Share it on WhatsApp, Facebook, or Instagram.', 'success');
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesPrice = p.cost <= maxPrice;
    const matchesSize = selectedSize ? p.sizes.includes(selectedSize) : true;
    const matchesColor = selectedColor ? p.colors.includes(selectedColor) : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesColor;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-low') return a.cost - b.cost;
    if (sortOrder === 'price-high') return b.cost - a.cost;
    if (sortOrder === 'popular') return b.views - a.views;
    return new Date(b._id).getTime() - new Date(a._id).getTime(); // Newest
  });

  // Extract list of all categories, sizes, and colors for filter selectors
  const categoriesList = Array.from(new Set(products.map(p => p.category)));
  const allSizesList = Array.from(new Set(products.flatMap(p => p.sizes || [])));
  const allColorsList = Array.from(new Set(products.flatMap(p => p.colors || [])));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-150 border-t-indigo-600 animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold mt-4">Loading Shop Catalog...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl block mb-4">🔍</span>
        <h1 className="text-xl font-extrabold text-slate-900">Store Catalog Not Found</h1>
        <p className="text-slate-500 text-xs max-w-sm mt-1 mb-6">
          This catalog URL may have expired or is incorrect. Please check with the shop owner.
        </p>
        <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold transition">
          Return to Home
        </Link>
      </div>
    );
  }

  // Get custom theme styles or fallbacks
  const primaryBrandColor = shop.theme?.primaryColor || '#4F46E5';
  const customFont = shop.theme?.font || 'Inter';

  return (
    <div
      className="min-h-screen bg-[#fcfdfe] text-slate-800 font-sans"
      style={{ fontFamily: `${customFont}, Inter, sans-serif` }}
    >
      
      {/* 1. Header (Navbar) */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {shop.logo ? (
            <img src={shop.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-150" />
          ) : (
            <div
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm"
              style={{ backgroundColor: primaryBrandColor }}
            >
              {shop.shopName[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm leading-tight">{shop.shopName}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{shop.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔗</span> Share Catalog
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-[11px] font-bold transition"
          >
            Create My Own
          </Link>
        </div>
      </nav>

      {/* 2. Banner and Shop Info */}
      <header className="relative bg-slate-100 h-56 md:h-72 border-b border-slate-100 overflow-hidden">
        {shop.banner ? (
          <img src={shop.banner} alt={shop.shopName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-150 flex items-center justify-center text-slate-400 font-black text-3xl">
            {shop.shopName}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6 md:p-10">
          <div className="text-white space-y-2 max-w-xl">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{shop.shopName}</h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{shop.about}</p>
          </div>
        </div>
      </header>

      {/* 3. Shop Info and Contacts Bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-wrap gap-6 items-center justify-between text-xs font-semibold text-slate-500">
        <div className="flex flex-wrap gap-4 items-center">
          {shop.address && <span>📍 {shop.address}</span>}
          {shop.phone && <span>📞 {shop.phone}</span>}
          {shop.businessEmail && <span>✉️ {shop.businessEmail}</span>}
        </div>
        <div className="flex gap-4 shrink-0">
          {shop.instagram && <a href={shop.instagram} target="_blank" rel="noreferrer" className="hover:text-indigo-600">Instagram</a>}
          {shop.facebook && <a href={shop.facebook} target="_blank" rel="noreferrer" className="hover:text-indigo-600">Facebook</a>}
          {shop.linkedin && <a href={shop.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-600">LinkedIn</a>}
        </div>
      </div>

      {/* 4. Main Catalog Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 pb-3 border-b border-slate-50">
              <span>🎛️</span> Filters
            </h3>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Max Price</span>
                <span style={{ color: primaryBrandColor }}>${maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max={products.length > 0 ? Math.max(...products.map(p => p.cost), 100) : 500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                style={{ accentColor: primaryBrandColor }}
              />
            </div>

            {/* Category Filter */}
            {categoriesList.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Size Filter */}
            {allSizesList.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Filter by Size</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedSize('')}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                      selectedSize === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  {allSizesList.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        selectedSize === size ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Filter */}
            {allColorsList.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Filter by Color</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedColor('')}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                      selectedColor === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  {allColorsList.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        selectedColor === color ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort order */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Popularity (Views)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid and Search */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Internal search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products in this boutique catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 text-slate-900 shadow-sm text-xs transition"
            />
          </div>

          {/* Product cards */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-3">
              <span className="text-4xl block">🛍️</span>
              <h4 className="text-slate-800 font-bold text-base">No Products Found</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No items match your filter settings. Try clearing search query or adjusting pricing scale.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
              {sortedProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleProductClick(p)}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Container */}
                    <div className="h-48 bg-slate-100 overflow-hidden relative border-b border-slate-50">
                      {p.images && p.images[0] ? (
                        <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                          NO IMAGE
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-white text-xs font-black shadow-md" style={{ backgroundColor: primaryBrandColor }}>
                        ${p.cost.toFixed(2)}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="p-4 space-y-2">
                      <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                        {p.category}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate group-hover:text-indigo-600 transition">
                        {p.name}
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                        {p.description}
                      </p>

                      {/* Sizes capsules */}
                      {p.sizes && p.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.sizes.slice(0, 3).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-[9px] rounded font-semibold text-slate-500">{s}</span>
                          ))}
                          {p.sizes.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{p.sizes.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-1">
                    <button
                      type="button"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center text-xs transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* 5. Product Detail Modal Overlay */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-slide-in flex flex-col md:flex-row max-h-[90vh]"
            style={{
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProductModal(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-black focus:outline-none transition cursor-pointer"
            >
              ✕
            </button>

            {/* Left Col: Product Image */}
            <div className="md:w-1/2 bg-slate-100 min-h-64 md:min-h-0 relative">
              {activeProductModal.images && activeProductModal.images[0] ? (
                <img src={activeProductModal.images[0].imageUrl} alt={activeProductModal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                  NO PHOTO
                </div>
              )}
            </div>

            {/* Right Col: Product Details */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{activeProductModal.category}</span>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{activeProductModal.name}</h2>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</p>
                    <p className="text-xl font-extrabold text-indigo-600">${activeProductModal.cost.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Availability</p>
                    <p className={`text-xs font-bold ${activeProductModal.inventory > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {activeProductModal.inventory > 0 ? `In Stock (${activeProductModal.inventory})` : 'Out of Stock'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Description</p>
                  <p className="text-slate-600 text-xs leading-relaxed">{activeProductModal.description}</p>
                </div>

                {/* Options display */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  {activeProductModal.sizes && activeProductModal.sizes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Available Sizes</span>
                      <div className="flex flex-wrap gap-1">
                        {activeProductModal.sizes.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-[10px] rounded font-semibold text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeProductModal.colors && activeProductModal.colors.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Available Colors</span>
                      <div className="flex flex-wrap gap-1">
                        {activeProductModal.colors.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-slate-100 text-[10px] rounded font-semibold text-slate-600">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex gap-2">
                <a
                  href={`https://wa.me/${shop.phone ? shop.phone.replace(/[^0-9]/g, '') : ''}?text=Hi%20there,%20I'm%20interested%2520in%20your%20product:%2520${encodeURIComponent(activeProductModal.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full text-center text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
