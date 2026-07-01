// src/Dashboard/pages/technician/pricing.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../../firebase'; // Sahi path verify kar lena
import TechLayout from '../../component/technician/TechLayout';
import { Wrench, DollarSign, CheckCircle, Loader2, Tags } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TechPricing() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Data States
  const [servicesList, setServicesList] = useState([]);
  const [myRates, setMyRates] = useState({});

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  const fetchTechnicianData = async () => {
    try {
      // ⏳ Auth state load hone ka wait karo
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          toast.error("Please login first.");
          return;
        }

        // 1. Master Data Fetch Karo (Brands, Models, Services)
        const [brandsSnap, modelsSnap, servicesSnap] = await Promise.all([
          getDocs(collection(db, 'master_brands')),
          getDocs(collection(db, 'master_models')),
          getDocs(collection(db, 'master_services'))
        ]);

        const brands = {};
        brandsSnap.forEach(doc => brands[doc.id] = doc.data().name);

        const models = {};
        modelsSnap.forEach(doc => models[doc.id] = { ...doc.data(), brandName: brands[doc.data().brandId] });

        const formattedServices = [];
        servicesSnap.forEach(doc => {
          const srv = doc.data();
          const model = models[srv.modelId];
          formattedServices.push({
            id: doc.id,
            title: srv.title,
            basePrice: srv.basePrice,
            modelName: model?.name || 'Unknown Model',
            brandName: model?.brandName || 'Unknown Brand'
          });
        });
        setServicesList(formattedServices);

        // 2. Sirf is Technician ke existing rates fetch karo
        const q = query(collection(db, 'technician_rates'), where('technicianId', '==', user.uid));
        const ratesSnap = await getDocs(q);
        
        const ratesMap = {};
        ratesSnap.forEach(doc => {
          const data = doc.data();
          ratesMap[data.masterServiceId] = data.offeringPrice;
        });
        setMyRates(ratesMap);
        
        setLoading(false);
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load services");
      setLoading(false);
    }
  };

  // Price Update Logic
  const handleSavePrice = async (serviceId, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      toast.error("Please enter a valid price!");
      return;
    }

    setSavingId(serviceId);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      // UNIQUE DOC ID: (Technician UID + Service ID)
      const rateDocId = `${user.uid}_${serviceId}`; 
      
      const rateData = {
        masterServiceId: serviceId,
        technicianId: user.uid,
        technicianName: user.displayName || user.email.split('@')[0], // Extract name from email
        offeringPrice: Number(newPrice),
        rating: 4.8, // Default rating for new vendor
        repairsCount: Math.floor(Math.random() * 50) + 10, // Dummy data for app UI
        inStock: true,
        updatedAt: new Date().toISOString()
      };

      // setDoc override kar dega agar pehle se rate set hai, nahi toh naya banayega
      await setDoc(doc(db, 'technician_rates', rateDocId), rateData);
      
      toast.success("Price Updated Successfully!", { icon: <CheckCircle className="text-emerald-500" /> });
    } catch (error) {
      toast.error("Failed to update price");
      console.error(error);
    }
    setSavingId(null);
  };

  const handlePriceChange = (serviceId, value) => {
    setMyRates(prev => ({ ...prev, [serviceId]: value }));
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
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Tags className="w-8 h-8 text-emerald-500" /> Service Pricing
          </h2>
          <p className="text-slate-400 mt-2">Set your offering prices for the master services created by Admin.</p>
        </div>

        {/* PRICING TABLE */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-500" /> Manage My Rates
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold rounded-tl-xl">Device & Model</th>
                  <th className="p-4 font-semibold">Service Required</th>
                  <th className="p-4 font-semibold">Platform Base Price</th>
                  <th className="p-4 font-semibold">Your Price (₹)</th>
                  <th className="p-4 font-semibold text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {servicesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No services available. Admin hasn't added any yet.</td>
                  </tr>
                ) : (
                  servicesList.map((service, index) => (
                    <tr key={service.id} className={`hover:bg-slate-800/50 transition-colors ${index !== servicesList.length - 1 ? 'border-b border-slate-800' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold text-white">{service.brandName}</div>
                        <div className="text-xs text-emerald-400 font-medium">{service.modelName}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-slate-500" /> {service.title}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 line-through">₹{service.basePrice}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">₹</span>
                          <input 
                            type="number" 
                            value={myRates[service.id] || ''} 
                            onChange={(e) => handlePriceChange(service.id, e.target.value)}
                            placeholder="Eg: 2500"
                            className="w-32 bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-emerald-400 font-bold outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleSavePrice(service.id, myRates[service.id])}
                          disabled={savingId === service.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ml-auto shadow-lg shadow-emerald-900/20"
                        >
                          {savingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Rate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </TechLayout>
  );
}