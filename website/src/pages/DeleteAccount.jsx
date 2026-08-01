import React, { useState } from 'react';
import Header from '../components/common/header';
import Footer from '../components/common/footer';

export default function DeleteAccount() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const message = `*Account Deletion Request*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Reason:* ${formData.reason}`;
    
    // Admin WhatsApp Number (Indian format by default, add country code if needed)
    const adminPhone = '919576441800'; 
    
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-[#050B14] min-h-screen flex flex-col text-slate-300 font-sans">
      <Header />
      <div className="flex-grow flex items-center justify-center px-6 py-20 mt-10">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <h1 className="text-3xl font-black text-white mb-2 text-center">Delete Account</h1>
          <p className="text-slate-400 text-sm mb-8 text-center">
            Submit a request to permanently delete your FixitPro account and all associated data.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Enter 10-digit mobile number"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason for leaving (Optional)</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Please tell us why you are leaving..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2"
            >
              Request Deletion via WhatsApp
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-4">
              * Note: Account deletion is permanent and cannot be undone.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
