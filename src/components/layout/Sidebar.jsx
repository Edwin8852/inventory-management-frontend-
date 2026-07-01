import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Layers, ShoppingCart, Truck, Users, LogOut, Tags, Hash, FileText, Settings, RefreshCcw, PieChart, ShieldCheck, UserCircle, CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { settingService } from '../../services/setting.service';
import { API_BASE_URL } from '../../utils/constants';

const baseUrl = API_BASE_URL.replace('/api', '');

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPPLIER', 'CUSTOMER'] },
  { path: '/shop', name: 'Product Catalog', icon: Package, roles: ['CUSTOMER', 'SUPPLIER'] },
  { path: '/cart', name: 'My Cart', icon: ShoppingCart, roles: ['CUSTOMER', 'SUPPLIER'] },
  { path: '/my-orders', name: 'My Orders', icon: Truck, roles: ['CUSTOMER'] },
  { path: '/purchases', name: 'Bulk Orders', icon: FileText, roles: ['ADMIN', 'SUPPLIER'] },
  { path: '/inventory', name: 'Inventory', icon: Layers, roles: ['ADMIN'] },
  { path: '/products', name: 'Products Mgmt', icon: Package, roles: ['ADMIN'] },
  { path: '/categories', name: 'Categories', icon: Tags, roles: ['ADMIN'] },
  { path: '/brands', name: 'Brands', icon: Hash, roles: ['ADMIN'] },
  { path: '/suppliers', name: 'Suppliers', icon: Truck, roles: ['ADMIN'] },
  { path: '/customers', name: 'Customers', icon: Users, roles: ['ADMIN'] },
  { path: '/invoices', name: 'Invoices', icon: FileText, roles: ['ADMIN', 'SUPPLIER', 'CUSTOMER'] },
  { path: '/upi-payments', name: 'UPI Payments', icon: CreditCard, roles: ['ADMIN'] },
  { path: '/returns', name: 'Returns', icon: RefreshCcw, roles: ['ADMIN'] },
  { path: '/reports', name: 'Reports', icon: PieChart, roles: ['ADMIN'] },
  { path: '/users', name: 'User Management', icon: ShieldCheck, roles: ['ADMIN'] },
  { path: '/supplier-profile', name: 'My Profile', icon: UserCircle, roles: ['SUPPLIER'] },
  { path: '/admin/settings', name: 'Admin Settings', icon: Settings, roles: ['ADMIN'] },
  { path: '/supplier/settings', name: 'Supplier Settings', icon: Settings, roles: ['SUPPLIER'] },
  { path: '/customer/settings', name: 'Customer Settings', icon: Settings, roles: ['CUSTOMER'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [companyLogo, setCompanyLogo] = useState(null);
  
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await settingService.getSystemSettings('company');
        if (res.data?.data?.companyLogo) {
          setCompanyLogo(res.data.data.companyLogo);
        }
      } catch (err) {
        console.error('Failed to fetch logo in sidebar');
      }
    };
    fetchLogo();
  }, []);

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-[#0a1128] text-white flex flex-col h-full transition-all duration-300 relative overflow-hidden">
      {/* Brand Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative z-10">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center mr-3 font-black text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white overflow-hidden">
          {companyLogo ? (
            <img src={`${baseUrl}${companyLogo}`} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            'X'
          )}
        </div>
        <h2 className="text-xl font-bold tracking-wide text-violet-400">XTown Gobal PVT LMT</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto relative z-10 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 my-0.5 rounded-full transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-violet-500/20 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-violet-400' : 'group-hover:text-violet-400'}`} />
                <span className="font-medium tracking-wide text-sm">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-white/10 relative z-10">
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-400 rounded-xl hover:bg-danger/20 hover:text-danger hover:ring-1 hover:ring-danger/50 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
