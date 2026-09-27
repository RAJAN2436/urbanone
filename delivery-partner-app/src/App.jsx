import React, { useState, useEffect } from 'react';
import { useRider } from './context/RiderContext';
import ActiveDeliveryCard from './components/ActiveDeliveryCard';
import IncomingOrderModal from './components/IncomingOrderModal';
import RiderEarningsView from './components/RiderEarningsView';
import RiderProfileView from './components/RiderProfileView';
import RiderAuthView from './components/RiderAuthView';
import LandingAnimation from './components/LandingAnimation';
import {
  Navigation2,
  Wallet,
  User,
  ClipboardList,
  Power,
  Wifi,
  BatteryMedium,
  Radio,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';

export default function App() {
  const {
    rider,
    authRider,
    isLoggedIn,
    isApproved,
    isOnline,
    toggleDuty,
    activeOrder,
    availableOrders = [],
    incomingOrder,
    stats,
    acceptIncomingOrder,
    isConnected
  } = useRider();

  const [activeTab, setActiveTab] = useState('map'); // 'map', 'orders', 'earnings', 'profile'
  const [currentTime, setCurrentTime] = useState('');
  const [showLanding, setShowLanding] = useState(true);

  // Clock for Android Status Bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // If rider is not logged in or pending approval, display Login/Register/Pending view
  if (!isLoggedIn || !isApproved) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start text-zinc-900 selection:bg-orange-500 selection:text-white">
        <div className="w-full max-w-md min-h-screen bg-zinc-100 flex flex-col relative shadow-2xl overflow-x-hidden">
          {/* Landing Animation strictly within Mobile Display */}
          {showLanding && (
            <LandingAnimation onComplete={() => setShowLanding(false)} />
          )}

          {/* Android Native Status Bar */}
          <div className="bg-zinc-900 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wide z-40 select-none">
            <span>{currentTime || '12:30'}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 font-mono">5G</span>
              <Wifi className="w-3 h-3 text-zinc-300" />
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <BatteryMedium className="w-3.5 h-3.5 text-zinc-300 ml-0.5" />
              <span className="text-[10px] text-zinc-300">88%</span>
            </div>
          </div>

          <RiderAuthView />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start text-zinc-900 selection:bg-orange-500 selection:text-white">
      {/* Mobile Device Container */}
      <div className="w-full max-w-md min-h-screen bg-zinc-100 flex flex-col relative shadow-2xl overflow-x-hidden">
        {/* Landing Animation strictly within Mobile Display */}
        {showLanding && (
          <LandingAnimation onComplete={() => setShowLanding(false)} />
        )}

        {/* Android Native Status Bar */}
        <div className="bg-zinc-900 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wide z-40 select-none">
          <span>{currentTime || '12:30'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 font-mono">5G</span>
            <Wifi className="w-3 h-3 text-zinc-300" />
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <BatteryMedium className="w-3.5 h-3.5 text-zinc-300 ml-0.5" />
            <span className="text-[10px] text-zinc-300">88%</span>
          </div>
        </div>

        {/* Top App Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden border border-orange-500/40 bg-zinc-900 flex-shrink-0 shadow-md">
              <img src={rider.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} alt={rider.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-tight text-zinc-900 uppercase truncate max-w-[140px]">{rider.name}</h1>
                <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-mono">
                  #{rider.id.slice(-4)}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-orange-500" /> Ushait, UP
              </p>
            </div>
          </div>

          {/* Duty Switch (Online / Offline) */}
          <button
            onClick={toggleDuty}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-xs transition-all cursor-pointer ${isOnline
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'ONLINE' : 'GO ONLINE'}</span>
          </button>
        </header>

        {/* Duty Status Bar (When Online) */}
        {isOnline && !activeOrder && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs z-20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-semibold text-[11px] tracking-wide">
                {availableOrders.length > 0
                  ? `${availableOrders.length} Order${availableOrders.length > 1 ? 's' : ''} Ready in Ushait`
                  : 'Connected to Ushait Platform • Searching'}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
              Live Dispatch
            </span>
          </div>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-zinc-800 text-zinc-300 px-4 py-2 text-xs flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-[11px] font-medium">You are Offline. Go Online to receive orders.</span>
            </div>
            <button
              onClick={toggleDuty}
              className="text-[10px] font-bold text-orange-400 underline underline-offset-2"
            >
              Start Shift
            </button>
          </div>
        )}

        {/* Main Tab Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0">
          {/* TAB 1: MAP & ACTIVE TASK */}
          {activeTab === 'map' && (
            <div className="flex-1 flex flex-col pb-20">
              {/* If active order exists, show Delivery Task with Google Maps button */}
              {activeOrder ? (
                <div className="flex-1 flex flex-col p-4 space-y-3">
                  <ActiveDeliveryCard order={activeOrder} />
                </div>
              ) : isOnline ? (
                /* Online & Ready: No Order Assigned Banner + Real-Time Location Telemetry (NO MAP) */
                <div className="flex-1 flex flex-col p-4 space-y-4">
                  {/* Hero Card: You Have Not Been Assigned an Order */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="uppercase tracking-wider">On Duty • Ready</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        GPS Status: <strong className="text-emerald-400 font-bold">Broadcasting</strong>
                      </span>
                    </div>

                    <div className="mt-5 space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                        You Have Not Been Assigned an Order
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        You are actively queued in the dispatch system. The moment a nearby kitchen or customer order is matched, it will pop up right here.
                      </p>
                    </div>

                    {/* Live Real-Time Telemetry Container */}
                    <div className="mt-5 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>Your Real-Time Coordinates</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-800/50">
                          Live GPS
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block mb-0.5">Latitude</span>
                          <span className="font-mono font-black text-white text-sm">
                            27.804800° N
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block mb-0.5">Longitude</span>
                          <span className="font-mono font-black text-white text-sm">
                            79.288200° E
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60 font-medium">
                        <span>Zone: <strong className="text-zinc-200 font-bold">Ushait Central Hub (243641)</strong></span>
                        <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live Stream
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Online Waiting Dashboard */}
                  <div className="space-y-3">
                    {/* Available Platform Orders List */}
                    {availableOrders.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                            Platform Orders Ready ({availableOrders.length})
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Live Feed
                          </span>
                        </div>

                        {availableOrders.map((ord) => (
                          <div key={ord.id} className="bg-white rounded-2xl p-3.5 border border-orange-200/80 shadow-xs space-y-2.5 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-extrabold text-orange-600">#{ord.id}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                {ord.orderStatus.replace('_', ' ')}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-zinc-900">{ord.merchantName || 'Kalsen Merchant'}</h4>
                              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{ord.deliveryAddress || 'Ushait Center'}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                              <div>
                                <span className="text-[9px] text-zinc-400 block font-semibold uppercase">Total</span>
                                <span className="text-xs font-extrabold text-zinc-900">₹{ord.grandTotal || ord.itemTotal || 0}</span>
                              </div>
                              <button
                                onClick={() => acceptIncomingOrder(ord.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                              >
                                Accept (+₹{ord.deliveryFee || 45})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                            <Radio className="w-5 h-5 text-orange-500 animate-pulse" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900">Ushait Dispatch Ready</div>
                            <p className="text-[11px] text-zinc-500">Listening for orders from main platform</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          ₹45/trip Base
                        </span>
                      </div>
                    )}

                    {/* Today Shift Stats Quick Pill */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl p-3 border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Today's Earnings</span>
                        <span className="text-base font-extrabold text-zinc-900">₹{stats.todayEarnings}</span>
                      </div>
                      <div className="bg-white rounded-2xl p-3 border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Completed Trips</span>
                        <span className="text-base font-extrabold text-emerald-600">{stats.completedOrders}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Offline Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
                    <Power className="w-9 h-9" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 mb-1">You are currently Offline</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mb-6">
                    Turn on your duty switch to connect to Ushait live food and grocery dispatch network.
                  </p>
                  <button
                    onClick={toggleDuty}
                    className="w-full max-w-xs py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4" /> Go Online Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASKS & DELIVERIES */}
          {activeTab === 'orders' && (
            <div className="flex-1 p-4 pb-24 space-y-3">
              <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Active & Queued Tasks</h2>

              {activeOrder ? (
                <div className="space-y-3">
                  <ActiveDeliveryCard order={activeOrder} />
                </div>
              ) : availableOrders.length > 0 ? (
                <div className="space-y-3">
                  {availableOrders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-2xl p-4 border border-orange-200 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-orange-600">#{ord.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">{ord.merchantName || 'Kalsen Merchant'}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{ord.deliveryAddress || 'Ushait Center'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Total Amount</span>
                          <span className="text-xs font-extrabold text-zinc-900">₹{ord.grandTotal || ord.itemTotal || 0}</span>
                        </div>
                        <button
                          onClick={() => acceptIncomingOrder(ord.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          Accept (+₹{ord.deliveryFee || 45})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center border border-zinc-200/80 shadow-xs">
                  <ClipboardList className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-zinc-800">No Active Delivery in Progress</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Orders placed on the main platform will automatically appear here for you to accept and deliver.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EARNINGS & WALLET */}
          {activeTab === 'earnings' && <RiderEarningsView />}

          {/* TAB 4: RIDER PROFILE & VEHICLE */}
          {activeTab === 'profile' && <RiderProfileView onPlayLanding={() => setShowLanding(true)} />}
        </main>

        {/* Incoming Order Alert Modal Popup */}
        {incomingOrder && <IncomingOrderModal />}

        {/* Android Bottom Navigation Bar */}
        <nav className="sticky bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-2 z-40 flex items-center justify-around shadow-lg shrink-0 mt-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'map' ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
          >
            <div className="relative">
              <Navigation2 className="w-5 h-5" />
              {activeOrder && (
                <span className="w-2 h-2 rounded-full bg-orange-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Live Map</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'orders' ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
          >
            <div className="relative">
              <ClipboardList className="w-5 h-5" />
              {activeOrder && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'earnings' ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Earnings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'profile' ? 'text-orange-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
