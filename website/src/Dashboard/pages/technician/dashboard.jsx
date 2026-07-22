import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout'; 
import { 
  ClipboardList, CheckCircle, Wallet, Clock, MapPin, 
  Loader2, Wrench, X, ArrowRight, User, Phone, Mail, ShieldCheck, AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase'; 
import toast, { Toaster } from 'react-hot-toast';

// 📊 Premium Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, shadowColor }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl ${shadowColor}`}>
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${color.replace('text-', 'bg-')}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-white">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl border ${color.replace('text-', 'border-').replace('text-', 'bg-').replace('500', '500/20').replace('400', '400/20')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default function TechDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [actionId, setActionId] = useState(null);
  
  // 🚀 SHOW MORE STATE (Default 5)
  const [visibleCount, setVisibleCount] = useState(5);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonTech, setCancelReasonTech] = useState('');
  const [cancellingTask, setCancellingTask] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'bookings'), where('technicianId', '==', user.uid));

        const unsubscribeTasks = onSnapshot(q, async (snapshot) => {
          // 🚀 PROMISE.ALL LOGIC (Exact Accurate User Data Fetching)
          const tasksPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            let finalCustomerName = data.customerName || data.name || 'Unknown Customer';
            let finalCustomerPhone = data.customerPhone || data.phone || data.mobile || data.phoneNumber || 'Phone not provided';
            let finalCustomerEmail = data.customerEmail || data.email || 'Email not provided';

            if (data.userId) {
              try {
                const userRef = doc(db, 'users', data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  if (userData.name) finalCustomerName = userData.name;
                  if (userData.email) finalCustomerEmail = userData.email;
                  if (userData.mobile) finalCustomerPhone = userData.mobile; 
                  else if (userData.phone) finalCustomerPhone = userData.phone; 
                }
              } catch (error) {
                console.error("Error fetching live user data:", error);
              }
            }

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
              
              customerName: finalCustomerName,
              customerPhone: finalCustomerPhone,
              customerEmail: finalCustomerEmail,
              
              cancelledBy: data.cancelledBy || null,
              cancelReason: data.cancelReason || 'No reason provided.'
            };
          });
          
          const resolvedTasks = await Promise.all(tasksPromises);
          setTasks(resolvedTasks.reverse());
          setLoadingTasks(false);
        });

        return () => unsubscribeTasks();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 🚀 Actions & Handlers
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

  // 🚀 Strict Filtering: DRAFT ORDERS BLOCKED
  const validTasks = tasks.filter(t => 
    t.status !== 'Payment_Pending' && 
    t.status !== 'Payment_Failed' && 
    t.status !== 'Payment_Cancelled'
  );

  // 🚀 Stats Calculations
  const newRequestsCount = validTasks.filter(t => t.technicianStatus === 'Pending' && t.status !== 'Cancelled').length;
  const activeJobsCount = validTasks.filter(t => t.technicianStatus === 'Accepted' && t.status !== 'Completed' && t.status !== 'Cancelled').length;
  const completedJobs = validTasks.filter(t => t.status === 'Completed');
  const totalEarnings = completedJobs.reduce((sum, task) => sum + (Number(task.totalAmount) || 0), 0);

  // 🚀 Urgent Tasks Board (New + Active Only)
  const urgentTasks = validTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');
  const displayedTasks = urgentTasks.slice(0, visibleCount); // SHOW MORE LOGIC

  // Badges
  const getModeBadge = (mode) => {
    const m = mode?.toLowerCase();
    if (m === 'home') return { text: '🏠 Home Visit', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    if (m === 'pickup') return { text: '🛵 Pickup & Drop', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    return { text: '🏪 Self Drop', color: 'bg-slate-700/30 text-slate-400 border-slate-600/30' };
  };

  const getStatusBadgeColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s === 'repair in-progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s === 'technician assigned') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  };

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto pb-12 p-4 sm:p-6">
        
        {/* 🚀 Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
              Command Center
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Welcome back! Here's what's happening with your repair jobs today.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2 w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-300 font-bold text-sm">System Live & Syncing</span>
          </div>
        </div>

        {/* 🚀 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <StatCard title="New Requests" value={newRequestsCount} icon={ClipboardList} color="text-orange-500" shadowColor="shadow-orange-900/10" />
          <StatCard title="Active Jobs" value={activeJobsCount} icon={Wrench} color="text-blue-500" shadowColor="shadow-blue-900/10" />
          <StatCard title="Total Completed" value={completedJobs.length} icon={CheckCircle} color="text-emerald-500" shadowColor="shadow-emerald-900/10" />
          <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={Wallet} color="text-purple-500" shadowColor="shadow-purple-900/10" />
        </div>
        
        {/* 🚀 Urgent Action Board */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="bg-orange-500/20 text-orange-500 p-1.5 rounded-lg border border-orange-500/30">
                <AlertTriangle size={18} />
              </span>
              Urgent Tasks Board 
              {loadingTasks && <Loader2 className="w-4 h-4 animate-spin text-emerald-500 ml-2" />}
            </h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {loadingTasks ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : urgentTasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl">
                <CheckCircle className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Urgent Tasks!</h3>
                <p className="text-slate-500 text-sm">You have no new requests or active jobs pending right now. Great job!</p>
              </div>
            ) : (
              <>
                {displayedTasks.map((task) => {
                  const modeData = getModeBadge(task.mode);
                  const isNew = task.technicianStatus === 'Pending';
                  const isPrepaid = task.paymentMode === 'Online';
                  
                  let displayStatus = task.status;
                  if (task.status === 'Order Placed') displayStatus = isPrepaid ? 'Placed (Online Paid)' : 'Placed (COD)';

                  return (
                    <div key={task.id} className={`bg-slate-900 border rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-5 ${isNew ? 'border-orange-500/50 shadow-orange-900/10' : 'border-slate-700/80'}`}>
                      
                      <div className="flex flex-row flex-wrap items-center gap-2 justify-between w-full border-b border-slate-800/60 pb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isNew && <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">NEW</span>}
                          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs font-black text-slate-300 border border-slate-700">
                            {task.orderId}
                          </span>
                          <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${modeData.color}`}>
                            {modeData.text}
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
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-1 leading-snug">{task.device}</h3>
                        <p className="text-emerald-400 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                          <Wrench size={14} className="shrink-0" /> {task.issue}
                        </p>
                      </div>

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
                          <button onClick={() => { setSelectedTask(task); setIsCancelModalOpen(true); }} className="flex-1 sm:flex-initial text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-red-400 transition-all">
                            Cancel
                          </button>

                          {isNew ? (
                            <button onClick={() => handleAcceptJob(task.id)} className="flex-[2] sm:flex-initial text-center bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all">
                              Accept Job
                            </button>
                          ) : (
                            <button onClick={() => openStatusModal(task)} className="flex-[2] sm:flex-initial text-center bg-blue-600 hover:bg-blue-500 px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-900/20">
                              Update Status <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* 🚀 SHOW MORE BUTTON */}
                {urgentTasks.length > visibleCount && (
                  <div className="flex justify-center mt-6">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 5)}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-full transition-all border border-slate-700 shadow-lg text-sm"
                    >
                      Show More Tasks <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 🚀 MODALS (Same robust modals from tasks logic) */}
        
        {/* Status Update Modal */}
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

        {/* Cancel Order Modal */}
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
                <button onClick={handleTechCancel} disabled={cancellingTask} className="flex-1 bg-red-600 text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-red-500 text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5">
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