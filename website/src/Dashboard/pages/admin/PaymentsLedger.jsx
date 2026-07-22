import React, { useState, useEffect } from 'react';
import { 
  ReceiptIndianRupee, XCircle, Menu, Loader2, ArrowUpRight, ArrowDownRight,
  CheckCircle2, History, Calculator, CalendarClock, Wallet, FileText, ChevronRight
} from 'lucide-react';
import { db } from '../../../firebase'; 
import { collection, getDocs, doc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import AdminSidebar from '../../component/admin/AdminSidebar'; 

export default function PaymentsLedger() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verifiedVendors, setVerifiedVendors] = useState([]);
  
  // 🚀 HISTORY STATE
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('Ledger'); // 'Ledger' or 'History'
  const [selectedHistoryTech, setSelectedHistoryTech] = useState(null); // Modal ke liye

  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [commissionRate, setCommissionRate] = useState(5);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Verified Technicians
      const qTech = query(collection(db, 'technicians'), where('kyc_status', '==', 'verified'));
      const techSnap = await getDocs(qTech);
      const techs = [];
      techSnap.forEach(d => techs.push({ id: d.id, ...d.data() }));

      // 2. Fetch All "Completed" Bookings
      const qBookings = query(collection(db, 'bookings'), where('status', '==', 'Completed'));
      const bookingsSnap = await getDocs(qBookings);
      const bookingsByTech = {};
      
      bookingsSnap.forEach(d => {
        const b = d.data();
        if (!b.technicianId) return;
        
        if (!bookingsByTech[b.technicianId]) {
          bookingsByTech[b.technicianId] = { 
            unsettledOnline: 0, 
            unsettledOffline: 0, 
            lifetimeGross: 0, 
            unsettledJobs: [] 
          };
        }
        
        const amount = Number(b.totalAmount) || 0;
        const mode = b.paymentMode || 'Online';
        const isSettled = b.isSettled === true; 

        bookingsByTech[b.technicianId].lifetimeGross += amount;

        if (!isSettled) {
          if (mode === 'Offline') {
            bookingsByTech[b.technicianId].unsettledOffline += amount;
          } else {
            bookingsByTech[b.technicianId].unsettledOnline += amount;
          }

          bookingsByTech[b.technicianId].unsettledJobs.push({
            id: d.id,
            orderId: b.orderId || 'N/A',
            amount: amount,
            mode: mode,
            date: b.scheduleDate || 'N/A'
          });
        }
      });

      // 3. Fetch Lifetime Payouts (History) - GROUPED BY TECHNICIAN
      const qPayouts = query(collection(db, 'payout_requests'), where('status', '==', 'Paid'));
      const payoutsSnap = await getDocs(qPayouts);
      
      const payoutsByTech = {}; // For Lifetime Calculations
      const groupedHistTemp = {}; // 🚀 For Grouped History UI

      payoutsSnap.forEach(d => {
        const p = d.data();
        if (!payoutsByTech[p.tech_id]) payoutsByTech[p.tech_id] = 0;
        
        const amt = Number(p.amount) || 0;
        if (p.type === 'TechToAdmin') payoutsByTech[p.tech_id] -= amt;
        else payoutsByTech[p.tech_id] += amt; 

        // 🚀 GROUPING LOGIC FOR HISTORY TAB
        if (!groupedHistTemp[p.tech_id]) {
           groupedHistTemp[p.tech_id] = {
               tech_id: p.tech_id,
               tech_name: p.tech_name,
               total_settlement_cycles: 0,
               records: []
           };
        }
        
        groupedHistTemp[p.tech_id].total_settlement_cycles += 1;
        groupedHistTemp[p.tech_id].records.push({
          id: d.id,
          ...p,
          dateObj: p.settled_at?.toDate() || new Date(),
          displayDate: p.settled_at?.toDate() ? p.settled_at.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'
        });
      });

      // Sort History Latest First
      const groupedHistoryArray = Object.values(groupedHistTemp).map(group => {
         group.records.sort((a, b) => b.dateObj - a.dateObj);
         return group;
      });
      setGroupedHistory(groupedHistoryArray);

      // 4. Combine Final Vendor Data
      const finalVendors = techs.map(tech => {
        const onlineEarned = bookingsByTech[tech.id]?.unsettledOnline || 0;
        const offlineEarned = bookingsByTech[tech.id]?.unsettledOffline || 0;
        const unsettledJobs = bookingsByTech[tech.id]?.unsettledJobs || [];
        const totalGross = onlineEarned + offlineEarned; 
        
        const lifetimeGross = bookingsByTech[tech.id]?.lifetimeGross || 0;
        const totalPaidOut = payoutsByTech[tech.id] || 0;

        return {
          ...tech,
          onlineEarned,
          offlineEarned,
          totalGross,
          unsettledJobs,
          lifetimeGross,
          totalPaidOut
        };
      });

      setVerifiedVendors(finalVendors);
    } catch (error) { 
      console.error("Error fetching ledger:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchLedgerData(); }, []);

  // 🚀 MATH LOGIC FOR SELECTED VENDOR
  let totalEarnings = 0;
  let adminCut = 0;
  let techShare = 0;
  let currentNetDue = 0;
  let isAdminPaying = true;
  let absDue = 0;

  if (selectedVendor) {
    totalEarnings = selectedVendor.totalGross; 
    adminCut = Math.round((totalEarnings * commissionRate) / 100);
    techShare = totalEarnings - adminCut;
    
    currentNetDue = selectedVendor.onlineEarned - adminCut; 
    
    isAdminPaying = currentNetDue >= 0;
    absDue = Math.abs(currentNetDue);
  }

  const handleClearDues = async () => {
    if (selectedVendor.unsettledJobs.length === 0) return alert("No new orders to settle!");
    
    const directionText = absDue === 0 
      ? `Accounts perfectly balanced. Mark ${selectedVendor.unsettledJobs.length} orders as Settled?`
      : isAdminPaying 
        ? `Confirm transferring ₹${absDue} TO ${selectedVendor.name}?` 
        : `Confirm receiving ₹${absDue} FROM ${selectedVendor.name}?`;

    if (!window.confirm(directionText)) return;
    
    setActionLoading(true);
    try {
      const batch = writeBatch(db);

      selectedVendor.unsettledJobs.forEach(job => {
        const jobRef = doc(db, 'bookings', job.id);
        batch.update(jobRef, { isSettled: true });
      });

      const payoutRef = doc(collection(db, 'payout_requests'));
      
      // 🚀 SAVING DETAILED SNAPSHOT FOR HISTORY
      batch.set(payoutRef, {
        tech_id: selectedVendor.id,
        tech_name: selectedVendor.name,
        amount: absDue,
        type: isAdminPaying ? 'AdminToTech' : 'TechToAdmin', 
        commission_applied: commissionRate,
        status: 'Paid',
        settled_at: serverTimestamp(),
        jobs_settled: selectedVendor.unsettledJobs.length,
        // Detailed Financials
        gross_revenue: totalEarnings,
        online_revenue: selectedVendor.onlineEarned,
        offline_revenue: selectedVendor.offlineEarned,
        admin_cut: adminCut,
        tech_net_share: techShare
      });

      await batch.commit();

      alert(`Success! ${selectedVendor.unsettledJobs.length} orders marked as Settled.`);
      setSelectedVendor(null);
      fetchLedgerData(); 
    } catch (error) { 
      console.error(error);
      alert("Failed to process settlement."); 
    } finally { 
      setActionLoading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex flex-center justify-between">
          <h1 className="text-white font-bold flex items-center gap-2"><ReceiptIndianRupee className="w-5 h-5 text-emerald-400" /> Ledger & Payouts</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300"><Menu className="w-6 h-6" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : (
          <div className="flex-1 p-6 md:p-8 bg-slate-900 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="bg-slate-800/40 p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 flex-1 w-full">
                  <h1 className="text-2xl font-black text-white flex items-center gap-3"><Wallet className="w-7 h-7 text-emerald-400" /> Finance Ledger</h1>
                  <p className="text-slate-400 text-sm mt-1">Manage current cycle settlements and view detailed historical payout records per technician.</p>
                </div>
              </div>

              {/* 🚀 TABS: Ledger vs History */}
              <div className="flex flex-row gap-2 bg-slate-900 p-1 rounded-2xl w-full sm:w-fit border border-slate-800 overflow-x-auto shadow-lg">
                <button 
                  onClick={() => setActiveTab('Ledger')} 
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'Ledger' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <Calculator className="w-4 h-4" /> Active Ledger
                </button>
                <button 
                  onClick={() => setActiveTab('History')} 
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'History' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <History className="w-4 h-4" /> Settlement History
                </button>
              </div>

              {/* ========================================= */}
              {/* 🟢 TAB 1: ACTIVE LEDGER (NEW ORDERS)      */}
              {/* ========================================= */}
              {activeTab === 'Ledger' && (
                <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="p-5">Partner Name</th>
                          <th className="p-5 text-center text-blue-400">New Orders</th>
                          <th className="p-5 text-center">Gross Revenue</th>
                          <th className="p-5 text-center text-emerald-400">Online Recv</th>
                          <th className="p-5 text-center text-amber-400">COD (Cash)</th>
                          <th className="p-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedVendors.map((vendor) => (
                          <tr key={vendor.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-5">
                              <div className="font-bold text-white text-base">{vendor.name}</div>
                              <div className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Lifetime Total: ₹{vendor.lifetimeGross}</div>
                            </td>
                            <td className="p-5 text-center text-blue-400 font-black text-lg">{vendor.unsettledJobs.length}</td>
                            <td className="p-5 text-center text-white font-black font-mono text-lg">₹{vendor.totalGross}</td>
                            <td className="p-5 text-center text-emerald-400 font-bold font-mono">₹{vendor.onlineEarned}</td>
                            <td className="p-5 text-center text-amber-400 font-bold font-mono">₹{vendor.offlineEarned}</td>
                            <td className="p-5 text-right">
                              <button 
                                onClick={() => setSelectedVendor(vendor)} 
                                disabled={vendor.unsettledJobs.length === 0}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 justify-end w-full ml-auto transition-all shadow-md ${vendor.unsettledJobs.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
                              >
                                <Calculator className="w-4 h-4"/> Settle Now
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* 🔵 TAB 2: SETTLEMENT HISTORY ARCHIVE      */}
              {/* ========================================= */}
              {activeTab === 'History' && (
                <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl">
                  {groupedHistory.length === 0 ? (
                    <div className="p-12 text-center">
                      <CalendarClock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No History Found</h3>
                      <p className="text-slate-500 text-sm">Past settlement records will appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/50 border-b border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="p-5">Partner Name</th>
                            <th className="p-5 text-center">Settlement Cycles</th>
                            <th className="p-5 text-center">Last Settled On</th>
                            <th className="p-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHistory.map((group) => {
                            const latestDate = group.records[0]?.displayDate || 'N/A';
                            return (
                              <tr key={group.tech_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                <td className="p-5 font-bold text-white text-base">
                                  {group.tech_name}
                                </td>
                                <td className="p-5 text-center text-blue-400 font-black">
                                  {group.total_settlement_cycles} Cycles
                                </td>
                                <td className="p-5 text-center text-slate-400 font-medium">
                                  {latestDate}
                                </td>
                                <td className="p-5 text-right flex justify-end">
                                  <button onClick={() => setSelectedHistoryTech(group)} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all shadow-md">
                                    <FileText className="w-4 h-4"/> View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 🛡️ MODAL 1: DYNAMIC SETTLEMENT MODAL (SAME AS BEFORE) */}
            {selectedVendor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                      <h2 className="text-2xl font-black text-white">Settle Cycle: {selectedVendor.name}</h2>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                        Settling {selectedVendor.unsettledJobs.length} new orders.
                      </p>
                    </div>
                    <button onClick={() => setSelectedVendor(null)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full"><XCircle className="w-6 h-6" /></button>
                  </div>
                  
                  {/* Body */}
                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider">Platform Commission</h3>
                        <p className="text-slate-400 text-xs mt-1">Percentage cut taken by Admin</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">
                        <input 
                          type="number" 
                          min="0" max="100"
                          value={commissionRate} 
                          onChange={(e) => setCommissionRate(Number(e.target.value))}
                          className="bg-transparent text-white font-black text-2xl w-16 text-center outline-none"
                        />
                        <span className="text-2xl font-black text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-bold">Unsettled Gross Revenue</span>
                          <span className="text-white font-mono font-bold">₹{totalEarnings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 text-sm font-bold">Admin Cut ({commissionRate}%)</span>
                          <span className="text-red-400 font-mono font-bold">- ₹{adminCut}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                          <span className="text-emerald-400 text-sm font-bold">Tech Net Share</span>
                          <span className="text-emerald-400 font-mono font-bold text-lg">₹{techShare}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-bold">Unsettled COD (Tech Has)</span>
                          <span className="text-amber-400 font-mono font-bold">₹{selectedVendor.offlineEarned}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm font-bold">Unsettled Online (Admin Has)</span>
                          <span className="text-blue-400 font-mono font-bold">₹{selectedVendor.onlineEarned}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border-2 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4 ${absDue === 0 ? 'bg-slate-800 border-slate-600' : isAdminPaying ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}`}>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${absDue === 0 ? 'text-slate-400' : isAdminPaying ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                          Net Settlement
                        </p>
                        <h2 className={`text-2xl sm:text-3xl font-black flex items-center gap-2 mt-1 ${absDue === 0 ? 'text-white' : isAdminPaying ? 'text-emerald-400' : 'text-red-400'}`}>
                          {absDue === 0 ? <CheckCircle2 className="w-6 h-6"/> : isAdminPaying ? <ArrowUpRight className="w-6 h-6"/> : <ArrowDownRight className="w-6 h-6"/>}
                          {absDue === 0 ? 'Balanced (Zero Due)' : isAdminPaying ? 'Admin Pays Tech' : 'Tech Pays Admin'}
                        </h2>
                      </div>
                      <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                        ₹{absDue}
                      </div>
                    </div>

                  </div>
                  
                  {/* Footer Actions */}
                  <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/50">
                    <button onClick={() => setSelectedVendor(null)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">Close</button>
                    {actionLoading ? (
                      <button disabled className="bg-slate-700 px-6 py-3 rounded-xl text-white font-bold flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</button>
                    ) : (
                      <button 
                        onClick={handleClearDues} 
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ${absDue === 0 ? 'bg-blue-600 hover:bg-blue-500 text-white' : isAdminPaying ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'}`}
                      >
                        <CheckCircle2 className="w-5 h-5"/> 
                        {absDue === 0 ? 'Mark Orders as Settled' : isAdminPaying ? 'Record Payment Sent' : 'Record Payment Received'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 🛡️ MODAL 2: DETAILED HISTORY VIEW FOR A SPECIFIC TECHNICIAN */}
            {selectedHistoryTech && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
                  
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                      <h2 className="text-2xl font-black text-white">Timeline: {selectedHistoryTech.tech_name}</h2>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                        Total {selectedHistoryTech.total_settlement_cycles} past settlement cycles recorded.
                      </p>
                    </div>
                    <button onClick={() => setSelectedHistoryTech(null)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full"><XCircle className="w-6 h-6" /></button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {selectedHistoryTech.records.map((record, idx) => {
                       const isAdminPaying = record.type === 'AdminToTech';
                       const isZero = record.amount === 0;

                       return (
                         <div key={record.id} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                            {/* Cycle Date Badge */}
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
                               <span className="bg-slate-900 text-slate-300 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 border border-slate-700"><CalendarClock className="w-3 h-3"/> Cycle #{selectedHistoryTech.records.length - idx}: {record.displayDate}</span>
                               <span className="text-xs font-bold text-slate-500">ID: {record.id.substring(0,8).toUpperCase()}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                               {/* Order Stats */}
                               <div>
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Order Stats</p>
                                 <p className="text-sm text-white font-bold mb-1">Orders Settled: <span className="text-blue-400">{record.jobs_settled || 0}</span></p>
                                 <p className="text-sm text-white font-bold mb-1">Total Gross: <span className="font-mono text-emerald-400">₹{record.gross_revenue || 0}</span></p>
                                 <p className="text-sm text-slate-400 font-medium">Comm. Applied: {record.commission_applied || 0}% (<span className="text-red-400 font-mono">₹{record.admin_cut || 0}</span>)</p>
                               </div>

                               {/* Cash Distribution */}
                               <div className="sm:border-l border-slate-700 sm:pl-6">
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Funds Distribution</p>
                                 <p className="text-sm text-white font-bold mb-1 flex justify-between">Tech Held (COD): <span className="font-mono text-amber-400">₹{record.offline_revenue || 0}</span></p>
                                 <p className="text-sm text-white font-bold flex justify-between">Admin Held (Online): <span className="font-mono text-blue-400">₹{record.online_revenue || 0}</span></p>
                               </div>

                               {/* Final Outcome */}
                               <div className={`sm:border-l border-slate-700 sm:pl-6 flex flex-col justify-center`}>
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Net Settlement</p>
                                 <div className={`flex items-center gap-2 ${isZero ? 'text-slate-300' : isAdminPaying ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isZero ? <CheckCircle2 className="w-5 h-5"/> : isAdminPaying ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5"/>}
                                    <span className="text-sm font-black uppercase">
                                      {isZero ? 'Balanced' : isAdminPaying ? 'Admin Paid' : 'Tech Paid'}
                                    </span>
                                 </div>
                                 <p className="text-3xl font-black font-mono text-white mt-1">₹{record.amount}</p>
                               </div>
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}