// src/components/home/Footer.jsx
import React from 'react';
import { Mail, Globe, MessageSquare, ArrowUpRight, Lock, Wrench, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050B14] relative overflow-hidden border-t border-white/10 pt-12 pb-6">
      
      {/* 🌌 Subtle Bottom Ambient Glow (Scaled down to save space) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        
        {/* 🚀 Main Footer Grid (Reduced gaps) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 mb-10">
          
          {/* 📝 Brand Column */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-1.5 mb-4 cursor-pointer group">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:bg-blue-500 transition-colors">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Fixit</span>
              <span className="text-xs font-bold bg-white text-slate-950 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pro</span>
            </div>
            
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs mb-6">
              India's #1 premium doorstep device repair service. We bring your tech back to life, securely and instantly.
            </p>

            {/* Smaller, compact social icons */}
            <div className="flex items-center gap-3">
              {[Mail, Globe, MessageSquare].map((Icon, index) => (
                <a key={index} href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* 🔗 Links Columns Wrapper (FIX: Now uses grid-cols-2 on mobile to save vertical space) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Quick Links */}
            <div className="flex flex-col items-start">
              <h4 className="text-white font-extrabold mb-4 tracking-wide uppercase text-[10px] opacity-50">Company</h4>
              <ul className="space-y-2.5">
                {['Our Services', 'How it Works', 'Pricing', 'About Us'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 text-xs font-medium hover:text-blue-400 transition-colors flex items-center gap-2 group">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="flex flex-col items-start">
              <h4 className="text-white font-extrabold mb-4 tracking-wide uppercase text-[10px] opacity-50">Support</h4>
              <ul className="space-y-2.5">
                {['Contact Us', 'FAQs', 'Privacy', 'Terms'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 text-xs font-medium hover:text-blue-400 transition-colors flex items-center gap-2 group">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🛡️ Portals (Admin & Technician) - Slimmer Version */}
            <div className="flex flex-col items-start col-span-2 sm:col-span-1 mt-4 sm:mt-0">
              <h4 className="text-white font-extrabold mb-4 tracking-wide uppercase text-[10px] opacity-50">Staff Access</h4>
              <ul className="space-y-2 w-full max-w-[200px]">
                
                <li>
                  <a href="/admin" className="group flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                     <Lock className="w-3.5 h-3.5 text-purple-400" />
                     <span className="text-slate-300 text-xs font-bold group-hover:text-white transition-colors">Admin Portal</span>
                     <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white ml-auto transition-colors" />
                  </a>
                </li>
                
                <li>
                  <a href="/technician" className="group flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                     <span className="text-slate-300 text-xs font-bold group-hover:text-white transition-colors">Tech Portal</span>
                     <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white ml-auto transition-colors" />
                  </a>
                </li>

              </ul>
            </div>

          </div>
        </div>

        {/* 🏁 Bottom Bar (Tighter spacing) */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-[11px] font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} FixitPro Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
             <span>Crafted with</span>
             <span className="text-red-500 animate-pulse text-xs">❤️</span>
             <span>in India</span>
          </div>
        </div>

      </div>
    </footer>
  );
}