import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CustomerAppView } from '../customer/CustomerAppView';
import { RiderAppView } from '../rider/RiderAppView';
import { MerchantPortalView } from '../merchant/MerchantPortalView';
import { AdminDashboardView } from '../admin/AdminDashboardView';
import { Play, Sparkles, ShoppingBag, Bike, Store, ShieldCheck } from 'lucide-react';

export const SplitScreenView = () => {
  const { triggerFullSimulation, orders } = usePlatform();
  const activeOrder = orders[0];

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-4 space-y-4">
      {/* Simulation Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 flex items-center justify-center text-slate-950 shadow-lg">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              KalsenOne Synchronized Ecosystem Mode
            </h2>
            <p className="text-xs text-slate-300">
              Watch real-time live events flow simultaneously across Customer, Merchant Kitchen, Rider, and Admin Command Center!
            </p>
          </div>
        </div>

        <button
          onClick={triggerFullSimulation}
          className="btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-2 shadow-indigo-600/40"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch End-to-End Live Order Simulation</span>
        </button>
      </div>

      {/* 2x2 Synchronized Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        
        {/* Panel 1: Customer App (KalsenOne) */}
        <div className="rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-indigo-950/60 border-b border-indigo-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs">
              <ShoppingBag className="w-4 h-4" />
              <span>1. KalsenOne (Customer App)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              Live Client
            </span>
          </div>
          <div className="p-3 max-h-[620px] overflow-y-auto">
            <CustomerAppView isEmbeddedInPhone={true} />
          </div>
        </div>

        {/* Panel 2: Merchant Portal (KalsenOneMerchant) */}
        <div className="rounded-3xl bg-slate-950 border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-amber-950/60 border-b border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
              <Store className="w-4 h-4" />
              <span>2. KalsenOneMerchant (Kitchen KDS & Portal)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              Live Kitchen
            </span>
          </div>
          <div className="p-3 max-h-[620px] overflow-y-auto">
            <MerchantPortalView />
          </div>
        </div>

        {/* Panel 3: Rider App (KalsenOneRider) */}
        <div className="rounded-3xl bg-slate-950 border border-sky-500/30 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-sky-950/60 border-b border-sky-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-300 font-extrabold text-xs">
              <Bike className="w-4 h-4" />
              <span>3. KalsenOneRider (Dispatch & GPS Navigation)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
              Live Rider
            </span>
          </div>
          <div className="p-3 max-h-[620px] overflow-y-auto">
            <RiderAppView isEmbeddedInPhone={true} />
          </div>
        </div>

        {/* Panel 4: Admin Command Center (KalsenOneCo) */}
        <div className="rounded-3xl bg-slate-950 border border-purple-500/30 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-purple-950/60 border-b border-purple-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>4. KalsenOneCo (Admin Operations War Room)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              War Room
            </span>
          </div>
          <div className="p-3 max-h-[620px] overflow-y-auto">
            <AdminDashboardView />
          </div>
        </div>

      </div>
    </div>
  );
};
