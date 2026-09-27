import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopBar } from './components/AdminTopBar';
import { RankingConsole } from './components/RankingConsole';
import { SurgePricing } from './components/SurgePricing';
import { RiderFleetKYC } from './components/RiderFleetKYC';
import { MerchantGovernance } from './components/MerchantGovernance';
import { DisputeRadar } from './components/DisputeRadar';
import { PlatformLedger } from './components/PlatformLedger';
import {
  Flame,
  Bell,
  Award,
  Zap,
  Users,
  Store
} from 'lucide-react';

const AdminAppContent = () => {
  const { merchants, riders, toast } = useAdmin();
  const [adminTab, setActiveAdminTab] = useState('ranking'); // 'ranking' | 'surge' | 'riders' | 'merchants' | 'disputes' | 'finance'

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Sleek Admin Sidebar matching Customer UI */}
      <AdminSidebar activeTab={adminTab} setActiveTab={setActiveAdminTab} />

      {/* Main Right Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Top Sticky Bar */}
        <AdminTopBar />

        {/* Dynamic Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28">
          
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="clean-card p-5 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Today's GMV</div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">₹4,82,450</div>
              <div className="text-[11px] text-emerald-700 font-bold">↑ 14.8% vs last week</div>
            </div>

            <div className="clean-card p-5 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Active Merchants</div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">{(merchants || []).length} Active</div>
              <div className="text-[11px] text-[#ea580c] font-bold">Rank #1: {(merchants || []).find(m => m.adminRank === 1)?.name || 'Pizzeria'}</div>
            </div>

            <div className="clean-card p-5 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Riders on Road (Online)</div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">
                {(riders || []).filter(r => r.isOnline).length} <span className="text-sm font-semibold text-zinc-400">/ {(riders || []).length}</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                {(riders || []).filter(r => r.isOnline).length > 0 
                  ? `${(riders || []).filter(r => r.isOnline).length} Active on Shift` 
                  : 'All Riders Offline'}
              </div>
            </div>

            <div className="clean-card p-5 space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Net Platform Margin</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">14.2%</div>
              <div className="text-[11px] text-zinc-500 font-medium">Platform blended</div>
            </div>
          </div>

          {/* Tab Views */}
          {adminTab === 'ranking' && <RankingConsole />}
          {adminTab === 'surge' && <SurgePricing />}
          {adminTab === 'riders' && <RiderFleetKYC />}
          {adminTab === 'merchants' && <MerchantGovernance />}
          {adminTab === 'disputes' && <DisputeRadar />}
          {adminTab === 'finance' && <PlatformLedger />}

        </main>

      </div>

      {/* Real-time Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 bg-white text-zinc-900 border-zinc-200 ${
            toast.type === 'error' ? 'border-red-400' : 'border-orange-400'
          }`}>
            <div className="w-7 h-7 rounded-xl bg-[#f97316] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-950">{toast.title}</h4>
              <p className="text-xs text-zinc-600 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AdminAppContent />
    </AdminProvider>
  );
}
