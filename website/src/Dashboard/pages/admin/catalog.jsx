import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';
import { Package, Smartphone, Laptop, Loader2, CheckCircle, Edit, Trash2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('Brand');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track kar rahe hain ki konsa item edit ho raha hai
  
  // Data States
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]); // Services ka bhi state add kiya

  // Form States
  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('Mobile');
  
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [modelName, setModelName] = useState('');
  
  const [selectedModelBrandId, setSelectedModelBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');

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
  };

  // Switch Tab Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // Add OR Update Logic
  const handleSave = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'Brand') {
        // Client-side Duplicate Check
        if (brands.some(b => b.name.toLowerCase() === brandName.toLowerCase() && b.id !== editingId)) {
          toast.error("Brand already exists!"); setLoading(false); return;
        }

        const data = { name: brandName, type: brandType };
        if (editingId) await updateDoc(doc(db, 'master_brands', editingId), data);
        else await addDoc(collection(db, 'master_brands'), data);
      } 
      else if (type === 'Model') {
        if (models.some(m => m.name.toLowerCase() === modelName.toLowerCase() && m.brandId === selectedBrandId && m.id !== editingId)) {
          toast.error("Model already exists under this brand!"); setLoading(false); return;
        }

        const data = { brandId: selectedBrandId, name: modelName };
        if (editingId) await updateDoc(doc(db, 'master_models', editingId), data);
        else await addDoc(collection(db, 'master_models'), data);
      } 
      else if (type === 'Service') {
        if (services.some(s => s.title.toLowerCase() === serviceTitle.toLowerCase() && s.modelId === selectedModelId && s.id !== editingId)) {
          toast.error("Service already exists for this model!"); setLoading(false); return;
        }

        const data = { modelId: selectedModelId, title: serviceTitle, basePrice: Number(basePrice) };
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
    if (type === 'Brand') {
      setBrandName(item.name); setBrandType(item.type);
    } else if (type === 'Model') {
      setModelName(item.name); setSelectedBrandId(item.brandId);
    } else if (type === 'Service') {
      setServiceTitle(item.title); setBasePrice(item.basePrice); setSelectedModelId(item.modelId);
      // Find parent brand to cascade dropdowns properly
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
      if (editingId === id) resetForm(); // Agar edit karte waqt delete kar diya
    } catch (err) { toast.error("Failed to delete!"); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto p-6">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3"><Package className="text-purple-500" /> Master Catalog</h2>
            <p className="text-slate-400 mt-1">Manage, Edit, and Structure your device ecosystem.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-2xl w-fit">
          {['Brand', 'Model', 'Service'].map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* 📝 FORM SECTION */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-xl mb-10 relative">
          
          {editingId && (
            <div className="absolute top-4 right-4">
              <button onClick={resetForm} className="flex items-center gap-1 text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg">
                <X size={16}/> Cancel Edit
              </button>
            </div>
          )}
          <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">
            {editingId ? `Edit ${activeTab}` : `Add New ${activeTab}`}
          </h3>

          {/* BRAND FORM */}
          {activeTab === 'Brand' && (
            <form onSubmit={(e) => handleSave(e, 'Brand')} className="space-y-6">
              <div className="flex gap-4">
                {['Mobile', 'Laptop'].map(t => (
                  <button key={t} type="button" onClick={() => setBrandType(t)} className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 ${brandType === t ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 text-slate-400'}`}>
                    {t === 'Mobile' ? <Smartphone size={18}/> : <Laptop size={18}/>} {t}
                  </button>
                ))}
              </div>
              <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Enter Brand Name" className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
              <button disabled={loading} className="w-full bg-purple-600 py-4 rounded-xl text-white font-bold">{loading ? <Loader2 className="animate-spin mx-auto"/> : (editingId ? 'Update Brand' : 'Save Brand')}</button>
            </form>
          )}

          {/* MODEL FORM */}
          {activeTab === 'Model' && (
            <form onSubmit={(e) => handleSave(e, 'Model')} className="space-y-6">
              <select value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required>
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
              </select>
              <input value={modelName} onChange={e => setModelName(e.target.value)} placeholder="Model Name (e.g. iPhone 15 Pro)" className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
              <button disabled={loading} className="w-full bg-purple-600 py-4 rounded-xl text-white font-bold">{loading ? <Loader2 className="animate-spin mx-auto"/> : (editingId ? 'Update Model' : 'Save Model')}</button>
            </form>
          )}

          {/* SERVICE FORM */}
          {activeTab === 'Service' && (
            <form onSubmit={(e) => handleSave(e, 'Service')} className="space-y-6">
              <select value={selectedModelBrandId} onChange={e => setSelectedModelBrandId(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required>
                <option value="">1. Choose Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              
              <select value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required disabled={!selectedModelBrandId}>
                <option value="">2. Choose Model</option>
                {models.filter(m => m.brandId === selectedModelBrandId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>

              <div className="flex gap-4">
                <input value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} placeholder="Service Title" className="flex-[2] bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="Price (₹)" className="flex-1 bg-slate-800 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-purple-500" required />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 py-4 rounded-xl text-white font-bold">{loading ? <Loader2 className="animate-spin mx-auto"/> : (editingId ? 'Update Service' : 'Save Service')}</button>
            </form>
          )}
        </div>

        {/* 🗃️ LIST VIEW SECTION */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Existing {activeTab}s</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold">Name / Title</th>
                  <th className="p-4 font-semibold">{activeTab === 'Service' ? 'Base Price' : 'Type / Parent'}</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                
                {activeTab === 'Brand' && brands.map(b => (
                  <tr key={b.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-white">{b.name}</td>
                    <td className="p-4"><span className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-slate-700">{b.type}</span></td>
                    <td className="p-4 flex justify-end gap-3">
                      <button onClick={() => handleEdit(b, 'Brand')} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(b.id, 'master_brands')} className="text-rose-400 hover:text-rose-300"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}

                {activeTab === 'Model' && models.map(m => {
                  const parentBrand = brands.find(b => b.id === m.brandId);
                  return (
                    <tr key={m.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-white">{m.name}</td>
                      <td className="p-4 text-purple-400">{parentBrand?.name || 'Unknown'}</td>
                      <td className="p-4 flex justify-end gap-3">
                        <button onClick={() => handleEdit(m, 'Model')} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(m.id, 'master_models')} className="text-rose-400 hover:text-rose-300"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  )
                })}

                {activeTab === 'Service' && services.map(s => {
                  const parentModel = models.find(m => m.id === s.modelId);
                  return (
                    <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-white">
                        {s.title}
                        <div className="text-xs text-slate-500 mt-1">{parentModel?.name || 'Unknown Model'}</div>
                      </td>
                      <td className="p-4 font-black text-emerald-400">₹{s.basePrice}</td>
                      <td className="p-4 flex justify-end gap-3">
                        <button onClick={() => handleEdit(s, 'Service')} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(s.id, 'master_services')} className="text-rose-400 hover:text-rose-300"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  )
                })}

                {/* Empty States */}
                {((activeTab === 'Brand' && brands.length === 0) || 
                  (activeTab === 'Model' && models.length === 0) || 
                  (activeTab === 'Service' && services.length === 0)) && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500">No data found. Add your first {activeTab} above.</td>
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