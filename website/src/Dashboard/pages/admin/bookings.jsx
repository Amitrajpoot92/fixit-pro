import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { 
  ShoppingCart, User, Wrench, X, Phone, Mail, MapPin, 
  Search, Loader2, Wallet, CreditCard, Banknote, AlertTriangle, Calendar 
} from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState({}); // Map of id -> tech data
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);

  useEffect(() => {
    // 1️⃣ Fetch Technicians Map
    const unsubTechs = onSnapshot(collection(db, 'technicians'), (snap) => {
      const techMap = {};
      snap.docs.forEach(doc => {
        techMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setTechnicians(techMap);
    });

    // 2️⃣ Fetch Bookings with Live User Data
    const unsubBookings = onSnapshot(collection(db, 'bookings'), async (snap) => {
      const promises = snap.docs.map(async (docSnap) => {
        const data = docSnap.data();

        // 🚀 LIVE USER DATA FETCHING
        let liveName = data.customerName || data.name || 'Unknown';
        let livePhone = data.customerPhone || data.phone || data.mobile || 'N/A';
        let liveEmail = data.customerEmail || data.email || 'N/A';

        if (data.userId) {
          try {
            const userRef = doc(db, 'users', data.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.name) liveName = userData.name;
              if (userData.email) liveEmail = userData.email;
              if (userData.mobile) livePhone = userData.mobile;
              else if (userData.phone) livePhone = userData.phone;
            }
          } catch (error) {
            console.error("Error fetching live user info:", error);
          }
        }

        // 🚀 ADDRESS FORMATTING
        let addressDisplay = 'Store Drop / Address Not Required';
        if (data.serviceAddress) {
          if (typeof data.serviceAddress === 'string') {
            addressDisplay = data.serviceAddress;
          } else {
            addressDisplay = `${data.serviceAddress.flat || ''} ${data.serviceAddress.area || ''} ${data.serviceAddress.city || ''} ${data.serviceAddress.pincode || ''}`.trim();
          }
        }

        return {
          id: docSnap.id,
          ...data,
          // Explicit Overrides
          orderId: data.orderId || 'N/A',
          customerName: liveName,
          customerPhone: livePhone,
          customerEmail: liveEmail,
          location: addressDisplay,
          mode: data.serviceMode || 'self',
          paymentMode: data.paymentMode || 'Offline',
          totalAmount: data.totalAmount || 0,
          status: data.status || 'Order Placed',
          technicianStatus: data.technicianStatus || 'Pending',
        };
      });

      const bks = await Promise.all(promises);
      setBookings(bks.reverse());
      setLoading(false);
    });

    return () => {
      unsubTechs();
      unsubBookings();
    };
  }, []);

  // 🚀 FILTER 1: BLOCK DRAFT ORDERS
  const validBookings = bookings.filter(b => 
    b.status !== 'Payment_Pending' && 
    b.status !== 'Payment_Failed' && 
    b.status !== 'Payment_Cancelled'
  );

  // 🚀 FILTER 2: TABS LOGIC
  const pendingBookings = validBookings.filter(b => b.status === 'Order Placed' || (b.technicianStatus === 'Pending' && b.status !== 'Cancelled'));
  const activeBookings = validBookings.filter(b => (b.status === 'Technician Assigned' || b.status === 'Repair In-Progress') && b.status !== 'Cancelled');
  const completedBookings = validBookings.filter(b => b.status === 'Completed');
  const cancelledBookings = validBookings.filter(b => b.status === 'Cancelled');

  const currentList = activeTab === 'Pending' ? pendingBookings : 
                      activeTab === 'Active' ? activeBookings : 
                      activeTab === 'Completed' ? completedBookings : 
                      cancelledBookings;

  // Helpers for UI
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s === 'cancelled') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (s === 'repair in-progress') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (s === 'technician assigned') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  };

  const getModeBadge = (mode) => {
    const m = mode?.toLowerCase();
    if (m === 'home') return { text: 'Home Visit', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    if (m === 'pickup') return { text: 'Pickup & Drop', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    return { text: 'Self Drop', color: 'bg-slate-700/30 text-slate-400 border-slate-600/30' };
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-500" /> Platform Bookings
            </h2>
            <p className="text-slate-400 mt-2">God's-eye view of all customer orders, payments, and technician assignments.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2 w-fit shadow-xl">
             <Wallet size={18} className="text-emerald-500" />
             <span className="text-slate-300 font-bold text-sm">Finance & Tracking Engine</span>
          </div>
        </div>

        {/* 🚀 Tabs */}
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

        {/* 🚀 Rich Data Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">Order Info</th>
                  <th className="p-4 font-semibold">Service Details</th>
                  <th className="p-4 font-semibold">Payment & Amount</th>
                  <th className="p-4 font-semibold">Status & Assignment</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td>
                  </tr>
                ) : currentList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500">No {activeTab} bookings found.</td>
                  </tr>
                ) : (
                  currentList.map(order => {
                    const tech = order.technicianId ? technicians[order.technicianId] : null;
                    const isPrepaid = order.paymentMode === 'Online';
                    const modeBadge = getModeBadge(order.mode);

                    return (
                      <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        
                        {/* Column 1: Order Info */}
                        <td className="p-4 align-top">
                          <div className="font-black text-white text-sm mb-1">{order.orderId}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <Calendar size={12} /> {order.scheduleDate || 'Recently'}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${modeBadge.color}`}>
                            {modeBadge.text}
                          </span>
                        </td>

                        {/* Column 2: Service Details */}
                        <td className="p-4 align-top">
                          <div className="font-bold text-slate-200">{order.brandName} {order.modelName}</div>
                          <div className="text-xs text-slate-500 max-w-[200px] mt-1 line-clamp-2">
                            {order.services?.map(s => s.serviceTitle).join(', ')}
                          </div>
                        </td>

                        {/* Column 3: Payment & Amount */}
                        <td className="p-4 align-top">
                          <div className="font-black text-white text-lg mb-1">₹{order.totalAmount}</div>
                          <span className={`flex items-center gap-1 px-2 py-0.5 w-fit rounded text-[10px] font-bold border whitespace-nowrap ${isPrepaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                            {isPrepaid ? <CreditCard size={12} /> : <Banknote size={12} />} 
                            {isPrepaid ? 'PRE-PAID' : 'COD'}
                          </span>
                        </td>

                        {/* Column 4: Status & Assignment */}
                        <td className="p-4 align-top">
                          <div className="mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {tech ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
                                <Wrench size={12} /> {tech.name}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700">
                                Pending Tech
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 5: Actions */}
                        <td className="p-4 align-top flex flex-col justify-start items-end gap-2">
                           <button onClick={() => setSelectedOrder(order)} className="w-24 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors shadow-md">
                             <User size={12} /> View Info
                           </button>
                           {tech && (
                             <button onClick={() => setSelectedTechId(tech.id)} className="w-24 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded border border-purple-500/30 transition-colors shadow-md">
                               <Wrench size={12} /> Tech Info
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

        {/* ============================================== */}
        {/* 🚀 MODAL 1: DETAILED CUSTOMER & ORDER INFO     */}
        {/* ============================================== */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5"><X size={16} /></button>
              
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <ShoppingCart className="text-blue-500 w-6 h-6"/>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Order: {selectedOrder.orderId}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedOrder.status}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                
                {/* Cancel Reason Box */}
                {selectedOrder.status === 'Cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-bold text-sm">Cancelled by: {selectedOrder.cancelledBy}</p>
                      <p className="text-red-300 text-xs mt-1 font-medium leading-relaxed">Reason: {selectedOrder.cancelReason}</p>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Customer Profile</p>
                  <div className="flex items-center gap-3 text-slate-200 font-bold mb-2.5">
                    <User size={16} className="text-slate-500"/> {selectedOrder.customerName}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm mb-2.5">
                    <Phone size={16} className="text-blue-400"/> 
                    {selectedOrder.customerPhone !== 'N/A' ? <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline font-semibold tracking-wide">{selectedOrder.customerPhone}</a> : 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm mb-2.5">
                    <Mail size={16} className="text-emerald-400"/> 
                    {selectedOrder.customerEmail !== 'N/A' ? <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline font-medium">{selectedOrder.customerEmail}</a> : 'N/A'}
                  </div>
                  <div className="flex items-start gap-3 text-slate-300 text-sm mt-4 pt-4 border-t border-slate-800/60">
                    <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5"/> 
                    <span className="leading-relaxed font-medium">{selectedOrder.location}</span>
                  </div>
                </div>
                
                {/* Financial & Service Details */}
                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Service & Financials</p>
                  <p className="text-base text-white font-black">{selectedOrder.brandName} {selectedOrder.modelName}</p>
                  <p className="text-xs text-emerald-400 mt-1.5 font-bold leading-relaxed">{selectedOrder.services?.map(s=>s.serviceTitle).join(', ')}</p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Mode</span>
                      <span className={`text-xs font-black mt-1 ${selectedOrder.paymentMode === 'Online' ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {selectedOrder.paymentMode === 'Online' ? 'PRE-PAID (ONLINE)' : 'CASH ON DELIVERY'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                       <span className="text-2xl font-black text-white">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* 🚀 MODAL 2: DETAILED TECHNICIAN INFO           */}
        {/* ============================================== */}
        {selectedTechId && technicians[selectedTechId] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setSelectedTechId(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5"><X size={16} /></button>
              
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <Wrench className="text-purple-500 w-6 h-6"/>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Technician Profile</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Partner</p>
                </div>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-4xl font-black mb-3 border-2 border-purple-500/30">
                  {technicians[selectedTechId].name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-center font-black text-white text-2xl mb-1">{technicians[selectedTechId].name}</div>
                
                {/* Shop Name Display */}
                {technicians[selectedTechId].shopName && (
                  <div className="text-center text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                    {technicians[selectedTechId].shopName}
                  </div>
                )}
                
                <div className="w-full space-y-3 mt-2 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Phone size={16} className="text-blue-400"/> 
                    <a href={`tel:${technicians[selectedTechId].phone || technicians[selectedTechId].mobileNo}`} className="hover:underline font-bold">
                      {technicians[selectedTechId].phone || technicians[selectedTechId].mobileNo || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Mail size={16} className="text-emerald-400"/> 
                    <span className="font-medium truncate">{technicians[selectedTechId].email || 'N/A'}</span>
                  </div>
                  {technicians[selectedTechId].shopAddress && (
                    <div className="flex items-start gap-3 text-slate-300 text-sm">
                      <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5"/> 
                      <span className="leading-relaxed font-medium">{technicians[selectedTechId].shopAddress}</span>
                    </div>
                  )}
                </div>
                
                <a href={`tel:${technicians[selectedTechId].phone || technicians[selectedTechId].mobileNo}`} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all mt-6 shadow-lg shadow-blue-900/20">
                  <Phone size={18} /> Contact Technician
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}