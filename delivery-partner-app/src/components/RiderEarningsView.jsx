import React, { useState } from 'react';
import { useRider } from '../context/RiderContext';
import { 
  TrendingUp, 
  Wallet, 
  IndianRupee, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';

export default function RiderEarningsView() {
  const { stats, pastDeliveries } = useRider();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun

  const weeklyData = daysOfWeek.map((day, idx) => {
    const isToday = idx === todayDayIndex;
    const amount = isToday ? stats.todayEarnings : 0;
    const orderCount = isToday ? stats.completedOrders : 0;
    const heightPercent = stats.todayEarnings > 0 ? (isToday ? '85%' : '14%') : '10%';
    return {
      day,
      amount,
      orders: orderCount,
      height: heightPercent,
      active: isToday
    };
  });

  const handleWithdraw = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 2000);
  };

  return (
    <div className="pb-24 pt-2 px-3.5 w-full max-w-full min-w-0 space-y-3.5 animate-fadeIn overflow-x-hidden">
      {/* Top Wallet Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white p-6 shadow-2xl border border-zinc-800">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Total Payout Balance</span>
          </div>
          <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-payout Active
          </span>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-white">₹{stats.walletBalance.toLocaleString('en-IN')}</span>
            <span className="text-xs text-zinc-400 font-medium">.00</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Next payout cycle: Wednesday, 6:00 AM
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-zinc-800/80">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" /> Instant Transfer
          </button>
          <div className="bg-zinc-800/60 rounded-2xl p-2.5 px-3 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-400 font-medium">Cash in Hand (COD)</span>
            <span className="text-xs font-bold text-amber-400">₹{stats.cashCollected} to deposit</span>
          </div>
        </div>
      </div>

      {/* Today vs Weekly Tab Selector */}
      <div className="bg-white p-1 rounded-2xl border border-zinc-200/80 shadow-xs flex">
        <button
          onClick={() => setSelectedPeriod('today')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedPeriod === 'today'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Today's Earnings
        </button>
        <button
          onClick={() => setSelectedPeriod('weekly')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            selectedPeriod === 'weekly'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Weekly Breakdown
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-zinc-100 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
            <IndianRupee className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-zinc-500 font-medium block">Trips Pay</span>
          <span className="text-base font-extrabold text-zinc-900">₹{stats.todayEarnings}</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-zinc-100 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-zinc-500 font-medium block">Incentives</span>
          <span className="text-base font-extrabold text-amber-600">{stats.completedOrders >= 8 ? '+₹150' : '+₹0'}</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-zinc-100 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-zinc-500 font-medium block">Customer Tips</span>
          <span className="text-base font-extrabold text-emerald-600">₹{stats.customerTips || 0}</span>
        </div>
      </div>

      {/* Weekly Bar Chart Preview (if weekly selected) */}
      {selectedPeriod === 'weekly' && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800">Weekly Performance</span>
            <span className="text-xs font-extrabold text-orange-600">₹{stats.todayEarnings} total</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div 
                  className={`w-full rounded-lg transition-all duration-300 relative ${
                    item.active 
                      ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-md shadow-orange-500/20' 
                      : 'bg-zinc-100 group-hover:bg-zinc-200'
                  }`}
                  style={{ height: item.height }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-zinc-900 text-white px-1 py-0.5 rounded shadow whitespace-nowrap">
                    ₹{item.amount}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold ${item.active ? 'text-orange-600' : 'text-zinc-400'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400 text-center">Live trip earnings from main platform orders</p>
        </div>
      )}

      {/* Active Daily Incentive Target */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-4 rounded-3xl border border-orange-200/60 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Ushait Rush Hour Milestone</h4>
              <p className="text-[11px] text-zinc-500">Deliver 8 orders in Ushait zone</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-xl">
            +₹150 Bonus
          </span>
        </div>

        <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (stats.completedOrders / 8) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 mt-1.5">
          <span>{stats.completedOrders} of 8 completed</span>
          <span className="text-orange-600 font-bold">{Math.max(0, 8 - stats.completedOrders)} trips remaining</span>
        </div>
      </div>

      {/* Completed Deliveries History */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Completed Trips Today</h3>
          <span className="text-[11px] text-zinc-500">{pastDeliveries.length} orders</span>
        </div>

        {pastDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-zinc-100">
            <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-bold">No completed orders yet today.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Orders placed from the main platform will appear here once delivered.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pastDeliveries.map((delivery) => (
              <div 
                key={delivery.id} 
                className="bg-white rounded-2xl p-3.5 border border-zinc-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{delivery.merchant}</span>
                      <span className="text-[10px] text-zinc-400">• {delivery.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                      {delivery.customer} • {delivery.distance}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-zinc-900">+₹{delivery.payout}</span>
                  <span className="text-[10px] block text-emerald-600 font-semibold">Credited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instant Transfer Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-200 animate-scaleUp">
            <h3 className="text-base font-extrabold text-zinc-900 mb-1">Instant Bank Transfer</h3>
            <p className="text-xs text-zinc-500 mb-4">Transfer available earnings directly to your verified bank account via IMPS/UPI.</p>

            <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200/80 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">State Bank of India</div>
                  <div className="text-[11px] text-zinc-500">A/C •••• 4912 • IFSC: SBIN0001248</div>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="bg-orange-50 rounded-2xl p-3 border border-orange-200/60 mb-5 flex items-center justify-between">
              <span className="text-xs text-zinc-600 font-medium">Transferable Balance</span>
              <span className="text-base font-extrabold text-orange-600">₹{stats.walletBalance}</span>
            </div>

            {withdrawSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Transfer Request Initiated Successfully!
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Transfer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
