import React from 'react';
import { useMerchant } from '../context/MerchantContext';
import { DollarSign, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

export const EarningsLedger = () => {
  const { currentMerchant, orders, showToast } = useMerchant();

  const orderList = Array.isArray(orders) ? orders : [];
  const merchantOrders = currentMerchant ? orderList.filter(o => o.merchantId === currentMerchant.id) : [];
  const todayRevenue = merchantOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const commissionAmount = Math.round(todayRevenue * ((currentMerchant?.commissionRate || 15) / 100));
  const netPayout = todayRevenue - commissionAmount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="clean-card p-6 space-y-2">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Gross Merchandise Value (GMV)</div>
          <div className="text-3xl font-black text-zinc-950 font-mono">₹{todayRevenue}</div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <span>● 100% Settled via Gateway</span>
          </div>
        </div>

        <div className="clean-card p-6 space-y-2">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Platform Commission ({currentMerchant.commissionRate}%)</div>
          <div className="text-3xl font-black text-[#ea580c] font-mono">₹{commissionAmount}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Tier: {currentMerchant.tier} Partner</div>
        </div>

        <div className="clean-card p-6 space-y-2 bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border-orange-200">
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Net Merchant Payout</div>
          <div className="text-3xl font-black text-emerald-700 font-mono">₹{netPayout}</div>
          <button
            onClick={() => showToast('Payout Initiated 🏦', `Instant bank transfer of ₹${netPayout} processed`, 'success')}
            className="btn-primary w-full py-2.5 text-xs font-black cursor-pointer mt-2"
          >
            Request Instant Transfer
          </button>
        </div>
      </div>
    </div>
  );
};
