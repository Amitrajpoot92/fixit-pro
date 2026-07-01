import React, { useState, useEffect } from 'react';
// 🚀 FIX: addDoc ko hata kar setDoc import kiya
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../../../firebase'; // Path verify kar lena
import AdminLayout from '../../component/admin/AdminLayout';
import { Wrench, Loader2, CheckCircle, Edit, Trash2, X, UserPlus, Phone, Mail, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Technicians() {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  // 🚀 Secret Weapon: Secondary App for creating users without logging out Admin
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

        // 1. Create in Firebase Auth
        const newUser = await createTechAuthAccount(generatedEmail, phone);

        // 2. Save details in Firestore (🚀 FIX: Using setDoc with UID as Document ID)
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
      <div className="max-w-6xl mx-auto p-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" /> Technician Management
          </h2>
          <p className="text-slate-400 mt-2">Onboard new partners and manage their FixitPro credentials.</p>
        </div>

        {/* 📝 FORM SECTION */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-xl mb-10 relative">
          {editingId && (
            <div className="absolute top-6 right-6">
              <button onClick={resetForm} className="flex items-center gap-1 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all">
                <X size={18}/> Cancel Edit
              </button>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="text-blue-500" />
            {editingId ? 'Edit Technician Details' : 'Register New Technician'}
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1">
                  <User className="text-slate-500 w-5 h-5 mr-2" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Raju Mechanic" className="w-full bg-transparent p-3 text-white outline-none" required />
                </div>
              </div>

              {/* Username (Email Auto-Branding) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Assign Username</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 overflow-hidden focus-within:border-blue-500">
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
                  <div className="bg-slate-700/50 text-blue-400 font-semibold px-4 py-4 border-l border-slate-700">
                    @fixitpro.com
                  </div>
                </div>
                {editingId && <p className="text-xs text-amber-500/80 mt-1">Username cannot be changed after creation.</p>}
              </div>

              {/* Mobile Number (Password) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Mobile No (Used as Password)</label>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 px-4 py-1">
                  <Phone className="text-slate-500 w-5 h-5 mr-2" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" className="w-full bg-transparent p-3 text-white outline-none" required />
                </div>
              </div>

            </div>

            <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto px-10 py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5"/> : (editingId ? 'Update Details' : 'Create Account')}
            </button>
          </form>
        </div>

        {/* 🗃️ LIST VIEW */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Active Technicians</h3>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Login ID (Email)</th>
                  <th className="p-4 font-semibold">Mobile / Password</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">No technicians registered yet.</td>
                  </tr>
                ) : (
                  technicians.map(tech => (
                    <tr key={tech.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                          {tech.name.charAt(0).toUpperCase()}
                        </div>
                        {tech.name}
                      </td>
                      <td className="p-4 text-blue-400 font-medium">{tech.email}</td>
                      <td className="p-4">{tech.phone}</td>
                      <td className="p-4 flex justify-end gap-3">
                        <button onClick={() => handleEdit(tech)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(tech.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}