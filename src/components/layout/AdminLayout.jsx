import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ClipboardList, Truck, Settings, FileSpreadsheet } from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { to: '/admin/dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/products', label: 'المنتجات', icon: <ShoppingBag size={20} /> },
    { to: '/admin/orders', label: 'الطلبات', icon: <ClipboardList size={20} /> },
    { to: '/admin/sales-archive', label: 'أرشيف المبيعات', icon: <FileSpreadsheet size={20} /> },
    { to: '/admin/shipping', label: 'أسعار الشحن', icon: <Truck size={20} /> },
    { to: '/admin/dashboard#settings', label: 'إعدادات المتجر', icon: <Settings size={20} /> },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <div className="font-cairo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar / Top Nav Wrapper */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm h-fit flex flex-col gap-2">
          <div className="hidden lg:block px-4 py-2 mb-4 border-b border-stone-50">
            <span className="text-xs font-black text-stone-400 uppercase tracking-wider">لوحة الإشراف</span>
          </div>
          
          {/* Scrollable horizontal list on mobile, vertical list on desktop */}
          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
