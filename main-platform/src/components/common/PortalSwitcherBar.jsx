import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  Bike,
  Columns,
  Play,
  Sparkles,
  Award
} from 'lucide-react';

export const PortalSwitcherBar = () => {
  const {
    activeApp,
    setActiveApp,
    cart,
    orders,
    merchants,
    activeMerchantId,
    triggerFullSimulation
  } = usePlatform();

  const totalCartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const currentMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0];
  const pendingOrdersCount = orders.filter(o => o.merchantId === currentMerchant.id && o.orderStatus === 'placed').length;

  const portals = [
    {
      id: 'customer',
      label: 'Customer App',
      icon: ShoppingBag,
      badge: totalCartCount > 0 ? `${totalCartCount}` : null,
      color: 'from-orange-500 to-amber-500',
      activeClass: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 font-extrabold'
    },
    {
      id: 'merchant',
      label: 'Merchant Portal',
      icon: Store,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : null,
      color: 'from-amber-500 to-orange-600',
      activeClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30 font-extrabold'
    },
    {
      id: 'admin',
      label: 'Admin War Room',
      icon: ShieldCheck,
      badge: 'Listing Rank #1',
      color: 'from-purple-600 to-indigo-600',
      activeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-extrabold'
    },
    {
      id: 'rider',
      label: 'Rider Fleet',
      icon: Bike,
      badge: null,
      color: 'from-emerald-500 to-teal-500',
      activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-extrabold'
    },
    {
      id: 'split',
      label: 'Split Demo',
      icon: Columns,
      badge: 'Live',
      color: 'from-slate-700 to-slate-800',
      activeClass: 'bg-slate-800 text-white border border-slate-600 shadow-md font-extrabold'
    }
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 sticky top-0 z-[60] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Platform Label */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-extrabold font-['Outfit'] text-white tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kalsen<span className="text-orange-400">One</span> Ecosystem</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Independent Portal Architecture (Customer, Merchant OS & Admin Governance)
          </span>
        </div>

        {/* Center: Portal Selectors */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = activeApp === portal.id;

            return (
              <button
                key={portal.id}
                onClick={() => setActiveApp(portal.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? portal.activeClass
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{portal.label}</span>
                {portal.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-950/40 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {portal.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Simulation Button */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={triggerFullSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95"
            title="Place automated test order to view live updates across Customer, Merchant & Rider views"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Simulate Order</span>
          </button>
        </div>

      </div>
    </div>
  );
};
