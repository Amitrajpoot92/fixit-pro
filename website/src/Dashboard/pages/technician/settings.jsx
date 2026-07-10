import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { 
  Store, MapPin, User, Phone, Mail, Save, Loader2, Edit2, X 
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function TechSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUid, setUserUid] = useState(null);
  
  // 🚀 Naye States - Edit aur View mode control karne ke liye
  const [isEditing, setIsEditing] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    ownerName: '',
    mobileNo: '',
    email: ''
  });

  // Fetch Existing Profile Data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const docRef = doc(db, 'technicians', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({ ...formData, ...data });
            
            // 🚀 Agar data pehle se hai (matlab form bhar chuka hai), toh Card dikhao (isEditing = false)
            if (data.shopName && data.mobileNo) {
              setIsEditing(false);
              setHasProfile(true);
            }
          } else {
            // Naya user hai, email pre-fill karo
            setFormData(prev => ({ ...prev, email: user.email || '' }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.mobileNo) {
      toast.error("Shop Name and Mobile No are required!");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'technicians', userUid), {
        ...formData,
        updatedAt: new Date()
      }, { merge: true });

      toast.success("Profile details saved successfully!");
      
      // 🚀 Save hote hi form band karo aur Card View chalu karo
      setIsEditing(false);
      setHasProfile(true);
    } catch (error) {
      toast.error("Failed to save details. Try again.");
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto pb-12 p-4 sm:p-6">
        
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-emerald-500" /> Shop Profile Settings
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            These details are shared with the customer on their order tracking screen for transparency.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* 🚀 READ-ONLY CARD VIEW (Data Save Hone Ke Baad Ye Dikhega)     */}
            {/* ============================================================== */}
            {!isEditing && hasProfile && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-800 pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                      <Store className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight">{formData.shopName}</h3>
                      <p className="text-emerald-400 font-bold text-sm mt-1 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Active Verified Profile
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1.5">Owner Name</p>
                      <p className="text-white font-semibold text-lg flex items-center gap-2">
                        <User className="text-slate-400 w-5 h-5" /> {formData.ownerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1.5">Mobile Number</p>
                      <p className="text-white font-semibold text-lg flex items-center gap-2">
                        <Phone className="text-blue-400 w-5 h-5" /> +91 {formData.mobileNo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1.5">Email Address</p>
                      <p className="text-white font-semibold text-lg flex items-center gap-2">
                        <Mail className="text-purple-400 w-5 h-5" /> {formData.email || 'Not Provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1.5">Shop Address</p>
                      <p className="text-slate-300 font-medium leading-relaxed flex items-start gap-2">
                        <MapPin className="text-orange-400 w-5 h-5 shrink-0 mt-0.5" /> {formData.shopAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 🚀 EDIT/CREATE FORM VIEW (Pehli Baar ya Edit dabane par)       */}
            {/* ============================================================== */}
            {isEditing && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">{hasProfile ? 'Update Shop Details' : 'Create Shop Profile'}</h3>
                  {hasProfile && (
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Shop Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Shop/Center Name *</label>
                      <div className="relative">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" name="shopName" value={formData.shopName} onChange={handleChange} required
                          placeholder="e.g. FixIt Pro Repairs"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Owner Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Owner Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required
                          placeholder="e.g. Amit Sharma"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Mobile No */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required
                          placeholder="10-digit mobile number"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          placeholder="contact@shop.com"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Shop Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Shop Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                      <textarea 
                        name="shopAddress" value={formData.shopAddress} onChange={handleChange} required rows="3"
                        placeholder="Enter complete address with landmark..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                    {hasProfile && (
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)} 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 px-6 rounded-xl transition-all w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 w-full sm:w-auto"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Shop Details</>}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </>
        )}
      </div>
    </TechLayout>
  );
}

// Chhoti si CheckCircle Icon component yahi par bana li taaki alag se import na karni pade
const CheckCircle = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);