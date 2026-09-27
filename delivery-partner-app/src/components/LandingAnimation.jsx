import React, { useState, useEffect } from 'react';
import { Bike, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { UrbanOneLogo } from './UrbanOneLogo';

export default function LandingAnimation({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting UrbanOne Fleet...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStatusText('Connecting to Ushait GPS Network...');
      } else if (pct < 65) {
        setStatusText('Syncing live merchant dispatch...');
      } else if (pct < 90) {
        setStatusText('Loading partner routing engine...');
      } else {
        setStatusText('Welcome to UrbanOne Partner');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 450);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 250);
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex flex-col justify-between bg-white text-zinc-900 select-none p-6 transition-all duration-500 ease-out overflow-hidden ${
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Warm Gradient Accent at Top & Bottom */}
      <div className="absolute -top-24 -left-20 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row with Skip */}
      <div className="relative z-10 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/90 border border-zinc-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
            Live Partner App
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-100 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          Skip <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Hero: Clean UrbanOne Logo & Brand Identity */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
        
        {/* Animated UrbanOne Logo Icon */}
        <div className="relative mb-6">
          {/* Subtle Outer Pulse Ring */}
          <div className="absolute -inset-4 rounded-full bg-orange-100/50 animate-ping opacity-75 pointer-events-none" style={{ animationDuration: '2s' }} />

          {/* Logo Card with Soft Shadow */}
          <div className="w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl shadow-orange-500/10 flex items-center justify-center relative p-3">
            <UrbanOneLogo size="xl" variant="icon" />
          </div>

          {/* Clean Floating Badge */}
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
            <Bike className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Official Brand Typography: UrbanOne */}
        <div className="space-y-1">
          <div className="text-3xl font-black tracking-tight flex items-center justify-center font-['Outfit']">
            <span className="text-zinc-900">Urban</span>
            <span className="text-[#f97316]">One</span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#f97316] text-[11px] font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" /> Delivery Partner
          </div>

          <p className="text-xs text-zinc-500 font-medium pt-1 max-w-[240px]">
            Swift hyper-local food & grocery dispatch network
          </p>
        </div>
      </div>

      {/* Bottom Progress & Clean Loading State */}
      <div className="relative z-10 space-y-2.5 pb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            {statusText}
          </span>
          <span className="font-mono font-bold text-orange-600 text-xs">
            {progress}%
          </span>
        </div>

        {/* Clean Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-100 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
          <span>Ushait Dispatch v1.0</span>
          <span>Verified Fleet Partner</span>
        </div>
      </div>
    </div>
  );
}
