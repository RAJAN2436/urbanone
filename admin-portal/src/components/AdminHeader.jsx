import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { UrbanAdminLogo } from './common/UrbanAdminLogo';
import {
  ShieldCheck,
  Cpu,
  Play,
  Bell,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const AdminHeader = () => {
  const { autoDispatchEnabled, setAutoDispatchEnabled, showToast } = useAdmin();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-sm px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand with Official SVG Emblem */}
        <UrbanAdminLogo size="md" showSubtitle={true} />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Smart Auto-Dispatch Toggle */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-sm">
            <Cpu className="w-4 h-4 text-[#f97316]" />
            <div className="text-left hidden sm:block text-xs">
              <div className="font-bold text-zinc-900">Auto-Dispatch</div>
              <div className="text-[9px] text-zinc-500">{autoDispatchEnabled ? 'AI Active' : 'Manual'}</div>
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

          {/* Quick links to Customer and Merchant portals */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-orange-400 text-zinc-700 hover:text-zinc-950 text-xs font-bold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#f97316]" />
            <span className="hidden sm:inline">Customer App</span>
          </a>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-orange-400 text-zinc-700 hover:text-zinc-950 text-xs font-bold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Merchant OS</span>
          </a>
        </div>

      </div>
    </header>
  );
};
