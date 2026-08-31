import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  plan: string;
  createdAt: string;
}

export default function MyShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyShops();
  }, []);

  const fetchMyShops = async () => {
    setLoading(true);
    try {
      const response = await api.get('/shops/my');
      if (response.data.success) {
        setShops(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load your shops. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Shops</h1>
          <p className="text-slate-500 text-xs leading-relaxed">
            Create, view, and manage your custom product catalogs and sales channels.
          </p>
        </div>
        <Link
          to="/create-shop"
          className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-full transition shadow-md hover:shadow-lg inline-flex items-center gap-1.5"
        >
          <span>➕</span> Create Shop
        </Link>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 animate-pulse shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-16 bg-slate-50 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded" />
              </div>
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center max-w-2xl mx-auto space-y-5 my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto">
            🏬
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">No Shops Created Yet</h2>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              Launch your online presence! Create a shop catalog, add items, and let our AI generate professional copy and branding instantly.
            </p>
          </div>
          <Link
            to="/create-shop"
            className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-150 text-xs"
          >
            Create Your First Shop
          </Link>
        </div>
      ) : (
        /* Shops Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              onClick={() => navigate(`/manage-shop/${shop._id}`)}
              className="bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Logo and Name */}
                <div className="flex items-start gap-4">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={shop.shopName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-150 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {shop.shopName[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate group-hover:text-indigo-600 transition">
                      {shop.shopName}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-500">{shop.category}</p>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[9px] font-extrabold uppercase rounded bg-slate-50 border border-slate-100 text-slate-500">
                      {shop.plan} plan
                    </span>
                  </div>
                </div>

                {/* About snippet */}
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                  {shop.about}
                </p>

                {/* Analytics Snapshot */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Views</p>
                    <p className="text-slate-800 font-extrabold text-sm">{shop.totalViews}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visits</p>
                    <p className="text-slate-800 font-extrabold text-sm">{shop.totalVisits}</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-5 flex items-center justify-between text-xs font-extrabold text-indigo-600 border-t border-slate-50 mt-5">
                <span className="text-[10px] text-slate-400 font-semibold">Created {new Date(shop.createdAt).toLocaleDateString()}</span>
                <span className="group-hover:translate-x-1.5 transition duration-150">Manage Shop & Products →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
