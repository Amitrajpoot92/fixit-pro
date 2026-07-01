import React from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { Settings } from 'lucide-react';

export default function TechSettings() {
  return (
    <TechLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Settings className="w-20 h-20 text-emerald-900 mb-4" />
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-slate-500">Update your profile, password, and preferences here...</p>
      </div>
    </TechLayout>
  );
}