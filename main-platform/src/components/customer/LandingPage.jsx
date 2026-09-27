import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { AndroidAppBanner } from './AndroidAppBanner';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  CheckCircle2,
  ChevronDown,
  Gift,
  ShoppingBag,
  TrendingUp,
  Award,
  PhoneCall,
  Smartphone
} from 'lucide-react';

export const LandingPage = () => {
  const {
    merchants,
    setSelectedMerchantId,
    setCustomerSubView,
    customer,
    isAuthenticated,
    showToast,
    playSound
  } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleCategoryClick = (category) => {
    playSound('order');
    setCustomerSubView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMerchantClick = (merchantId) => {
    playSound('order');
    setSelectedMerchantId(merchantId);
    setCustomerSubView('merchant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast('Searching in Ushait', `Looking for "${searchQuery}"...`, 'info');
      setCustomerSubView('home');
    }
  };

  const categories = [
    { name: 'Woodfire Pizzas', icon: '🍕', color: 'from-orange-500 to-amber-500', desc: 'San Marzano & Burrata' },
    { name: 'Nizami Biryanis', icon: '🍗', color: 'from-amber-500 to-yellow-600', desc: 'Slow Dum Mutton & Chicken' },
    { name: '15m Fresh Mart', icon: '🥑', color: 'from-emerald-500 to-teal-500', desc: 'Farm Produce & Dairy' },
    { name: '24x7 Pharmacy', icon: '💊', color: 'from-blue-500 to-indigo-500', desc: 'Medicines & Wellness' },
    { name: 'Pastas & Bowls', icon: '🍝', color: 'from-rose-500 to-pink-500', desc: 'Handmade Bronze-Die' },
    { name: 'Desserts & Bakes', icon: '🍰', color: 'from-purple-500 to-fuchsia-500', desc: 'Tiramisu & Artisans' }
  ];

  const faqs = [
    {
      q: 'How fast is delivery in Ushait?',
      a: 'Our average delivery time across Ushait is between 12 to 20 minutes! Food orders are assigned instantly to hyper-localized delivery riders equipped with electric vehicles.'
    },
    {
      q: 'What is the Group Feast bill-splitting feature?',
      a: 'Group Feast lets you create a shared room link via WhatsApp. Everyone adds their favorite dishes to one shared cart, and you can split the payment evenly or per-item with 1-tap UPI!'
    },
    {
      q: 'How does the secure OTP contactless handover work?',
      a: 'Every placed order generates a unique 4-digit PIN. You only share this PIN with the verified rider upon delivery at your doorstep, guaranteeing 100% order accuracy.'
    },
    {
      q: 'Is there a welcome discount for new customers in Ushait?',
      a: 'Yes! Use promo code KALSEN50 during checkout or account registration to get FLAT ₹150 OFF and free express delivery on your first order.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* ========================================================================= */}
      {/* HERO SECTION WITH CLEAN WHITE AESTHETIC & ORANGE ACCENTS */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-12 pb-8 overflow-hidden">
        
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-400/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Top Location & Promo Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] shadow-sm animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">
              Live in Ushait, UP
            </span>
            <span className="text-orange-300">•</span>
            <span className="text-xs font-bold text-zinc-700">Average 15-Min Delivery</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-zinc-950 font-['Outfit'] tracking-tight leading-[1.08]">
            Lightning-Fast Food & Groceries in <span className="text-[#f97316] underline decoration-orange-300 decoration-wavy decoration-2">Ushait</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Order authentic artisan woodfire pizzas, Nizami dum biryanis, and fresh groceries. Enjoy live GPS radar tracking and instant 1-tap UPI payment.
          </p>

          {/* Interactive Search & Direct Action Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="p-2 sm:p-2.5 rounded-3xl bg-white border border-zinc-200 shadow-xl flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 w-full flex-1">
                <Search className="w-5 h-5 text-[#f97316] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search pizzas, biryani, avocados, medicines in Ushait..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap group"
              >
                <span>Find Food</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Quick CTA Actions: Explore vs Login/Register */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setCustomerSubView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Explore All Restaurants</span>
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => { setCustomerSubView('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-6 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#ea580c] text-xs sm:text-sm font-black shadow-sm cursor-pointer transition-all flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Claim ₹150 Bonus</span>
                </button>

                <button
                  onClick={() => { setCustomerSubView('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all"
                >
                  <span>Sign In</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { setCustomerSubView('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Hi, {customer.name} (₹{customer.walletBalance} Balance)</span>
              </button>
            )}
          </div>

          {/* Live Trust Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#ea580c] font-mono">15 Mins</div>
              <div className="text-[11px] text-zinc-500 font-bold mt-0.5">Average Delivery</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <div className="text-xl sm:text-2xl font-black text-zinc-950 font-mono">500+</div>
              <div className="text-[11px] text-zinc-500 font-bold mt-0.5">Curated Dishes</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono">4.9 ★</div>
              <div className="text-[11px] text-zinc-500 font-bold mt-0.5">Foodie Ratings</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">100%</div>
              <div className="text-[11px] text-zinc-500 font-bold mt-0.5">Contactless Handover</div>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* POPULAR CATEGORIES ROW */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
              What are you craving today?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Explore freshly prepared gourmet specials delivered in minutes in Ushait
            </p>
          </div>
          <button
            onClick={() => { setCustomerSubView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#ea580c] hover:underline cursor-pointer"
          >
            <span>View all items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategoryClick(cat.name)}
              className="clean-card p-4 text-center space-y-2 cursor-pointer group hover:-translate-y-1 transition-all border border-zinc-200"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr ${cat.color} p-0.5 shadow-md group-hover:scale-110 transition-transform`}>
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
                  {cat.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-950 group-hover:text-[#ea580c] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW KALSENONE WORKS (3 SIMPLE STEPS) */}
      {/* ========================================================================= */}
      <section className="p-6 sm:p-10 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-black uppercase text-[#ea580c] tracking-wider font-mono">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
            Hot Food & Essentials in 3 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="text-base font-black text-zinc-950">Select Your Kitchen</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Browse top-rated artisan pizzerias, Nizami biryanis, or dark grocery stores operating locally in Ushait.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="text-base font-black text-zinc-950">1-Tap UPI Checkout</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Pay securely via Google Pay, PhonePe, Paytm, or redeem loyalty wallet cash with zero hidden charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="text-base font-black text-zinc-950">Live GPS Radar Delivery</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Track the rider's trajectory live in real-time on our interactive city map with secure OTP PIN handover.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED RESTAURANTS SHOWCASE IN USHAIT */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
              Featured Kitchens & Stores in Ushait
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Handpicked culinary partners with high food-safety and delivery ratings
            </p>
          </div>
          <button
            onClick={() => { setCustomerSubView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-orange-400 text-zinc-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Explore All ({merchants.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {merchants.map((m) => (
            <div
              key={m.id}
              onClick={() => handleMerchantClick(m.id)}
              className="clean-card overflow-hidden cursor-pointer group border border-zinc-200 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 relative overflow-hidden bg-zinc-100">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-zinc-900 border border-zinc-200 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#f97316] fill-current" />
                    <span>{m.rating}</span>
                    <span className="text-zinc-400">({m.ratingCount})</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-[#ea580c] border border-zinc-200 shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{m.deliveryTime}</span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold">
                    <MapPin className="w-3 h-3 text-[#f97316]" />
                    <span className="truncate">{m.address}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-zinc-950 group-hover:text-[#ea580c] transition-colors truncate">
                    {m.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium truncate">
                    {m.cuisine}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMerchantClick(m.id);
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-50 hover:bg-[#f97316] text-[#ea580c] hover:text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OFFICIAL ANDROID APP SHOWCASE */}
      {/* ========================================================================= */}
      <AndroidAppBanner />

      {/* ========================================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
      {/* ========================================================================= */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-black uppercase text-[#ea580c] tracking-wider font-mono">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="clean-card rounded-2xl border border-zinc-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-950">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-[#f97316]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 text-xs text-zinc-600 font-medium leading-relaxed border-t border-zinc-100 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
