import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Wrench, Settings, LogOut, X, ShoppingBag, Boxes, Truck, MonitorPlay // 👈 MonitorPlay add kiya
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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Manage Home', icon: MonitorPlay, path: '/admin/manage-home' }, // 👈 NAYA TAB YAHAN HAI
    { name: 'Master Catalog', icon: Package, path: '/admin/catalog' },
    { name: 'Live Bookings', icon: ShoppingCart, path: '/admin/bookings' },
    { name: 'Technicians', icon: Wrench, path: '/admin/technicians' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Inventory', icon: Boxes, path: '/admin/inventory' },
    { name: 'Product Orders', icon: Truck, path: '/admin/orders' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>
        
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-5 right-4 md:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="h-16 flex items-center justify-center border-b border-slate-800 cursor-pointer shrink-0" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="text-xl font-black text-white tracking-tight">Fixit<span className="text-purple-400">Pro</span></span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button 
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}