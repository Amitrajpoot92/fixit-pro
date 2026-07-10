import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import AdminLayout from '../../component/admin/AdminLayout';
import { Wrench, Loader2, CheckCircle, Edit, Trash2, X, UserPlus, Phone, Mail, User, Eye, Store, MapPin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Technicians() {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewTech, setViewTech] = useState(null); // 🚀 NEW: For View Profile Modal

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch Technicians
  const fetchTechnicians = async () => {
    try {
      const snap = await getDocs(collection(db, 'technicians'));
      setTechnicians(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

        await setDoc(doc(db, 'technicians', newUser.uid), {
          uid: newUser.uid,
          name: name,
          username: formattedUsername,
          email: generatedEmail,
          phone: phone, 
          status: 'Active',
          createdAt: new Date().toISOString()
        });

        toast.success("Technician Account Created!", { icon: <CheckCircle className="text-emerald-500" /> });
      } else {
        // 🔄 UPDATE EXISTING TECHNICIAN
        await updateDoc(doc(db, 'technicians', editingId), {
          name: name,
          phone: phone
        });
        toast.success("Details Updated!");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this technician? Note: This only removes them from your list. Firebase Auth deletion requires Firebase Console.")) return;
    try {
      await deleteDoc(doc(db, 'technicians', id));
      toast.success("Removed from database.");
      fetchTechnicians();
      if (editingId === id) resetForm();
    } catch (err) { toast.error("Failed to delete."); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" /> Technician Management
          </h2>
          <p className="text-slate-400 mt-2">Onboard new partners and manage their FixitPro credentials and profiles.</p>
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
                  <User className="text-slate-500 w-5 h-5 mr-2" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Raju Mechanic" className="w-full bg-transparent p-3 text-white outline-none" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Assign Username</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 overflow-hidden focus-within:border-blue-500 transition-colors">
                  <Mail className="text-slate-500 w-5 h-5 ml-4 mr-2" />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="raju" 
                    disabled={!!editingId} 
                    className="w-full bg-transparent p-4 text-white outline-none disabled:opacity-50" 
                    required 
                  />
                  <div className="bg-slate-700/50 text-blue-400 font-semibold px-3 sm:px-4 py-4 border-l border-slate-700 text-sm sm:text-base whitespace-nowrap">
                    @fixitpro.com
                  </div>
                </div>
                {editingId && <p className="text-xs text-amber-500/80 mt-1">Username cannot be changed after creation.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Mobile No (Password)</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1 transition-colors">
                  <Phone className="text-slate-500 w-5 h-5 mr-2" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" className="w-full bg-transparent p-3 text-white outline-none" required />
                </div>
              </div>

            </div>

            <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 w-full md:w-auto px-10 py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30">
              {loading ? <Loader2 className="animate-spin w-5 h-5"/> : (editingId ? 'Update Credentials' : 'Create Account')}
            </button>
          </form>
        </div>

        {/* 🗃️ LIST VIEW */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Active Technicians Directory</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="p-4 font-semibold whitespace-nowrap">Name</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Login ID (Email)</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Mobile / Password</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Profile Status</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-500">No technicians registered yet.</td>
                    </tr>
                  ) : (
                    technicians.map(tech => {
                      // Check if tech has completed their profile setup (shopName exists)
                      const hasProfile = !!tech.shopName;
                      
                      return (
                        <tr key={tech.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-3 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                            {tech.name}
                          </td>
                          <td className="p-4 text-blue-400 font-medium whitespace-nowrap">{tech.email}</td>
                          <td className="p-4 whitespace-nowrap">{tech.phone}</td>
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
                            {/* 🚀 NEW: View Profile Button */}
                            <button onClick={() => setViewTech(tech)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20" title="View Full Profile">
                              <Eye size={16}/>
                            </button>
                            
                            <button onClick={() => handleEdit(tech)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20" title="Edit Credentials">
                              <Edit size={16}/>
                            </button>
                            <button onClick={() => handleDelete(tech.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20" title="Delete Technician">
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

                {/* Shop / Personal Info Section (Fetched from TechSettings) */}
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