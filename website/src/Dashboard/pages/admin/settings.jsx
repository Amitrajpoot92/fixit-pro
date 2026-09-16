import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { Settings, Save, Loader2, DollarSign, Percent, Phone, Mail, ShieldAlert, Building, BellRing, MapPin, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPinCode, setNewPinCode] = useState('');
  const [formData, setFormData] = useState({
    platformFee: 50,
    taxPercentage: 18,
    supportEmail: 'support@fixitpro.com',
    supportPhone: '+91 9876543210',
    allowedPinCodes: [],
  });

  // 🚀 Exactly wahi DB path jahan se Mobile App data fetch kar rahi hai
  const docRef = doc(db, 'admin_settings', 'global_config');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({ ...prev, ...data, allowedPinCodes: data.allowedPinCodes || [] }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 🚀 Save to Firestore
      await setDoc(docRef, formData, { merge: true });
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings.");
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-20">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" /> System Settings
          </h2>
          <p className="text-slate-400 mt-2">Manage global app configuration, pricing rules, and support details.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SECTION 1: Financial & Pricing */}
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="bg-emerald-500/20 p-2 rounded-lg"><DollarSign className="w-6 h-6 text-emerald-400"/></div>
                  <h3 className="text-xl font-bold text-white">Financial & Pricing</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Platform Fee (₹) per booking</label>
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 focus-within:border-emerald-500 px-4 py-1 transition-colors">
                      <DollarSign className="text-slate-500 w-5 h-5 mr-2" />
                      <input type="number" name="platformFee" value={formData.platformFee} onChange={handleChange} className="w-full bg-transparent p-3 text-white outline-none" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Tax / GST Percentage (%)</label>
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 focus-within:border-emerald-500 px-4 py-1 transition-colors">
                      <Percent className="text-slate-500 w-5 h-5 mr-2" />
                      <input type="number" name="taxPercentage" value={formData.taxPercentage} onChange={handleChange} className="w-full bg-transparent p-3 text-white outline-none" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Support & Contact (🚀 YE DIRECT APP SE LINK HAI) */}
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="bg-purple-500/20 p-2 rounded-lg"><BellRing className="w-6 h-6 text-purple-400"/></div>
                  <h3 className="text-xl font-bold text-white">Support & Contact Info</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Support Email Address</label>
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 focus-within:border-purple-500 px-4 py-1 transition-colors">
                      <Mail className="text-slate-500 w-5 h-5 mr-2" />
                      <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="w-full bg-transparent p-3 text-white outline-none" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">Helpline Phone Number</label>
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 focus-within:border-purple-500 px-4 py-1 transition-colors">
                      <Phone className="text-slate-500 w-5 h-5 mr-2" />
                      <input type="tel" name="supportPhone" value={formData.supportPhone} onChange={handleChange} className="w-full bg-transparent p-3 text-white outline-none" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Delivery Pin Codes */}
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl lg:col-span-2">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="bg-orange-500/20 p-2 rounded-lg"><MapPin className="w-6 h-6 text-orange-400"/></div>
                  <h3 className="text-xl font-bold text-white">Delivery Pin Codes</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-end gap-4">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-semibold text-slate-300 ml-1">Add Deliverable Pin Code</label>
                      <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 focus-within:border-orange-500 px-4 py-1 transition-colors">
                        <MapPin className="text-slate-500 w-5 h-5 mr-2" />
                        <input 
                          type="text" 
                          value={newPinCode} 
                          onChange={(e) => setNewPinCode(e.target.value)} 
                          className="w-full bg-transparent p-3 text-white outline-none" 
                          placeholder="e.g. 110001" 
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (newPinCode.trim().length > 0 && !formData.allowedPinCodes?.includes(newPinCode.trim())) {
                          setFormData(prev => ({ ...prev, allowedPinCodes: [...(prev.allowedPinCodes || []), newPinCode.trim()] }));
                          setNewPinCode('');
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all h-[54px] flex items-center justify-center"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {(formData.allowedPinCodes || []).map((pin, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-800 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-full font-bold">
                        {pin}
                        <button 
                          type="button" 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              allowedPinCodes: prev.allowedPinCodes.filter(p => p !== pin)
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-500 ml-1 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {(!formData.allowedPinCodes || formData.allowedPinCodes.length === 0) && (
                      <p className="text-slate-500 text-sm">No pin codes added yet. Delivery is closed everywhere.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <button disabled={saving} className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto px-10 py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30">
                {saving ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save className="w-5 h-5" /> Save All Settings</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}