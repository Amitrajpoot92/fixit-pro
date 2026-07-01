import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, Wallet, Settings, 
  LogOut, Wrench, Tags // 👈 Tags icon import kiya Pricing ke liye
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase'; // Sahi path!

export default function TechSidebar({ isSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/technician'); // Logout hone par tech login page par
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // 🚀 YAHAN ADD KIYA HAI "My Pricing"
  const menuItems = [
    { name: 'My Dashboard', icon: LayoutDashboard, path: '/technician/dashboard' },
    { name: 'Pending Tasks', icon: ClipboardList, path: '/technician/tasks' },
    { name: 'My Pricing', icon: Tags, path: '/technician/pricing' }, // 👈 NEW BUTTON
    { name: 'My Earnings', icon: Wallet, path: '/technician/earnings' },
    { name: 'Profile Settings', icon: Settings, path: '/technician/settings' },
  ];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 cursor-pointer" onClick={() => navigate('/technician/dashboard')}>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="text-xl font-black text-white tracking-tight">Tech<span className="text-emerald-400">Portal</span></span>}
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
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
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