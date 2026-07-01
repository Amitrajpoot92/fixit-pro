import React, { useState, useEffect } from 'react';
import TechLayout from '../../component/technician/TechLayout'; 
import { ClipboardList, CheckCircle, Wallet, Star, Clock, MapPin, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../firebase'; // Path zaroor check kar lena

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

// Lucide Icon fallback (Just in case)
function UserIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

export default function TechDashboard() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    // 🚀 FIREBASE REAL-TIME MAGIC
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Query: Sirf is Technician ke orders laao (Assumes mobile app saves 'technicianId' in bookings)
        const q = query(
          collection(db, 'bookings'), 
          where('technicianId', '==', user.uid)
        );

        // onSnapshot = Live Data Listener
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              // ⚠️ Mobile App ke database fields ke hisaab se isko match kar lena
              device: data.deviceModel || 'Unknown Device', 
              issue: data.serviceName || 'Service Request',
              time: data.bookingTime || 'ASAP',
              status: data.status || 'Pending',
              customer: data.customerName || 'Customer',
              location: data.address || 'Address not provided',
              phone: data.customerPhone || 'N/A'
            };
          });
          
          setTodayTasks(tasksData);
          setLoadingTasks(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribeTasks();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'In Progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  // Stats calculate karna
  const pendingCount = todayTasks.filter(t => t.status === 'Pending').length;
  const completedCount = todayTasks.filter(t => t.status === 'Completed').length;

  return (
    <TechLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">My Workspace</h2>
            <p className="text-slate-400 text-sm mt-1">Check your assigned tasks and daily earnings.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-400 text-sm font-medium">Today's Date</p>
            <p className="text-emerald-400 font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {/* 📊 LIVE STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Pending Tasks" value={pendingCount} icon={ClipboardList} color="bg-orange-500" />
          <StatCard title="Completed Today" value={completedCount} icon={CheckCircle} color="bg-emerald-600" />
          <StatCard title="Today's Earnings" value="₹ 0" icon={Wallet} color="bg-blue-600" />
          <StatCard title="My Rating" value="4.8" icon={Star} color="bg-yellow-500" />
        </div>
        
        {/* 📋 LIVE TASKS LIST */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Today's Appointments 
              {loadingTasks && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            {todayTasks.length === 0 && !loadingTasks ? (
              <div className="p-10 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No jobs assigned to you right now. Sit tight!</p>
              </div>
            ) : (
              todayTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-800/50 transition-colors ${index !== todayTasks.length - 1 ? 'border-b border-slate-800' : ''}`}
                >
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-black text-slate-500">#{task.id.slice(0,6).toUpperCase()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{task.device}</h4>
                    <p className="text-emerald-400 font-medium text-sm flex items-center gap-1 mt-1">
                      <Wrench size={14} /> {task.issue}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <UserIcon className="w-4 h-4 text-slate-500" /> {task.customer}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Phone className="w-4 h-4 text-slate-500" /> {task.phone}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" /> {task.location}
                    </div>
                  </div>

                  {/* Time & Action */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4">
                    <div className="flex items-center gap-2 text-white font-bold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                      <Clock className="w-4 h-4 text-emerald-400" /> {task.time}
                    </div>
                    {task.status !== 'Completed' && (
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
                        Update Status
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