import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UrbanLogo } from '../common/UrbanLogo';
import { DeliveryEmblem } from '../common/DeliveryEmblem';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Flame,
  Tag,
  ChevronRight,
  Leaf,
  Plus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const CustomerHome = () => {
  const {
    merchants,
    customer,
    setSelectedMerchantId,
    setCustomerSubView,
    cart
  } = usePlatform();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const categories = [
    { id: 'All', name: 'All Cravings', icon: '✨' },
    { id: 'Food', name: 'Food Delivery', icon: '🍕' },
    { id: 'Grocery', name: 'Urban Mart 15m', icon: '🥑' },
    { id: 'Pharmacy', name: '24x7 Express Meds', icon: '💊' },
    { id: 'Gourmet', name: 'Gourmet & Cafes', icon: '☕' },
    { id: 'Desserts', name: 'Bakes & Sweets', icon: '🍰' }
  ];

  const filteredMerchants = merchants
    .filter(m => {
      if (m.adminApprovalStatus === 'suspended') return false;
      if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
      if (vegOnly && !m.isVegetarian) return false;
      if (minRating > 0 && m.rating < minRating) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchCuisine = m.cuisine.toLowerCase().includes(q);
        const matchDishes = m.dishes.some(d => d.name.toLowerCase().includes(q));
        if (!matchName && !matchCuisine && !matchDishes) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const rankA = a.adminRank ?? 99;
      const rankB = b.adminRank ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      return (b.adminBoostScore || 0) - (a.adminBoostScore || 0);
    });

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-5 sm:space-y-8 pb-28 md:pb-16 px-3 sm:px-6 max-w-7xl mx-auto">
      
      {/* Light Hero Spotlight Banner with Official Delivery Emblem & Logo */}
      <div className="relative rounded-3xl p-4 sm:p-8 md:p-10 overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40 border border-orange-200/80 shadow-lg shadow-orange-500/5">
        
        {/* Soft Radial Glow */}
        <div className="absolute -top-24 right-0 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-orange-400/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-orange-100/80 border border-orange-300/60 text-[#ea580c] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f97316]" />
              <span>Instant Hyperlocal Dispatch</span>
            </div>
            
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight font-['Outfit']">
              {customer?.name ? (
                <>Welcome back, <span className="text-[#f97316]">{(customer?.name || 'Foodie').split(' ')[0]}!</span> 👋</>
              ) : (
                <>Craving Something <span className="text-[#f97316]">Delicious?</span></>
              )}
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
              Top artisan restaurants, gourmet woodfire pizzas & 15-minute groceries delivered blazing fast across Ushait, UP.
            </p>
          </div>

          {/* Right: Official Express Scooter Delivery Emblem (Desktop) & Group Feast Card */}
          <div className="hidden md:flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Delivery Emblem Vector Illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-orange-200/80 shadow-md">
              <DeliveryEmblem size={100} />
              <span className="text-[10px] font-black text-[#f97316] uppercase tracking-wider mt-1">
                Express 15m Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Command Search & Filter Bar */}
        <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 relative z-10">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, cuisines, ingredients..."
              style={{ paddingLeft: '2.75rem' }}
              className="w-full clean-input pr-4 sm:pr-14 text-xs sm:text-sm font-medium placeholder:text-zinc-400"
            />
            <span className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
              ⌘K
            </span>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setMinRating(minRating === 4.8 ? 0 : 4.8)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                minRating > 0
                  ? 'bg-orange-50 text-[#ea580c] border-orange-300 shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-[#f97316]" />
              <span>4.8+ Stars</span>
            </button>
          </div>
        </div>

      </div>

      {/* Gamification & Streak Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ea580c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xl shadow-orange-500/20">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0 mt-0.5 sm:mt-0">
            🔥
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-base font-extrabold text-white">
                Weekly Streak: {customer?.streakCount || 0}/5 Feasts
              </h4>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white text-[#ea580c] uppercase">
                Active Reward
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-orange-100 mt-0.5 font-medium leading-tight">
              Order 1 more time this week to unlock <span className="underline font-bold">₹100 cashback!</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCustomerSubView('profile')}
          className="bg-white text-[#ea580c] font-bold text-xs px-4 py-2 rounded-xl shadow hover:bg-orange-50 w-full sm:w-auto text-center transition-all cursor-pointer"
        >
          View Rewards
        </button>
      </div>

      {/* Category Tabs */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Explore by Category
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#f97316] text-white border-transparent shadow-md shadow-orange-500/25 font-extrabold'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <span className="text-sm sm:text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 font-['Outfit']">
              Featured Kitchens & Stores
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
              {filteredMerchants.length} curated partners offering lightning delivery in Indiranagar
            </p>
          </div>

          {/* Admin Priority Ranking Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-orange-50 border border-orange-200/80 text-[10px] sm:text-[11px] font-bold text-[#ea580c] self-start sm:self-auto">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#f97316]" />
            <span>Ranked by Urban Algorithm</span>
          </div>
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="clean-card p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-3xl space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto text-3xl shadow-sm">
              🍽️
            </div>
            <h4 className="text-base font-extrabold text-zinc-900 font-['Outfit']">No Stores Listed Yet</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              Stores registered on the <strong>Urban Partner Merchant Portal</strong> will appear here automatically with their live menus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredMerchants.map((merchant) => (
            <div
              key={merchant.id}
              onClick={() => {
                setSelectedMerchantId(merchant.id);
                setCustomerSubView('merchant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="clean-card group cursor-pointer overflow-hidden flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all"
            >
              {/* Image Banner */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-zinc-100">
                <img
                  src={merchant.banner || merchant.image}
                  alt={merchant.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-zinc-950 text-xs font-extrabold shadow-md border border-zinc-100">
                  <Star className="w-3.5 h-3.5 fill-current text-[#f97316]" />
                  <span>{merchant.rating}</span>
                  <span className="text-zinc-500 font-normal">({merchant.ratingCount})</span>
                </div>

                {/* Time & Veg Badge & Admin Badges */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-wrap items-center gap-1.5 max-w-[80%]">
                  {merchant.adminRank === 1 ? (
                    <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] sm:text-xs font-black shadow-md uppercase">
                      🥇 #1 Top Spotlight
                    </span>
                  ) : merchant.isPromoted ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black shadow-md uppercase">
                      ⚡ Sponsored
                    </span>
                  ) : merchant.adminPriorityBadge ? (
                    <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-zinc-950 text-[10px] sm:text-xs font-bold shadow-sm">
                      {merchant.adminPriorityBadge}
                    </span>
                  ) : null}

                  <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-zinc-950 text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3 text-[#f97316]" />
                    {merchant.deliveryTime}
                  </span>
                  {merchant.isVegetarian && (
                    <span className="px-2 py-0.5 rounded-xl bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold shadow-sm">
                      🌱 Pure Veg
                    </span>
                  )}
                </div>

                {/* Offers Tag */}
                {merchant.offers && (
                  <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f97316] text-white font-black text-[10px] sm:text-[11px] shadow-md">
                    <Tag className="w-3 h-3 fill-current" />
                    <span>{merchant.offers}</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-extrabold text-zinc-950 group-hover:text-[#f97316] transition-colors">
                      {merchant.name}
                    </h4>
                    <span className="text-xs font-bold text-zinc-500">
                      {merchant.costForTwo} for two
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1 font-medium">
                    {merchant.cuisine}
                  </p>
                </div>

                {/* Top Dish Preview */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 min-w-0">
                    <Flame className="w-3.5 h-3.5 text-[#f97316] flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px] text-zinc-700 font-medium">
                      {merchant.dishes[0]?.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#f97316] group-hover:translate-x-1 transition-transform flex items-center gap-1 flex-shrink-0">
                    View Menu <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

    </div>
  );
};
