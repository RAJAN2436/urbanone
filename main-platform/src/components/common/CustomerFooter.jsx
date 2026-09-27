import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UrbanLogo } from './UrbanLogo';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Flame,
  Zap,
  Globe,
  Award,
  ChevronRight
} from 'lucide-react';

export const CustomerFooter = () => {
  const { setCustomerSubView, showToast, playSound } = usePlatform();

  const handlePartnerRedirect = (url, name) => {
    playSound('order');
    showToast(`Opening ${name}`, `Redirecting to ${url}`, 'info');
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-white text-zinc-950 border-t border-zinc-200 relative overflow-hidden pt-12 sm:pt-16 pb-28 md:pb-12 shadow-inner">
      
      {/* Soft Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
        
        {/* Top Row: Brand Info, Stats & Portals Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-200">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div
              onClick={() => {
                setCustomerSubView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer inline-block"
              title="UrbanOne - Landing Page"
            >
              <UrbanLogo size="md" showSubtitle={true} />
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed max-w-sm">
              India’s next-generation hyperlocal ecosystem delivering artisan cuisines, gourmet woodfire pizzas, and 15-minute essentials across Ushait with 1-tap UPI checkout.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-[11px]">All Systems Operational (99.99%)</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-auto">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-[#ea580c] font-mono">15 Mins</div>
              <div className="text-[11px] text-zinc-600 font-bold mt-0.5">Average Delivery</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-zinc-950 font-mono">500+</div>
              <div className="text-[11px] text-zinc-600 font-bold mt-0.5">Curated Kitchens</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono">4.9 ★</div>
              <div className="text-[11px] text-zinc-600 font-bold mt-0.5">Customer Rating</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">100%</div>
              <div className="text-[11px] text-zinc-600 font-bold mt-0.5">Secure Escrow UPI</div>
            </div>
          </div>

        </div>

        {/* Middle Row: Links Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          
          {/* 1. Explore Cuisines & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-['Outfit'] text-[#ea580c]">
              For Foodies
            </h4>
            <ul className="space-y-2 text-zinc-600 font-medium">
              <li>
                <button
                  onClick={() => {
                    setCustomerSubView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#f97316] transition-colors cursor-pointer"
                >
                  Woodfire Artisan Pizzas
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerSubView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#f97316] transition-colors cursor-pointer"
                >
                  Hyderabadi Dum Biryani
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerSubView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#f97316] transition-colors cursor-pointer"
                >
                  15-Min Express Mart
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerSubView('profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#f97316] transition-colors cursor-pointer"
                >
                  Urban Gold VIP Rewards
                </button>
              </li>
            </ul>
          </div>

          {/* 2. Partner Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-['Outfit'] text-[#ea580c]">
              Partner Ecosystem
            </h4>
            <ul className="space-y-2 text-zinc-600 font-medium">
              <li>
                <button
                  onClick={() => handlePartnerRedirect('http://localhost:3000', 'Merchant Partner Portal')}
                  className="hover:text-[#f97316] transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-zinc-900"
                >
                  <span>Merchant Portal (Port 3000)</span>
                  <ExternalLink className="w-3 h-3 text-[#f97316]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePartnerRedirect('http://localhost:3001', 'Admin Command Portal')}
                  className="hover:text-[#f97316] transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-zinc-900"
                >
                  <span>Admin Command Console (Port 3001)</span>
                  <ExternalLink className="w-3 h-3 text-[#f97316]" />
                </button>
              </li>
              <li>
                <span className="hover:text-zinc-900 cursor-pointer">Live Kitchen Display System (KDS)</span>
              </li>
              <li>
                <span className="hover:text-zinc-900 cursor-pointer">Rider Fleet Partner Onboarding</span>
              </li>
              <li>
                <span className="hover:text-zinc-900 cursor-pointer">Restaurant POS API Integration</span>
              </li>
            </ul>
          </div>

          {/* 3. Company & Careers */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-['Outfit'] text-[#ea580c]">
              Company
            </h4>
            <ul className="space-y-2 text-zinc-600 font-medium">
              <li className="hover:text-zinc-900 cursor-pointer">About UrbanOne</li>
              <li className="hover:text-zinc-900 cursor-pointer flex items-center gap-1">
                <span>Careers</span>
                <span className="bg-orange-100 text-[#ea580c] text-[9px] px-1.5 py-0.2 rounded font-black">WE'RE HIRING</span>
              </li>
              <li className="hover:text-zinc-900 cursor-pointer">Press & Media Kit</li>
              <li className="hover:text-zinc-900 cursor-pointer">Zero-Carbon EV Fleet Initiative</li>
              <li className="hover:text-zinc-900 cursor-pointer">UrbanOne Foundation</li>
            </ul>
          </div>

          {/* 4. Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-['Outfit'] text-[#ea580c]">
              24x7 Support
            </h4>
            <div className="space-y-2 text-zinc-600 font-medium">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#f97316] flex-shrink-0" />
                <span className="truncate">support@urbanone.app</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#f97316] flex-shrink-0" />
                <span>+91 80 4920 1100</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#f97316] flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Main Market Road, Ushait, UP 243641</span>
              </div>
            </div>
          </div>

        </div>

        {/* Delivering in Popular Ushait Zones */}
        <div className="pt-6 border-t border-zinc-200 space-y-2">
          <div className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">
            Active Hyperlocal Delivery Zones:
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 font-medium">
            {[
              'Ushait',
            ].map((zone, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-[11px] hover:border-orange-400 hover:bg-orange-50 hover:text-[#ea580c] transition-colors cursor-pointer"
              >
                {zone}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Compliance */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} UrbanOne Platform Inc. All rights reserved.</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-current" /> in Ushait
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-600 font-medium">
            <span className="hover:text-zinc-950 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-950 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-950 cursor-pointer">FSSAI License #11224332000192</span>
            <span className="hover:text-zinc-950 cursor-pointer">Security Radar</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
