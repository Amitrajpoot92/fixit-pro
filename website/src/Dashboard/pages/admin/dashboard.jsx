import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout'; 
import { Users, Wrench, CircleDollarSign, Activity, Loader2, ArrowRight } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase'; 

// 📊 Premium Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, loading, subtitle }) => (
  <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${color.replace('text-', 'bg-')}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        {loading ? (
          <Loader2 className={`w-8 h-8 animate-spin mt-2 ${color}`} />
        ) : (
          <h3 className="text-3xl font-black text-white">{value}</h3>
        )}
      </div>
      <div className={`p-4 rounded-2xl border ${color.replace('text-', 'border-').replace('text-', 'bg-').replace('500', '500/20')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 relative z-10">
      <Activity className="w-3 h-3" /> {subtitle}
    </p>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Real Data States
  const [stats, setStats] = useState({
    customers: 0,
    technicians: 0,
    revenue: 0,
    pendingRepairs: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    // 1. Fetch Users Count
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, customers: snap.size }));
    });

    // 2. Fetch Technicians Count
    const unsubTechs = onSnapshot(collection(db, 'technicians'), (snap) => {
      setStats(prev => ({ ...prev, technicians: snap.size }));
    });

    // 3. Fetch Bookings for Revenue, Pending Count, and Recent Table
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      let totalRev = 0;
      let pendingCount = 0;
      let allBookings = [];

      snap.forEach(doc => {
        const data = doc.data();
        allBookings.push({ id: doc.id, ...data });

        if (data.status === 'Completed') {
          totalRev += Number(data.totalAmount) || 0;
        } else if (data.status !== 'Cancelled') {
          pendingCount += 1; // Any active or new order
        }
      });

      // Sort bookings by creation time (Latest first)
      allBookings.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setStats(prev => ({ 
        ...prev, 
        revenue: totalRev, 
        pendingRepairs: pendingCount 
      }));
      
      setRecentBookings(allBookings.slice(0, 5)); // Get top 5 recent
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubTechs();
      unsubBookings();
    };
  }, []);

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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              Dashboard Overview
            </h2>
            <p className="text-slate-400 text-sm mt-2">Welcome to your central command. Here is your real-time platform data.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2 w-fit shadow-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-300 font-bold text-sm">Real-time Sync Active</span>
          </div>
        </div>

        {/* 🚀 TOP STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Customers" 
            value={stats.customers} 
            icon={Users} 
            color="text-blue-500" 
            loading={loading}
            subtitle="Registered app users"
          />
          <StatCard 
            title="Active Technicians" 
            value={stats.technicians} 
            icon={Wrench} 
            color="text-purple-500" 
            loading={loading}
            subtitle="Onboarded partners"
          />
          <StatCard 
            title="Platform Revenue" 
            value={`₹${stats.revenue.toLocaleString('en-IN')}`} 
            icon={CircleDollarSign} 
            color="text-emerald-500" 
            loading={loading}
            subtitle="From completed jobs"
          />
          <StatCard 
            title="Pending Repairs" 
            value={stats.pendingRepairs} 
            icon={Activity} 
            color="text-orange-500" 
            loading={loading}
            subtitle="Orders currently active"
          />
        </div>
        
        {/* 🚀 RECENT BOOKINGS TABLE */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Recent Bookings Feed
            </h3>
            <a href="/admin/bookings" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={14}/>
            </a>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Device / Service</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                        <p>Syncing live data...</p>
                      </td>
                    </tr>
                  ) : recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-500">No bookings generated yet.</td>
                    </tr>
                  ) : (
                    recentBookings.map(order => (
                      <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white whitespace-nowrap">{order.orderId || 'N/A'}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{order.customerName || 'Customer'}</div>
                          <div className="text-xs text-slate-500">{order.customerPhone || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-blue-400">{order.brandName} {order.modelName}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {order.services?.map(s => s.serviceTitle).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 font-black text-emerald-400 whitespace-nowrap">₹{order.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusColor(order.status)}`}>
                            {order.status || 'Order Placed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}