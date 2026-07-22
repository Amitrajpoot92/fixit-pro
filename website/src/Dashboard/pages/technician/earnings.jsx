import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { 
  Wallet, IndianRupee, CheckCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, Loader2, SearchX, Banknote, CreditCard, ShieldCheck, History, Calculator, CalendarClock
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Earnings() {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' or 'Payouts'
  const [loading, setLoading] = useState(true);

  // Stats & Data States
  const [unsettledJobs, setUnsettledJobs] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [stats, setStats] = useState({ 
    lifetimeGross: 0, 
    unsettledGross: 0,
    unsettledOnline: 0, 
    unsettledOffline: 0,
    lifetimePaid: 0
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        
        // 1. Fetch Completed Bookings
        const qBookings = query(collection(db, 'bookings'), where('technicianId', '==', user.uid), where('status', '==', 'Completed'));
        const unsubBookings = onSnapshot(qBookings, (snapshot) => {
          let lifetimeGross = 0;
          let unsettledGross = 0;
          let unsettledOnline = 0;
          let unsettledOffline = 0;
          const pendingJobs = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const amount = Number(data.totalAmount) || 0;
            const mode = data.paymentMode || 'Offline'; 
            const isSettled = data.isSettled === true;

            lifetimeGross += amount;

            if (!isSettled) {
              unsettledGross += amount;
              if (mode === 'Online') {
                unsettledOnline += amount;
              } else {
                unsettledOffline += amount;
              }

              pendingJobs.push({
                id: docSnap.id,
                orderId: data.orderId || 'N/A',
                device: `${data.brandName || ''} ${data.modelName || ''}`.trim(),
                amount: amount,
                date: data.scheduleDate || 'Recently',
                customerName: data.customerName || data.name || 'Customer',
                paymentMode: mode
              });
            }
          });

          setUnsettledJobs(pendingJobs.reverse());
          setStats(prev => ({ ...prev, lifetimeGross, unsettledGross, unsettledOnline, unsettledOffline }));
        });

        // 2. Fetch Payouts (Settlement History)
        const qPayouts = query(collection(db, 'payout_requests'), where('tech_id', '==', user.uid), where('status', '==', 'Paid'));
        const unsubPayouts = onSnapshot(qPayouts, (snapshot) => {
          let lifetimePaid = 0;
          const historyArr = [];

          snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const amt = Number(p.amount) || 0;
            
            if (p.type === 'TechToAdmin') {
              lifetimePaid -= amt;
            } else {
              lifetimePaid += amt; 
            }

            historyArr.push({
              id: docSnap.id,
              ...p,
              dateObj: p.settled_at?.toDate() || new Date(),
              displayDate: p.settled_at?.toDate() ? p.settled_at.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'
            });
          });

          historyArr.sort((a, b) => b.dateObj - a.dateObj); // Sort Latest First
          setPayoutHistory(historyArr);
          setStats(prev => ({ ...prev, lifetimePaid }));
          setLoading(false);
        });
        
        return () => {
          unsubBookings();
          unsubPayouts();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto pb-12 p-4 sm:p-6">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-500" /> My Earnings & Payouts
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Real-time sync with Admin. Track your unbilled revenue and past settlement history.</p>
        </div>

        {/* 🚀 TABS */}
        <div className="flex flex-row gap-2 mb-8 bg-slate-900 p-1 rounded-2xl w-full sm:w-fit border border-slate-800 overflow-x-auto shadow-lg">
          <button 
            onClick={() => setActiveTab('Overview')} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'Overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Calculator className="w-4 h-4" /> Current Cycle Overview
          </button>
          <button 
            onClick={() => setActiveTab('Payouts')} 
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'Payouts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'}`}
          >
            <History className="w-4 h-4" /> Settlement History
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
        ) : (
          <>
            {/* ======================================= */}
            {/* 🟢 TAB 1: CURRENT CYCLE OVERVIEW        */}
            {/* ======================================= */}
            {activeTab === 'Overview' && (
              <div className="animate-in fade-in duration-300">
                {/* 💰 3-PART STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
                  
                  {/* Unsettled Gross */}
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">New Unsettled Revenue</p>
                    <h1 className="text-4xl font-black text-white flex items-center mt-2 font-mono"><IndianRupee className="w-7 h-7 mr-1 text-slate-400" />{stats.unsettledGross}</h1>
                    <p className="text-slate-500 text-xs mt-3 font-medium">From {unsettledJobs.length} active unbilled jobs</p>
                  </div>

                  {/* Due from Admin (Online) */}
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">Online (With Admin)</p>
                    <h1 className="text-4xl font-black text-white flex items-center mt-2 font-mono"><IndianRupee className="w-7 h-7 mr-1 text-emerald-400" />{stats.unsettledOnline}</h1>
                    <p className="text-slate-500 text-xs mt-3 font-medium">Paid by customers via App</p>
                  </div>

                  {/* Cash in Hand (Offline) */}
                  <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
                    <p className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-1">COD (Cash You Have)</p>
                    <h1 className="text-4xl font-black text-white flex items-center mt-2 font-mono"><IndianRupee className="w-7 h-7 mr-1 text-amber-400" />{stats.unsettledOffline}</h1>
                    <p className="text-slate-500 text-xs mt-3 font-medium">Collected directly from customers</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    <strong className="text-blue-400">Note:</strong> The final payout will be calculated by the Admin during settlement after deducting the platform commission percentage from your total gross revenue.
                  </p>
                </div>

                {/* 📋 UNSETTLED JOBS LEDGER */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500 w-5 h-5" /> Current Cycle Jobs
                  </h3>

                  {unsettledJobs.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                      <SearchX className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Unsettled Jobs</h3>
                      <p className="text-slate-500 text-sm">All your past jobs have been settled. Complete new jobs to see them here.</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-2 p-2">
                      {unsettledJobs.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{item.orderId}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base">{item.device}</h4>
                            <p className="text-slate-400 text-xs mt-1">Gross Amt: <span className="text-white font-mono font-bold tracking-wider">₹{item.amount}</span> • Cust: {item.customerName}</p>
                          </div>

                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-bold text-sm ${item.paymentMode === 'Online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                              {item.paymentMode === 'Online' ? <CreditCard className="w-4 h-4"/> : <Banknote className="w-4 h-4"/>}
                              {item.paymentMode === 'Online' ? 'Pre-Paid (Online)' : 'Cash Collected (COD)'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 🔵 TAB 2: PAYOUT HISTORY                */}
            {/* ======================================= */}
            {activeTab === 'Payouts' && (
              <div className="animate-in fade-in duration-300">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                   <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Lifetime Gross Revenue</p>
                      <h1 className="text-3xl font-black text-white mt-2 font-mono">₹{stats.lifetimeGross}</h1>
                   </div>
                   <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Lifetime Admin Settlements</p>
                      <h1 className="text-3xl font-black text-blue-400 mt-2 font-mono">₹{stats.lifetimePaid}</h1>
                   </div>
                </div>

                {payoutHistory.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                    <CalendarClock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Settlement History</h3>
                    <p className="text-slate-500 text-sm">Once the Admin settles your account, the records will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payoutHistory.map((record, index) => {
                      const isAdminPaying = record.type === 'AdminToTech';
                      const isZero = record.amount === 0;

                      return (
                        <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                           
                           {/* Header */}
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-2">
                             <div>
                               <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">
                                 Cycle #{payoutHistory.length - index}
                               </span>
                               <p className="text-slate-400 text-xs font-bold mt-2"><CalendarClock className="w-3 h-3 inline mr-1"/> {record.displayDate}</p>
                             </div>
                             <div className="text-slate-500 font-mono text-[10px] font-bold">
                               TXN ID: {record.id.substring(0, 10).toUpperCase()}
                             </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                             {/* Block 1: Details */}
                             <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Cycle Summary</p>
                                <p className="text-sm text-slate-300 font-bold mb-1">Orders Settled: <span className="text-white">{record.jobs_settled || 0}</span></p>
                                <p className="text-sm text-slate-300 font-bold mb-1">Gross Rev: <span className="text-white font-mono">₹{record.gross_revenue || 0}</span></p>
                                <p className="text-sm text-slate-300 font-bold">Comm. Cut: <span className="text-red-400 font-mono">{record.commission_applied}% (-₹{record.admin_cut || 0})</span></p>
                             </div>

                             {/* Block 2: Balances */}
                             <div className="sm:border-l border-slate-800 sm:pl-6">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Cycle Collections</p>
                                <p className="text-sm text-slate-300 font-bold mb-1 flex justify-between">Tech Cash (COD): <span className="text-amber-400 font-mono">₹{record.offline_revenue || 0}</span></p>
                                <p className="text-sm text-slate-300 font-bold flex justify-between">Admin Online: <span className="text-emerald-400 font-mono">₹{record.online_revenue || 0}</span></p>
                             </div>

                             {/* Block 3: Final Payout */}
                             <div className="sm:border-l border-slate-800 sm:pl-6 flex flex-col justify-center bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Final Settlement</p>
                                
                                <div className={`flex items-center gap-1.5 font-black uppercase text-sm mb-1 ${isZero ? 'text-slate-400' : isAdminPaying ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isZero ? <CheckCircle2 className="w-4 h-4"/> : isAdminPaying ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                                  {isZero ? 'Perfectly Balanced' : isAdminPaying ? 'Admin Paid You' : 'You Paid Admin'}
                                </div>
                                
                                <p className="text-3xl font-black text-white font-mono">₹{record.amount}</p>
                             </div>
                           </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </TechLayout>
  );
}