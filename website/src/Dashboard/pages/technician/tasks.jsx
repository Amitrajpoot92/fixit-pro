import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { 
  ClipboardList, CheckCircle, Wrench, MapPin, Clock, 
  Loader2, X, ArrowRight, ShieldCheck, User, Phone, Mail, Package 
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeTab, setActiveTab] = useState('New'); 
  const [actionId, setActionId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Query to fetch orders assigned to this specific technician
        const q = query(collection(db, 'bookings'), where('technicianId', '==', user.uid));

        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            
            // 🚀 DATA MAPPING: Extracting exact fields from order document
            return {
              id: docSnap.id,
              orderId: data.orderId || 'N/A',
              device: `${data.brandName || ''} ${data.modelName || ''}`,
              issue: data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Repair Service',
              time: data.scheduleDate ? `${data.scheduleDate} | ${data.scheduleTime}` : 'ASAP',
              status: data.status || 'Order Placed',
              technicianStatus: data.technicianStatus || 'Pending',
              location: data.serviceAddress ? `${data.serviceAddress.flat}, ${data.serviceAddress.area}, ${data.serviceAddress.city}` : 'Store Drop',
              // 🚀 MODE: Handle data existence safely
              mode: data.serviceMode || 'self', 
              totalAmount: data.totalAmount || 0,
              // 🚀 CUSTOMER DATA: Fetching what was saved from app
              customerName: data.customerName || 'N/A',
              customerPhone: data.customerPhone || 'N/A',
              customerEmail: data.customerEmail || 'N/A',
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

  // Helper to render Mode Badge
  const getModeBadge = (mode) => {
    switch(mode) {
      case 'home': return { text: '🏠 Home Visit', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'pickup': return { text: '🛵 Pickup & Drop', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default: return { text: '🏪 Self Drop', color: 'bg-slate-700/30 text-slate-400 border-slate-600/30' };
    }
  };

  const handleAcceptJob = async (taskId) => {
    setActionId(taskId);
    try {
      await updateDoc(doc(db, 'bookings', taskId), {
        technicianStatus: 'Accepted',
        status: 'Technician Assigned' 
      });
      toast.success("Job Accepted!");
    } catch (error) {
      toast.error("Error accepting job");
    }
    setActionId(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, 'bookings', selectedTask.id), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
    setUpdatingStatus(false);
  };

  const newRequests = tasks.filter(t => t.technicianStatus === 'Pending');
  const activeTasks = tasks.filter(t => t.technicianStatus === 'Accepted' && t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const currentList = activeTab === 'New' ? newRequests : activeTab === 'Active' ? activeTasks : completedTasks;

  return (
    <TechLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto pb-12 p-4">
        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
          <ClipboardList className="text-emerald-500" /> Tasks
        </h2>

        <div className="flex gap-2 mb-8 bg-slate-900 p-1.5 rounded-2xl w-fit border border-slate-800">
          {['New', 'Active', 'Completed'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              {tab}
            </button>
          ))}
        </div>

        {currentList.map((task) => {
          const modeData = getModeBadge(task.mode);
          return (
            <div key={task.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-300">{task.orderId}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${modeData.color}`}>{modeData.text}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{task.device}</h3>
                  <p className="text-emerald-400 font-medium text-sm">{task.issue}</p>
                  
                  {/* 🚀 CUSTOMER DATA */}
                  <div className="mt-4 flex flex-col gap-1 text-slate-300 text-sm">
                    <p className="flex items-center gap-2"><User size={14}/> {task.customerName}</p>
                    <a href={`tel:${task.customerPhone}`} className="flex items-center gap-2 text-blue-400"><Phone size={14}/> {task.customerPhone}</a>
                    <p className="flex items-center gap-2 text-slate-500"><Mail size={14}/> {task.customerEmail}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white">₹{task.totalAmount}</div>
                  {activeTab === 'New' && (
                    <button onClick={() => handleAcceptJob(task.id)} className="mt-4 bg-emerald-600 px-6 py-2 rounded-lg font-bold text-white">Accept</button>
                  )}
                  {activeTab === 'Active' && (
                    <button onClick={() => { setSelectedTask(task); setNewStatus(task.status); setIsModalOpen(true); }} className="mt-4 bg-blue-600 px-6 py-2 rounded-lg font-bold text-white">Update</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal logic remains same as provided previously... */}
    </TechLayout>
  );
}