import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { 
  Ticket, PlusCircle, Settings, Loader2, Search, Edit2, 
  Trash2, ToggleLeft, ToggleRight, CheckCircle, Percent
} from 'lucide-react';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Coupons() {
  const [loading, setLoading] = useState(true);

  // 🚀 Referral Settings State
  const [refDiscount, setRefDiscount] = useState('50');
  const [rewardDiscount, setRewardDiscount] = useState('30');
  const [savingSettings, setSavingSettings] = useState(false);

  // 🚀 Global Coupons State
  const [globalCoupons, setGlobalCoupons] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  useEffect(() => {
    // 1. Fetch Referral Settings
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'referral');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRefDiscount(docSnap.data().referralDiscount?.toString() || '50');
          setRewardDiscount(docSnap.data().rewardDiscount?.toString() || '30');
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    // 2. Fetch Global Coupons
    const qCoupons = query(collection(db, 'coupons'), where('isGlobal', '==', true));
    const unsubCoupons = onSnapshot(qCoupons, (snap) => {
      const cps = [];
      snap.forEach(d => cps.push({ id: d.id, ...d.data() }));
      cps.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setGlobalCoupons(cps);
      setLoading(false);
    });

    fetchSettings();
    return () => unsubCoupons();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'referral'), {
        referralDiscount: Number(refDiscount) || 50,
        rewardDiscount: Number(rewardDiscount) || 30,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Referral Settings Updated!");
    } catch (error) {
      toast.error("Failed to update settings");
    }
    setSavingSettings(false);
  };

  const createGlobalCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponTitle || !newCouponDiscount) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreating(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        code: newCouponCode.trim().toUpperCase(),
        title: newCouponTitle.trim(),
        desc: newCouponDesc.trim() || 'Grab this special offer now!',
        discount: Number(newCouponDiscount),
        type: 'global',
        isGlobal: true,
        isActive: true,
        createdAt: serverTimestamp()
      });
      toast.success("Global Coupon created successfully!");
      setNewCouponCode('');
      setNewCouponTitle('');
      setNewCouponDesc('');
      setNewCouponDiscount('');
    } catch (error) {
      toast.error("Failed to create coupon");
    }
    setIsCreating(false);
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'coupons', couponId), {
        isActive: !currentStatus
      });
      toast.success(`Coupon marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon? It will be permanently removed.")) {
      try {
        await updateDoc(doc(db, 'coupons', couponId), {
          isActive: false,
          isDeleted: true // Soft delete so we don't break history
        });
        toast.success("Coupon deleted.");
      } catch (error) {
        toast.error("Deletion failed");
      }
    }
  };

  const activeGlobalCoupons = globalCoupons.filter(c => !c.isDeleted);

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupons & Offers</h1>
            <p className="text-slate-500 font-medium mt-1">Manage global promos and referral systems</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Settings & Create Form */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* REFERRAL SYSTEM SETTINGS */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Referral Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New User Discount (₹)</label>
                    <input 
                      type="number" 
                      value={refDiscount}
                      onChange={(e) => setRefDiscount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Discount given to a new user when they apply a friend's code.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Referrer Reward (₹)</label>
                    <input 
                      type="number" 
                      value={rewardDiscount}
                      onChange={(e) => setRewardDiscount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <p className="text-xs text-slate-500 mt-1">Single-use discount coupon given to the referrer after order completion.</p>
                  </div>
                  <button 
                    onClick={saveSettings}
                    disabled={savingSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4"
                  >
                    {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Save Settings
                  </button>
                </div>
              </div>

              {/* CREATE GLOBAL COUPON */}
              <form onSubmit={createGlobalCoupon} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Create Global Promo</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Coupon Code *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. SUMMER50"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Summer Special Offer"
                      value={newCouponTitle}
                      onChange={(e) => setNewCouponTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Get Flat ₹50 off on all bookings!"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Discount Amount (₹) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 50"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Promo Code'}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Coupons List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Ticket className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Active Global Promos</h2>
                </div>

                {activeGlobalCoupons.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No global promos created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGlobalCoupons.map((coupon) => (
                      <div key={coupon.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:border-purple-300 transition-colors">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className={`p-4 rounded-xl font-black text-xl border ${coupon.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                            ₹{coupon.discount}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg text-slate-800">{coupon.code}</span>
                              <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-700 text-sm mt-1">{coupon.title}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">{coupon.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200">
                          <button 
                            onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold text-sm text-slate-700 transition"
                          >
                            {coupon.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          
                          <button 
                            onClick={() => deleteCoupon(coupon.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
