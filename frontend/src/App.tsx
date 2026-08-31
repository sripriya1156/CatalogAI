import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyShops from './pages/MyShops';
import CreateShop from './pages/CreateShop';
import ShopManagement from './pages/ShopManagement';
import CreateItem from './pages/CreateItem';
import ShopDiscovery from './pages/ShopDiscovery';
import AccountSettings from './pages/AccountSettings';
import MerchantLayout from './components/layout/MerchantLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop/:slug" element={<ShopDiscovery />} />

        {/* Protected Merchant Console Pages */}
        <Route element={<MerchantLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-shops" element={<MyShops />} />
          <Route path="/create-shop" element={<CreateShop />} />
          <Route path="/edit-shop/:id" element={<CreateShop />} />
          <Route path="/manage-shop/:shopId" element={<ShopManagement />} />
          <Route path="/manage-shop/:shopId/create-item" element={<CreateItem />} />
          <Route path="/manage-shop/:shopId/edit-item/:itemId" element={<CreateItem />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}
