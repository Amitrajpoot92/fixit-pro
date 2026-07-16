import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';
import { Package, Smartphone, Laptop, Loader2, CheckCircle, Edit, Trash2, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const IMAGEKIT_PRIVATE_KEY = "private_x77JBMB4vB985OM8bOdAhUEoxW8=";

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('Brand');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // Data States
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]); 

  // Form States
  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('Mobile');
  
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [modelName, setModelName] = useState('');
  
  const [selectedModelBrandId, setSelectedModelBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');

  // 🚀 Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch All Data
  const fetchData = async () => {
    const bSnap = await getDocs(collection(db, 'master_brands'));
    setBrands(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const mSnap = await getDocs(collection(db, 'master_models'));
    setModels(mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const sSnap = await getDocs(collection(db, 'master_services'));
    setServices(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  // Form Reset Helper
  const resetForm = () => {
    setBrandName(''); setBrandType('Mobile');
    setModelName(''); setSelectedBrandId('');
    setServiceTitle(''); setBasePrice(''); setSelectedModelId(''); setSelectedModelBrandId('');
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // Switch Tab Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // 🚀 ImageKit Upload Logic
  const uploadToImageKit = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);

    const encodedKey = btoa(IMAGEKIT_PRIVATE_KEY + ":");

    try {
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: { Authorization: `Basic ${encodedKey}` },
        body: form,
      });

      const data = await response.json();
      if (response.ok) return data.url; 
      else throw new Error(data.message || "Image upload failed");
    } catch (err) {
      console.error("ImageKit Error:", err);
      throw err;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add OR Update Logic
  const handleSave = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🚀 Step 1: Handle Image Upload if a new file is selected
      let finalImageUrl = imagePreview && !imageFile ? imagePreview : null; // Keep old image if editing and no new file selected
      if (imageFile) {
        finalImageUrl = await uploadToImageKit(imageFile);
      }

      // 🚀 Step 2: Handle Specific Collection Data
      if (type === 'Brand') {
        if (brands.some(b => b.name.toLowerCase() === brandName.toLowerCase() && b.id !== editingId)) {
          toast.error("Brand already exists!"); setLoading(false); return;
        }
        const data = { name: brandName, type: brandType, image: finalImageUrl };
        if (editingId) await updateDoc(doc(db, 'master_brands', editingId), data);
        else await addDoc(collection(db, 'master_brands'), data);
      } 
      else if (type === 'Model') {
        if (models.some(m => m.name.toLowerCase() === modelName.toLowerCase() && m.brandId === selectedBrandId && m.id !== editingId)) {
          toast.error("Model already exists under this brand!"); setLoading(false); return;
        }
        const data = { brandId: selectedBrandId, name: modelName, image: finalImageUrl };
        if (editingId) await updateDoc(doc(db, 'master_models', editingId), data);
        else await addDoc(collection(db, 'master_models'), data);
      } 
      else if (type === 'Service') {
        if (services.some(s => s.title.toLowerCase() === serviceTitle.toLowerCase() && s.modelId === selectedModelId && s.id !== editingId)) {
          toast.error("Service already exists for this model!"); setLoading(false); return;
        }
        const data = { modelId: selectedModelId, title: serviceTitle, basePrice: Number(basePrice), image: finalImageUrl };
        if (editingId) await updateDoc(doc(db, 'master_services', editingId), data);
        else await addDoc(collection(db, 'master_services'), data);
      }

      toast.success(`${type} ${editingId ? 'Updated' : 'Added'} Successfully!`, { icon: <CheckCircle className="text-emerald-500" /> });
      resetForm();
      fetchData();
    } catch (err) { toast.error("Operation failed!"); console.error(err); }
    
    setLoading(false);
  };

  // Edit Action (Populate Form)
  const handleEdit = (item, type) => {
    setEditingId(item.id);
    setImagePreview(item.image || null); // Load existing image into preview
    setImageFile(null); // Clear any pending new file

    if (type === 'Brand') {
      setBrandName(item.name); setBrandType(item.type);
    } else if (type === 'Model') {
      setModelName(item.name); setSelectedBrandId(item.brandId);
    } else if (type === 'Service') {
      setServiceTitle(item.title); setBasePrice(item.basePrice); setSelectedModelId(item.modelId);
      const parentModel = models.find(m => m.id === item.modelId);
      if (parentModel) setSelectedModelBrandId(parentModel.brandId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Action
  const handleDelete = async (id, collectionName) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Item Deleted!");
      fetchData();
      if (editingId === id) resetForm(); 
    } catch (err) { toast.error("Failed to delete!"); }
  };

  // Dynamic Image Label
  const getImageLabel = () => {
    if (activeTab === 'Brand') return "Upload Brand Icon (e.g. Apple Logo)";
    if (activeTab === 'Model') return "Upload Model Image (e.g. iPhone 15 Pro)";
    return "Upload Service Image (e.g. Broken Screen)";
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3"><Package className="text-purple-500" /> Master Catalog</h2>
            <p className="text-slate-400 mt-1">Manage, Edit, and Structure your device ecosystem with images.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-2xl w-fit">
          {['Brand', 'Model', 'Service'].map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* 📝 FORM SECTION */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-xl mb-10 relative">
          
          {editingId && (
            <div className="absolute top-4 right-4">
              <button onClick={resetForm} className="flex items-center gap-1 text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors">
                <X size={16}/> Cancel Edit
              </button>
            </div>
          )}
          <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">
            {editingId ? `Edit ${activeTab}` : `Add New ${activeTab}`}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* 🚀 1. IMAGE EDITOR / PREVIEW SECTION (Universal for all tabs) */}
            <div className="md:col-span-4 flex flex-col">
              <label className="block text-sm font-semibold text-slate-300 mb-2">{getImageLabel()}</label>
              <div className="relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center h-48 overflow-hidden group">
                {imagePreview ? (
                  <>
                    {/* Object-contain ensures the image is centered and looks perfect */}
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-4" />
                    <button 
                      type="button" 
                      onClick={() => { setImagePreview(null); setImageFile(null); }}
                      className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-full text-rose-400 hover:text-white hover:bg-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4 pointer-events-none">
                    <div className="bg-slate-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-300">Click to upload</p>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG (Max 2MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            </div>

            {/* 🚀 2. DYNAMIC FORM FIELDS SECTION */}
            <div className="md:col-span-8">
              
              {/* BRAND FORM */}
              {activeTab === 'Brand' && (
                <form onSubmit={(e) => handleSave(e, 'Brand')} className="space-y-6 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      {['Mobile', 'Laptop'].map(t => (
                        <button key={t} type="button" onClick={() => setBrandType(t)} className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${brandType === t ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                          {t === 'Mobile' ? <Smartphone size={18}/> : <Laptop size={18}/>} {t}
                        </button>
                      ))}
                    </div>
                    <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Enter Brand Name (e.g. Apple)" className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500 transition-colors" required />
                  </div>
                  <button disabled={loading} className={`w-full bg-purple-600 hover:bg-purple-500 transition-colors py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-auto ${loading && 'opacity-70'}`}>
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <><UploadCloud size={20}/> {editingId ? 'Update Brand' : 'Save Brand'}</>}
                  </button>
                </form>
              )}

              {/* MODEL FORM */}
              {activeTab === 'Model' && (
                <form onSubmit={(e) => handleSave(e, 'Model')} className="space-y-6 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500 appearance-none" required>
                      <option value="">Select Parent Brand</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                    </select>
                    <input value={modelName} onChange={e => setModelName(e.target.value)} placeholder="Model Name (e.g. iPhone 15 Pro)" className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
                  </div>
                  <button disabled={loading} className={`w-full bg-purple-600 hover:bg-purple-500 transition-colors py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-auto ${loading && 'opacity-70'}`}>
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <><UploadCloud size={20}/> {editingId ? 'Update Model' : 'Save Model'}</>}
                  </button>
                </form>
              )}

              {/* SERVICE FORM */}
              {activeTab === 'Service' && (
                <form onSubmit={(e) => handleSave(e, 'Service')} className="space-y-6 h-full flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <select value={selectedModelBrandId} onChange={e => setSelectedModelBrandId(e.target.value)} className="flex-1 bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500 appearance-none" required>
                        <option value="">1. Choose Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <select value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)} className="flex-1 bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500 appearance-none" required disabled={!selectedModelBrandId}>
                        <option value="">2. Choose Model</option>
                        {models.filter(m => m.brandId === selectedModelBrandId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <input value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} placeholder="Service Title (e.g. Screen Replacement)" className="flex-[2] bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
                      <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="Price (₹)" className="flex-1 bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required min="0" />
                    </div>
                  </div>
                  <button disabled={loading} className={`w-full bg-purple-600 hover:bg-purple-500 transition-colors py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-auto ${loading && 'opacity-70'}`}>
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <><UploadCloud size={20}/> {editingId ? 'Update Service' : 'Save Service'}</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 🗃️ LIST VIEW SECTION */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Existing {activeTab}s Directory</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold w-16">Image</th>
                  <th className="p-4 font-semibold">Name / Title</th>
                  <th className="p-4 font-semibold">{activeTab === 'Service' ? 'Base Price' : 'Type / Parent'}</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                
                {/* BRAND LIST */}
                {activeTab === 'Brand' && brands.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                        {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-contain p-1" /> : <ImageIcon size={16} className="text-slate-600"/>}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{b.name}</td>
                    <td className="p-4"><span className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-slate-700">{b.type}</span></td>
                    <td className="p-4 flex justify-end gap-3 items-center h-16">
                      <button onClick={() => handleEdit(b, 'Brand')} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(b.id, 'master_brands')} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}

                {/* MODEL LIST */}
                {activeTab === 'Model' && models.map(m => {
                  const parentBrand = brands.find(b => b.id === m.brandId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-contain p-1" /> : <ImageIcon size={16} className="text-slate-600"/>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">{m.name}</td>
                      <td className="p-4 text-purple-400">{parentBrand?.name || 'Unknown'}</td>
                      <td className="p-4 flex justify-end gap-3 items-center h-16">
                        <button onClick={() => handleEdit(m, 'Model')} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(m.id, 'master_models')} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  )
                })}

                {/* SERVICE LIST */}
                {activeTab === 'Service' && services.map(s => {
                  const parentModel = models.find(m => m.id === s.modelId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {s.image ? <img src={s.image} alt={s.title} className="w-full h-full object-contain p-1" /> : <ImageIcon size={16} className="text-slate-600"/>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {s.title}
                        <div className="text-xs text-slate-500 mt-0.5">{parentModel?.name || 'Unknown Model'}</div>
                      </td>
                      <td className="p-4 font-black text-emerald-400">₹{s.basePrice}</td>
                      <td className="p-4 flex justify-end gap-3 items-center h-16">
                        <button onClick={() => handleEdit(s, 'Service')} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(s.id, 'master_services')} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  )
                })}

                {/* Empty States */}
                {((activeTab === 'Brand' && brands.length === 0) || 
                  (activeTab === 'Model' && models.length === 0) || 
                  (activeTab === 'Service' && services.length === 0)) && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="opacity-50 mb-2"/>
                        <p>No data found. Upload images and add your first {activeTab} above.</p>
                      </div>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}