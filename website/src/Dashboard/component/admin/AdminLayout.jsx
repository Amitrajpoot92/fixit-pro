import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  // Mobile par sidebar close rahega by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-200 font-sans">
      
      {/* 🚀 EXTRACTED SIDEBAR */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white hidden sm:block">Admin Workspace</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search anything..." className="bg-slate-800 border border-slate-700 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500 text-white w-64 transition-all" />
            </div>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5 cursor-pointer shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-white">A</div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages render here */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="relative z-10 w-full max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}