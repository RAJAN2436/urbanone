import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { AlertTriangle } from 'lucide-react';

export const DisputeRadar = () => {
  const { showToast } = useAdmin();

  const tickets = [
    { id: 'DSP-102', customer: 'Rohan Mehta', issue: 'Missing item in pasta order', amount: '₹240', status: 'Pending Review' },
    { id: 'DSP-098', customer: 'Kavita Roy', issue: 'Late delivery due to rain surge', amount: '₹50 Refunded', status: 'Resolved' }
  ];

  return (
    <div className="clean-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-zinc-950 font-['Outfit'] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#f97316]" />
          <span>AI Fraud Radar & Customer Dispute Tickets</span>
        </h3>
        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          0 Critical Breaches
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-extrabold text-zinc-950">#{ticket.id} • {ticket.customer}</div>
              <p className="text-zinc-500 mt-0.5">{ticket.issue}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-zinc-950">{ticket.amount}</span>
              <button
                onClick={() => showToast('Refund Authorized', `Refund of ${ticket.amount} credited to customer wallet`, 'success')}
                className="btn-secondary text-[11px] py-1.5 px-3 cursor-pointer"
              >
                Authorize Refund
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
