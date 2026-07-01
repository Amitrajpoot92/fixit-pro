import React from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { ClipboardList } from 'lucide-react';

export default function Tasks() {
  return (
    <TechLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ClipboardList className="w-20 h-20 text-emerald-900 mb-4" />
        <h2 className="text-2xl font-bold text-white">Pending Tasks</h2>
        <p className="text-slate-500">Your assigned repairs will appear here...</p>
      </div>
    </TechLayout>
  );
}