import React from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { ShoppingCart } from 'lucide-react';

export default function Bookings() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ShoppingCart className="w-20 h-20 text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-white">Live Bookings</h2>
        <p className="text-slate-500">Bookings table and management coming soon...</p>
      </div>
    </AdminLayout>
  );
}