import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { 
  Wallet, TrendingUp, IndianRupee, CheckCircle, 
  Calendar, ArrowDownLeft, Loader2, SearchX
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Earnings() {
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sirf logged-in technician ke orders layega
        const q = query(
          collection(db, 'bookings'), 
          where('technicianId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          let totalBalance = 0;
          const completedJobs = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // 🚀 MAGIC: Sirf unhi orders ka paisa jodega jo "Completed" hain
            if (data.status === 'Completed') {
              const amount = Number(data.totalAmount) || 0;
              totalBalance += amount;
              
              completedJobs.push({
                id: doc.id,
                orderId: data.orderId || 'N/A',
                device: `${data.brandName || ''} ${data.modelName || ''}`.trim(),
                amount: amount,
                date: data.scheduleDate || 'Recently',
                customerName: data.customerName || 'Customer',
              });
            }
          });

          setEarnings(totalBalance);
          // Latest order upar dikhane ke liye reverse kiya
          setHistory(completedJobs.reverse()); 
          setLoading(false);
        }, (error) => {
          console.error("Error fetching earnings: ", error);
          toast.error("Failed to load earnings data");
          setLoading(false);
        });

        return () => unsubscribe();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto pb-12 p-4 sm:p-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-500" /> My Wallet & Earnings
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Track your total revenue and payout history for all completed jobs.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* 💰 TOP STATS CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              
              {/* Main Wallet Balance */}
              <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 bg-emerald-500/10 w-40 h-40 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <p className="text-emerald-400/80 font-bold uppercase tracking-widest text-xs mb-1">Total Available Balance</p>
                    <h1 className="text-5xl sm:text-6xl font-black text-white flex items-center">
                      <IndianRupee className="w-10 h-10 sm:w-12 sm:h-12 mr-1" />
                      {earnings}
                    </h1>
                  </div>
                  <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-medium z-10 relative">Amount credited automatically from {history.length} completed jobs.</p>
              </div>

              {/* Jobs Completed Stat */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Jobs Finished</p>
                </div>
                <h2 className="text-4xl font-black text-white">{history.length}</h2>
                <p className="text-slate-500 text-xs mt-2 font-medium">Successfully completed services</p>
              </div>

            </div>

            {/* 📋 TRANSACTIONS HISTORY */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowDownLeft className="text-emerald-500 w-5 h-5" /> Recent Transactions
              </h3>

              {history.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                  <SearchX className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Earnings Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Complete your pending tasks and update their status to see your earnings grow here.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  {history.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-5 sm:p-6 hover:bg-slate-800/50 transition-colors ${index !== history.length - 1 ? 'border-b border-slate-800/60' : ''}`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        {/* Status Icon */}
                        <div className="hidden sm:flex bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        
                        {/* Transaction Details */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{item.orderId}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {item.date}
                            </span>
                          </div>
                          <h4 className="text-white font-bold text-sm sm:text-base">{item.device}</h4>
                          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Paid by <span className="font-semibold text-slate-300">{item.customerName}</span></p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <span className="text-emerald-400 font-black text-lg sm:text-xl flex items-center justify-end">
                          + ₹{item.amount}
                        </span>
                        <span className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-wider mt-1">Credited</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </TechLayout>
  );
}