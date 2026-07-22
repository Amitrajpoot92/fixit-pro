import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Clock, Landmark, 
  CreditCard, Smartphone, CheckCircle2, Save, 
  Loader2, Eye, EyeOff, Phone 
} from 'lucide-react';
import { auth, db } from '../../../firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

// 🚀 Common Layout import kiya hai taaki sidebar automatic manage ho
import TechLayout from '../../component/technician/TechLayout'; 

export default function Kyc() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('unverified'); 
  
  // 👁️ Visibility States for sensitive fields
  const [showPan, setShowPan] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  
  const [formData, setFormData] = useState({
    pan_number: '', 
    aadhaar_number: '', 
    account_number: '', 
    ifsc_code: '', 
    mobile_number: '', 
    upi_id: '', 
    upi_number: ''
  });

  useEffect(() => {
    const fetchKycData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const techSnap = await getDoc(doc(db, 'technicians', user.uid));
        if (techSnap.exists()) {
          const data = techSnap.data();
          if (data.kyc_details) setFormData(data.kyc_details);
          if (data.kyc_status) setStatus(data.kyc_status);
        }
      } catch (error) {
        console.error("Error fetching KYC:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKycData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['aadhaar_number', 'account_number', 'upi_number', 'mobile_number'].includes(name) && value !== '' && !/^\d+$/.test(value)) return;
    
    if (name === 'pan_number' || name === 'ifsc_code') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      await setDoc(doc(db, 'technicians', user.uid), { kyc_details: formData, kyc_status: 'pending' }, { merge: true });
      setStatus('pending');
      alert("KYC Details Submitted! Waiting for Admin Approval.");
    } catch (error) {
      alert("Failed to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isVerified = status === 'verified';

  return (
    <TechLayout>
      <div className="max-w-4xl mx-auto pb-12 p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* HEADER STATUS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" /> 
                  KYC & Bank Verification
                </h1>
                <p className="text-slate-400 text-sm mt-1">Submit your secure details to receive payouts.</p>
              </div>
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border font-bold ${status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : status === 'pending' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                {status === 'verified' && <CheckCircle2 className="w-5 h-5" />}
                {status === 'pending' && <Clock className="w-5 h-5" />}
                {status === 'unverified' && <AlertTriangle className="w-5 h-5" />}
                <span>{status === 'verified' ? 'Verified (Active)' : status === 'pending' ? 'Under Review' : 'Action Required'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. IDENTITY DOCUMENTS */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="bg-slate-700/30 px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white">Identity Documents</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-300">PAN Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input required disabled={isVerified} type={showPan ? "text" : "password"} name="pan_number" value={formData.pan_number} onChange={handleChange} maxLength="10" placeholder="ABCDE1234F" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                      <button type="button" onClick={() => setShowPan(!showPan)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white" disabled={isVerified}>
                        {showPan ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-300">Aadhaar Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input required disabled={isVerified} type={showAadhaar ? "text" : "password"} name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} maxLength="12" placeholder="[Aadhaar Redacted]" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                      <button type="button" onClick={() => setShowAadhaar(!showAadhaar)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white" disabled={isVerified}>
                        {showAadhaar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. BANK ACCOUNT DETAILS */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="bg-slate-700/30 px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Bank Account Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Account Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input required disabled={isVerified} type={showAccount ? "text" : "password"} name="account_number" value={formData.account_number} onChange={handleChange} placeholder="Enter Account No." className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-mono tracking-wider" />
                      <button type="button" onClick={() => setShowAccount(!showAccount)} className="absolute right-3 top-3.5 text-slate-400 hover:text-white" disabled={isVerified}>
                        {showAccount ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">IFSC Code <span className="text-red-500">*</span></label>
                    <input required disabled={isVerified} type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} maxLength="11" placeholder="SBIN0001234" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-mono" />
                  </div>
                </div>
              </div>

              {/* 3. CONTACT & UPI DETAILS */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="bg-slate-700/30 px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">Contact & UPI Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> Primary Mobile No <span className="text-red-500">*</span></label>
                    <input required disabled={isVerified} type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} maxLength="10" placeholder="9876543210" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">UPI ID <span className="text-slate-500">(Optional)</span></label>
                    <input disabled={isVerified} type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} placeholder="yourname@okbank" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-300">UPI Number <span className="text-slate-500">(Optional)</span></label>
                    <input disabled={isVerified} type="text" name="upi_number" value={formData.upi_number} onChange={handleChange} maxLength="10" placeholder="9876543210" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end pt-4 pb-10">
                {!isVerified ? (
                  <button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving Details...' : 'Submit Securely for Verification'}
                  </button>
                ) : (
                  <div className="w-full md:w-auto bg-emerald-500/10 px-6 py-4 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-bold">Details Verified & Locked</p>
                      <p className="text-emerald-500/70 text-xs mt-0.5">Contact support to make any changes.</p>
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        )}
      </div>
    </TechLayout>
  );
}