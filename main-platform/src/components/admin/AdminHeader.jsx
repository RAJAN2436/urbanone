import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShieldCheck,
  Cpu,
  Play,
  Bell,
  Activity,
  UserCheck
} from 'lucide-react';

export const AdminHeader = () => {
  const {
    autoDispatchEnabled,
    setAutoDispatchEnabled,
    triggerFullSimulation,
    showToast,
    toast
  } = usePlatform();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-purple-900/40 backdrop-blur-xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Admin Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-['Outfit']">
                KalsenOne<span className="text-purple-400">Co</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                War Room
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Operations, Dispatch Engine & Platform Governance
            </p>
          </div>
        </div>

        {/* Admin Right Actions */}
        <div className="flex items-center gap-3">
          {/* Smart Auto-Dispatch Toggle */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-purple-900/50">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white">Auto-Dispatch</div>
              <div className="text-[9px] text-slate-400">{autoDispatchEnabled ? 'AI Active' : 'Manual'}</div>
            </div>
            <input
              type="checkbox"
              checked={autoDispatchEnabled}
              onChange={(e) => {
                setAutoDispatchEnabled(e.target.checked);
                showToast('Dispatch Mode', e.target.checked ? 'Smart AI Dispatch Enabled' : 'Manual Ops Mode Active', 'info');
              }}
              className="ml-1 w-4 h-4 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Quick Simulation Trigger */}
          <button
            onClick={triggerFullSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Live Order</span>
          </button>

          {/* Admin User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center">
              AD
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-purple-950/90 border-purple-500/50 text-purple-200'
          }`}>
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
