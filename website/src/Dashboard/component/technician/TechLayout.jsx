// src/Dashboard/component/technician/TechLayout.jsx
import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import TechSidebar from './TechSidebar'; // 👈 Imported our newly created sidebar

export default function TechLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-200 font-sans">
      
      {/* 🟢 EXTRACTED SIDEBAR */}
      <TechSidebar isSidebarOpen={isSidebarOpen} />

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white hidden sm:block">Technician Workspace</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search tasks..." className="bg-slate-800 border border-slate-700 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 text-white w-64 transition-all" />
            </div>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 cursor-pointer">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-white">T</div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages render here */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Emerald Green Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}