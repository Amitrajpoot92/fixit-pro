// src/components/home/Cta.jsx
import React from 'react';
import { Sparkles, Play, Apple } from 'lucide-react';
// 🚀 Tumhari CTA image
import ctaImg from '../../assets/cta.png'; 

export default function Cta() {
  return (
    <section className="py-20 lg:py-32 bg-white relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8">
      
      {/* 🌌 Outer glow for the entire section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* 🚀 The Banner Wrapper (Creates the 1px premium gradient border) */}
      <div className="relative w-full max-w-6xl rounded-[2.5rem] sm:rounded-[3rem] p-[1px] bg-linear-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_30px_100px_-15px_rgba(37,99,235,0.25)] z-10 group transition-transform duration-500 hover:scale-[1.01]">

        {/* 🖤 Inner Dark OLED Card */}
        <div className="relative w-full h-full bg-[#050B14] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-center">

          {/* ✨ Aurora Glows inside the card */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/15 blur-[130px] rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none"></div>

          {/* 📝 LEFT COLUMN: Content & Buttons */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 lg:p-16 xl:p-20 relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Glowing Pill Badge */}
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs sm:text-sm font-bold text-blue-400 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
              Your Device, As Good As New
            </div>

            {/* Headline with 3D Gradient Text */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Get it fixed today. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-emerald-300 drop-shadow-sm">
                10% Off your first app booking.
              </span>
            </h2>

            <p className="text-slate-400 mb-10 text-base sm:text-lg font-medium max-w-lg leading-relaxed">
              Join 10,000+ happy users. Download FixitPro now, track your technician live, and pay securely after the repair.
            </p>

            {/* Premium High-Contrast Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              
              {/* Primary White Button (Apple Style) */}
              <button className="w-full sm:w-auto bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-base hover:bg-slate-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95">
                <Apple className="w-7 h-7 fill-slate-950" />
                <div className="text-left flex flex-col">
                  <span className="text-[10px] leading-none uppercase tracking-widest opacity-80 mb-1">Download on</span>
                  <span className="leading-none font-black text-lg">Play Store</span>
                </div>
              </button>

              {/* Secondary Dark Glass Button (Play Store Style) */}
              <button className="w-full sm:w-auto bg-slate-800/80 backdrop-blur-md text-white border border-slate-700 px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95">
                <Play className="w-6 h-6 fill-white" />
                <div className="text-left flex flex-col">
                  <span className="text-[10px] leading-none uppercase tracking-widest opacity-80 mb-1">Get it on</span>
                  <span className="leading-none font-black text-lg">Google Play</span>
                </div>
              </button>

            </div>
          </div>

          {/* 📸 RIGHT COLUMN: Image Area with Spotlight */}
          <div className="w-full lg:w-2/5 relative h-[300px] sm:h-[400px] lg:h-full flex items-end justify-center lg:justify-end z-10 pt-8 lg:pt-0">

            {/* 💥 Dynamic Spotlight strictly behind the image */}
            <div className="absolute bottom-10 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-10 w-[70%] h-[70%] bg-blue-500/30 blur-[70px] rounded-full z-0 group-hover:bg-blue-400/40 transition-colors duration-700"></div>

            {/* The Image */}
            <img
              src={ctaImg}
              alt="FixitPro App Layout"
              className="relative z-20 w-[70%] sm:w-[55%] lg:w-[85%] max-w-[400px] h-auto object-contain transform translate-y-6 lg:translate-y-10 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-700 ease-out drop-shadow-2xl"
            />

            {/* Seamless Absolute Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-[#050B14] via-[#050B14]/80 to-transparent z-30 pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
}