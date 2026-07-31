import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';
import { 
  Package, Smartphone, Laptop, Loader2, CheckCircle, Edit, Trash2, 
  X, Image as ImageIcon, UploadCloud, Plus, Save, IndianRupee, Layers 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const IMAGEKIT_PRIVATE_KEY = "private_x77JBMB4vB985OM8bOdAhUEoxW8=";

export default function Catalog() {
  // 🚀 NAYE 4 TABS ARCHITECTURE
  const [activeTab, setActiveTab] = useState('Global Services');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // Data States
  const [globalServices, setGlobalServices] = useState([]); // Master Menu
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [masterServices, setMasterServices] = useState([]); // Old structure for app

  // Form States
  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('Mobile');
  
  // Quick Add Models States
  const [quickBrandId, setQuickBrandId] = useState('');
  const [quickModelName, setQuickModelName] = useState('');
  const [pendingModels, setPendingModels] = useState([]); // List of models before save

  // Smart Pricing States
  const [pricingBrandId, setPricingBrandId] = useState('');
  const [pricingModelId, setPricingModelId] = useState('');
  const [priceMap, setPriceMap] = useState({}); // Stores { "Screen Repair": 4500 }

  // Global Service States
  const [globalServiceTitle, setGlobalServiceTitle] = useState('');

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 🚀 Fetch All Data
  const fetchData = async () => {
    // Naya Master Menu
    const gsSnap = await getDocs(collection(db, 'master_global_services'));
    setGlobalServices(gsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Purane Tables
    const bSnap = await getDocs(collection(db, 'master_brands'));
    setBrands(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const mSnap = await getDocs(collection(db, 'master_models'));
    setModels(mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const sSnap = await getDocs(collection(db, 'master_services'));
    setMasterServices(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  // Form Reset
  const resetForm = () => {
    setBrandName(''); setBrandType('Mobile');
    setQuickModelName(''); setQuickBrandId(''); setPendingModels([]);
    setGlobalServiceTitle('');
    setPricingBrandId(''); setPricingModelId(''); setPriceMap({});
    setEditingId(null); setImageFile(null); setImagePreview(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // ImageKit Upload
  const uploadToImageKit = async (file) => {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);
    const encodedKey = btoa(IMAGEKIT_PRIVATE_KEY + ":");

    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST", headers: { Authorization: `Basic ${encodedKey}` }, body: form,
      });
      const data = await response.json();
      if (response.ok) return data.url; 
      else throw new Error("Upload failed");
    } catch (err) { throw err; }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  // ==================================================
  // 🚀 1. SAVE GLOBAL SERVICE & BRAND LOGIC
  // ==================================================
  const handleSaveStandard = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = imagePreview && !imageFile ? imagePreview : null; 
      if (imageFile) finalImageUrl = await uploadToImageKit(imageFile);

      if (type === 'Global Service') {
        const data = { title: globalServiceTitle, image: finalImageUrl };
        if (editingId) await updateDoc(doc(db, 'master_global_services', editingId), data);
        else await addDoc(collection(db, 'master_global_services'), data);
      } 
      else if (type === 'Brand') {
        const data = { name: brandName, type: brandType, image: finalImageUrl };
        if (editingId) await updateDoc(doc(db, 'master_brands', editingId), data);
        else await addDoc(collection(db, 'master_brands'), data);
      } 
      
      toast.success(`${type} Saved Successfully!`);
      resetForm(); fetchData();
    } catch (err) { toast.error("Failed to save!"); }
    setLoading(false);
  };

  // ==================================================
  // 🚀 2. RAPID MODEL ADDER (The + Button Logic)
  // ==================================================
  const handleAddPendingModel = () => {
    if(!quickModelName.trim() || !quickBrandId) return toast.error("Select Brand & enter Model name!");
    
    setPendingModels([...pendingModels, {
      id: Date.now(),
      name: quickModelName,
      imageFile: imageFile,
      imagePreview: imagePreview
    }]);
    
    // Clear inputs for next entry
    setQuickModelName(''); setImageFile(null); setImagePreview(null);
  };

  const removePendingModel = (id) => {
    setPendingModels(pendingModels.filter(m => m.id !== id));
  };

  const handleSaveAllModels = async () => {
    if(pendingModels.length === 0) return toast.error("Add at least one model to save.");
    setLoading(true);
    
    try {
      const batch = writeBatch(db);
      
      for (let model of pendingModels) {
        let finalImageUrl = null;
        if (model.imageFile) finalImageUrl = await uploadToImageKit(model.imageFile);
        
        const docRef = doc(collection(db, 'master_models'));
        batch.set(docRef, { brandId: quickBrandId, name: model.name, image: finalImageUrl });
      }

      await batch.commit();
      toast.success(`${pendingModels.length} Models added successfully!`);
      resetForm(); fetchData();
    } catch (error) {
      toast.error("Failed to save models.");
    }
    setLoading(false);
  };

  // ==================================================
  // 🚀 3. SMART PRICING MANAGER LOGIC
  // ==================================================
  useEffect(() => {
    // Jab bhi model change ho, uski existing pricing fetch karke map me bhar do
    if (pricingModelId) {
      const existingServicesForModel = masterServices.filter(s => s.modelId === pricingModelId);
      const newPriceMap = {};
      existingServicesForModel.forEach(s => {
        newPriceMap[s.title] = s.basePrice;
      });
      setPriceMap(newPriceMap);
    } else {
      setPriceMap({});
    }
  }, [pricingModelId, masterServices]);

  const handlePriceChange = (title, value) => {
    setPriceMap(prev => ({ ...prev, [title]: value }));
  };

  const handleUpdateSmartPricing = async () => {
    if(!pricingModelId) return toast.error("Select a model first!");
    setLoading(true);
    
    try {
      const batch = writeBatch(db);
      const existingServicesForModel = masterServices.filter(s => s.modelId === pricingModelId);
      let count = 0;

      // Loop through all global services
      globalServices.forEach(globalSrv => {
        const enteredPrice = priceMap[globalSrv.title];
        
        // Agar price 0 se zyada hai, toh save/update karo
        if (enteredPrice !== undefined && enteredPrice !== '' && Number(enteredPrice) > 0) {
          
          // Check if this service already exists for this model
          const existingSrv = existingServicesForModel.find(s => s.title === globalSrv.title);
          
          if (existingSrv) {
            // Update existing (Protects old database structure)
            const docRef = doc(db, 'master_services', existingSrv.id);
            batch.update(docRef, { basePrice: Number(enteredPrice), image: globalSrv.image });
          } else {
            // Add new (Protects old database structure)
            const docRef = doc(collection(db, 'master_services'));
            batch.set(docRef, {
              modelId: pricingModelId,
              title: globalSrv.title,
              basePrice: Number(enteredPrice),
              image: globalSrv.image
            });
          }
          count++;
        }
      });

      await batch.commit();
      toast.success(`${count} Services updated for this model!`);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update pricing.");
      console.error(error);
    }
    setLoading(false);
  };

  // Delete Handlers
  const handleDelete = async (id, collectionName) => {
    if (!window.confirm("Delete this permanently?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Deleted!"); fetchData();
    } catch (err) { toast.error("Failed to delete!"); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3"><Layers className="text-purple-500" /> Catalog Engine</h2>
          <p className="text-slate-400 mt-1">Smart Entry System: Set global services once, rapid add models, and manage pricing in bulk.</p>
        </div>

        {/* 🚀 SMART TABS */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900 p-1.5 rounded-2xl w-fit border border-slate-800">
          {['Global Services', 'Brands', 'Models (Quick Add)', 'Smart Pricing'].map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ================================================== */}
        {/* TAB 1: GLOBAL SERVICES (Master List) */}
        {/* ================================================== */}
        {activeTab === 'Global Services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">Add Master Service</h3>
              <form onSubmit={(e) => handleSaveStandard(e, 'Global Service')} className="space-y-5">
                <div className="relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center h-40 overflow-hidden group">
                  {imagePreview ? (
                    <><img src={imagePreview} className="h-full w-full object-contain p-2" /><button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 bg-slate-900/80 p-1 rounded-full text-rose-400 hover:text-white hover:bg-rose-500"><X size={16} /></button></>
                  ) : (
                    <div className="text-center p-4 pointer-events-none">
                      <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-400">Upload Icon</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <input value={globalServiceTitle} onChange={e => setGlobalServiceTitle(e.target.value)} placeholder="E.g. Screen Replacement" className="w-full bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-purple-500" required />
                <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 py-3.5 rounded-xl text-white font-bold flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : <><UploadCloud size={18}/> Save to Global</>}</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl">
               <h3 className="text-lg font-bold text-white mb-4">Global Services List ({globalServices.length})</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {globalServices.map(s => (
                   <div key={s.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center relative group">
                     <button onClick={() => handleDelete(s.id, 'master_global_services')} className="absolute top-2 right-2 p-1.5 bg-rose-500/10 text-rose-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"><Trash2 size={14}/></button>
                     <img src={s.image} alt={s.title} className="w-12 h-12 object-contain mb-3" />
                     <p className="text-sm font-bold text-white leading-tight">{s.title}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 2: BRANDS */}
        {/* ================================================== */}
        {activeTab === 'Brands' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">Add Brand</h3>
              <form onSubmit={(e) => handleSaveStandard(e, 'Brand')} className="space-y-5">
                <div className="flex gap-2">
                  {['Mobile', 'Laptop'].map(t => (
                    <button key={t} type="button" onClick={() => setBrandType(t)} className={`flex-1 py-3 rounded-xl border text-sm font-bold flex justify-center gap-2 transition-all ${brandType === t ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                      {t === 'Mobile' ? <Smartphone size={16}/> : <Laptop size={16}/>} {t}
                    </button>
                  ))}
                </div>
                <div className="relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center h-32 overflow-hidden group">
                  {imagePreview ? (
                    <><img src={imagePreview} className="h-full w-full object-contain p-2" /><button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 bg-slate-900/80 p-1 rounded-full text-rose-400"><X size={16} /></button></>
                  ) : (
                    <div className="text-center pointer-events-none"><ImageIcon className="w-6 h-6 text-slate-500 mx-auto mb-1" /><p className="text-[10px] font-medium text-slate-400">Upload Logo</p></div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="E.g. Apple" className="w-full bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-purple-500" required />
                <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 py-3.5 rounded-xl text-white font-bold flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : <><UploadCloud size={18}/> Save Brand</>}</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl">
               <h3 className="text-lg font-bold text-white mb-4">Existing Brands ({brands.length})</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {brands.map(b => (
                   <div key={b.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center relative group">
                     <button onClick={() => handleDelete(b.id, 'master_brands')} className="absolute top-2 right-2 p-1 bg-rose-500/10 text-rose-400 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"><Trash2 size={12}/></button>
                     <img src={b.image} alt={b.name} className="w-10 h-10 object-contain mb-2" />
                     <p className="text-sm font-bold text-white">{b.name}</p>
                     <p className="text-[10px] text-slate-400">{b.type}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: MODELS (RAPID ADDER) */}
        {/* ================================================== */}
        {activeTab === 'Models (Quick Add)' && (
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-8 shadow-xl">
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
               <select value={quickBrandId} onChange={e => setQuickBrandId(e.target.value)} className="w-full sm:w-1/3 bg-slate-800 p-4 rounded-xl text-white border-2 border-purple-500/30 focus:border-purple-500 outline-none font-bold" required>
                 <option value="">1. Choose Brand First</option>
                 {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
            </div>

            {quickBrandId && (
              <div className="bg-slate-950 p-4 lg:p-6 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">2. Add Models Rapidly</p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-20 h-20 relative border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <><img src={imagePreview} className="h-full w-full object-contain p-1" /><button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-1 right-1 bg-slate-900/80 p-0.5 rounded-full text-rose-400"><X size={12} /></button></>
                    ) : (
                      <div className="text-center pointer-events-none"><ImageIcon className="w-5 h-5 text-slate-500 mx-auto" /><p className="text-[8px] mt-1 text-slate-400">Photo</p></div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>

                  <div className="flex-1 w-full">
                     <label className="text-xs text-slate-500 font-bold mb-1 block">Model Name</label>
                     <input value={quickModelName} onChange={e => setQuickModelName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPendingModel()} placeholder="E.g. iPhone 15 Pro" className="w-full bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-emerald-500 outline-none" />
                  </div>

                  <button onClick={handleAddPendingModel} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 p-4 rounded-xl text-white font-black flex items-center justify-center gap-2 h-[58px] transition-colors">
                    <Plus size={20}/> Add
                  </button>
                </div>
              </div>
            )}

            {/* List of pending models */}
            {pendingModels.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">Ready to Save ({pendingModels.length} Models)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {pendingModels.map(model => (
                    <div key={model.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3 relative">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {model.imagePreview ? <img src={model.imagePreview} className="w-full h-full object-contain p-1" /> : <ImageIcon size={16} className="text-slate-600"/>}
                      </div>
                      <p className="font-bold text-white text-sm truncate pr-6">{model.name}</p>
                      <button onClick={() => removePendingModel(model.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-300 bg-rose-500/10 p-1.5 rounded-md"><X size={14}/></button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveAllModels} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-black flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20">
                  {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save size={20}/> Save All {pendingModels.length} Models to Database</>}
                </button>
              </div>
            )}

            {/* Existing Models List */}
            <div className="mt-12">
               <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Existing Models ({models.length})</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                 {models.map(m => {
                   const pBrand = brands.find(b => b.id === m.brandId);
                   return (
                     <div key={m.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center relative group">
                       <button onClick={() => handleDelete(m.id, 'master_models')} className="absolute top-1 right-1 p-1 bg-rose-500/10 text-rose-400 rounded opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                       <img src={m.image} alt={m.name} className="w-10 h-10 object-contain mx-auto mb-2" />
                       <p className="text-xs font-bold text-white truncate">{m.name}</p>
                       <p className="text-[9px] text-purple-400">{pBrand?.name}</p>
                     </div>
                   )
                 })}
               </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 4: SMART PRICING MANAGER (The Game Changer) */}
        {/* ================================================== */}
        {activeTab === 'Smart Pricing' && (
          <div className="bg-slate-900 border-t-4 border-t-purple-500 border-slate-700 rounded-3xl p-6 lg:p-8 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
               <select value={pricingBrandId} onChange={e => {setPricingBrandId(e.target.value); setPricingModelId('');}} className="flex-1 bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-purple-500 outline-none font-bold">
                 <option value="">1. Choose Brand</option>
                 {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>

               <select value={pricingModelId} onChange={e => setPricingModelId(e.target.value)} disabled={!pricingBrandId} className="flex-1 bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-purple-500 outline-none font-bold disabled:opacity-50">
                 <option value="">2. Choose Model to Price</option>
                 {models.filter(m => m.brandId === pricingBrandId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
            </div>

            {pricingModelId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4 mb-6 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                  {models.find(m => m.id === pricingModelId)?.image && (
                    <img src={models.find(m => m.id === pricingModelId)?.image} className="w-12 h-12 object-contain" />
                  )}
                  <div>
                    <h3 className="text-xl font-black text-white">{models.find(m => m.id === pricingModelId)?.name} Pricing</h3>
                    <p className="text-xs text-purple-400 font-semibold mt-1">Set prices below. Leave blank (or 0) to skip a service.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {globalServices.map(globalSrv => (
                    <div key={globalSrv.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-4 hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                          <img src={globalSrv.image} alt="icon" className="w-6 h-6 object-contain" />
                        </div>
                        <p className="font-bold text-sm text-slate-200 line-clamp-2 leading-tight">{globalSrv.title}</p>
                      </div>
                      
                      <div className="relative w-28 shrink-0">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="number" 
                          min="0"
                          value={priceMap[globalSrv.title] || ''}
                          onChange={(e) => handlePriceChange(globalSrv.title, e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-8 pr-3 text-white font-bold text-sm focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleUpdateSmartPricing} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4.5 rounded-xl text-white font-black text-lg flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all h-[60px]">
                  {loading ? <Loader2 className="animate-spin w-6 h-6"/> : <><Save size={24}/> Update All Prices for {models.find(m => m.id === pricingModelId)?.name}</>}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}