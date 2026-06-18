// src/components/home/Services.jsx
import React from 'react';
import { Smartphone, Laptop, Headphones, BatteryCharging, Wrench } from 'lucide-react';
// 🚀 REAL IMAGE IMPORT
import serviceImg from '../../assets/service.jpg';

// Premium Service Data with Gradient Highlights
const services = [
  { 
    icon: <Smartphone className="w-7 h-7 text-white" />, 
    title: 'Mobile Repair', 
    desc: 'Screen, battery, and motherboard fixes.',
    gradient: 'bg-linear-to-br from-blue-500 to-indigo-600',
    shadow: 'shadow-[0_10px_20px_rgba(59,130,246,0.3)]',
    hoverBorder: 'group-hover:border-blue-200'
  },
  { 
    icon: <Laptop className="w-7 h-7 text-white" />, 
    title: 'Laptop Repair', 
    desc: 'Keyboard, screen, and software issues.',
    gradient: 'bg-linear-to-br from-emerald-400 to-teal-500',
    shadow: 'shadow-[0_10px_20px_rgba(16,185,129,0.3)]',
    hoverBorder: 'group-hover:border-emerald-200'
  },
  { 
    icon: <Headphones className="w-7 h-7 text-white" />, 
    title: 'Accessories', 
    desc: 'Original chargers, cables, and covers.',
    gradient: 'bg-linear-to-br from-purple-500 to-fuchsia-500',
    shadow: 'shadow-[0_10px_20px_rgba(168,85,247,0.3)]',
    hoverBorder: 'group-hover:border-purple-200'
  },
  { 
    icon: <BatteryCharging className="w-7 h-7 text-white" />, 
    title: 'Battery Replacements', 
    desc: '100% original batteries with warranty.',
    gradient: 'bg-linear-to-br from-orange-400 to-rose-500',
    shadow: 'shadow-[0_10px_20px_rgba(249,115,22,0.3)]',
    hoverBorder: 'group-hover:border-orange-200'
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 lg:py-32 bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-50/80 blur-[100px] pointer-events-none"></div>
      
      {/* 🚀 Advanced Grid: Manages Mobile vs Desktop DOM Order automatically */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-16 items-center">
        
        {/* 📝 1. TEXT HEADER (Mobile: Order 1, Desktop: Top Right) */}
        <div className="lg:col-start-2 lg:row-start-1 text-center lg:text-left z-10 pt-4 lg:pt-0">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white text-slate-700 font-bold text-sm mb-6 border border-slate-200 shadow-sm">
            <Wrench className="w-4 h-4 text-blue-600" />
            What We Fix
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
            Premium Repairs, <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Done Right.</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0">
            We fix all major brands right in front of you. Transparent pricing, genuine parts, and zero hidden charges.
          </p>
        </div>

        {/* 🎨 2. HERO IMAGE (Mobile: Order 2, Desktop: Left Column spanning both rows) */}
        <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 w-full relative flex justify-center z-10">
          
          {/* Decorative Glow Behind Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-blue-200 rounded-full blur-[80px] opacity-50"></div>
          
          <div className="relative group w-full max-w-[450px]">
            {/* Image Container with "Apple-like" Soft Outline */}
            <div className="bg-white p-2 sm:p-3 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden transform transition duration-700 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
              <div className="rounded-[2rem] overflow-hidden bg-slate-50">
                <img 
                  src={serviceImg} 
                  alt="FixitPro Expert Technician" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700 ease-out"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🧩 3. PREMIUM SERVICE CARDS (Mobile: Order 3, Desktop: Bottom Right) */}
        <div className="lg:col-start-2 lg:row-start-2 grid grid-cols-1 sm:grid-cols-2 gap-5 z-10">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`group relative bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] overflow-hidden ${service.hoverBorder}`}
            >
              {/* Premium Hover Sheen Effect */}
              <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-out z-0 pointer-events-none"></div>
              
              {/* Floating Orb Icon */}
              <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center mb-6 relative z-10 ${service.gradient} ${service.shadow} transform group-hover:scale-110 group-hover:rotate-3 transition duration-300`}>
                {service.icon}
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 relative z-10 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}