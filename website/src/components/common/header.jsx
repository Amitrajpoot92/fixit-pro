// src/components/home/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Wrench, Download, Lock } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect for dynamic shadow and sizing
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 🚀 Floating Glassmorphism Pill Header */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
        
        <div className={`pointer-events-auto w-full max-w-6xl bg-white/70 backdrop-blur-2xl border border-white/50 rounded-full px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-2 sm:py-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)]' : 'py-3 sm:py-4 shadow-[0_5px_20px_rgba(0,0,0,0.04)]'}`}>
          
          {/* ✨ Premium Logo (Matches Footer) */}
          <div className="flex-shrink-0 flex items-center gap-1.5 cursor-pointer group">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md group-hover:bg-blue-500 transition-colors">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Fixit</span>
            <span className="text-xs sm:text-sm font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">Pro</span>
          </div>

          {/* 💻 Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {['Services', 'How it Works', 'Why Us'].map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* 🎯 Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors">
              <Lock className="w-4 h-4" />
              Staff Login
            </a>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-600 transition-colors duration-300 shadow-md flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg">
              <Download className="w-4 h-4" />
              Get App
            </button>
          </div>

          {/* 📱 Mobile Menu Toggle Button */}
          <button 
            className="md:hidden bg-slate-100 p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </header>

      {/* 📱 Mobile Dropdown Menu (Glassmorphism overlay) */}
      <div className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
        
        <div 
          className={`absolute top-24 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-y-0 scale-100' : '-translate-y-10 scale-95'}`}
          onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
        >
          <nav className="flex flex-col space-y-2 mb-6">
            {['Services', 'How it Works', 'Why Us'].map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                className="text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-2xl font-bold text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex flex-col space-y-3 pt-6 border-t border-slate-100">
            <a href="/admin" className="flex items-center justify-center gap-2 text-base font-bold text-slate-600 hover:text-slate-900 bg-slate-50 px-4 py-3 rounded-2xl">
              <Lock className="w-4 h-4" />
              Staff Login
            </a>
            <button className="bg-blue-600 text-white px-4 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download App
            </button>
          </div>
        </div>

      </div>
    </>
  );
}