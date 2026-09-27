import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { INITIAL_MERCHANTS } from '../mockData';
import {
  Award,
  Pin,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sliders,
  Store
} from 'lucide-react';

export const RankingConsole = () => {
  const {
    merchants,
    pinMerchantToTop,
    moveMerchantRank,
    toggleMerchantPromoted,
    updateMerchantBoostScore,
    updateMerchantApprovalStatus,
    updateMerchantRating
  } = useAdmin();

  const merchantList = Array.isArray(merchants) ? merchants : [];
  const rankedMerchants = [...merchantList].sort((a, b) => (a.adminRank || 99) - (b.adminRank || 99));

  return (
    <div className="space-y-6">
      
      {/* Top Explanation Banner matching Customer App Spotlight */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-orange-50/90 via-white to-orange-50/40 border border-orange-200/80 shadow-lg shadow-orange-500/5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Soft Radial Glow */}
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-orange-400/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#ea580c] text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Admin Placement Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit'] tracking-tight">
            Customer App Top Listing <span className="text-[#f97316]">Decision Console</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
            As the Admin, you decide <strong>which merchant listing appears first (#1, #2, #3...)</strong> in the Customer App. Pin any restaurant to #1 Top Spotlight, adjust boost scores, or grant "Sponsored" badges.
          </p>
        </div>

        {/* Live Customer Preview Box */}
        <div className="relative z-10 bg-white p-4 rounded-2xl border border-orange-200 shadow-md shadow-orange-500/5 text-xs space-y-1.5 min-w-[240px]">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Current #1 on Customer App:
          </div>
          <div className="font-black text-[#ea580c] flex items-center gap-1.5 text-sm">
            <span>🥇</span>
            <span className="truncate">{rankedMerchants[0]?.name || 'None'}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            ● Live taking top traffic in Indiranagar
          </div>
        </div>
      </div>

      {/* Ranked Listings Cards */}
      <div className="space-y-4">
        {rankedMerchants.length === 0 ? (
          <div className="clean-card p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-3xl">
            <div className="text-3xl mb-2">🏪</div>
            <h4 className="text-sm font-bold text-zinc-800">No Merchant Stores Listed Yet</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Registered merchant stores will appear here automatically for you to pin #1, boost ranking, or sponsor.
            </p>
          </div>
        ) : (
          rankedMerchants.map((merchant, index) => {
          const rankNumber = merchant.adminRank || (index + 1);
          const isTopOne = rankNumber === 1;

          return (
            <div
              key={merchant.id}
              className={`clean-card p-5 transition-all ${
                isTopOne
                  ? 'border-orange-300 bg-gradient-to-r from-orange-50/60 via-white to-white shadow-md'
                  : 'hover:border-zinc-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Left: Rank Badge + Merchant Info */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Rank Position Pillar */}
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 border ${
                    isTopOne
                      ? 'bg-orange-100 border-orange-300 text-[#ea580c] shadow-sm'
                      : rankNumber === 2
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-800'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Rank</span>
                    <span className="text-xl font-mono leading-none">#{rankNumber}</span>
                  </div>

                  {/* Store Image */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100">
                    <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Store Details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-zinc-950">{merchant.name}</h4>
                      
                      {merchant.isPromoted && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#f97316] text-white uppercase shadow-sm">
                          Sponsored / Promoted
                        </span>
                      )}

                      {isTopOne && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200 uppercase">
                          🥇 Top Hero Spotlight
                        </span>
                      )}

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        merchant.adminApprovalStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}>
                        {merchant.adminApprovalStatus || 'Approved'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 font-medium mt-1">
                      {merchant.cuisine} • Rating: ⭐ {merchant.rating} ({merchant.ratingCount}) • {merchant.dishes?.length || 0} Listings
                    </p>
                  </div>
                </div>

                {/* Right: Ranking Controls, Move Up/Down, Boost Score, Rating */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Rating Control */}
                  <div className="bg-zinc-50 px-3 py-1.5 rounded-2xl border border-zinc-200 min-w-[130px] shadow-sm">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        <span>Rating</span>
                      </span>
                      <input
                        type="number"
                        min="1.0"
                        max="5.0"
                        step="0.05"
                        value={merchant.rating || 4.5}
                        onChange={(e) => updateMerchantRating?.(merchant.id, e.target.value)}
                        className="w-12 text-right font-mono font-black text-xs text-[#ea580c] bg-white border border-zinc-200 rounded px-1 py-0.5"
                      />
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.05"
                      value={merchant.rating || 4.5}
                      onChange={(e) => updateMerchantRating?.(merchant.id, e.target.value)}
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                      title="Adjust Rating (1.0 - 5.0)"
                    />
                  </div>

                  {/* Boost Score Slider */}
                  <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200 min-w-[150px] shadow-sm">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold mb-1">
                      <span>Boost Score</span>
                      <span className="text-[#ea580c] font-mono font-extrabold">{merchant.adminBoostScore || 80}/100</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={merchant.adminBoostScore || 80}
                      onChange={(e) => updateMerchantBoostScore(merchant.id, e.target.value)}
                      className="w-full accent-[#f97316] cursor-pointer"
                    />
                  </div>

                  {/* Rank Position Adjustment Buttons */}
                  <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-2xl border border-zinc-200 shadow-sm">
                    <button
                      onClick={() => moveMerchantRank(merchant.id, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        index === 0 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-700 hover:text-zinc-950 hover:bg-white'
                      }`}
                      title="Move 1 position higher"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveMerchantRank(merchant.id, 'down')}
                      disabled={index === rankedMerchants.length - 1}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        index === rankedMerchants.length - 1 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-700 hover:text-zinc-950 hover:bg-white'
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
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-100 hover:bg-[#f97316] text-[#ea580c] hover:text-white border border-orange-200 text-xs font-black shadow-sm transition-all cursor-pointer"
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                      <span>Pin to #1 Top</span>
                    </button>
                  )}

                  {/* Promoted Toggle */}
                  <button
                    onClick={() => toggleMerchantPromoted(merchant.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      merchant.isPromoted
                        ? 'bg-[#f97316] text-white border-[#f97316] font-black shadow-sm'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      merchant.adminApprovalStatus === 'approved'
                        ? 'bg-white text-zinc-700 border-zinc-200 hover:border-red-300 hover:text-red-600'
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    {merchant.adminApprovalStatus === 'approved' ? 'Active' : 'Suspended'}
                  </button>

                </div>

              </div>
            </div>
          );
        }))}
      </div>

    </div>
  );
};
