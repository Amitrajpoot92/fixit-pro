import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Wrench, ArrowLeft, Loader2 } from 'lucide-react';
// 🚀 Firebase & Firestore Imports
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase'; // Sahi path

export default function TechLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Pehle Auth se login check karo
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Ab Firestore se 'technicians' collection mein check karo (YAHI BUG THA!)
      const techDocRef = doc(db, 'technicians', user.uid);
      const techDoc = await getDoc(techDocRef);

      if (techDoc.exists()) {
        // 🟢 Agar sach mein technician hai, toh seedha Dashboard jao
        console.log("Technician Verified:", user.email);
        navigate('/technician/dashboard'); 
      } else {
        // 🔴 Agar admin ya koi aur hai, toh logout karo aur error do
        await signOut(auth);
        setError("Access Denied! You are not registered as a Technician.");
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Agar Firebase auth error de (wrong password/email)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid Email or Password. Please try again.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4 relative overflow-hidden text-slate-200">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold z-20 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Website
      </button>

      <div className="w-full max-w-md relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-500/20 p-3 rounded-2xl mb-4 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             <Wrench className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Tech Portal</h2>
          <p className="text-slate-400 text-sm font-medium">Access your field tasks & earnings.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium rounded-xl text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 pl-1">Tech Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                placeholder="tech@fixitpro.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 pl-1">Secure Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 mt-6 flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Login to Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}