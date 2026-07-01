import React from 'react';
import TechLayout from '../../component/technician/TechLayout';
import { Wallet } from 'lucide-react';

export default function Earnings() {
  return (
    <TechLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Wallet className="w-20 h-20 text-emerald-900 mb-4" />
        <h2 className="text-2xl font-bold text-white">My Earnings</h2>
        <p className="text-slate-500">Wallet balance and payout history coming soon...</p>
      </div>
    </TechLayout>
  );
}