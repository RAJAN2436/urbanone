import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { DollarSign } from 'lucide-react';

export const PlatformLedger = () => {
  return (
    <div className="clean-card p-6 space-y-4">
      <h3 className="text-xl font-black text-zinc-950 font-['Outfit']">Consolidated Platform Financial Streams</h3>

      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
        <div className="flex justify-between text-zinc-600 font-medium">
          <span>Gross Merchandise Value (GMV)</span>
          <span className="text-zinc-950 font-bold font-mono">₹4,82,450</span>
        </div>
        <div className="flex justify-between text-zinc-600 font-medium">
          <span>Merchant Net Payout (85%)</span>
          <span className="text-zinc-900 font-mono">₹4,10,082</span>
        </div>
        <div className="flex justify-between text-zinc-600 font-medium">
          <span>Rider Delivery Fees & Tips (Paid Out)</span>
          <span className="text-zinc-900 font-mono">₹44,200</span>
        </div>
        <div className="flex justify-between text-zinc-600 font-medium">
          <span>GST & Gateway Costs</span>
          <span className="text-zinc-900 font-mono">₹8,600</span>
        </div>
        <div className="pt-3 border-t border-zinc-200 flex justify-between text-sm">
          <span className="font-extrabold text-zinc-950">Net Platform Profit</span>
          <span className="font-black text-emerald-700 font-mono">₹19,568 (Net 4.05%)</span>
        </div>
      </div>
    </div>
  );
};
