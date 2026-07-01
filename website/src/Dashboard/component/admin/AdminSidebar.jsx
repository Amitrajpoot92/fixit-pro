// src/website/src/components/Dashboard/component/admin/AdminSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Wrench, Settings, LogOut 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
// Apne folder structure ke hisaab se firebase import path adjust kar lena
import { auth } from '../../../firebase'; 

export default function AdminSidebar({ isSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin'); // Logout hone par wapas login page par
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // 🚀 Naya Menu Structure (Urban Company Style)
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Master Catalog', icon: Package, path: '/admin/catalog' }, // 👈 Naya Add Kiya
    { name: 'Live Bookings', icon: ShoppingCart, path: '/admin/bookings' }, // 👈 Naya Add Kiya
    { name: 'Technicians', icon: Wrench, path: '/admin/technicians' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-1.5 rounded-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="text-xl font-black text-white tracking-tight">Fixit<span className="text-purple-400">Pro</span></span>}
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <button 
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );
}