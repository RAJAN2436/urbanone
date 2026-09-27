import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Cpu,
  Play,
  Bell,
  Search,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export const AdminTopBar = () => {
  const { autoDispatchEnabled, setAutoDispatchEnabled, showToast } = useAdmin();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-zinc-200 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search merchants, riders, orders, surge zones..."
          className="w-full clean-input pl-10 pr-4 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Smart Dispatch Switch */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm">
          <Cpu className="w-4 h-4 text-[#f97316]" />
          <div className="text-left hidden md:block text-xs">
            <div className="font-bold text-zinc-900 leading-tight">Auto-Dispatch</div>
            <div className="text-[9px] text-zinc-500">{autoDispatchEnabled ? 'AI Automated' : 'Manual'}</div>
          </div>
          <input
            type="checkbox"
            checked={autoDispatchEnabled}
            onChange={(e) => {
              setAutoDispatchEnabled(e.target.checked);
              showToast('Dispatch Mode', e.target.checked ? 'Smart AI Dispatch Enabled' : 'Manual Ops Mode Active', 'info');
            }}
            className="ml-1 w-4 h-4 accent-[#f97316] cursor-pointer"
          />
        </div>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#ea580c] font-black text-xs flex items-center justify-center shadow-sm">
            AD
          </div>
          <div className="text-left hidden lg:block text-xs">
            <div className="font-extrabold text-zinc-900">Admin Console</div>
            <div className="text-[10px] text-zinc-500 font-medium">Head of Operations</div>
          </div>
        </div>
      </div>

    </header>
  );
};
