import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, LogOut, ChevronDown, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/product.service';
import { settingService } from '../../services/setting.service';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAlerts();
    }
    fetchLogo();
  }, [user]);

  const fetchLogo = async () => {
    try {
      const res = await settingService.getSystemSettings('company');
      if (res.data?.data?.companyLogo) {
        setCompanyLogo(res.data.data.companyLogo);
      }
    } catch (err) {
      console.error('Failed to fetch logo');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await productService.getProducts();
      const products = res.data.data || [];
      const lowStock = products.filter(p => p.stock <= (p.minimumStock || 10));
      
      const alerts = lowStock.map(p => ({
        id: p.id,
        title: 'Low Stock Alert',
        message: `${p.productName} is running low on stock (${p.stock} remaining).`,
        time: new Date().toLocaleDateString(),
        type: 'warning'
      }));
      setNotifications(alerts);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    }
  };

  return (
    <header className="h-20 glass-navbar flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
      {/* Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-lg group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110 group-focus-within:text-primary">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </span>
          <input 
            type="text" 
            placeholder="Search products, invoices, or customers..." 
            className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white shadow-inner transition-all"
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-6">
        {/* Notification Icon */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-white/50 rounded-full text-gray-500 hover:text-primary hover:bg-white hover:shadow-md transition-all group"
          >
            <Bell className={`h-6 w-6 ${notifications.length > 0 ? 'group-hover:animate-bounce text-primary' : ''}`} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white shadow-sm animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          <div className={`absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 origin-top-right z-50 ${showNotifications ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {notifications.length > 0 && <span className="bg-danger/10 text-danger text-xs px-2 py-1 rounded-full font-bold">{notifications.length} New</span>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                  <Bell className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex items-start">
                    <div className="mt-0.5 bg-amber-100 p-1.5 rounded-full mr-3 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile Dropdown Placeholder */}
        <div className="relative group">
          <div className="flex items-center space-x-3 border-l border-gray-200/60 pl-6 cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all overflow-hidden">
              {companyLogo ? (
                <img src={`http://localhost:5000${companyLogo}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-800">{user?.name || 'User'}</p>
              <p className="text-xs font-medium text-gray-500">{user?.role || 'Guest'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:rotate-180 transition-all duration-300" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-3 w-56 glass-panel py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top-right z-50 transform group-hover:translate-y-0 translate-y-2">
            <div className="px-4 py-3 border-b border-gray-100/50">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="p-2">
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-danger rounded-lg hover:bg-danger/10 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
