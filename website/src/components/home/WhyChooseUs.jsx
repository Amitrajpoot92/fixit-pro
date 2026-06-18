// src/components/home/WhyChooseUs.jsx
import React from 'react';
import { ShieldCheck, BadgeCheck, Wrench, Wallet } from 'lucide-react';
import trustImg from '../../assets/trust1.png'; 

const trustFeatures = [
  {
    icon: <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />,
    title: 'Certified Experts',
    desc: 'Strict background checks and rigorous training before they knock on your door.'
  },
  {
    icon: <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />,
    title: 'Premium Parts',
    desc: 'We only use original or highest-grade OEM parts for a brand new feel.'
  },
  {
    icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />,
    title: '6-Month Warranty',
    desc: 'Peace of mind guaranteed. Same issue within 6 months? We fix it for free.'
  },
  {
    icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
    title: 'No Hidden Charges',
    desc: '100% transparent pricing. Pay only the amount you see on the app.'
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 lg:py-32 bg-[#0B0F19] relative overflow-hidden">
      
      {/* 🌌 Refined Ambient Glows (Smoother) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-blue-600/10 blur-[100px] lg:blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-emerald-500/10 blur-[100px] lg:blur-[130px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10 w-full">
        
        {/* 📸 LEFT COLUMN: Ultra-Sleek Image with Spinning Light Border */}
        <div className="w-full lg:w-1/2 relative group mt-4 lg:mt-0 flex justify-center">
          
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-2 lg:-inset-4 bg-linear-to-tr from-blue-500/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none z-0"></div>

          {/* 💥 FIX: Border now has a spinning light effect (border-spinning-light class and nested divs) */}
          <div className="relative p-[3px] rounded-[3.5rem] bg-slate-900 overflow-hidden border-spinning-light z-10 flex justify-center items-center shadow-2xl">
            {/* The actual image container that gets clipped */}
            <div className="relative rounded-[2.8rem] overflow-hidden bg-slate-900 shadow-inner z-20">
              
              <img 
                src={trustImg} 
                alt="Expert Technician" 
                className="w-full h-[320px] sm:h-[450px] lg:h-[550px] object-cover object-center filter contrast-110 brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700 ease-out"
              />
              
              {/* Bottom Fade */}
              <div className="absolute inset-0 bg-linear-to-t from-[#0B0F19] via-transparent to-transparent opacity-90 pointer-events-none z-10"></div>
              
              {/* 💥 FIX: Floating Pill */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[85%] sm:w-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 py-3 px-5 sm:px-6 rounded-full flex items-center justify-center sm:justify-start gap-3 sm:gap-4 z-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="bg-blue-500/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white font-bold text-sm sm:text-base leading-none mb-1">100% Data Secured</span>
                  <span className="text-slate-400 text-[10px] sm:text-xs font-medium leading-none">Military-grade privacy protocol.</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 📝 RIGHT COLUMN: Refined Typography & Cards */}
        <div className="w-full lg:w-1/2 relative z-20">
          
          <div className="mb-10 lg:mb-12 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-5">
               <ShieldCheck className="w-4 h-4" />
               FixitPro Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Trusted Experts. <br />
              <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Absolute Peace of Mind.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Your device holds your digital life. We treat it with utmost security, ensuring original parts and transparent pricing every single time.
            </p>
          </div>

          {/* Refined Feature List */}
          <div className="space-y-3 sm:space-y-4">
            {trustFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group flex items-start gap-4 p-4 sm:p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="bg-slate-900 border border-white/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1 tracking-tight group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 💥 ADDITION: CSS for the Spinning Light Border */}
      <style>{`
        @keyframes border-spinning-light {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .border-spinning-light::after {
          content: '';
          position: absolute;
          z-index: -1;
          left: -50%;
          top: -50%;
          width: 200%;
          height: 200%;
          /* This is the light pattern - a conic gradient */
          background-image: conic-gradient(
            transparent, 
            transparent 10%, 
            #00e6ff, /* Neon Cyan */
            #0047ff 20%, /* Electric Blue */
            transparent 30%,
            transparent 70%,
            #00e6ff 80%, /* Neon Cyan */
            #0047ff 90%, /* Electric Blue */
            transparent
          );
          animation: border-spinning-light 6s linear infinite;
        }

        /* Border radius tweaks for better fit */
        @media (max-width: 640px) {
          .border-spinning-light {
            border-radius: 2.8rem;
          }
          .border-spinning-light > div {
            border-radius: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}