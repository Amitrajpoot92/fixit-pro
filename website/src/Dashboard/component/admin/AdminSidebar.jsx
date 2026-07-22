import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Wrench, Settings, LogOut, X, ShoppingBag, Boxes, MonitorPlay,
  ShieldCheck, BadgeIndianRupee, PackageOpen 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase'; 

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const mainItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Manage Home', icon: MonitorPlay, path: '/admin/manage-home' },
    { name: 'Master Catalog', icon: Package, path: '/admin/catalog' },
    { name: 'Live Bookings', icon: ShoppingCart, path: '/admin/bookings' },
    { name: 'Technicians', icon: Wrench, path: '/admin/technicians' },
    // 🚀 NAYA LINK ADD KIYA JUST PRODUCTS KE UPAR
    { name: 'Product Orders', icon: PackageOpen, path: '/admin/product-orders' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Inventory', icon: Boxes, path: '/admin/inventory' },
  ];

  const financeItems = [
    { name: 'KYC Approvals', icon: ShieldCheck, path: '/admin/kyc' },
    { name: 'Payments Ledger', icon: BadgeIndianRupee, path: '/admin/payments' },
  ];

  const settingItems = [
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  // 🚀 FIX: Mobile aur Tablet par auto close
  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024 && setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* 🚀 Mobile Backdrop Blur */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🚀 FIX: Mobile par puri tarah screen se bahar (0 icons visible) */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-all duration-300 ${
        isSidebarOpen 
        ? 'translate-x-0 w-64' 
        : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'
      }`}>
        
        {/* 🚀 Mobile Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-5 right-4 lg:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
        >
          <X size={18} />
        </button>

        {/* 🚀 Logo Section */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="text-xl font-black text-white tracking-tight">Admin<span className="text-purple-400">Pro</span></span>}
          </div>
        </div>

        {/* 🚀 Menu Links */}
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          <div className="space-y-2">
            {isSidebarOpen && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-3 mb-2">Operations</p>}
            {mainItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <button 
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  title={!isSidebarOpen ? item.name : ""}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  {isSidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 relative pt-2">
            <div className="absolute top-0 left-0 right-0 border-t border-slate-800"></div>
            {isSidebarOpen && (
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider pl-3 mb-2 flex items-center gap-2">
                <BadgeIndianRupee className="w-4 h-4 text-emerald-400" /> Accounts & Payouts
              </p>
            )}
            <div className="space-y-2 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/60">
              {financeItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <button 
                    key={item.name}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-emerald-600/20 to-teal-900/10 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)] font-bold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
                    title={!isSidebarOpen ? item.name : ""}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {isSidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 relative pt-2">
            <div className="absolute top-0 left-0 right-0 border-t border-slate-800"></div>
            {settingItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <button 
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                  title={!isSidebarOpen ? item.name : ""}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{item.name}</span>}
                </button>
              );
            })}
          </div>

        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}