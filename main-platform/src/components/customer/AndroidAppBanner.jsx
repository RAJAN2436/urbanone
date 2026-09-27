import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import confetti from 'canvas-confetti';
import {
  Download,
  QrCode,
  Star,
  Zap,
  ShieldCheck,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  ChevronRight,
  Clock,
  Search,
  Camera,
  Smartphone
} from 'lucide-react';

export const AndroidAppBanner = () => {
  const { showToast, playSound } = usePlatform();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleDownloadApk = () => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    playSound('success');
    showToast('Download Started 🤖', 'KalsenOne Android App (v2.4.0) APK is downloading...', 'success');
  };

  const handleGooglePlayClick = () => {
    playSound('success');
    showToast('Google Play Store 🚀', 'Redirecting to KalsenOne on Google Play Store...', 'info');
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    playSound('order');
    showToast('Camera Scanner Activated 📸', 'Scanning QR code for Android App installer...', 'info');

    setTimeout(() => {
      setIsScanning(false);
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
      playSound('success');
      showToast('Scan Verified! 🎉', 'Opening KalsenOne App Store page & download...', 'success');
    }, 1400);
  };

  const handleSendLink = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      showToast('Invalid Number', 'Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setIsSent(true);
    showToast('Link Sent! 📲', `Google Play download link sent to +91 ${phoneNumber}`, 'success');
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white text-zinc-950 p-6 sm:p-10 border border-zinc-200 shadow-2xl shadow-orange-500/5">
      {/* Soft Ambient Radial Glows */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* Left Column: Heading, Value Props, Download CTAs, & Scanner Card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-300 text-[#ea580c] text-xs font-black uppercase tracking-wider shadow-sm">
            {/* Google Play Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 512 512">
              <path fill="#4285F4" d="M32.53 18.08C24.41 26.83 20 40.54 20 58.1v395.8c0 17.56 4.41 31.27 12.53 40.02L238.1 288.3 32.53 18.08z"/>
              <path fill="#FBBC04" d="M323.2 203.2L238.1 288.3l85.1 85.1 98.7-56.9c14.2-8.2 22.1-20.8 22.1-34.8 0-14-7.9-26.6-22.1-34.8l-98.7-43.7z"/>
              <path fill="#EA4335" d="M238.1 288.3L32.53 493.92c10.4 11.2 26.6 13.9 44.1 3.9l246.57-124.62L238.1 288.3z"/>
              <path fill="#34A853" d="M323.2 203.2L76.63 14.18C59.13 4.18 42.93 6.88 32.53 18.08L238.1 288.3l85.1-85.1z"/>
            </svg>
            <span>Google Play Official Release (Android)</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-['Outfit'] leading-tight text-zinc-950">
              Get the <span className="text-[#f97316]">KalsenOne Android App</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed max-w-xl">
              Order gourmet meals, 15-minute essentials, and medicines with 1-tap UPI payment, lock-screen live GPS tracking, and flat 50% discount on your first 3 orders.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-zinc-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3 fill-current" />
              </div>
              <span>15-Minute Instant Express</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <Flame className="w-3 h-3 fill-current" />
              </div>
              <span>Flat 50% Off (Code: KALSEN50)</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span>Live Lock-Screen GPS Radar</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3" />
              </div>
              <span>1-Tap UPI (GPay / PhonePe)</span>
            </div>
          </div>

          {/* Integrated Interactive QR Scanner Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 via-zinc-50 to-orange-50/50 border border-orange-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4">
            
            {/* Animated Laser QR Matrix */}
            <div className="relative w-28 h-28 bg-white p-2 rounded-xl border border-zinc-200 shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden group cursor-pointer" onClick={handleScanSimulation}>
              {/* High Fidelity SVG Matrix */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="4" y="4" width="28" height="28" rx="4" fill="#09090b" />
                <rect x="8" y="8" width="20" height="20" rx="2" fill="#ffffff" />
                <rect x="12" y="12" width="12" height="12" rx="2" fill="#f97316" />

                <rect x="68" y="4" width="28" height="28" rx="4" fill="#09090b" />
                <rect x="72" y="8" width="20" height="20" rx="2" fill="#ffffff" />
                <rect x="76" y="12" width="12" height="12" rx="2" fill="#f97316" />

                <rect x="4" y="68" width="28" height="28" rx="4" fill="#09090b" />
                <rect x="8" y="72" width="20" height="20" rx="2" fill="#ffffff" />
                <rect x="12" y="76" width="12" height="12" rx="2" fill="#f97316" />

                <rect x="36" y="8" width="6" height="6" fill="#09090b" />
                <rect x="48" y="8" width="6" height="6" fill="#f97316" />
                <rect x="56" y="14" width="6" height="6" fill="#09090b" />
                <rect x="36" y="20" width="6" height="6" fill="#09090b" />
                <rect x="44" y="26" width="6" height="6" fill="#09090b" />
                
                <rect x="8" y="38" width="6" height="6" fill="#09090b" />
                <rect x="16" y="44" width="6" height="6" fill="#f97316" />
                <rect x="26" y="38" width="6" height="6" fill="#09090b" />
                <rect x="34" y="44" width="8" height="8" rx="2" fill="#f97316" />
                <rect x="46" y="38" width="6" height="6" fill="#09090b" />
                <rect x="58" y="44" width="6" height="6" fill="#09090b" />
                <rect x="68" y="38" width="6" height="6" fill="#f97316" />
                <rect x="80" y="44" width="6" height="6" fill="#09090b" />

                <rect x="36" y="56" width="6" height="6" fill="#09090b" />
                <rect x="48" y="62" width="6" height="6" fill="#f97316" />
                <rect x="58" y="56" width="6" height="6" fill="#09090b" />
                <rect x="38" y="74" width="6" height="6" fill="#f97316" />
                <rect x="48" y="82" width="6" height="6" fill="#09090b" />
                <rect x="62" y="74" width="6" height="6" fill="#09090b" />
                <rect x="74" y="82" width="6" height="6" fill="#f97316" />
                <rect x="86" y="74" width="6" height="6" fill="#09090b" />
              </svg>

              {/* Dynamic Laser Scanline Effect */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#f97316] to-transparent shadow-[0_0_8px_#f97316] animate-pulse top-1/2" />
            </div>

            {/* Scanner Info & Actions */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-zinc-950">
                <QrCode className="w-4 h-4 text-[#f97316]" />
                <span>Camera QR Scanner Ready</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium">
                Point your phone camera at this QR code to download directly from Google Play.
              </p>
              <button
                onClick={handleScanSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-100 hover:bg-orange-200/80 text-[#ea580c] text-[10px] font-black cursor-pointer transition-colors shadow-sm"
              >
                <Camera className="w-3 h-3" />
                <span>{isScanning ? 'Scanning QR...' : 'Test Instant Scan'}</span>
              </button>
            </div>

          </div>

          {/* Download CTAs Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            
            {/* Google Play Button */}
            <button
              onClick={handleGooglePlayClick}
              className="flex items-center justify-center sm:justify-start gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 hover:border-orange-500 transition-all cursor-pointer shadow-sm hover:shadow-md group"
            >
              <svg className="w-7 h-7" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M32.53 18.08C24.41 26.83 20 40.54 20 58.1v395.8c0 17.56 4.41 31.27 12.53 40.02L238.1 288.3 32.53 18.08z"/>
                <path fill="#FBBC04" d="M323.2 203.2L238.1 288.3l85.1 85.1 98.7-56.9c14.2-8.2 22.1-20.8 22.1-34.8 0-14-7.9-26.6-22.1-34.8l-98.7-43.7z"/>
                <path fill="#EA4335" d="M238.1 288.3L32.53 493.92c10.4 11.2 26.6 13.9 44.1 3.9l246.57-124.62L238.1 288.3z"/>
                <path fill="#34A853" d="M323.2 203.2L76.63 14.18C59.13 4.18 42.93 6.88 32.53 18.08L238.1 288.3l85.1-85.1z"/>
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">GET IT ON</div>
                <div className="text-sm font-black text-zinc-950">Google Play</div>
              </div>
              <span className="text-xs text-orange-500 font-bold ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            {/* Direct APK Download Button */}
            <button
              onClick={handleDownloadApk}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Direct APK Download (v2.4)</span>
            </button>

          </div>

          {/* SMS Link Input Form */}
          <form onSubmit={handleSendLink} className="flex flex-col sm:flex-row gap-2 max-w-md pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter mobile number for link"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-3 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-sm"
            >
              {isSent ? '✓ Sent' : 'Text Link'}
            </button>
          </form>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs text-zinc-500">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-zinc-900 font-extrabold">4.9</span>
            </div>
            <span>•</span>
            <span className="font-medium">50,000+ Downloads on Google Play</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">Android 8.0+</span>
          </div>

        </div>

        {/* Right: FULL SIZE ANDROID MOBILE DEVICE FRAME MOCKUP */}
        <div className="lg:col-span-5 flex justify-center items-center relative w-full pt-4 lg:pt-0">
          
          {/* Main Full-Size Phone Shell (Galaxy S25 / Pixel Titanium Frame) */}
          <div className="relative w-full max-w-[280px] sm:max-w-[310px] h-[520px] sm:h-[560px] rounded-[44px] p-2.5 sm:p-3 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-2xl border-4 border-zinc-700/80 flex flex-col justify-between overflow-hidden">
            
            {/* Screen Inner Display */}
            <div className="w-full h-full bg-[#fafafa] rounded-[34px] overflow-hidden flex flex-col justify-between relative border border-zinc-300/60 shadow-inner select-none">
              
              {/* Android Status Bar with Camera Punch-Hole */}
              <div className="w-full bg-white pt-2.5 px-4 pb-1 flex items-center justify-between z-20 border-b border-zinc-100">
                <span className="text-[11px] font-bold text-zinc-900 font-mono">09:41</span>
                
                {/* Center Punch Hole Camera */}
                <div className="w-3 h-3 bg-black rounded-full border border-zinc-700 flex items-center justify-center">
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-800">
                  <span className="text-[8px] font-black text-orange-600 bg-orange-100 px-1 rounded">5G</span>
                  <span>📶</span>
                  <span>98%</span>
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 p-3 space-y-2.5 overflow-hidden flex flex-col justify-between">
                
                {/* Mobile Header Location */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black text-[#ea580c] uppercase tracking-wide flex items-center gap-0.5">
                      <span>15-MIN EXPRESS</span>
                      <Zap className="w-2.5 h-2.5 fill-current text-[#f97316]" />
                    </div>
                    <div className="text-xs font-black text-zinc-950 flex items-center gap-0.5">
                      <span className="truncate max-w-[150px]">Indiranagar 100ft Rd</span>
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-black text-xs shadow-sm">
                    K
                  </div>
                </div>

                {/* Mobile Mini Search Bar */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-400 text-[10px] shadow-sm">
                  <Search className="w-3 h-3 text-zinc-400" />
                  <span>Search pizza, biryani, grocery...</span>
                </div>

                {/* Mini Stories Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { label: '50% Off', emoji: '🔥', bg: 'from-orange-500 to-amber-500' },
                    { label: '15m Mart', emoji: '🥑', bg: 'from-emerald-500 to-teal-500' },
                    { label: 'Pizzas', emoji: '🍕', bg: 'from-rose-500 to-orange-500' },
                    { label: 'Biryani', emoji: '🍗', bg: 'from-amber-600 to-yellow-500' }
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${s.bg} p-0.5 shadow-sm`}>
                        <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-sm">
                          {s.emoji}
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-zinc-700">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* In-App Promo Banner */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ea580c] text-white shadow-md space-y-0.5">
                  <div className="text-[8px] font-black uppercase bg-black/20 px-1 py-0.2 rounded w-max">
                    APP EXCLUSIVE
                  </div>
                  <div className="text-xs font-black">FLAT 50% OFF (Code: KALSEN50)</div>
                  <div className="text-[8px] text-orange-100">Instant delivery to your doorstep</div>
                </div>

                {/* Dish Card Preview */}
                <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-base">
                      🍕
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-zinc-950 truncate max-w-[120px]">
                        Truffle Burrata Pizza
                      </div>
                      <div className="text-[9px] text-[#ea580c] font-black">
                        ₹549 • 15 mins
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadApk}
                    className="px-2.5 py-1 rounded-lg bg-[#f97316] text-white text-[9px] font-black shadow-sm cursor-pointer hover:bg-[#ea580c]"
                  >
                    ADD +
                  </button>
                </div>

                {/* Floating Rider Live GPS Radar Status */}
                <div className="p-2 rounded-xl bg-white text-zinc-900 border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <div className="text-[9px] font-bold text-zinc-900">Rider on the way 🛵</div>
                      <div className="text-[8px] text-zinc-500">ETA 6 mins • Indiranagar</div>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                    OTP: 4821
                  </span>
                </div>

              </div>

              {/* Bottom Android 3-Button Navigation Bar */}
              <div className="w-full bg-white py-1.5 px-6 flex items-center justify-around border-t border-zinc-200 text-zinc-600 text-xs font-black">
                <span>◀</span>
                <span>●</span>
                <span>■</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
