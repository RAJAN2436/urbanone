import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Store,
  Bell,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';

export const MerchantHeader = () => {
  const {
    merchants,
    activeMerchantId,
    setActiveMerchantId,
    toggleMerchantOpenStatus,
    orders,
    setActiveApp,
    setCustomerSubView,
    setSelectedMerchantId
  } = usePlatform();

  const currentMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0];
  const pendingOrders = orders.filter(o => o.merchantId === currentMerchant.id && o.orderStatus === 'placed');

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-amber-900/30 backdrop-blur-xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Merchant Brand & Store Selector */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white font-['Outfit'] tracking-tight">
                  Urban<span className="text-amber-400">Partner</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Merchant OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Listing Management, Kitchen Display & Real-time Orders
              </p>
            </div>
          </div>

          {/* Store Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentMerchant.id}
              onChange={(e) => setActiveMerchantId(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-700 hover:border-amber-500/60 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer shadow-sm transition-all"
            >
              {merchants.map(m => (
                <option key={m.id} value={m.id}>
                  🏪 {m.name} ({m.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Live Store Toggle */}
          <button
            onClick={() => toggleMerchantOpenStatus(currentMerchant.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              currentMerchant.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-sm shadow-emerald-500/10'
                : 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentMerchant.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span>{currentMerchant.isOpen ? 'Accepting Orders' : 'Store Offline'}</span>
          </button>

          {/* Pending Orders Pill */}
          {pendingOrders.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingOrders.length} New Order{pendingOrders.length > 1 ? 's' : ''}!</span>
            </div>
          )}

          {/* View in Customer App Link */}
          <button
            onClick={() => {
              setSelectedMerchantId(currentMerchant.id);
              setActiveApp('customer');
              setCustomerSubView('merchant');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-bold transition-all"
            title="Preview how this merchant store and dishes look on Customer App"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Preview on Customer App</span>
          </button>
        </div>

      </div>
    </header>
  );
};
