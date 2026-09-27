import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { KalsenAdminLogo } from './common/KalsenAdminLogo';
import {
  Award,
  Zap,
  Users,
  Store,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  Cpu,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { autoDispatchEnabled, merchants, riders, surgeZones } = useAdmin();

  const navItems = [
    {
      id: 'ranking',
      label: 'Top Listing Placements',
      subtitle: 'Customer App #1 Priority',
      icon: Award,
      badge: 'Main Feature',
      badgeColor: 'bg-orange-100 text-[#ea580c]'
    },
    {
      id: 'surge',
      label: 'Surge Zones & Pricing',
      subtitle: 'Dynamic multiplier rules',
      icon: Zap,
      badge: `${surgeZones.length} Zones`,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'riders',
      label: 'Rider Fleet & KYC',
      subtitle: 'Approvals & roster',
      icon: Users,
      badge: `${riders.length} Fleet`,
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'merchants',
      label: 'Merchant Directory',
      subtitle: 'Register & delete stores',
      icon: Store,
      badge: `${merchants.length} Stores`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'disputes',
      label: 'Fraud & Dispute Radar',
      subtitle: 'Instant wallet refunds',
      icon: AlertTriangle,
      badge: '0 Alerts',
      badgeColor: 'bg-zinc-100 text-zinc-600'
    },
    {
      id: 'finance',
      label: 'Financial Streams',
      subtitle: 'Consolidated GMV ledger',
      icon: DollarSign,
      badge: null
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col justify-between min-h-screen sticky top-0 z-40 shadow-sm flex-shrink-0">
      
      {/* Top: Brand Header with Official SVG Admin Logo */}
      <div>
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <KalsenAdminLogo size="md" showSubtitle={true} />
        </div>

        {/* Navigation Menu */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-[#ea580c] text-white shadow-md shadow-orange-500/20 font-extrabold'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 border border-transparent hover:border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-orange-50 group-hover:text-[#f97316]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="leading-tight">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate font-medium ${
                      isActive ? 'text-orange-100' : 'text-zinc-400'
                    }`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                    isActive ? 'bg-white text-[#ea580c]' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: External Portals & System Status */}
      <div className="p-4 border-t border-zinc-100 space-y-3">
        {/* Quick Launch Links */}
        <div className="space-y-1.5">
          <div className="px-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
            Ecosystem Portals
          </div>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 hover:bg-orange-50 text-zinc-700 hover:text-[#ea580c] border border-zinc-200 text-xs font-bold transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Customer App (:5173)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ea580c]" />
          </a>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 hover:bg-orange-50 text-zinc-700 hover:text-[#ea580c] border border-zinc-200 text-xs font-bold transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Merchant OS (:3000)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ea580c]" />
          </a>
        </div>

        {/* AI Dispatch Status Card */}
        <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200/80 text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-900">
            <span className="flex items-center gap-1.5 text-[#ea580c]">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Dispatch Engine</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-zinc-600 font-medium">
            {autoDispatchEnabled ? 'Automated routing active' : 'Manual Ops mode'}
          </p>
        </div>
      </div>

    </aside>
  );
};
