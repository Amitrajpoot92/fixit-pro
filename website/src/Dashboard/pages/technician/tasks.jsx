import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { 
  ClipboardList, CheckCircle, Wrench, MapPin, Clock, 
  Loader2, X, ArrowRight, ShieldCheck, User, Phone, Mail, 
  AlertTriangle, Home, Truck, Store, Wallet
} from 'lucide-react';
// 🚀 getDoc import kiya gaya hai taaki direct users collection se data nikal sakein
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  // 🚀 MAIN TAB: Service Mode ('home', 'pickup', 'self')
  const [activeMode, setActiveMode] = useState('home'); 
  
  // 🚀 SUB TAB: Order Status
  const [activeTab, setActiveTab] = useState('New'); 
  const [actionId, setActionId] = useState(null);

  // Status Update Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cancel Order Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonTech, setCancelReasonTech] = useState('');
  const [cancellingTask, setCancellingTask] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'bookings'), where('technicianId', '==', user.uid));

        const unsubscribeTasks = onSnapshot(q, async (snapshot) => {
          
          // 🚀 PROMISE.ALL LOGIC: Har order ke user ka live data fetch karne ke liye
          const tasksPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Default Fallback Data
            let finalCustomerName = data.customerName || data.name || 'Unknown Customer';
            let finalCustomerPhone = data.customerPhone || data.phone || data.mobile || data.phoneNumber || 'Phone not provided';
            let finalCustomerEmail = data.customerEmail || data.email || 'Email not provided';

            // 🚀 LIVE FETCH FROM USERS COLLECTION (100% Accurate Data)
            if (data.userId) {
              try {
                const userRef = doc(db, 'users', data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  if (userData.name) finalCustomerName = userData.name;
                  if (userData.email) finalCustomerEmail = userData.email;
                  // EXACT MATCH with EditProfileScreen (mobile field)
                  if (userData.mobile) finalCustomerPhone = userData.mobile; 
                  else if (userData.phone) finalCustomerPhone = userData.phone; 
                }
              } catch (error) {
                console.error("Error fetching live user data:", error);
              }
            }
            
            // 🚀 ROBUST ADDRESS FORMATTING
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
              orderId: data.orderId || 'N/A',
              device: `${data.brandName || ''} ${data.modelName || ''}`.trim(),
              issue: data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Repair Service',
              time: data.scheduleDate ? `${data.scheduleDate} | ${data.scheduleTime}` : 'ASAP',
              status: data.status || 'Order Placed',
              technicianStatus: data.technicianStatus || 'Pending',
              location: addressDisplay || 'Location not available',
              
              mode: data.serviceMode || 'self', 
              paymentMode: data.paymentMode || 'Offline',
              totalAmount: data.totalAmount || 0,
              
              // 🚀 ASSIGNING FRESH DATA
              customerName: finalCustomerName,
              customerPhone: finalCustomerPhone,
              customerEmail: finalCustomerEmail,
              
              cancelledBy: data.cancelledBy || null,
              cancelReason: data.cancelReason || 'No reason provided.'
            };
          });
          
          // Wait for all profiles to load before updating UI
          const resolvedTasks = await Promise.all(tasksPromises);
          setTasks(resolvedTasks.reverse());
          setLoadingTasks(false);
        });

        return () => unsubscribeTasks();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const getStatusBadgeColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s === 'repair in-progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s === 'technician assigned') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (s === 'cancelled') return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  };

  const handleAcceptJob = async (taskId) => {
    setActionId(taskId);
    try {
      await updateDoc(doc(db, 'bookings', taskId), {
        technicianStatus: 'Accepted',
        status: 'Technician Assigned' 
      });
      toast.success("Job Accepted Successfully!");
    } catch (error) {
      toast.error("Error accepting job");
    }
    setActionId(null);
  };

  const openStatusModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, 'bookings', selectedTask.id), { 
        status: newStatus,
        technicianStatus: 'Accepted'
      });
      toast.success(`Status updated to ${newStatus}`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
    setUpdatingStatus(false);
  };

  const handleTechCancel = async () => {
    if (!cancelReasonTech.trim()) {
      toast.error("Cancellation reason is required!");
      return;
    }
    setCancellingTask(true);
    try {
      await updateDoc(doc(db, 'bookings', selectedTask.id), { 
        status: 'Cancelled',
        cancelledBy: 'Technician',
        cancelReason: cancelReasonTech
      });
      toast.success(`Order has been cancelled.`);
      setIsCancelModalOpen(false);
      setCancelReasonTech('');
    } catch (error) {
      toast.error("Failed to cancel order.");
    }
    setCancellingTask(false);
  };

  // 🚀 FILTER 1: First filter by Service Mode (Home, Pickup, Self)
  const modeFilteredTasks = tasks.filter(t => t.mode.toLowerCase() === activeMode);

  // 🚀 FILTER 2: STRICT STATUS CHECK (Blocks Pending/Failed Payments)
  const newRequests = modeFilteredTasks.filter(t => 
    t.technicianStatus === 'Pending' && 
    t.status !== 'Cancelled' && 
    t.status !== 'Payment_Pending' && 
    t.status !== 'Payment_Failed' && 
    t.status !== 'Payment_Cancelled'
  );
  
  const activeTasks = modeFilteredTasks.filter(t => t.technicianStatus === 'Accepted' && t.status !== 'Completed' && t.status !== 'Cancelled');
  const completedTasks = modeFilteredTasks.filter(t => t.status === 'Completed');
  const cancelledTasks = modeFilteredTasks.filter(t => t.status === 'Cancelled'); 
  
  const currentList = activeTab === 'New' ? newRequests : activeTab === 'Active' ? activeTasks : activeTab === 'Completed' ? completedTasks : cancelledTasks;

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto pb-12 p-2 sm:p-4">
        
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 sm:w-8 h-8 text-emerald-500" /> Job Center
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage all your assigned repairs and home visits.</p>
        </div>

        {/* 🚀 LEVEL 1 TABS: SERVICE MODES */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <button 
            onClick={() => setActiveMode('home')}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${activeMode === 'home' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <Home className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Home Visit</span>
          </button>
          
          <button 
            onClick={() => setActiveMode('pickup')}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${activeMode === 'pickup' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <Truck className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Pickup/Drop</span>
          </button>

          <button 
            onClick={() => setActiveMode('self')}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${activeMode === 'self' ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <Store className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Store Drop</span>
          </button>
        </div>

        {/* 🚀 LEVEL 2 TABS: STATUS */}
        <div className="flex flex-row gap-1 sm:gap-2 mb-6 sm:mb-8 bg-slate-900 p-1 rounded-xl sm:rounded-2xl w-full sm:w-fit border border-slate-800 overflow-x-auto shadow-lg">
          {['New', 'Active', 'Completed', 'Cancelled'].map((tab) => {
            const count = tab === 'New' ? newRequests.length : tab === 'Active' ? activeTasks.length : tab === 'Completed' ? completedTasks.length : cancelledTasks.length;
            const tabBg = tab === 'New' ? 'bg-orange-600' : tab === 'Active' ? 'bg-blue-600' : tab === 'Completed' ? 'bg-emerald-600' : 'bg-red-600';
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === tab ? `${tabBg} text-white shadow-md` : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
                {count > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* 📋 RESPONSIVE TASK CARDS LIST */}
        <div className="space-y-4 sm:space-y-6">
          {loadingTasks ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : currentList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-xl">
              <CheckCircle className="w-12 h-12 sm:w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">No {activeTab} Tasks!</h3>
              <p className="text-xs sm:text-sm text-slate-500">You are all caught up for {activeMode.toUpperCase()} mode.</p>
            </div>
          ) : (
            currentList.map((task) => {
              const isCancelled = task.status === 'Cancelled';
              const isPrepaid = task.paymentMode === 'Online';
              
              // 🚀 DYNAMIC STATUS DISPLAY
              let displayStatus = task.status;
              if (task.status === 'Order Placed') {
                displayStatus = isPrepaid ? 'Placed (Online Paid)' : 'Placed (COD)';
              }

              return (
                <div key={task.id} className={`bg-slate-900 border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4 sm:gap-5 ${isCancelled ? 'border-red-900/50' : 'border-slate-700/80'}`}>
                  
                  <div className="flex flex-row flex-wrap items-center gap-2 justify-between w-full border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs font-black text-slate-300 border border-slate-700">
                        {task.orderId}
                      </span>
                      {/* 🚀 PAYMENT BADGE */}
                      <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1 ${isPrepaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                        <Wallet size={12} /> {isPrepaid ? 'PRE-PAID' : 'COD'}
                      </span>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${getStatusBadgeColor(task.status)}`}>
                      {displayStatus}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black mb-1 leading-snug ${isCancelled ? 'text-slate-400 line-through' : 'text-white'}`}>{task.device}</h3>
                    <p className={`${isCancelled ? 'text-red-400' : 'text-emerald-400'} font-bold text-xs sm:text-sm flex items-center gap-1.5`}>
                      <Wrench size={14} className="shrink-0" /> {task.issue}
                    </p>
                  </div>

                  {isCancelled && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-bold text-sm">Cancelled by: {task.cancelledBy}</p>
                        <p className="text-red-300 text-xs mt-1 font-medium leading-relaxed">Reason: {task.cancelReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                    <div className="bg-slate-950/40 p-3 sm:p-4 rounded-xl border border-slate-800/60 flex flex-col gap-2.5">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Customer Info</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-slate-200 text-xs sm:text-sm font-semibold truncate">
                          <User size={14} className="text-slate-500 shrink-0"/> <span className="truncate">{task.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm truncate">
                          <Phone size={14} className="text-blue-400 shrink-0"/>
                          {task.customerPhone !== 'Phone not provided' ? (
                            <a href={`tel:${task.customerPhone}`} className="text-blue-400 hover:underline font-bold tracking-wide truncate">{task.customerPhone}</a>
                          ) : <span className="text-slate-500 truncate">{task.customerPhone}</span>}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm truncate">
                          <Mail size={14} className="text-emerald-400 shrink-0"/>
                          {task.customerEmail !== 'Email not provided' ? (
                            <a href={`mailto:${task.customerEmail}`} className="text-emerald-400 hover:underline font-medium truncate">{task.customerEmail}</a>
                          ) : <span className="text-slate-500 truncate">{task.customerEmail}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-3 sm:p-4 rounded-xl border border-slate-800/60 flex flex-col gap-2.5">
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Service Address / Slot</p>
                       <div className="space-y-2">
                         <div className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm">
                           <MapPin className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" /> 
                           <span className="leading-relaxed font-medium line-clamp-2">{task.location}</span>
                         </div>
                         <div className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm">
                           <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" /> 
                           <span className="font-semibold truncate">{task.time}</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Footer Row */}
                  {!isCancelled && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/20 p-3 sm:p-4 rounded-xl border border-slate-700/40 mt-1">
                      
                      {/* 🚀 AMOUNT TO COLLECT LOGIC */}
                      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start bg-slate-950 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                          {isPrepaid ? 'Payment Status' : 'Amount to Collect'}
                        </span>
                        <span className={`text-2xl sm:text-3xl font-black ${isPrepaid ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {isPrepaid ? 'PAID' : `₹${task.totalAmount}`}
                        </span>
                      </div>
                      
                      <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                        
                        {activeTab !== 'Completed' && (
                          <button onClick={() => { setSelectedTask(task); setIsCancelModalOpen(true); }} className="flex-1 sm:flex-initial text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-red-400 transition-all">
                            Cancel
                          </button>
                        )}

                        {activeTab === 'New' && (
                          <button onClick={() => handleAcceptJob(task.id)} className="flex-[2] sm:flex-initial text-center bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all">
                            Accept Job
                          </button>
                        )}

                        {activeTab === 'Active' && (
                          <button onClick={() => openStatusModal(task)} className="flex-[2] sm:flex-initial text-center bg-blue-600 hover:bg-blue-500 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-900/20">
                            Update Status <ArrowRight size={14} />
                          </button>
                        )}

                        {activeTab === 'Completed' && (
                          <div className="w-full text-center flex items-center justify-center gap-1 text-emerald-400 font-black bg-emerald-500/10 px-5 py-2.5 rounded-xl border border-emerald-500/20 text-xs sm:text-sm">
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> Job Done
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* 🚀 MODAL 1: STATUS UPDATE MODAL */}
        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-200">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5 transition-colors"><X size={16} /></button>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-0.5">Update Live Status</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 font-medium">Order ID: <span className="text-emerald-400 font-bold">{selectedTask.orderId}</span></p>

              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-0.5">Select Current Stage</label>
              <div className="relative mb-6 sm:mb-8">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3.5 sm:p-4 text-white appearance-none outline-none focus:border-blue-500 transition-colors font-bold text-sm sm:text-base cursor-pointer">
                  <option value="Order Placed">🟢 Order Placed</option>
                  <option value="Technician Assigned">👨‍🔧 Technician Assigned</option>
                  <option value="Repair In-Progress">⚙️ Repair In-Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>

              <div className="flex gap-2 sm:gap-3 pb-4 sm:pb-0">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 sm:py-3.5 rounded-xl hover:bg-slate-700 text-xs sm:text-sm transition-colors">Cancel</button>
                <button onClick={handleStatusUpdate} disabled={updatingStatus} className="flex-1 bg-blue-600 text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-blue-500 text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 MODAL 2: CANCEL ORDER MODAL */}
        {isCancelModalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-red-900/50 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-200">
              <button onClick={() => setIsCancelModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5 transition-colors"><X size={16} /></button>
              <h3 className="text-xl sm:text-2xl font-black text-red-500 mb-0.5">Cancel Job</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 font-medium">Order ID: <span className="text-red-400 font-bold">{selectedTask.orderId}</span></p>

              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-0.5">Reason for Cancellation (Required) *</label>
              <textarea 
                value={cancelReasonTech} 
                onChange={(e) => setCancelReasonTech(e.target.value)} 
                placeholder="e.g. Spare parts not available, Customer not reachable..."
                rows="3"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3.5 sm:p-4 text-white outline-none focus:border-red-500 transition-colors font-medium text-sm sm:text-base mb-6 resize-none"
              ></textarea>

              <div className="flex gap-2 sm:gap-3 pb-4 sm:pb-0">
                <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 sm:py-3.5 rounded-xl hover:bg-slate-700 text-xs sm:text-sm transition-colors">Abort</button>
                <button 
                  onClick={handleTechCancel} 
                  disabled={cancellingTask} 
                  className="flex-1 bg-red-600 text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-red-500 text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {cancellingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TechLayout>
  );
}