import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { CustomerHeader } from './components/customer/CustomerHeader';
import { CustomerAppView } from './components/customer/CustomerAppView';
import { CustomerFooter } from './components/common/CustomerFooter';
import { Bell } from 'lucide-react';

const CustomerMainApp = () => {
  const { toast } = usePlatform();

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Pure Customer Header */}
      <CustomerHeader />
      
      {/* Pure Customer App View (Explore, Menus, Cart, Live Tracking, Profile) */}
      <main className="flex-1">
        <CustomerAppView />
      </main>

      {/* Official Customer Footer */}
      <CustomerFooter />

      {/* Real-time Toast Notifications */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce px-2">
          <div className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border flex items-start gap-3 bg-white ${
            toast.type === 'error'
              ? 'border-red-300 text-red-900 shadow-red-500/10'
              : toast.type === 'success'
              ? 'border-emerald-300 text-emerald-950 shadow-emerald-500/10'
              : 'border-zinc-200 text-zinc-900 shadow-zinc-500/10'
          }`}>
            <Bell className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f97316]" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-950">{toast.title}</h4>
              <p className="text-[11px] sm:text-xs text-zinc-600 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <CustomerMainApp />
    </PlatformProvider>
  );
}
