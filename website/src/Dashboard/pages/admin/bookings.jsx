import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { ShoppingCart, User, Wrench, X, Phone, Mail, MapPin, Search, Loader2 } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState({}); // Map of id -> tech data
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);

  useEffect(() => {
    // Fetch Technicians
    const unsubTechs = onSnapshot(collection(db, 'technicians'), (snap) => {
      const techMap = {};
      snap.docs.forEach(doc => {
        techMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setTechnicians(techMap);
    });

    // Fetch Bookings
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const bks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by latest first (assuming they have createdAt or just reverse for now)
      setBookings(bks.reverse());
      setLoading(false);
    });

    return () => {
      unsubTechs();
      unsubBookings();
    };
  }, []);

  const pendingBookings = bookings.filter(b => b.status === 'Order Placed' || b.technicianStatus === 'Pending' && b.status !== 'Cancelled');
  const activeBookings = bookings.filter(b => (b.status === 'Technician Assigned' || b.status === 'Repair In-Progress') && b.status !== 'Cancelled');
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

  const currentList = activeTab === 'Pending' ? pendingBookings : 
                      activeTab === 'Active' ? activeBookings : 
                      activeTab === 'Completed' ? completedBookings : 
                      cancelledBookings;

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s === 'cancelled') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (s === 'repair in-progress') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (s === 'technician assigned') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-500" /> All Bookings
          </h2>
          <p className="text-slate-400 mt-2">Monitor all platform orders and assign tasks to technicians.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-row gap-2 mb-8 bg-slate-900 p-1 rounded-2xl w-full sm:w-fit border border-slate-800 overflow-x-auto shadow-lg">
          {['Pending', 'Active', 'Completed', 'Cancelled'].map((tab) => {
             const count = tab === 'Pending' ? pendingBookings.length : tab === 'Active' ? activeBookings.length : tab === 'Completed' ? completedBookings.length : cancelledBookings.length;
             return (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)} 
                 className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 {tab} {count > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{count}</span>}
               </button>
             );
          })}
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                  <th className="p-4 font-semibold">Service Booked</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Technician</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td>
                  </tr>
                ) : currentList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500">No {activeTab} bookings found.</td>
                  </tr>
                ) : (
                  currentList.map(order => {
                    const tech = order.technicianId ? technicians[order.technicianId] : null;
                    return (
                      <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white whitespace-nowrap">{order.orderId || 'N/A'}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{order.brandName} {order.modelName}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{order.services?.map(s=>s.serviceTitle).join(', ')}</div>
                        </td>
                        <td className="p-4 font-black text-emerald-400 whitespace-nowrap">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusColor(order.status)}`}>
                            {order.status || 'Order Placed'}
                          </span>
                        </td>
                        <td className="p-4">
                          {tech ? (
                            <span className="text-blue-400 font-semibold whitespace-nowrap">{tech.name}</span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-500 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 whitespace-nowrap">
                              Pending Selection
                           </span>
                          )}
                        </td>
                        <td className="p-4 flex justify-end gap-2">
                           <button onClick={() => setSelectedUser(order)} className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shadow-md">
                             <User size={12} /> User
                           </button>
                           {tech && (
                             <button onClick={() => setSelectedTechId(tech.id)} className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-purple-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shadow-md">
                               <Wrench size={12} /> Tech
                             </button>
                           )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Info Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5"><X size={16} /></button>
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4"><User className="text-blue-500"/> Customer Details</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-3 text-slate-200 font-semibold mb-2">
                    <User size={16} className="text-slate-500"/> {selectedUser.customerName || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm mb-2">
                    <Phone size={16} className="text-blue-400"/> 
                    {selectedUser.customerPhone ? <a href={`tel:${selectedUser.customerPhone}`} className="hover:underline">{selectedUser.customerPhone}</a> : 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm mb-2">
                    <Mail size={16} className="text-emerald-400"/> 
                    {selectedUser.customerEmail ? <a href={`mailto:${selectedUser.customerEmail}`} className="hover:underline">{selectedUser.customerEmail}</a> : 'N/A'}
                  </div>
                  <div className="flex items-start gap-3 text-slate-300 text-sm mt-3 pt-3 border-t border-slate-800">
                    <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5"/> 
                    <span className="leading-relaxed">
                      {selectedUser.serviceAddress ? 
                        `${selectedUser.serviceAddress.flat || ''}, ${selectedUser.serviceAddress.area || ''}, ${selectedUser.serviceAddress.city || ''}` 
                        : 'Store Drop / Address Not Provided'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Order Snapshot Data</p>
                  <p className="text-sm text-slate-300 font-semibold">{selectedUser.brandName} {selectedUser.modelName}</p>
                  <p className="text-xs text-emerald-400 mt-1 font-medium">{selectedUser.services?.map(s=>s.serviceTitle).join(', ')}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-500">Amount Paid</span>
                    <span className="text-xl font-black text-emerald-400">₹{selectedUser.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tech Info Modal */}
        {selectedTechId && technicians[selectedTechId] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setSelectedTechId(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5"><X size={16} /></button>
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4"><Wrench className="text-purple-500"/> Technician Details</h3>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-inner">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-2xl font-black mb-2 border border-purple-500/30">
                  {technicians[selectedTechId].name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center font-bold text-slate-200 text-xl">{technicians[selectedTechId].name}</div>
                <div className="text-center text-purple-400 text-sm font-medium mb-4">{technicians[selectedTechId].email}</div>
                
                <a href={`tel:${technicians[selectedTechId].phone}`} className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all mt-4">
                  <Phone size={16} /> Call Technician
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}