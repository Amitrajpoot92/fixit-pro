import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle, Eye, 
  Loader2, CreditCard, Landmark, Smartphone, Phone, Menu 
} from 'lucide-react';
import { db } from '../../../firebase'; 
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import AdminSidebar from '../../component/admin/AdminSidebar'; 

export default function AdminKyc() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'technicians'));
        const techData = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().kyc_details) techData.push({ id: doc.id, ...doc.data() });
        });
        setTechnicians(techData);
      } catch (error) { 
        console.error("Error:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchTechnicians();
  }, []);

  const handleKycAction = async (techId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this KYC as ${newStatus.toUpperCase()}?`)) return;
    setActionLoading(true);
    try {
      const updateData = { kyc_status: newStatus };
      if (newStatus === 'verified') updateData.wallet_initialized = true;
      await updateDoc(doc(db, 'technicians', techId), updateData);
      setTechnicians(technicians.map(tech => tech.id === techId ? { ...tech, kyc_status: newStatus } : tech));
      setSelectedTech(null);
      alert(`KYC status successfully updated to ${newStatus}!`);
    } catch (error) {
      alert("Failed to update status.");
    } finally { 
      setActionLoading(false); 
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'verified') return <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/20"><CheckCircle2 className="w-4 h-4"/> Verified</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/20"><Clock className="w-4 h-4"/> Pending</span>;
    return <span className="flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20"><AlertTriangle className="w-4 h-4"/> Unverified</span>;
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* 🚀 Sidebar Integration */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header Menu */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h1 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Approvals</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300"><Menu className="w-6 h-6" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : (
          <div className="flex-1 p-6 md:p-8 bg-slate-900 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-emerald-400" /> KYC Approvals Manager</h1>
                <p className="text-slate-400 text-sm mt-1">Review vendor identity and payment details carefully before approving.</p>
              </div>

              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-700/50 border-b border-slate-700 text-slate-300">
                        <th className="p-4 font-semibold">Technician Name</th>
                        <th className="p-4 font-semibold">Contact</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicians.length === 0 ? (
                         <tr><td colSpan="4" className="p-8 text-center text-slate-400">No KYC records found.</td></tr>
                      ) : (
                        technicians.map((tech) => (
                          <tr key={tech.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white">{tech.name || 'Vendor'}</div>
                              <div className="text-xs text-slate-500">ID: {tech.id.substring(0,8)}...</div>
                            </td>
                            <td className="p-4 text-slate-300">{tech.kyc_details?.mobile_number || tech.phone || 'N/A'}</td>
                            <td className="p-4">{getStatusBadge(tech.kyc_status)}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => setSelectedTech(tech)} 
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg font-semibold transition-all"
                              >
                                <Eye className="w-4 h-4 inline mr-1" /> Review
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 🛡️ HIGH-DETAIL REVIEW MODAL */}
            {selectedTech && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                  
                  <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Review KYC: <span className="text-emerald-400">{selectedTech.name}</span>
                    </h2>
                    <button onClick={() => setSelectedTech(null)} className="text-slate-400 hover:text-white transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    
                    {/* 1. Identity Documents */}
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-inner">
                      <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Identity Documents</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">PAN Card Number</p>
                          <p className="text-white font-mono font-bold text-base bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.pan_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aadhaar Number</p>
                          <p className="text-white font-mono font-bold text-base bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.aadhaar_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Bank Details */}
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-inner">
                      <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2"><Landmark className="w-4 h-4"/> Bank Account (Primary)</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                          <p className="text-white font-mono font-bold text-base bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.account_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">IFSC Code</p>
                          <p className="text-white font-mono font-bold text-base bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.ifsc_code || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Contact & UPI */}
                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-inner">
                      <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2"><Smartphone className="w-4 h-4"/> Contact & UPI Routing</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Mobile No</p>
                          <p className="text-white font-mono font-bold text-sm bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.mobile_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">UPI ID</p>
                          <p className="text-white font-bold text-sm bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.upi_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">UPI Number</p>
                          <p className="text-white font-mono font-bold text-sm bg-slate-950 px-3 py-1.5 rounded border border-slate-800 select-all">{selectedTech.kyc_details?.upi_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-5 border-t border-slate-700 bg-slate-800/80 flex items-center justify-end gap-3">
                    {actionLoading ? (
                      <button disabled className="bg-slate-700 px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleKycAction(selectedTech.id, 'unverified')} 
                          className="px-6 py-2.5 rounded-xl font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                        >
                          Reject / Suspend
                        </button>
                        <button 
                          onClick={() => handleKycAction(selectedTech.id, 'verified')} 
                          disabled={selectedTech.kyc_status === 'verified'}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" /> 
                          {selectedTech.kyc_status === 'verified' ? 'Already Verified' : 'Verify & Approve'}
                        </button>
                      </>
                    )}
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