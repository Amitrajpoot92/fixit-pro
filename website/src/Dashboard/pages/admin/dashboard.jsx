import React from 'react';
import AdminLayout from '../../component/admin/AdminLayout'; 
import { Users, Wrench, CircleDollarSign, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
      <Activity className="w-3 h-3" /> +12% from last month
    </p>
  </div>
);

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
        <p className="text-slate-400 text-sm">Welcome back! Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value="1,248" icon={Users} color="bg-blue-600" />
        <StatCard title="Active Technicians" value="45" icon={Wrench} color="bg-purple-600" />
        <StatCard title="Total Revenue" value="₹ 4.2L" icon={CircleDollarSign} color="bg-emerald-600" />
        <StatCard title="Pending Repairs" value="18" icon={Activity} color="bg-orange-500" />
      </div>
      
      {/* Chart Placeholder */}
      <div className="mt-8 h-96 border border-slate-700/50 rounded-2xl border-dashed flex items-center justify-center text-slate-500 font-medium">
        Charts & Recent Bookings Table Area (Coming Soon)
      </div>
    </AdminLayout>
  );
}