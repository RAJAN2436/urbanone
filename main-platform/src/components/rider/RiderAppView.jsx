import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  Bike,
  Navigation,
  Power,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Award,
  Zap,
  DollarSign,
  ChevronRight,
  Sparkles,
  Layers,
  Battery,
  Wifi,
  WifiOff,
  UserCheck,
  FileText
} from 'lucide-react';

export const RiderAppView = ({ isEmbeddedInPhone = false }) => {
  const {
    riders,
    setRiders,
    orders,
    merchants,
    riderArrivedAtMerchant,
    riderPickupOrder,
    riderDeliverOrder,
    showToast,
    playSound
  } = usePlatform();

  // Active Rider is Arjun Verma (r1)
  const currentRider = riders.find(r => r.id === 'r1') || riders[0];

  const [isOnline, setIsOnline] = useState(currentRider.isOnline);
  const [offlineSyncMode, setOfflineSyncMode] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'navigation' | 'earnings' | 'leaderboard' | 'docs'
  const [inputOtp, setInputOtp] = useState('');
  const [checklistVerified, setChecklistVerified] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);

  // Find active orders assigned to this rider
  const assignedOrders = orders.filter(o => o.riderId === currentRider.id && o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const activeOrder = assignedOrders[0];
  const merchant = activeOrder ? merchants.find(m => m.id === activeOrder.merchantId) : null;

  // Incoming unassigned orders awaiting acceptance
  const unassignedOrders = orders.filter(o => !o.riderId && (o.orderStatus === 'accepted' || o.orderStatus === 'preparing' || o.orderStatus === 'placed'));
  const incomingOrderOffer = unassignedOrders[0];

  const [offerCountdown, setOfferCountdown] = useState(30);

  useEffect(() => {
    if (incomingOrderOffer && isOnline) {
      const timer = setInterval(() => {
        setOfferCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [incomingOrderOffer, isOnline]);

  const toggleDutyStatus = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    setRiders(prev => prev.map(r => r.id === currentRider.id ? { ...r, isOnline: nextState } : r));
    showToast(nextState ? 'You are now Online! 🛵' : 'You are now Offline', nextState ? 'Looking for high-surge orders near Indiranagar' : 'Shift paused', 'info');
    playSound('order');
  };

  const handleAcceptIncomingOffer = () => {
    if (!incomingOrderOffer) return;
    setRiders(prev => prev.map(r => r.id === currentRider.id ? {
      ...r,
      status: 'navigating_to_merchant',
      currentOrderIds: [...r.currentOrderIds, incomingOrderOffer.id]
    } : r));

    // Update order
    orders.find(o => o.id === incomingOrderOffer.id).riderId = currentRider.id;
    orders.find(o => o.id === incomingOrderOffer.id).riderName = currentRider.name;
    orders.find(o => o.id === incomingOrderOffer.id).riderPhone = currentRider.phone;
    orders.find(o => o.id === incomingOrderOffer.id).orderStatus = 'rider_assigned';

    showToast('Order Accepted! 🚀', `Head towards ${incomingOrderOffer.merchantName}`, 'success');
    playSound('order');
    setActiveTab('navigation');
  };

  const handleDeliverWithOtp = () => {
    if (!inputOtp.trim()) {
      showToast('OTP Required', 'Please ask the customer for the 4-digit verification code', 'error');
      return;
    }
    const res = riderDeliverOrder(activeOrder.id, inputOtp.trim());
    if (res.success) {
      setInputOtp('');
      setChecklistVerified(false);
      setActiveTab('earnings');
    }
  };

  return (
    <div className={`w-full ${isEmbeddedInPhone ? 'h-full flex flex-col justify-between overflow-y-auto' : 'max-w-6xl mx-auto px-4 py-6'} space-y-6 pb-28`}>
      
      {/* Top Rider Duty & Status Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Rider Profile Preview */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-lg shadow-sky-500/20">
              <img src={currentRider.photo} alt={currentRider.name} className="w-full h-full object-cover" />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">{currentRider.name}</h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                ⚡ Pro Rider
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{currentRider.vehicleType}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                ⭐ {currentRider.rating} ({currentRider.deliveriesCount} trips)
              </span>
            </div>
          </div>
        </div>

        {/* Duty Toggle & Offline Sync Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOfflineSyncMode(!offlineSyncMode)}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              offlineSyncMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="Offline Cache Mode (saves trips in local storage if network drops)"
          >
            {offlineSyncMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="hidden sm:inline">{offlineSyncMode ? 'Offline Sync: ON' : 'Online'}</span>
          </button>

          <button
            onClick={toggleDutyStatus}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
              isOnline
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'On Duty (Online)' : 'Go Online'}</span>
          </button>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'orders', label: 'Active Orders', icon: Layers, count: assignedOrders.length },
          { id: 'navigation', label: 'Turn Navigation', icon: Navigation },
          { id: 'earnings', label: 'Earnings & Cash', icon: DollarSign },
          { id: 'leaderboard', label: 'Surge Pool & Rank', icon: TrendingUp },
          { id: 'docs', label: 'Safety & KYC', icon: UserCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white border-transparent shadow-lg shadow-sky-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-400 text-slate-950 font-black">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ACTIVE ORDERS & INCOMING OFFERS */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          
          {/* Incoming Dispatch Offer Alert */}
          {incomingOrderOffer && isOnline && !activeOrder && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900/70 via-indigo-900/70 to-slate-950 border-2 border-sky-400 shadow-2xl animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-300 font-extrabold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 fill-current text-sky-400" />
                  <span>New Order Dispatch Offer! ({offerCountdown}s remaining)</span>
                </div>
                <span className="text-sm font-black text-amber-300">
                  Earn ₹95 + ₹{incomingOrderOffer.tip || 0} Tip
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{incomingOrderOffer.merchantName}</h3>
                  <span className="text-xs font-semibold text-slate-400">Pickup: 1.4 km</span>
                </div>
                <p className="text-xs text-slate-300">
                  Drop: {incomingOrderOffer.customerAddress} (~3.8 km total)
                </p>
                <div className="text-[11px] text-slate-400">
                  Items: {incomingOrderOffer.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAcceptIncomingOffer}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Accept Dispatch (₹{95 + (incomingOrderOffer.tip || 0)})
                </button>
                <button
                  className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Pass
                </button>
              </div>
            </div>
          )}

          {/* Current In-Progress Trip Card */}
          {activeOrder ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-1 rounded-xl bg-sky-950/80 border border-sky-800/60">
                    Trip #{activeOrder.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    Status: {activeOrder.orderStatus.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('navigation')}
                  className="btn-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open Live Map</span>
                </button>
              </div>

              {/* Step Sequence Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pickup Location */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 1. Pickup Merchant
                    </span>
                    <span>~1.2 km away</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeOrder.merchantName}</h4>
                  <p className="text-xs text-slate-400">{merchant?.address || 'Indiranagar Main Road'}</p>

                  <div className="pt-2">
                    {activeOrder.orderStatus === 'rider_assigned' && (
                      <button
                        onClick={() => riderArrivedAtMerchant(activeOrder.id)}
                        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                      >
                        Mark: Arrived at Restaurant
                      </button>
                    )}
                  </div>
                </div>

                {/* Drop Location */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 2. Drop Customer
                    </span>
                    <span>~3.5 km</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{activeOrder.customerName}</h4>
                  <p className="text-xs text-slate-400">{activeOrder.customerAddress}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`tel:${activeOrder.customerPhone}`}
                      className="flex-1 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer
                    </a>
                  </div>
                </div>

              </div>

              {/* Packing Verification Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Order Item Verification Checklist
                  </h5>
                  <span className="text-[10px] text-slate-400">{activeOrder.items.length} Packages</span>
                </div>

                <div className="space-y-1.5">
                  {activeOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-slate-200">
                        <span className="font-extrabold text-sky-400">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Hot Pack</span>
                    </div>
                  ))}
                </div>

                {activeOrder.orderStatus === 'at_merchant' && (
                  <button
                    onClick={() => riderPickupOrder(activeOrder.id)}
                    className="w-full btn-success text-xs font-bold py-2.5 mt-2"
                  >
                    Confirm Checked & Picked Up 🚀
                  </button>
                )}
              </div>

              {/* Delivery OTP Handover */}
              {(activeOrder.orderStatus === 'picked_up' || activeOrder.orderStatus === 'on_the_way') && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Customer OTP Verification
                      </h4>
                      <p className="text-[11px] text-slate-400">Ask the customer for their 4-digit PIN</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20">
                      Demo PIN: {activeOrder.deliveryOtp}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={4}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="Enter 4-Digit OTP"
                      className="flex-1 glass-input font-mono text-center font-bold tracking-widest text-lg"
                    />
                    <button
                      onClick={handleDeliverWithOtp}
                      className="btn-success text-xs font-black py-3 px-6"
                    >
                      Complete Delivery 🎉
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-16 text-center space-y-3 rounded-3xl bg-slate-900/50 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                <Bike className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">No Current Active Trip</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isOnline
                  ? 'Auto-dispatch radar is scanning high-demand restaurant clusters in Indiranagar & Koramangala...'
                  : 'Turn duty status ON to receive incoming high-payout orders.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: TURN-BY-TURN ROUTE NAVIGATION */}
      {activeTab === 'navigation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center font-black">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Simulated GPS Turn Route
                </h4>
                <p className="text-xs text-slate-400">
                  {activeOrder ? `Heading towards ${activeOrder.customerName}` : 'Idle in Indiranagar Sector'}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-800">
              Speed: 38 km/h
            </span>
          </div>

          <InteractiveMap
            height="380px"
            merchants={merchants}
            riders={riders}
            orders={orders}
            activeOrderId={activeOrder?.id}
          />

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Turn right on 100ft road in 250m towards customer gate</span>
            </div>
            <span className="font-bold text-sky-400">ETA: ~6 mins</span>
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS, CASH & INCENTIVES */}
      {activeTab === 'earnings' && (
        <div className="space-y-5">
          {/* Shift Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Today's Payout</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">₹{currentRider.earningsToday}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{currentRider.deliveriesToday} Trips Completed</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Weekly Total</div>
              <div className="text-2xl font-black text-sky-400 mt-1">₹{currentRider.weeklyEarnings}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹450 Surge Bonus</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Cash in Hand (COD)</div>
              <div className="text-2xl font-black text-amber-400 mt-1">₹{currentRider.cashInHand}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">To deposit at hub</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Min Guarantee</div>
              <div className="text-2xl font-black text-purple-400 mt-1">₹1,200/day</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Unlocked (10+ trips)</div>
            </div>
          </div>

          {/* Instant Cashout Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Instant UPI Cashout</h4>
              <p className="text-xs text-slate-400">Transfer available ₹{currentRider.walletBalance} directly to your bank</p>
            </div>
            <button
              onClick={() => showToast('Payout Initiated', `₹${currentRider.walletBalance} sent to your linked bank account`, 'success')}
              className="btn-success text-xs font-bold py-2.5 px-4"
            >
              Transfer to Bank
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SURGE POOL & LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Weekly Rider Surge Pool (₹25,000 Total)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Top 10 highest-rated riders split the pool every Sunday midnight</p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Your Rank: #1 🏆
            </span>
          </div>

          <div className="space-y-2">
            {[
              { rank: 1, name: 'Arjun Verma (You)', trips: 78, rating: 4.94, bonus: '₹4,500' },
              { rank: 2, name: 'Rohit Deshmukh', trips: 71, rating: 4.88, bonus: '₹3,200' },
              { rank: 3, name: 'Suresh Pillai', trips: 64, rating: 4.79, bonus: '₹2,500' },
              { rank: 4, name: 'Vikas Nambiar', trips: 59, rating: 4.82, bonus: '₹1,800' }
            ].map((entry) => (
              <div
                key={entry.rank}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  entry.rank === 1
                    ? 'bg-amber-950/40 border-amber-500/40 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    entry.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{entry.rank}
                  </span>
                  <span>{entry.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{entry.trips} Trips</span>
                  <span className="text-amber-400">⭐ {entry.rating}</span>
                  <span className="font-extrabold text-emerald-400">{entry.bonus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY & KYC */}
      {activeTab === 'docs' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Driver Safety & Document Verification</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Driving License (DL)', status: 'VERIFIED', expires: 'Valid till 2031' },
              { label: 'Vehicle RC & Registration', status: 'VERIFIED', expires: 'KA 03 HY 8842' },
              { label: 'Accidental Insurance (₹5 Lakh)', status: 'ACTIVE', expires: 'HDFC Ergo Policy' },
              { label: 'Non-Veg Hygiene Certification', status: 'CERTIFIED', expires: 'FSSAI Delivery Standard' }
            ].map((doc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{doc.label}</div>
                  <div className="text-[10px] text-slate-400">{doc.expires}</div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
