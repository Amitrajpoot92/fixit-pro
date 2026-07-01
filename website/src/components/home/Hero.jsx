// src/components/home/Hero.jsx
import React from 'react';
import { Wrench, Clock3, ShieldCheck, Star, Zap, Bot, Download } from 'lucide-react';
// 🚀 REAL IMAGE IMPORT
import appScreenshot from '../../assets/heross.png'; 

// 💎 REFINED: Responsive Service Cards (Smaller on mobile, pushed outward to prevent overlap)
const ServiceCard = ({ icon: Icon, title, description, borderColor, iconColor, position }) => (
  <div className={`absolute p-3 md:p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border ${borderColor} shadow-[0_0_20px_0_rgba(0,0,0,0.5)] transition-transform duration-500 hover:-translate-y-2 z-30 flex flex-col gap-1 md:gap-2 ${position}`}>
    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center border ${borderColor} shadow-inner bg-slate-800/50`}>
      <Icon className={`w-4 h-4 md:w-6 md:h-6 ${iconColor}`} />
    </div>
    <div>
      <h4 className="text-sm md:text-lg font-bold text-white leading-tight">{title}</h4>
      <p className="text-[9px] md:text-xs text-slate-400 font-medium whitespace-nowrap">{description}</p>
    </div>
  </div>
);

// 💎 Floating Circuit Boards (Background Elements)
const FloatingCircuit = ({ position, rotation, opacity }) => (
  <div className={`absolute w-32 h-32 ${position} ${rotation} ${opacity} pointer-events-none z-10 hidden sm:block`}>
    <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-500/20" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="10" y="10" width="80" height="80" rx="5" />
      <circle cx="30" cy="30" r="5" fill="currentColor" opacity="0.3" />
      <path d="M30 35 L30 65 M35 30 L65 30 M70 35 L70 65 M35 70 L65 70" />
      <circle cx="70" cy="70" r="5" fill="currentColor" opacity="0.3" />
    </svg>
  </div>
);

export default function Hero() {
  return (
    <section className="relative bg-slate-950 pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
      
      {/* 🌌 Ambient Neon Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-15%] w-[300px] lg:w-[700px] h-[300px] lg:h-[700px] rounded-full bg-linear-to-br from-purple-800 to-blue-900 blur-[90px] lg:blur-[140px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] rounded-full bg-cyan-700/30 blur-[90px] lg:blur-[120px] opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]"></div>
        
        {/* Abstract Glowing Circuit Paths */}
        <svg className="absolute inset-0 w-full h-full opacity-20 hidden md:block" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neon_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
          <path d="M-100 200 Q 100 350 400 300 T 900 450 T 1400 350" stroke="url(#neon_grad)" strokeWidth="1.5" fill="none" className="blur-[1.5px]"/>
          <path d="M200 800 Q 500 650 800 700 T 1300 550 T 1800 650" stroke="url(#neon_grad)" strokeWidth="1.5" fill="none" className="blur-[1.5px]"/>
        </svg>

        <FloatingCircuit position="top-[15%] left-[5%]" rotation="rotate-[-15deg]" opacity="opacity-70" />
        <FloatingCircuit position="bottom-[10%] right-[8%]" rotation="rotate-[25deg]" opacity="opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 w-full">
        
        {/* 📝 Left Column: Copy & Buttons */}
        <div className="w-full lg:w-3/5 text-center lg:text-left z-20">
          <span className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-slate-700 text-xs md:text-sm font-semibold text-white mb-8 md:mb-10 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-slate-100">FixitPro</span> | Doorstep Device Repair
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.1] md:leading-[1.0] mb-6 md:mb-10 [text-shadow:0_2px_10px_rgba(255,255,255,0.1)]">
            Broken Device? <br /> We Fix It <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]">At Your Door.</span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 mb-10 md:mb-16 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-medium opacity-95">
            Skip the service center queues. Our certified experts repair smartphones and laptops at your location. Genuine parts, transparent pricing, and 6-month warranty.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8 md:mt-14 border-b border-slate-800 pb-10 lg:border-b-0 lg:pb-0">
            <button className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-full bg-white text-slate-950 font-black text-sm md:text-lg hover:bg-slate-200 transition duration-300 flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(255,255,255,0.1)] active:scale-95">
               <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 1h-11a3.5 3.5 0 00-3.5 3.5v15a3.5 3.5 0 003.5 3.5h11a3.5 3.5 0 003.5-3.5v-15a3.5 3.5 0 00-3.5-3.5zM12 21a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM18.5 17h-13V4.5a1.5 1.5 0 011.5-1.5h10a1.5 1.5 0 011.5 1.5V17z"></path></svg>
               Get it on Play Store
            </button>
            <button className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-full bg-slate-800/80 text-white font-black text-sm md:text-lg hover:bg-slate-700 transition duration-300 shadow-lg border border-slate-700 flex items-center justify-center gap-3 active:scale-95">
               <Download className="w-6 h-6" />
               Download App Store
            </button>
          </div>
        </div>

        {/* 📱 Right Column: PERFECTED LAYOUT - NO OVERLAPPING */}
        <div className="w-full lg:w-2/5 flex justify-center mt-10 lg:mt-0 relative">
          
          <div className="relative w-full max-w-[340px] md:max-w-[400px] flex items-center justify-center transition-transform duration-700 ease-out [animation:float_6s_ease-in-out_infinite]">
            
            {/* Background Glows */}
            <div className="absolute top-[20%] right-[-10%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-purple-600 rounded-full blur-[80px] md:blur-[100px] opacity-60"></div>
            <div className="absolute top-[40%] left-[-10%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-cyan-400 rounded-full blur-[80px] md:blur-[100px] opacity-60"></div>

            {/* 🚀 FIXED: Cards pushed outside the phone frame via negative margins */}
            <ServiceCard 
              icon={Wrench} title="Repair" description="Phones & Laptops" 
              borderColor="border-purple-500/50" iconColor="text-purple-400" 
              position="top-[5%] md:top-[10%] -left-6 md:-left-16" 
            />

            <ServiceCard 
              icon={ShieldCheck} title="Warranty" description="6-Month Shield" 
              borderColor="border-green-500/50" iconColor="text-green-400" 
              position="top-[25%] md:top-[20%] -right-8 md:-right-20" 
            />

            <ServiceCard 
              icon={Clock3} title="60-Min" description="Fast Service" 
              borderColor="border-cyan-500/50" iconColor="text-cyan-400" 
              position="bottom-[30%] md:bottom-[25%] -left-8 md:-left-16" 
            />

            {/* 🚀 FIXED: Reviews card pushed securely to the bottom right */}
            <div className="absolute bottom-[5%] md:bottom-[10%] -right-4 md:-right-12 p-3 md:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-yellow-500/40 shadow-[0_0_20px_0_rgba(245,158,11,0.2)] z-40">
              <div className="flex -space-x-2 mb-2 justify-center">
                 {[...Array(5)].map((_,i)=> <span key={i} className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] md:text-[10px] text-yellow-500 shadow-md">⭐️</span>)}
              </div>
              <div className="text-center">
                <span className="flex items-center justify-center text-[10px] md:text-xs font-black text-white"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" /> 4.9 Rating</span>
              </div>
            </div>

            {/* 🚀 Phone Frame: Clean & Unobstructed */}
            <div className="bg-slate-900 border-[8px] md:border-[10px] border-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] w-[240px] md:w-[300px] h-[500px] md:h-[620px] shadow-[20px_20px_40px_rgba(0,0,0,0.6)] relative z-20 p-2 overflow-hidden ring-2 md:ring-4 ring-cyan-500/30">
                
                {/* Notch */}
                <div className="w-24 md:w-32 h-5 md:h-7 bg-slate-950 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl md:rounded-b-2xl z-20"></div>

                {/* 🚀 FIX: Removed resizeMode completely from the img tag */}
                <img 
                    src={appScreenshot} 
                    alt="FixitPro App" 
                    className="w-full h-full object-cover rounded-[2rem] md:rounded-[3rem]"
                />
                
                {/* Subtle Edge Sheen */}
                <div className="absolute inset-0 bg-linear-to-tr from-cyan-400/0 via-cyan-400/5 to-purple-400/0 rounded-[3.5rem] z-10 pointer-events-none opacity-50"></div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}