import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShoppingBag,
  ShieldCheck,
  Play,
  Bell,
  Wallet,
  Award
} from 'lucide-react';

export const GlobalHeader = () => {
  const {
    activeApp,
    setActiveApp,
    customer,
    cart,
    setCustomerSubView,
    triggerFullSimulation,
    toast
  } = usePlatform();

  const totalCartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-zinc-200 backdrop-blur-xl px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveApp('customer'); setCustomerSubView('home'); }}>
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 p-1 shadow-md flex items-center justify-center border border-zinc-800">
              <img src="/urbanone-logo.svg" alt="UrbanOne" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-zinc-950 font-['Outfit']">
                  Urban<span className="text-[#f97316]">One</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-widest">
                  {activeApp === 'admin' ? 'Admin Portal' : 'Customer App'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                {activeApp === 'admin' ? 'UrbanOne Operations & Governance' : 'Hyperlocal Food & Express Delivery'}
              </p>
            </div>
          </div>

          {/* Quick Simulation on Mobile */}
          <button
            onClick={triggerFullSimulation}
            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate</span>
          </button>
        </div>

        {/* Clean 2-Portal Switcher: UrbanOne Customer vs UrbanOne Admin */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-inner">
          <button
            onClick={() => { setActiveApp('customer'); setCustomerSubView('home'); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeApp === 'customer'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#f97316]" />
            <span>UrbanOne Customer</span>
            {totalCartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f97316] text-white font-extrabold">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveApp('admin')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeApp === 'admin'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>UrbanOne Admin</span>
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={triggerFullSimulation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Place automated test order to view live tracking"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Quick Demo Order</span>
          </button>

          {/* Customer Quick Wallet / Points */}
          {activeApp === 'customer' && (
            <div
              onClick={() => { setCustomerSubView('profile'); }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs cursor-pointer hover:border-orange-400 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Wallet className="w-3.5 h-3.5" />
                <span>₹{customer?.walletBalance || 0}</span>
              </div>
              <div className="w-px h-3.5 bg-zinc-200" />
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>{customer?.loyaltyPoints || 0} pts</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 bg-white ${
            toast.type === 'error'
              ? 'border-red-300 text-red-900 shadow-red-500/10'
              : toast.type === 'success'
              ? 'border-emerald-300 text-emerald-950 shadow-emerald-500/10'
              : 'border-zinc-200 text-zinc-900 shadow-zinc-500/10'
          }`}>
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f97316]" />
            <div>
              <h4 className="text-sm font-bold text-zinc-950">{toast.title}</h4>
              <p className="text-xs text-zinc-600 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
