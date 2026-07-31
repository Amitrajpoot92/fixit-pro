// src/Dashboard/pages/technician/pricing.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, query, where, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../../firebase'; 
import TechLayout from '../../component/technician/TechLayout';
import { Wrench, DollarSign, CheckCircle, Loader2, Tags, Smartphone, Save, IndianRupee } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TechPricing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🚀 Core Data States
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [masterServices, setMasterServices] = useState([]); // All admin services
  const [techRatesMap, setTechRatesMap] = useState({}); // Stores existing rates of this tech

  // 🚀 Selection States
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  
  // 🚀 Active Form State
  const [activeServices, setActiveServices] = useState([]); // Services for selected model
  const [currentPrices, setCurrentPrices] = useState({}); // Current typed prices

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // ⏳ Wait for Auth
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          toast.error("Please login first.");
          return;
        }

        // 1. Fetch Master Data
        const [brandsSnap, modelsSnap, servicesSnap] = await Promise.all([
          getDocs(collection(db, 'master_brands')),
          getDocs(collection(db, 'master_models')),
          getDocs(collection(db, 'master_services'))
        ]);

        setBrands(brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setModels(modelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setMasterServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 2. Fetch this Technician's existing rates globally
        const q = query(collection(db, 'technician_rates'), where('technicianId', '==', user.uid));
        const ratesSnap = await getDocs(q);
        
        const ratesMap = {};
        ratesSnap.forEach(doc => {
          const data = doc.data();
          ratesMap[data.masterServiceId] = data.offeringPrice;
        });
        setTechRatesMap(ratesMap);
        setCurrentPrices(ratesMap); // Load existing prices into input states
        
        setLoading(false);
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load catalog data.");
      setLoading(false);
    }
  };

  // 🚀 Handle Model Change (Load services for this specific model)
  useEffect(() => {
    if (selectedModelId) {
      const filteredServices = masterServices.filter(s => s.modelId === selectedModelId);
      setActiveServices(filteredServices);
    } else {
      setActiveServices([]);
    }
  }, [selectedModelId, masterServices]);

  const handlePriceChange = (serviceId, value) => {
    setCurrentPrices(prev => ({ ...prev, [serviceId]: value }));
  };

  // 🚀 BULK SAVE LOGIC (Save all prices for the selected model at once)
  const handleBulkSave = async () => {
    if (!selectedModelId) return toast.error("Select a model first!");
    
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const batch = writeBatch(db);
      let updatedCount = 0;

      activeServices.forEach(service => {
        const enteredPrice = currentPrices[service.id];

        // Agar price 0 se zyada hai, tabhi save karo
        if (enteredPrice !== undefined && enteredPrice !== '' && Number(enteredPrice) > 0) {
          const rateDocId = `${user.uid}_${service.id}`; // UNIQUE DOC ID
          
          const rateData = {
            masterServiceId: service.id,
            technicianId: user.uid,
            technicianName: user.displayName || user.email.split('@')[0],
            offeringPrice: Number(enteredPrice),
            rating: 4.8, // Default base rating
            repairsCount: Math.floor(Math.random() * 50) + 10, // Dummy data for UI initially
            inStock: true,
            updatedAt: new Date().toISOString()
          };

          const docRef = doc(db, 'technician_rates', rateDocId);
          batch.set(docRef, rateData); // .set overwrites/creates exactly as needed
          updatedCount++;
        }
      });

      if (updatedCount === 0) {
        toast.error("Please enter a valid price for at least one service.");
        setSaving(false);
        return;
      }

      await batch.commit();
      
      // Update our local techRatesMap so it stays in sync
      setTechRatesMap(prev => ({ ...prev, ...currentPrices }));
      toast.success(`${updatedCount} Services updated for this model!`, { icon: <CheckCircle className="text-emerald-500" /> });

    } catch (error) {
      toast.error("Failed to update bulk pricing");
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <TechLayout>
        <div className="h-[70vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      </TechLayout>
    );
  }

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Tags className="w-8 h-8 text-emerald-500" /> Service Pricing
          </h2>
          <p className="text-slate-400 mt-2">Smart Pricing Engine: Select a brand and model to update all your service rates instantly.</p>
        </div>

        {/* 🚀 STEP 1: SMART SELECTION */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Smartphone className="text-emerald-500" /> Select Device
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
             <select 
               value={selectedBrandId} 
               onChange={e => { setSelectedBrandId(e.target.value); setSelectedModelId(''); }} 
               className="flex-1 bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-emerald-500 outline-none font-bold appearance-none cursor-pointer"
             >
               <option value="">1. Choose Brand</option>
               {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>

             <select 
               value={selectedModelId} 
               onChange={e => setSelectedModelId(e.target.value)} 
               disabled={!selectedBrandId} 
               className="flex-1 bg-slate-800 p-4 rounded-xl text-white border border-slate-700 focus:border-emerald-500 outline-none font-bold disabled:opacity-50 appearance-none cursor-pointer"
             >
               <option value="">2. Choose Model to set Prices</option>
               {models.filter(m => m.brandId === selectedBrandId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
          </div>
        </div>

        {/* 🚀 STEP 2: PRICING GRID (Visible only when model is selected) */}
        {selectedModelId && (
          <div className="bg-slate-900 border-t-4 border-t-emerald-500 border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            <div className="flex items-center gap-4 mb-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              {models.find(m => m.id === selectedModelId)?.image && (
                <img src={models.find(m => m.id === selectedModelId)?.image} className="w-12 h-12 object-contain" alt="Model" />
              )}
              <div>
                <h3 className="text-xl font-black text-white">{models.find(m => m.id === selectedModelId)?.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Set your custom prices below. Leave 0 or blank to skip offering a service.</p>
              </div>
            </div>

            {activeServices.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-2xl">
                <Wrench className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">No services found for this model.</p>
                <p className="text-sm text-slate-500 mt-1">Admin has not added any services for {models.find(m => m.id === selectedModelId)?.name} yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeServices.map(service => (
                    <div key={service.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between gap-4 hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                          {service.image ? <img src={service.image} alt="icon" className="w-8 h-8 object-contain" /> : <Wrench className="w-6 h-6 text-slate-500" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">{service.title}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Base: ₹{service.basePrice}</p>
                        </div>
                      </div>
                      
                      <div className="relative w-32 shrink-0">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input 
                          type="number" 
                          min="0"
                          value={currentPrices[service.id] || ''}
                          onChange={(e) => handlePriceChange(service.id, e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl py-3 pl-8 pr-3 text-emerald-400 font-black text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🚀 BULK SAVE BUTTON */}
                <button 
                  onClick={handleBulkSave} 
                  disabled={saving} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-black text-lg flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all h-[60px]"
                >
                  {saving ? <Loader2 className="animate-spin w-6 h-6"/> : <><Save size={24}/> Update All Prices for {models.find(m => m.id === selectedModelId)?.name}</>}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </TechLayout>
  );
}