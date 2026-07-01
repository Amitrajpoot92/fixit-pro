import React from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Settings className="w-20 h-20 text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-slate-500">App configuration and admin settings coming soon...</p>
      </div>
    </AdminLayout>
  );
}