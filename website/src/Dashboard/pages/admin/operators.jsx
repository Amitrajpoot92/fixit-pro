import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import AdminLayout from '../../component/admin/AdminLayout';
import { UserCheck, Loader2, CheckCircle, Edit, Trash2, X, UserPlus, Phone, Mail, User, Eye, ShieldCheck, Key, Lock, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Operators() {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewOperator, setViewOperator] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch Operators
  const fetchOperators = async () => {
    try {
      const snap = await getDocs(collection(db, 'operators'));
      setOperators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Failed to load operators.");
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const resetForm = () => {
    setName('');
    setUsername('');
    setPhone('');
    setEditingId(null);
  };

  // 🚀 Secondary Auth App: Avoids logging out the Admin
  const createOperatorAuthAccount = async (generatedEmail, generatedPassword) => {
    const appName = "OperatorCreatorApp";
    let secondaryApp;
    
    const existingApps = getApps();
    secondaryApp = existingApps.find(app => app.name === appName) || initializeApp(auth.app.options, appName);
    
    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, generatedEmail, generatedPassword);
    
    await signOut(secondaryAuth);
    return userCredential.user;
  };

  const updateOperatorAuthAccount = async (oldEmail, oldPassword, newEmail, newPassword) => {
    const appName = "OperatorCreatorApp";
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
      return toast.error("Mobile number (used as Password) must be at least 6 digits!");
    }

    setLoading(true);
    try {
      const formattedUsername = username.toLowerCase().replace(/\s+/g, '');
      const generatedEmail = `${formattedUsername}@fixitpro.com`;

      if (!editingId) {
        // 🆕 CREATE NEW OPERATOR
        if (operators.some(o => o.username === formattedUsername)) {
          toast.error("Username already taken! Choose another.");
          setLoading(false);
          return;
        }

        const newUser = await createOperatorAuthAccount(generatedEmail, phone);

        const opData = {
          uid: newUser.uid,
          name: name,
          username: formattedUsername,
          email: generatedEmail,
          phone: phone,
          role: 'operator',
          status: 'Active',
          permissions: ['bookings', 'product-orders', 'products', 'inventory', 'catalog'],
          createdAt: new Date().toISOString()
        };

        // Save in both 'operators' and 'users' collections
        await setDoc(doc(db, 'operators', newUser.uid), opData);
        await setDoc(doc(db, 'users', newUser.uid), opData);

        toast.success("Operator Account Created Successfully!", { icon: <CheckCircle className="text-emerald-500" /> });
      } else {
        // 🔄 UPDATE EXISTING OPERATOR
        const existingOp = operators.find(o => o.id === editingId);
        
        if (existingOp.username !== formattedUsername && operators.some(o => o.username === formattedUsername && o.id !== editingId)) {
          toast.error("Username already taken! Choose another.");
          setLoading(false);
          return;
        }

        try {
          await updateOperatorAuthAccount(existingOp.email, existingOp.phone, generatedEmail, phone);
        } catch (authError) {
          console.error("Auth Update Error:", authError);
          toast.error("Could not update Auth credentials (maybe password changed).");
          setLoading(false);
          return;
        }

        const updateData = {
          name: name,
          username: formattedUsername,
          email: generatedEmail,
          phone: phone,
          role: 'operator'
        };

        await updateDoc(doc(db, 'operators', editingId), updateData);
        await updateDoc(doc(db, 'users', editingId), updateData);

        toast.success("Operator Credentials Updated Successfully!");
      }

      resetForm();
      fetchOperators();
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

  const handleEdit = (op) => {
    setEditingId(op.id);
    setName(op.name || '');
    setUsername(op.username || '');
    setPhone(op.phone || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, opName) => {
    if (!window.confirm(`Are you sure you want to delete operator "${opName}"? They will permanently lose access.`)) return;
    try {
      await deleteDoc(doc(db, 'operators', id));
      await deleteDoc(doc(db, 'users', id));
      setOperators(operators.filter(o => o.id !== id));
      toast.success("Operator Deleted");
    } catch (error) {
      toast.error("Failed to delete operator.");
    }
  };

  const handleToggleStatus = async (op) => {
    const newStatus = op.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDoc(doc(db, 'operators', op.id), { status: newStatus });
      await updateDoc(doc(db, 'users', op.id), { status: newStatus });
      setOperators(operators.map(o => o.id === op.id ? { ...o, status: newStatus } : o));
      toast.success(`Operator marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-500" /> Operator Accounts Management
            </h2>
            <p className="text-slate-400 mt-2">
              Create sub-admin staff credentials with access restricted to Orders, Product Listing, Live Bookings & Master Catalogue.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-300 w-fit">
            <ShieldCheck size={16} className="text-blue-400" />
            <span>Role-Based Access Control</span>
          </div>
        </div>

        {/* ℹ️ ROLE PERMISSIONS INFO BOX */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Assigned Permissions for All Operators:
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Operators have full access to: <span className="text-blue-300 font-bold">1. Live Bookings</span> • <span className="text-blue-300 font-bold">2. Orders Manage</span> • <span className="text-blue-300 font-bold">3. Product Listing & Inventory</span> • <span className="text-blue-300 font-bold">4. Master Catalogue</span>.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
            🔒 Financials, KYC & Settings are Hidden
          </span>
        </div>

        {/* ADD / EDIT FORM */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              {editingId ? 'Edit Operator Credentials' : 'Create New Operator'}
            </h3>
            {editingId && (
              <button onClick={resetForm} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Operator Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Rahul Sharma" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" 
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Username (Login ID)</label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 focus-within:border-blue-500">
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="rahul" 
                  className="w-full bg-transparent p-3 text-white focus:outline-none" 
                />
                <span className="text-xs text-slate-500 font-bold whitespace-nowrap">@fixitpro.com</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Mobile (Initial Password)</label>
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="9876543210" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" 
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                {editingId ? 'Update Operator' : 'Generate Operator Account'}
              </button>
            </div>
          </form>
        </div>

        {/* OPERATORS LIST TABLE */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Registered Operators ({operators.length})</h3>
            <span className="text-xs text-slate-400">Total {operators.filter(o => o.status !== 'Inactive').length} Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 text-slate-300 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Operator Name</th>
                  <th className="p-4">Login Email</th>
                  <th className="p-4">Password (Phone)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {operators.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No operators created yet. Use the form above to add an operator.
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-black flex items-center justify-center shrink-0">
                          {op.name ? op.name.charAt(0).toUpperCase() : 'O'}
                        </div>
                        <div>
                          <p>{op.name}</p>
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Operator Role</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-slate-300 font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all">
                          {op.email}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-slate-300 font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all">
                          {op.phone}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(op)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            op.status !== 'Inactive'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle Active/Inactive"
                        >
                          ● {op.status || 'Active'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewOperator(op)}
                            className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Profile & Access"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(op)}
                            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Edit Credentials"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(op.id, op.name)}
                            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Operator"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 👁️ VIEW OPERATOR MODAL */}
        {viewOperator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button 
                onClick={() => setViewOperator(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-black text-xl">
                  {viewOperator.name ? viewOperator.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{viewOperator.name}</h3>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Operator Profile</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Login Email</p>
                  <p className="text-sm font-mono text-white mt-0.5 select-all">{viewOperator.email}</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Password (Mobile Number)</p>
                  <p className="text-sm font-mono text-white mt-0.5 select-all">{viewOperator.phone}</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Granted Access Modules</p>
                  <div className="space-y-1.5">
                    {[
                      'Live Bookings (Customer orders & tracking)',
                      'Product Orders (E-commerce dispatch & delivery)',
                      'Product Listing & Inventory (Add/edit & stock)',
                      'Master Catalogue (Brands, models & smart repair pricing)'
                    ].map((sec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                        <span>{sec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewOperator(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

