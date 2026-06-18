// src/components/home/HowItWorks.jsx
import React from 'react';
import { Smartphone, Zap, CheckCircle2, ChevronDown } from 'lucide-react';

// Refined steps for "Cuts" design - tech icons & sharp colors
const steps = [
  {
    id: '01',
    title: 'Book Service',
    desc: 'Select device & issue on app.',
    icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-[-45deg]" />,
    color: 'bg-teal-500',
    hoverBorder: 'group-hover:border-teal-300',
    shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]',
  },
  {
    id: '02',
    title: 'Tech Assigned',
    desc: 'Expert matches instantly.',
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-[-45deg]" />,
    color: 'bg-cyan-700',
    hoverBorder: 'group-hover:border-cyan-400',
    shadow: 'shadow-[0_0_20px_rgba(14,116,144,0.3)]',
  },
  {
    id: '03',
    title: 'Device Fixed',
    desc: 'Repair done at your door.',
    icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-[-45deg]" />,
    color: 'bg-blue-800',
    hoverBorder: 'group-hover:border-blue-500',
    shadow: 'shadow-[0_0_20px_rgba(30,58,138,0.3)]',
  }
];

export default function HowItWorks() {
  return (
    // 🚀 SECTION: Clean base, soft ambient lighting
    <section id="how-it-works" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden">
      
      {/* Soft Ambient Background Meshes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-100/40 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 mb-5 shadow-sm">
             <div className="w-2.5 h-2.5 bg-blue-500 rotate-45"></div>
             Seamless 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 mb-6 leading-tighttracking-tight">
            How It Works
          </h2>
        </div>

        {/* 🚀 Timeline Container (Unified Zigzag Layout) */}
        <div className="relative">
          
          {/* 💥 CONNECTING LINE: Now a solid sharp line centered horizontally */}
          <div className="absolute md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-slate-200 z-0"></div>

          {steps.map((step, index) => {
            // Alternating logic handles all screens
            const isLeft = index % 2 === 0;

            return (
              <div key={index} className="flex flex-col md:flex-row items-center justify-center w-full mb-12 md:mb-16 relative z-10">
                
                {/* 🎨 STEP LAYOUT: Single unified structure */}
                {/* Mobile: col-number | node | card vs col-card | node | col-number */}
                <div className={`flex items-center justify-center w-full gap-2 sm:gap-4 md:gap-0 ${isLeft ? 'flex-row' : 'flex-row-reverse md:flex-row'}`}>

                  {/* 1. Step Label & Number Side (Desktop Align handles alternating) */}
                  <div className={`flex flex-col items-center md:w-[45%] ${isLeft ? 'md:items-end md:text-right md:pr-10' : 'md:items-start md:text-left md:pl-10'}`}>
                     <div className="text-[2.5rem] sm:text-5xl md:text-7xl font-black leading-none bg-linear-to-b from-slate-300 via-slate-200 to-transparent bg-clip-text text-transparent [text-shadow:0_2px_10px_rgba(0,0,0,0.02)]">{step.id}</div>
                  </div>

                  {/* 2. Timeline Node (Sharp Diamond Shape) */}
                  <div className="w-10 sm:w-12 md:w-[10%] flex justify-center relative z-20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rotate-45 bg-white border-[6px] border-slate-200 flex items-center justify-center shadow-[5px_5px_15px_rgba(0,0,0,0.05)]">
                       <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${step.color}`}></div>
                    </div>
                  </div>

                  {/* 3. The 'Cuts' Card Side */}
                  <div className={`flex-1 md:w-[45%] flex items-center gap-3 lg:gap-4 ${isLeft ? 'justify-start md:justify-start md:pl-10' : 'justify-end md:justify-end md:pr-10'} relative`}>
                    
                    {/* 💥 CUTS: Parallelogram Shape (Clip-path used for extreme sharp cut design) */}
                    <div 
                      style={{ clipPath: `polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)` }}
                      className={`relative group ${step.color} p-5 lg:p-6 shadow-lg min-w-[160px] max-w-[280px] lg:max-w-[320px] transition-all duration-500 hover:-translate-y-1.5 ${step.shadow} z-10 border-b-4 ${step.hoverBorder}`}
                    >
                      {/* Premium Hover Sheen Effect */}
                      <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-out z-0 pointer-events-none"></div>

                      <h3 className="text-lg lg:text-xl font-extrabold text-white mb-1.5 uppercase tracking-widest leading-tight relative z-10">{step.title}</h3>
                      <p className="text-[11px] lg:text-xs text-white/90 font-medium leading-relaxed relative z-10 max-w-[180px]">{step.desc}</p>
                    </div>

                    {/* 💎 Icon Orb (Diamond Shape + Upright Icon) */}
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rotate-45 flex items-center justify-center shrink-0 shadow-lg ${step.color} border border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]`}>
                        {step.icon}
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}