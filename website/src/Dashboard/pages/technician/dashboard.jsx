import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout'; 
import { ClipboardList, CheckCircle, Wallet, Star, Clock, MapPin, Loader2, Wrench, Check, X, ArrowRightCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase'; 
import toast, { Toaster } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl transition-all hover:bg-slate-800">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function TechDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [actionId, setActionId] = useState(null); // Button loading state ke liye

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🚀 LIVE LISTENER: Sirf wahi order layega jo is tech ko assign hue hain
        const q = query(
          collection(db, 'bookings'), 
          where('technicianId', '==', user.uid)
        );

        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            
            const deviceName = `${data.brandName || ''} ${data.modelName || ''}`;
            const servicesList = data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Repair Service';
            const scheduledFor = data.scheduleDate ? `${data.scheduleDate} | ${data.scheduleTime}` : 'ASAP / Self Drop';
            
            let fullAddress = 'Address not provided';
            if (data.serviceAddress) {
              fullAddress = `${data.serviceAddress.flat}, ${data.serviceAddress.area}, ${data.serviceAddress.city}`;
            }

            return {
              id: docSnap.id,
              orderId: data.orderId,
              device: deviceName,
              issue: servicesList,
              time: scheduledFor,
              status: data.status || 'Order Placed',
              technicianStatus: data.technicianStatus || 'Pending', // 👈 Important flag
              location: fullAddress,
              mode: data.serviceMode,
              totalAmount: data.totalAmount
            };
          });
          
          setTasks(tasksData);
          setLoadingTasks(false);
        });

        return () => unsubscribeTasks();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 🚀 ACTION: Accept Job
  const handleAcceptJob = async (taskId) => {
    setActionId(taskId);
    try {
      await updateDoc(doc(db, 'bookings', taskId), {
        technicianStatus: 'Accepted',
        status: 'Technician Assigned' // Ye App pe Track Order me update dikhayega
      });
      toast.success("Job Accepted Successfully!");
    } catch (error) {
      toast.error("Failed to accept job");
    }
    setActionId(null);
  };

  // 🚀 ACTION: Transfer to Admin
  const handleTransferToAdmin = async (taskId) => {
    setActionId(taskId);
    try {
      await updateDoc(doc(db, 'bookings', taskId), {
        technicianId: "", // ID hata di, ab tech ke panel se gayab ho jayega
        technicianName: "Unassigned",
        technicianStatus: 'Transferred', // Admin ko pata chalega ki ye reject hua hai
        status: 'Admin Re-assignment' 
      });
      toast.success("Job Transferred to Admin!");
    } catch (error) {
      toast.error("Failed to transfer job");
    }
    setActionId(null);
  };

  // 🚀 ACTION: Update Working Status (In-Progress / Completed)
  const handleUpdateStatus = async (taskId, currentStatus) => {
    setActionId(taskId);
    try {
      let newStatus = '';
      if (currentStatus.toLowerCase() === 'technician assigned') {
        newStatus = 'Repair In-Progress';
      } else if (currentStatus.toLowerCase() === 'repair in-progress') {
        newStatus = 'Completed';
      }

      if (newStatus) {
        await updateDoc(doc(db, 'bookings', taskId), { status: newStatus });
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
    setActionId(null);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'repair in-progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  // Data Filtering
  const newRequests = tasks.filter(t => t.technicianStatus === 'Pending');
  const activeTasks = tasks.filter(t => t.technicianStatus === 'Accepted');
  
  const completedCount = activeTasks.filter(t => t.status.toLowerCase() === 'completed').length;
  const todaysEarnings = activeTasks.filter(t => t.status.toLowerCase() === 'completed').reduce((sum, task) => sum + (task.totalAmount || 0), 0);

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto pb-10">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">My Workspace</h2>
            <p className="text-slate-400 text-sm mt-1">Manage your job requests and active repairs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="New Requests" value={newRequests.length} icon={ClipboardList} color="bg-orange-500" />
          <StatCard title="Active Jobs" value={activeTasks.filter(t => t.status.toLowerCase() !== 'completed').length} icon={Wrench} color="bg-blue-600" />
          <StatCard title="Completed Today" value={completedCount} icon={CheckCircle} color="bg-emerald-600" />
          <StatCard title="Today's Earnings" value={`₹ ${todaysEarnings}`} icon={Wallet} color="bg-purple-600" />
        </div>
        
        {/* =========================================
            SECTION 1: NEW JOB REQUESTS (PENDING)
        ============================================= */}
        {newRequests.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              New Job Requests ({newRequests.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newRequests.map((task) => (
                <div key={task.id} className="bg-slate-900 border border-orange-500/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">NEW REQUEST</span>
                      <h4 className="text-lg font-bold text-white mt-2">{task.device}</h4>
                      <p className="text-slate-400 text-sm">{task.issue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">₹{task.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-6 bg-slate-800/50 p-3 rounded-xl">
                    <div className="flex items-center gap-1"><Clock size={16} className="text-slate-500"/> {task.time}</div>
                    <div className="flex items-center gap-1 truncate"><MapPin size={16} className="text-slate-500"/> {task.location}</div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAcceptJob(task.id)}
                      disabled={actionId === task.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all"
                    >
                      {actionId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check size={18} /> Accept Job</>}
                    </button>
                    <button 
                      onClick={() => handleTransferToAdmin(task.id)}
                      disabled={actionId === task.id}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl border border-slate-700 flex justify-center items-center gap-2 transition-all"
                    >
                      {actionId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X size={18} /> Pass to Admin</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 2: MY ACTIVE WORKSPACE (ACCEPTED)
        ============================================= */}
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            My Active Workspace 
            {loadingTasks && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </h3>

          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            {activeTasks.length === 0 && !loadingTasks ? (
              <div className="p-10 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active jobs right now. Accept new requests to start earning!</p>
              </div>
            ) : (
              activeTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-800/50 transition-colors ${index !== activeTasks.length - 1 ? 'border-b border-slate-800' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-black text-slate-500">{task.orderId}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {task.mode}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{task.device}</h4>
                    <p className="text-emerald-400 font-medium text-sm flex items-center gap-1 mt-1">
                      <Wrench size={14} /> {task.issue}
                    </p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" /> {task.location}
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Wallet className="w-4 h-4 text-slate-500" /> ₹{task.totalAmount}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4">
                    <div className="flex items-center gap-2 text-white font-bold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                      <Clock className="w-4 h-4 text-emerald-400" /> {task.time}
                    </div>
                    
                    {task.status.toLowerCase() !== 'completed' && (
                      <button 
                        onClick={() => handleUpdateStatus(task.id, task.status)}
                        disabled={actionId === task.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
                      >
                        {actionId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                          (task.status.toLowerCase() === 'repair in-progress' ? <><CheckCircle size={18}/> Mark Completed</> : <><ArrowRightCircle size={18}/> Start Repair</>)
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </TechLayout>
  );
}