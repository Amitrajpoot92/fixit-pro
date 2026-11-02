import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, writeBatch, query, where } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword, signOut, deleteUser } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import AdminLayout from '../../component/admin/AdminLayout';
import { Wrench, Loader2, CheckCircle, Edit, Trash2, X, UserPlus, Phone, Mail, User, Eye, Store, MapPin, Sparkles, Power, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Technicians() {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewTech, setViewTech] = useState(null);
  const [cleaningRates, setCleaningRates] = useState(false);
  const [orphanedCount, setOrphanedCount] = useState(0);

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  // 🧹 Auto-clean any leftover rates from deleted technicians
  const cleanOrphanedRates = async (currentTechs, showToast = false) => {
    try {
      const activeList = currentTechs || technicians;
      const activeIds = new Set(activeList.map(t => t.id));

      const ratesSnap = await getDocs(collection(db, 'technician_rates'));
      const orphanedDocs = ratesSnap.docs.filter(d => !activeIds.has(d.data().technicianId));

      setOrphanedCount(orphanedDocs.length);

      if (orphanedDocs.length > 0) {
        setCleaningRates(true);
        const batch = writeBatch(db);
        orphanedDocs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        setOrphanedCount(0);
        console.log(`Purged ${orphanedDocs.length} orphaned technician rates.`);
        if (showToast) {
          toast.success(`Purged ${orphanedDocs.length} leftover rates from deleted technicians!`);
        }
      } else if (showToast) {
        toast.success("All service rates are healthy & properly synced!");
      }
    } catch (e) {
      console.error("Error cleaning orphaned rates:", e);
      if (showToast) toast.error("Failed to clean orphaned rates.");
    } finally {
      setCleaningRates(false);
    }
  };

  // Fetch Technicians
  const fetchTechnicians = async () => {
    try {
      const snap = await getDocs(collection(db, 'technicians'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTechnicians(list);
      // 🔥 Automatically purge any orphaned rates from previously deleted technicians
      cleanOrphanedRates(list, false);
    } catch (error) {
      toast.error("Failed to load technicians.");
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const resetForm = () => {
    setName(''); setUsername(''); setPhone(''); setEditingId(null);
  };

  const createTechAuthAccount = async (generatedEmail, generatedPassword) => {
    const appName = "TechCreatorApp";
    let secondaryApp;
    
    const existingApps = getApps();
    secondaryApp = existingApps.find(app => app.name === appName) || initializeApp(auth.app.options, appName);
    
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, generatedEmail, generatedPassword);
    
    await signOut(secondaryAuth);
    return userCredential.user;
  };

  const updateTechAuthAccount = async (oldEmail, oldPassword, newEmail, newPassword) => {
    const appName = "TechCreatorApp";
    let secondaryApp;
    
    const existingApps = getApps();
    secondaryApp = existingApps.find(app => app.name === appName) || initializeApp(auth.app.options, appName);
    
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await signInWithEmailAndPassword(secondaryAuth, oldEmail, oldPassword);
    
    if (oldEmail !== newEmail) {
      await updateEmail(userCredential.user, newEmail);
    }
    if (oldPassword !== newPassword) {
      await updatePassword(userCredential.user, newPassword);
    }
    
    await signOut(secondaryAuth);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (phone.length < 6) {
      return toast.error("Mobile number (Password) must be at least 6 digits!");
    }

    setLoading(true);
    try {
      const formattedUsername = username.toLowerCase().replace(/\s+/g, '');
      const generatedEmail = `${formattedUsername}@fixitpro.com`;

      if (!editingId) {
        // 🆕 CREATE NEW TECHNICIAN
        if (technicians.some(t => t.username === formattedUsername)) {
          toast.error("Username already taken! Choose another.");
          setLoading(false);
          return;
        }

        const newUser = await createTechAuthAccount(generatedEmail, phone);

        const techData = {
          uid: newUser.uid,
          name: name,
          username: formattedUsername,
          email: generatedEmail,
          phone: phone, 
          status: 'Active',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'technicians', newUser.uid), techData);
        // Also save to users collection for unified authentication
        try {
          await setDoc(doc(db, 'users', newUser.uid), {
            ...techData,
            role: 'technician'
          });
        } catch (e) {
          console.log("Could not set users doc:", e);
        }

        toast.success("Technician Account Created!", { icon: <CheckCircle className="text-emerald-500" /> });
      } else {
        // 🔄 UPDATE EXISTING TECHNICIAN
        const existingTech = technicians.find(t => t.id === editingId);
        
        if (existingTech.username !== formattedUsername && technicians.some(t => t.username === formattedUsername && t.id !== editingId)) {
          toast.error("Username already taken! Choose another.");
          setLoading(false);
          return;
        }

        try {
          await updateTechAuthAccount(existingTech.email, existingTech.phone, generatedEmail, phone);
        } catch (authError) {
          console.error("Auth Update Error:", authError);
          toast.error("Could not update Auth credentials (maybe old password changed manually).");
          setLoading(false);
          return;
        }

        const updatedFields = {
          name: name,
          username: formattedUsername,
          email: generatedEmail,
          phone: phone
        };

        await updateDoc(doc(db, 'technicians', editingId), updatedFields);
        try {
          await updateDoc(doc(db, 'users', editingId), updatedFields);
        } catch (e) {}

        toast.success("Credentials & Details Updated!");
      }

      resetForm();
      fetchTechnicians();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error("This email/username is already registered in Firebase!");
      } else {
        toast.error("Operation failed. Try again.");
      }
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (tech) => {
    setEditingId(tech.id);
    setName(tech.name);
    setUsername(tech.username);
    setPhone(tech.phone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔒 TOGGLE ACTIVE / INACTIVE STATUS
  const toggleStatus = async (tech) => {
    const newStatus = tech.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await updateDoc(doc(db, 'technicians', tech.id), { status: newStatus });
      try {
        await updateDoc(doc(db, 'users', tech.id), { status: newStatus });
      } catch (e) {}

      // If inactive, mark their custom rates as out of stock in real-time
      const ratesQ = query(collection(db, 'technician_rates'), where('technicianId', '==', tech.id));
      const ratesSnap = await getDocs(ratesQ);
      if (!ratesSnap.empty) {
        const batch = writeBatch(db);
        ratesSnap.docs.forEach(d => {
          batch.update(d.ref, { inStock: newStatus === 'Active' });
        });
        await batch.commit();
      }

      toast.success(`Technician is now ${newStatus}`);
      fetchTechnicians();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // 🗑️ PERMANENT TECHNICIAN DELETION (Removes Rates, Profile, and Auth Access)
  const handleDelete = async (tech) => {
    const techId = typeof tech === 'object' ? tech.id : tech;
    const targetTech = typeof tech === 'object' ? tech : technicians.find(t => t.id === techId);

    if (!window.confirm("Permanently delete this technician? This will remove their login account, their profile, and ALL their service prices from the app.")) return;
    
    setLoading(true);
    try {
      // 1. 🔥 Delete all custom service prices set by this technician from `technician_rates`
      const ratesQ = query(collection(db, 'technician_rates'), where('technicianId', '==', techId));
      const ratesSnap = await getDocs(ratesQ);
      if (!ratesSnap.empty) {
        const batch = writeBatch(db);
        ratesSnap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        console.log(`Deleted ${ratesSnap.size} rates for tech ${techId}`);
      }

      // 2. 🔥 Delete from `technicians` collection
      await deleteDoc(doc(db, 'technicians', techId));

      // 3. 🔥 Delete from `users` collection if present
      try {
        await deleteDoc(doc(db, 'users', techId));
      } catch (e) {}

      // 4. 🔥 Delete from Firebase Auth via secondary app
      if (targetTech && targetTech.email && targetTech.phone) {
        try {
          const appName = "TechCreatorApp";
          const existingApps = getApps();
          const secondaryApp = existingApps.find(app => app.name === appName) || initializeApp(auth.app.options, appName);
          const secondaryAuth = getAuth(secondaryApp);
          const userCredential = await signInWithEmailAndPassword(secondaryAuth, targetTech.email, targetTech.phone);
          await deleteUser(userCredential.user);
          await signOut(secondaryAuth);
          console.log("Deleted user from Firebase Auth");
        } catch (authErr) {
          console.warn("Could not delete from Firebase Auth directly:", authErr);
        }
      }

      // 5. 🔥 Auto-clean any remaining orphaned rates
      await cleanOrphanedRates(technicians.filter(t => t.id !== techId), false);

      toast.success("Technician and all custom rates permanently removed!");
      fetchTechnicians();
      if (editingId === techId) resetForm();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete technician completely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-500" /> Technician Management
            </h2>
            <p className="text-slate-400 mt-2">Onboard new partners, manage credentials, and control service pricing access.</p>
          </div>

          {/* Sync & Clean Orphaned Prices Button */}
          <button
            onClick={() => cleanOrphanedRates(technicians, true)}
            disabled={cleaningRates}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all shadow-md self-start sm:self-auto disabled:opacity-50"
            title="Scan and delete prices left behind by deleted technicians"
          >
            {cleaningRates ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            )}
            {orphanedCount > 0 ? `Purge ${orphanedCount} Orphaned Prices` : 'Sync & Clean Rates'}
          </button>
        </div>

        {/* 📝 FORM SECTION */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl mb-10 relative">
          {editingId && (
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
              <button onClick={resetForm} className="flex items-center gap-1 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all">
                <X size={18}/> <span className="hidden sm:inline">Cancel Edit</span>
              </button>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="text-blue-500" />
            {editingId ? 'Edit Technician Credentials' : 'Register New Technician'}
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1 transition-colors">
                  <User className="text-slate-500 w-5 h-5 mr-3 shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma" 
                    className="w-full bg-transparent py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">System Username</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1 transition-colors">
                  <span className="text-slate-500 font-bold mr-2 text-sm">@</span>
                  <input 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahul_tech" 
                    className="w-full bg-transparent py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 ml-1">Login email will be: <span className="text-blue-400 font-mono">{username ? username.toLowerCase().replace(/\s+/g, '') : 'username'}@fixitpro.com</span></p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Phone Number (Password)</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1 transition-colors">
                  <Phone className="text-slate-500 w-5 h-5 mr-3 shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210" 
                    className="w-full bg-transparent py-3 text-white placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 ml-1">This phone number will be their initial login password.</p>
              </div>

            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Credentials' : 'Create Technician Account'}
              </button>
            </div>
          </form>
        </div>

        {/* 📋 LIST SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Registered Technicians <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold">{technicians.length}</span>
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Login Email</th>
                    <th className="p-4">Phone (Password)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Profile</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {technicians.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No technicians registered yet. Add your first technician above.
                      </td>
                    </tr>
                  ) : (
                    technicians.map(tech => {
                      const hasProfile = !!tech.shopName;
                      const isActive = tech.status !== 'Inactive';
                      
                      return (
                        <tr key={tech.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-3 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">
                              {tech.name ? tech.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{tech.name}</p>
                              <p className="text-[11px] text-slate-400">@{tech.username}</p>
                            </div>
                          </td>
                          <td className="p-4 text-blue-400 font-medium whitespace-nowrap">{tech.email}</td>
                          <td className="p-4 whitespace-nowrap">{tech.phone}</td>
                          <td className="p-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleStatus(tech)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                                isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                              title="Click to toggle Active / Inactive"
                            >
                              <Power size={11} /> {isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {hasProfile ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                <CheckCircle size={12}/> Setup Complete
                              </span>
                            ) : (
                              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold w-fit">
                                Pending Setup
                              </span>
                            )}
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            {/* View Profile Button */}
                            <button onClick={() => setViewTech(tech)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20" title="View Full Profile">
                              <Eye size={16}/>
                            </button>
                            
                            <button onClick={() => handleEdit(tech)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20" title="Edit Credentials">
                              <Edit size={16}/>
                            </button>
                            <button onClick={() => handleDelete(tech)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20" title="Permanently Delete Technician & Prices">
                              <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🚀 MODAL: VIEW TECHNICIAN PROFILE */}
        {viewTech && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <button onClick={() => setViewTech(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-2 transition-colors z-10">
                <X size={18}/>
              </button>
              
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-6 relative z-10">
                <User className="text-blue-500 w-8 h-8"/> Technician Profile
              </h3>

              <div className="space-y-4 relative z-10">
                
                {/* System Credentials Section */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">System Credentials</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Full Name</p>
                      <p className="text-sm text-white font-bold">{viewTech.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">System Username</p>
                      <p className="text-sm text-blue-400 font-bold">{viewTech.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Login Email</p>
                      <p className="text-sm text-slate-200 font-medium truncate" title={viewTech.email}>{viewTech.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Login Phone / Password</p>
                      <p className="text-sm text-slate-200 font-medium">{viewTech.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Shop / Personal Info Section */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2 flex justify-between items-center">
                    Shop Profile Data
                    {viewTech.shopName ? 
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10}/> Completed</span> : 
                      <span className="text-orange-400">Pending Setup</span>
                    }
                  </p>
                  
                  {viewTech.shopName ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Store className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400">Shop Name</p>
                          <p className="text-base text-white font-bold">{viewTech.shopName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">Owner Name</p>
                          <p className="text-sm text-slate-200 font-medium">{viewTech.ownerName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-purple-400 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-400">Shop Phone</p>
                            <p className="text-sm text-slate-200 font-medium">{viewTech.mobileNo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-orange-400 shrink-0" />
                          <div className="truncate pr-2">
                            <p className="text-xs text-slate-400">Shop Email</p>
                            <p className="text-sm text-slate-200 font-medium truncate" title={viewTech.email}>{viewTech.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-2">
                        <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400">Complete Address</p>
                          <p className="text-sm text-slate-200 font-medium leading-relaxed">{viewTech.shopAddress}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <Store className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">This technician has not completed their shop profile setup yet.</p>
                      <p className="text-xs text-slate-500 mt-1">They need to login to their panel and save details.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
