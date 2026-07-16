import React, { useState, useEffect } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdminLayout from '../../component/admin/AdminLayout';

const IMAGEKIT_PRIVATE_KEY = "private_x77JBMB4vB985OM8bOdAhUEoxW8=";

export default function ManageHome() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // 🚀 Title split into 3 lines, default image removed
  const [banners, setBanners] = useState([
    { id: 1, isVisible: true, isFullImage: false, titleLine1: '', titleLine2: '', titleLine3: '', feature1: '', feature2: '', feature3: '', btnText: '', image: '', color: '#0F172A' },
    { id: 2, isVisible: false, isFullImage: false, titleLine1: '', titleLine2: '', titleLine3: '', feature1: '', feature2: '', feature3: '', btnText: '', image: '', color: '#4C1D95' },
    { id: 3, isVisible: false, isFullImage: false, titleLine1: '', titleLine2: '', titleLine3: '', feature1: '', feature2: '', feature3: '', btnText: '', image: '', color: '#065F46' },
    { id: 4, isVisible: false, isFullImage: false, titleLine1: '', titleLine2: '', titleLine3: '', feature1: '', feature2: '', feature3: '', btnText: '', image: '', color: '#9A3412' },
  ]);

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const docRef = doc(db, 'app_settings', 'home_banners');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().banners) {
          const fetchedBanners = docSnap.data().banners;
          setBanners(banners.map((b, i) => fetchedBanners[i] ? { ...b, ...fetchedBanners[i] } : b));
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const handleChange = (index, field, value) => {
    const newBanners = [...banners];
    newBanners[index][field] = value;
    setBanners(newBanners);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    setSaving(true);
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", `banner_${index}.jpg`);

    const encodedKey = btoa(IMAGEKIT_PRIVATE_KEY + ":");

    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}` },
        body: form,
      });
      const data = await response.json();
      if (response.ok) {
        handleChange(index, 'image', data.url);
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await setDoc(doc(db, 'app_settings', 'home_banners'), { banners });
      setSuccess('All Banners Updated Successfully! Live on App.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error saving banners:", error);
      alert("Failed to save banners.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div></AdminLayout>;
  }

  const activeBanner = banners[activeTab];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-10">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">App Home Banners</h1>
            <p className="text-slate-400 mt-1">Manage display, colors, and content in real-time.</p>
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Publish to App
          </button>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Banner Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {banners.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === idx ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {b.isVisible ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
              Banner {idx + 1}
            </button>
          ))}
        </div>

        {/* Editor Form for Active Tab */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeBanner.isVisible}
                  onChange={(e) => handleChange(activeTab, 'isVisible', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
                <span className={`text-sm font-bold ${activeBanner.isVisible ? 'text-green-400' : 'text-slate-400'}`}>
                  {activeBanner.isVisible ? 'Banner is Visible' : 'Banner is Hidden'}
                </span>
              </label>

              <div className="w-[1px] h-6 bg-slate-700"></div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeBanner.isFullImage}
                  onChange={(e) => handleChange(activeTab, 'isFullImage', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-300">Full Image Banner</span>
              </label>

              <div className="w-[1px] h-6 bg-slate-700"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300">Color:</span>
                <input 
                  type="color" 
                  value={activeBanner.color}
                  onChange={(e) => handleChange(activeTab, 'color', e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* 🟢 Banner Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {activeBanner.isFullImage ? "Upload Full Wide Banner Image" : "Upload Right Side Product Image (Transparent PNG)"}
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(activeTab, e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30"
              />
            </div>

            {/* 🟢 Text Fields (3 Lines for Title) */}
            {!activeBanner.isFullImage && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Title Line 1</label>
                    <input type="text" value={activeBanner.titleLine1} onChange={(e) => handleChange(activeTab, 'titleLine1', e.target.value)} placeholder="Professional Repair" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Title Line 2</label>
                    <input type="text" value={activeBanner.titleLine2} onChange={(e) => handleChange(activeTab, 'titleLine2', e.target.value)} placeholder="Trusted Service" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Title Line 3</label>
                    <input type="text" value={activeBanner.titleLine3} onChange={(e) => handleChange(activeTab, 'titleLine3', e.target.value)} placeholder="At Your Doorstep" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Feature 1</label>
                    <input type="text" value={activeBanner.feature1} onChange={(e) => handleChange(activeTab, 'feature1', e.target.value)} placeholder="Pickup" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Feature 2</label>
                    <input type="text" value={activeBanner.feature2} onChange={(e) => handleChange(activeTab, 'feature2', e.target.value)} placeholder="Repair" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Feature 3</label>
                    <input type="text" value={activeBanner.feature3} onChange={(e) => handleChange(activeTab, 'feature3', e.target.value)} placeholder="Delivered" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Button Text</label>
                  <input 
                    type="text" 
                    value={activeBanner.btnText}
                    onChange={(e) => handleChange(activeTab, 'btnText', e.target.value)}
                    placeholder="Book Repair Now"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 🟢 Live Preview Side */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex justify-between">
              <span>Live App Preview</span>
              {!activeBanner.isVisible && <span className="text-red-400 text-xs">Currently Hidden in App</span>}
            </label>
            
            <div 
              style={{ backgroundColor: activeBanner.color, opacity: activeBanner.isVisible ? 1 : 0.4 }}
              className="relative w-full h-[220px] rounded-[20px] shadow-2xl overflow-hidden transition-all duration-300 flex"
            >
              {activeBanner.isFullImage ? (
                /* FULL IMAGE PREVIEW */
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  {activeBanner.image ? (
                    <img src={activeBanner.image} alt="Full Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white/50 text-sm font-bold flex flex-col items-center">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      Upload Full Image
                    </div>
                  )}
                </div>
              ) : (
                /* TEXT + IMAGE PREVIEW */
                <>
                  <div className="w-[60%] p-5 z-10 relative flex flex-col justify-center">
                    <div className="text-white text-[15px] font-extrabold leading-[22px] flex flex-col mb-1">
                      <span>{activeBanner.titleLine1 || 'Title Line 1...'}</span>
                      <span>{activeBanner.titleLine2 || 'Title Line 2...'}</span>
                      <span>{activeBanner.titleLine3 || 'Title Line 3...'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {activeBanner.feature1 && <span className="text-white text-[9px] font-semibold opacity-90">✓ {activeBanner.feature1}</span>}
                      {activeBanner.feature2 && <span className="text-white text-[9px] font-semibold opacity-90">✓ {activeBanner.feature2}</span>}
                      {activeBanner.feature3 && <span className="text-white text-[9px] font-semibold opacity-90">✓ {activeBanner.feature3}</span>}
                    </div>
                    {activeBanner.btnText && (
                      <div className="bg-[#FACC15] px-3 py-2 rounded-lg inline-block self-start">
                        <p className="text-black text-[12px] font-extrabold">{activeBanner.btnText}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-[40%] h-full flex items-center justify-center p-2 relative">
                    {activeBanner.image ? (
                      <img src={activeBanner.image} alt="Product" className="w-full h-full object-contain z-10" />
                    ) : (
                      <div className="text-white/30 text-xs text-center border-2 border-dashed border-white/20 rounded-xl p-4 w-[90%] h-[80%] flex items-center justify-center">
                        Image Optional
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}