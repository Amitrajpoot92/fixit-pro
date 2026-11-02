import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, AlertOctagon, Package, CheckCircle2, X, Shield, ShieldCheck } from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  // Mobile par sidebar close rahega by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [userRole, setUserRole] = useState('admin');
  const [userName, setUserName] = useState('');

  // 🔔 Real-time Stock Alerts State
  const [alerts, setAlerts] = useState({ outOfStock: [], lowStock: [] });
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🛡️ Fetch role & user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role) setUserRole(data.role);
            if (data.name) setUserName(data.name);
          } else {
            const opDoc = await getDoc(doc(db, 'operators', user.uid));
            if (opDoc.exists()) {
              setUserRole('operator');
              if (opDoc.data().name) setUserName(opDoc.data().name);
            }
          }
        } catch (e) {
          console.error("Error fetching user role in layout:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 🚀 Real-time Listener for Out of Stock and Low Stock across both collections
  useEffect(() => {
    let newProds = [];
    let refProds = [];

    const getStock = (p) => {
      if (typeof p.stock === 'number') return p.stock;
      if (typeof p.quantity === 'number') return p.quantity;
      if (p.stock !== undefined && p.stock !== '') return Number(p.stock) || 0;
      if (p.quantity !== undefined && p.quantity !== '') return Number(p.quantity) || 0;
      if (p.inStock === false) return 0;
      return 10;
    };

    const recomputeAlerts = () => {
      const combined = [...newProds, ...refProds];
      const out = combined.filter(p => getStock(p) === 0);
      const low = combined.filter(p => {
        const s = getStock(p);
        return s > 0 && s <= 5;
      });
      setAlerts({ outOfStock: out, lowStock: low });
    };

    const unsubNew = onSnapshot(collection(db, 'new_products'), (snap) => {
      newProds = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'New' }));
      recomputeAlerts();
    });

    const unsubRef = onSnapshot(collection(db, 'refurbished_products'), (snap) => {
      refProds = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'Refurbished' }));
      recomputeAlerts();
    });

    return () => {
      unsubNew();
      unsubRef();
    };
  }, []);

  const totalAlertCount = alerts.outOfStock.length;

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-200 font-sans">
      
      {/* 🚀 EXTRACTED SIDEBAR */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white hidden sm:block">
                {userRole === 'operator' ? 'Operator Workspace' : 'Admin Workspace'}
              </h1>
              {userRole === 'operator' ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Shield className="w-3 h-3" /> Operational Staff
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-3 h-3" /> Super Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search anything..." className="bg-slate-800 border border-slate-700 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-purple-500 text-white w-64 transition-all" />
            </div>

            {/* 🔔 NOTIFICATION BELL WITH STOCK ALERTS */}
            <div className="relative">
              <button 
                onClick={() => setIsAlertOpen(!isAlertOpen)} 
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800"
                title="Stock & Inventory Alerts"
              >
                <Bell className="w-6 h-6" />
                {totalAlertCount > 0 ? (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900 shadow-lg shadow-rose-500/50">
                    {totalAlertCount}
                  </span>
                ) : alerts.lowStock.length > 0 ? (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-900"></span>
                ) : null}
              </button>

              {/* 🚨 Notification Popover */}
              {isAlertOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAlertOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <h3 className="font-bold text-white text-sm">Stock & Inventory Alerts</h3>
                      </div>
                      <button 
                        onClick={() => setIsAlertOpen(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-md"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {alerts.outOfStock.length === 0 && alerts.lowStock.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                          All products are healthy and in stock!
                        </div>
                      ) : (
                        <>
                          {alerts.outOfStock.map(item => (
                            <div key={item.id} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-rose-400 font-black uppercase tracking-wider mt-0.5">
                                  ● Out of Stock (0 units)
                                </p>
                              </div>
                            </div>
                          ))}

                          {alerts.lowStock.map(item => (
                            <div key={item.id} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                                  Low Stock: {item.stock !== undefined ? item.stock : item.quantity} units left
                                </p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800">
                      <button 
                        onClick={() => {
                          setIsAlertOpen(false);
                          navigate('/admin/inventory');
                        }}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                      >
                        Open Inventory to Restock →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div 
              className={`w-9 h-9 rounded-full p-0.5 shrink-0 ${
                userRole === 'operator' 
                  ? 'bg-gradient-to-tr from-cyan-500 to-blue-500' 
                  : 'bg-gradient-to-tr from-purple-500 to-blue-500'
              }`}
              title={userName ? `${userName} (${userRole})` : userRole}
            >
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase">
                {userName ? userName.charAt(0) : (userRole === 'operator' ? 'O' : 'A')}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages render here */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="relative z-10 w-full max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
