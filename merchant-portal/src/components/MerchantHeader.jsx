import React from 'react';
import { useMerchant } from '../context/MerchantContext';
import { UrbanPartnerLogo } from './common/UrbanPartnerLogo';
import {
  Store,
  Bell,
  Clock,
  ExternalLink,
  Sparkles,
  Award,
  LogOut
} from 'lucide-react';

export const MerchantHeader = () => {
  const {
    currentMerchant,
    toggleMerchantOpenStatus,
    logoutMerchant,
    orders
  } = useMerchant();

  if (!currentMerchant) return null;
  const orderList = Array.isArray(orders) ? orders : [];
  const pendingOrders = orderList.filter(o => o.merchantId === currentMerchant.id && o.orderStatus === 'placed');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-sm px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Official SVG Merchant Logo & Admin Assigned Store Badge */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <UrbanPartnerLogo size="md" showSubtitle={true} />

          {/* Admin Assigned Store Badge (Read-Only) */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-black flex-shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <span>Admin Assigned Store</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-xs font-black text-zinc-950 truncate max-w-[180px] sm:max-w-[260px]">
                {currentMerchant.name}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Live Store Open/Close Toggle */}
          <button
            onClick={() => toggleMerchantOpenStatus(currentMerchant.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              currentMerchant.isOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-sm'
                : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentMerchant.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{currentMerchant.isOpen ? 'Accepting Orders' : 'Store Offline'}</span>
          </button>

          {/* Pending Orders Notification Pill */}
          {pendingOrders.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 border border-orange-300 text-[#ea580c] text-xs font-black animate-pulse shadow-sm">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingOrders.length} New Order{pendingOrders.length > 1 ? 's' : ''}!</span>
            </div>
          )}

          {/* Customer App Link */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-orange-400 text-zinc-700 hover:text-zinc-950 text-xs font-bold shadow-sm transition-all"
            title="Open Customer App (Port 5173)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#f97316]" />
            <span className="hidden sm:inline">Open Customer App</span>
          </a>

          {/* Logout Button */}
          <button
            onClick={logoutMerchant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-bold transition-all cursor-pointer"
            title="Sign Out of Merchant OS"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};
