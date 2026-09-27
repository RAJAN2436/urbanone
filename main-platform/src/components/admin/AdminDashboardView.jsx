import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  ShieldCheck,
  Activity,
  Zap,
  Sliders,
  Users,
  Store,
  DollarSign,
  AlertTriangle,
  Flame,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  MapPin,
  Cpu,
  Layers,
  Search,
  ChevronRight,
  UserCheck,
  Award,
  ArrowUp,
  ArrowDown,
  Pin,
  Star,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';

export const AdminDashboardView = () => {
  const {
    merchants,
    setMerchants,
    riders,
    setRiders,
    orders,
    surgeZones,
    setSurgeZones,
    autoDispatchEnabled,
    setAutoDispatchEnabled,
    pinMerchantToTop,
    moveMerchantRank,
    toggleMerchantPromoted,
    toggleMerchantFeatured,
    updateMerchantBoostScore,
    updateMerchantApprovalStatus,
    updateMerchantCommission,
    updateMerchantRating,
    showToast,
    triggerFullSimulation
  } = usePlatform();

  const [adminTab, setActiveAdminTab] = useState('ranking'); // 'ranking' | 'ops' | 'surge' | 'riders' | 'merchants' | 'disputes' | 'finance'
  const [selectedZone, setSelectedZone] = useState(surgeZones[0]);
  const [searchRider, setSearchRider] = useState('');

  // Calculate live global stats
  const totalGMV = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.grandTotal : 0), 0) + 482450;
  const activeOrders = orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const onlineRiders = riders.filter(r => r.isOnline);

  // Sorted merchants by admin ranking
  const rankedMerchants = [...merchants].sort((a, b) => (a.adminRank || 99) - (b.adminRank || 99));

  const handleUpdateSurge = (zoneId, newMultiplier) => {
    setSurgeZones(prev => prev.map(z => z.id === zoneId ? { ...z, multiplier: Number(newMultiplier) } : z));
    showToast('Surge Multiplier Updated', `Surge set to ${newMultiplier}x for zone`, 'info');
  };

  const handleApproveKYC = (riderId) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, kycVerified: true } : r));
    showToast('KYC Approved', 'Driver background check & video KYC verified', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Top Admin Command Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">KalsenOneCo Command Center</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Admin Governance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Merchant Listing Top Ranking, Hyperlocal Dispatch & Platform Controls
            </p>
          </div>
        </div>

        {/* Global Dispatch Engine Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div className="text-xs">
              <div className="font-bold text-white">Smart Auto-Dispatch</div>
              <div className="text-[10px] text-slate-400">{autoDispatchEnabled ? 'Automated AI Routing' : 'Manual Ops Mode'}</div>
            </div>
            <input
              type="checkbox"
              checked={autoDispatchEnabled}
              onChange={(e) => {
                setAutoDispatchEnabled(e.target.checked);
                showToast('Dispatch Mode', e.target.checked ? 'AI Automated Dispatching Enabled' : 'Manual Dispatching Active', 'info');
              }}
              className="ml-2 w-4 h-4 accent-purple-600 cursor-pointer"
            />
          </div>

          <button
            onClick={triggerFullSimulation}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Order</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Today's Total GMV</div>
          <div className="text-lg font-black text-emerald-400 mt-1">₹{totalGMV.toLocaleString()}</div>
          <div className="text-[9px] text-emerald-400">↑ 14.8% vs last week</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Orders Live</div>
          <div className="text-lg font-black text-indigo-400 mt-1">{activeOrders.length + 8}</div>
          <div className="text-[9px] text-slate-400">In-flight deliveries</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Riders on Road</div>
          <div className="text-lg font-black text-sky-400 mt-1">{onlineRiders.length + 42}</div>
          <div className="text-[9px] text-sky-400">82% Fleet utilization</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Delivery Time</div>
          <div className="text-lg font-black text-amber-400 mt-1">23.8 min</div>
          <div className="text-[9px] text-emerald-400">Target &lt; 25 mins</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Platform Margin</div>
          <div className="text-lg font-black text-purple-400 mt-1">14.2%</div>
          <div className="text-[9px] text-purple-300">Blended commission</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Merchants</div>
          <div className="text-lg font-black text-pink-400 mt-1">{merchants.length} Active</div>
          <div className="text-[9px] text-slate-400">All Verified</div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'ranking', label: 'Customer App Top Ranking & Listing Decision Console', icon: Award, badge: 'Key Feature' },
          { id: 'ops', label: 'City Operations War Room', icon: Activity },
          { id: 'surge', label: 'Surge Zones & Pricing', icon: Zap },
          { id: 'riders', label: 'Rider Fleet & KYC', icon: Users },
          { id: 'merchants', label: 'Merchant Governance', icon: Store },
          { id: 'disputes', label: 'Fraud & Dispute Radar', icon: AlertTriangle },
          { id: 'finance', label: 'Platform Financials', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              adminTab === tab.id
                ? 'bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                adminTab === tab.id ? 'bg-white text-purple-700' : 'bg-purple-500/20 text-purple-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB: TOP LISTINGS & MERCHANT RANKING DECISION CONSOLE */}
      {/* ========================================================================= */}
      {adminTab === 'ranking' && (
        <div className="space-y-6">
          
          {/* Information & Explanation Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                  Admin Placement Engine
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Customer App Top Listing Decision Console
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As the Admin, you have full authority to decide <strong>which merchant listing appears on Top (#1, #2, #3...)</strong> in the Customer App. You can pin any restaurant to #1 Top Spotlight, adjust algorithmic boost scores, grant "Sponsored / Promoted" badges, and reorder ranks.
              </p>
            </div>

            {/* Live Customer Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs space-y-1.5 min-w-[220px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current #1 on Customer App:
              </div>
              <div className="font-extrabold text-amber-400 flex items-center gap-1.5 text-sm">
                <span>🥇</span>
                <span className="truncate">{rankedMerchants[0]?.name || 'None'}</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                ● Live & taking top traffic
              </div>
            </div>
          </div>

          {/* Ranked Merchants Cards */}
          <div className="space-y-3.5">
            {rankedMerchants.map((merchant, index) => {
              const rankNumber = merchant.adminRank || (index + 1);
              const isTopOne = rankNumber === 1;

              return (
                <div
                  key={merchant.id}
                  className={`p-5 rounded-3xl bg-slate-900 border transition-all ${
                    isTopOne
                      ? 'border-amber-500/60 shadow-xl shadow-amber-500/5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Left: Rank Badge + Merchant Info */}
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Rank Position Pillar */}
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 border ${
                        isTopOne
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : rankNumber === 2
                          ? 'bg-slate-800 border-slate-600 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Rank</span>
                        <span className="text-xl font-mono leading-none">#{rankNumber}</span>
                      </div>

                      {/* Store Image */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-800 flex-shrink-0">
                        <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Store Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-extrabold text-white">{merchant.name}</h4>
                          
                          {/* Badges */}
                          {merchant.isPromoted && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase shadow-sm">
                              Sponsored / Promoted
                            </span>
                          )}

                          {isTopOne && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                              🥇 Top Hero Spotlight
                            </span>
                          )}

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            merchant.adminApprovalStatus === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-300 border-red-500/30'
                          }`}>
                            {merchant.adminApprovalStatus || 'Approved'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                          {merchant.cuisine} • Rating: ⭐ {merchant.rating} ({merchant.ratingCount}) • {merchant.dishes.length} Dishes
                        </p>
                      </div>
                    </div>

                    {/* Right: Ranking Controls, Move Up/Down, Boost Score, Rating */}
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Rating Control */}
                      <div className="bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 min-w-[130px]">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-amber-400" />
                            <span>Rating</span>
                          </span>
                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.05"
                            value={merchant.rating || 4.5}
                            onChange={(e) => updateMerchantRating(merchant.id, e.target.value)}
                            className="w-12 text-right font-mono font-black text-xs text-purple-400 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                          />
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="5.0"
                          step="0.05"
                          value={merchant.rating || 4.5}
                          onChange={(e) => updateMerchantRating(merchant.id, e.target.value)}
                          className="w-full accent-amber-400 cursor-pointer h-1.5"
                          title="Adjust Rating (1.0 - 5.0)"
                        />
                      </div>

                      {/* Boost Score Slider */}
                      <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 min-w-[150px]">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                          <span>Boost Score</span>
                          <span className="text-purple-400 font-mono font-extrabold">{merchant.adminBoostScore || 80}/100</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={merchant.adminBoostScore || 80}
                          onChange={(e) => updateMerchantBoostScore(merchant.id, e.target.value)}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* Rank Position Adjustment Buttons */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                          onClick={() => moveMerchantRank(merchant.id, 'up')}
                          disabled={index === 0}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Move 1 position higher"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveMerchantRank(merchant.id, 'down')}
                          disabled={index === rankedMerchants.length - 1}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            index === rankedMerchants.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Move 1 position lower"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 1-Click Pin to Top 1 */}
                      {!isTopOne && (
                        <button
                          onClick={() => pinMerchantToTop(merchant.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-black transition-all"
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                          <span>Pin to #1 Top</span>
                        </button>
                      )}

                      {/* Promoted Toggle */}
                      <button
                        onClick={() => toggleMerchantPromoted(merchant.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          merchant.isPromoted
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {merchant.isPromoted ? '★ Sponsored' : '+ Promote'}
                      </button>

                      {/* Approval Toggle */}
                      <button
                        onClick={() => {
                          const nextStatus = merchant.adminApprovalStatus === 'approved' ? 'suspended' : 'approved';
                          updateMerchantApprovalStatus(merchant.id, nextStatus);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          merchant.adminApprovalStatus === 'approved'
                            ? 'bg-slate-950 text-slate-400 border-slate-800 hover:border-red-500/50 hover:text-red-300'
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}
                      >
                        {merchant.adminApprovalStatus === 'approved' ? 'Active' : 'Suspended'}
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OPERATIONS WAR ROOM & REAL-TIME MAP */}
      {/* ========================================================================= */}
      {adminTab === 'ops' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live City Operations War Room (Ushait Central)</h3>
              <p className="text-xs text-slate-400">Showing active merchant clusters, rider trajectories, and live delivery routes</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Live WebSocket Sync
            </span>
          </div>

          <InteractiveMap
            height="440px"
            merchants={merchants}
            riders={riders}
            orders={orders}
            showSurgeZones={true}
            surgeZones={surgeZones}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SURGE ZONES & DYNAMIC PRICING */}
      {/* ========================================================================= */}
      {adminTab === 'surge' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Surge Pricing Trigger Rules & Demand Forecasting</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surgeZones.map((zone) => (
                <div key={zone.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{zone.name}</h4>
                      <p className="text-xs text-slate-400">{zone.ordersInQueue} Orders in Queue • {zone.availableRiders} Idle Riders</p>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      zone.multiplier > 1.4 ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {zone.multiplier}x Surge
                    </span>
                  </div>

                  {/* Multiplier Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Multiplier Control</span>
                      <span className="font-mono font-bold text-white">{zone.multiplier}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={zone.multiplier}
                      onChange={(e) => handleUpdateSurge(zone.id, e.target.value)}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RIDER FLEET & KYC CONSOLE */}
      {/* ========================================================================= */}
      {adminTab === 'riders' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Rider Fleet Roster & Video KYC Approvals</h3>
              <p className="text-xs text-slate-400">{riders.length} Active riders enrolled</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {riders.map((r) => (
              <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700">
                    <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-white">{r.name}</h5>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-sky-500/20 text-sky-300">
                        {r.vehicleType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ⭐ {r.rating} • {r.deliveriesToday} trips today • Wallet ₹{r.walletBalance}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    r.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {r.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>

                  {r.kycVerified ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> KYC Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApproveKYC(r.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Approve Video KYC
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MERCHANT GOVERNANCE */}
      {/* ========================================================================= */}
      {adminTab === 'merchants' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Merchant Partner Governance & Commission Tiers</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {merchants.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.name}</h4>
                    <p className="text-xs text-slate-400">{m.cuisine}</p>
                  </div>
                  <span className="text-xs font-black text-amber-400 px-2.5 py-1 rounded-xl bg-amber-500/20">
                    {m.tier} Tier ({m.commissionRate}%)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Commission Rate (%)</span>
                    <span className="font-mono font-bold text-purple-400">{m.commissionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={m.commissionRate || 15}
                    onChange={(e) => updateMerchantCommission(m.id, e.target.value)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Rating: ⭐ {m.rating} ({m.ratingCount})</span>
                  <span className="text-emerald-400 font-bold">Open & Taking Orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FRAUD & DISPUTE RESOLUTION */}
      {/* ========================================================================= */}
      {adminTab === 'disputes' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>AI Fraud Radar & Customer Dispute Tickets</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300">
              0 Critical Breaches
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'DSP-102', customer: 'Rohan Mehta', issue: 'Missing item in pasta order', amount: '₹240', status: 'Pending Review' },
              { id: 'DSP-098', customer: 'Kavita Roy', issue: 'Late delivery due to rain surge', amount: '₹50 Refunded', status: 'Resolved' }
            ].map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">#{ticket.id} • {ticket.customer}</div>
                  <p className="text-slate-400 mt-0.5">{ticket.issue}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{ticket.amount}</span>
                  <button
                    onClick={() => showToast('Refund Authorized', `Refund of ${ticket.amount} credited to customer wallet`, 'success')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  >
                    Authorize Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GLOBAL FINANCIAL LEDGER */}
      {/* ========================================================================= */}
      {adminTab === 'finance' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Consolidated Platform Financial Streams</h3>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Merchandise Value (GMV)</span>
              <span className="text-white font-bold">₹4,82,450</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Merchant Net Payout (85%)</span>
              <span className="text-slate-300">₹4,10,082</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rider Delivery Fees & Tips (Paid Out)</span>
              <span className="text-slate-300">₹44,200</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST & Gateway Costs</span>
              <span className="text-slate-300">₹8,600</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
              <span className="font-extrabold text-white">Net Platform Profit</span>
              <span className="font-black text-emerald-400">₹19,568 (Net 4.05%)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
