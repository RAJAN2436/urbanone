import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { KalsenLogo } from '../common/KalsenLogo';
import { AddressLocationModal } from './AddressLocationModal';
import {
  MapPin,
  ShoppingBag,
  Wallet,
  Bell,
  Search,
  User,
  Flame,
  Home,
  Clock,
  Menu,
  X,
  Smartphone,
  ChevronRight,
  ChevronDown,
  LogIn,
  UserPlus,
  Compass,
  LogOut,
  LocateFixed,
  Loader2
} from 'lucide-react';

export const CustomerHeader = () => {
  const {
    customer,
    cart,
    setCustomerSubView,
    customerSubView,
    orders,
    toast,
    isAuthenticated,
    logout,
    detectGPSLocation,
    isLocatingGPS,
    setActiveTrackingOrderId,
    clearTrackingData
  } = usePlatform();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [autoTriggerGPSModal, setAutoTriggerGPSModal] = useState(false);

  const totalCartCount = (cart?.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const safeAddresses = Array.isArray(customer?.addresses) && customer.addresses.length > 0
    ? customer.addresses
    : [{ id: "a1", tag: "Home", street: "Main Market Road", landmark: "Ushait" }];
  const selectedAddress = safeAddresses.find(a => a.id === customer?.selectedAddressId) || safeAddresses[0];
  const activeOrder = Array.isArray(orders) ? orders.find(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled') : null;

  const handleNavClick = (view) => {
    if (view === 'tracking') {
      if (activeOrder) {
        setActiveTrackingOrderId(activeOrder.id);
      } else {
        clearTrackingData();
      }
    }
    setCustomerSubView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-sm px-3 sm:px-6 py-2 sm:py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Desktop Address Pill */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div
              onClick={() => handleNavClick('landing')}
              className="cursor-pointer flex-shrink-0"
              title="KalsenOne - Landing Page"
            >
              <KalsenLogo size="sm" showSubtitle={false} />
            </div>

            {/* Delivery Address Pill with 1-click GPS detection & Address Selector */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-zinc-50 hover:bg-orange-50/50 border border-zinc-200 hover:border-orange-400 transition-all shadow-sm max-w-[210px] md:max-w-[280px] group"
            >
              {/* Clickable address area to open address & location modal */}
              <div
                onClick={() => {
                  setAutoTriggerGPSModal(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                title="Click to select or manage delivery addresses"
              >
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[#f97316] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider truncate flex items-center gap-1">
                    <span>Deliver to</span>
                    <span className="text-[#f97316]">({selectedAddress.tag || 'Home'})</span>
                    <ChevronDown className="w-2.5 h-2.5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-zinc-900 truncate">
                    {selectedAddress.street}
                  </div>
                </div>
              </div>

              {/* Direct GPS Button on Navbar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoTriggerGPSModal(true);
                  setIsLocationModalOpen(true);
                }}
                disabled={isLocatingGPS}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer flex-shrink-0 ${
                  isLocatingGPS
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white hover:bg-orange-500 text-zinc-500 hover:text-white border border-zinc-200 hover:border-orange-500 shadow-sm active:scale-95'
                }`}
                title="Detect exact location using GPS"
              >
                {isLocatingGPS ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Center Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-zinc-100/90 border border-zinc-200">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                customerSubView === 'home'
                  ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200 font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#f97316]" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => handleNavClick('cart')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                customerSubView === 'cart'
                  ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/25 font-extrabold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  customerSubView === 'cart' ? 'bg-white text-[#f97316]' : 'bg-[#f97316] text-white'
                }`}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleNavClick('tracking')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    customerSubView === 'tracking'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200 font-extrabold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Live Track</span>
                  {activeOrder && (
                    <span className="w-2 h-2 rounded-full bg-[#f97316] animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    customerSubView === 'profile'
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200 font-extrabold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/50'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Profile</span>
                </button>
              </>
            )}
          </nav>

          {/* Right: Mobile Address / Auth Buttons / User Profile Chip */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Mobile-Only Compact Address Tag & Quick GPS Button */}
            <div className="sm:hidden flex items-center gap-1">
              <div
                onClick={() => {
                  setAutoTriggerGPSModal(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50/90 border border-orange-200 text-zinc-800 cursor-pointer text-[11px] max-w-[130px] shadow-sm active:scale-95 transition-transform"
                title="Select delivery address"
              >
                <MapPin className="w-3 h-3 text-[#f97316] flex-shrink-0" />
                <span className="font-bold truncate">{selectedAddress.street.split(',')[0]}</span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" />
              </div>

              {/* Mobile Direct GPS Button */}
              <button
                type="button"
                onClick={() => {
                  setAutoTriggerGPSModal(true);
                  setIsLocationModalOpen(true);
                }}
                disabled={isLocatingGPS}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs cursor-pointer shadow-sm active:scale-95 transition-all ${
                  isLocatingGPS
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 hover:bg-orange-200 text-[#ea580c] border border-orange-300'
                }`}
                title="Detect GPS Location"
              >
                {isLocatingGPS ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    customerSubView === 'login'
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-white text-zinc-800 hover:bg-orange-50 border border-zinc-200 hover:border-orange-400'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => handleNavClick('register')}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    customerSubView === 'register'
                      ? 'bg-[#ea580c] text-white shadow-sm'
                      : 'bg-orange-50 text-[#ea580c] hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* User Profile Chip */}
                <div
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-orange-50/90 hover:bg-orange-100 border border-orange-200 text-xs cursor-pointer transition-all shadow-sm group"
                  title={`Signed in as ${customer.name || 'Foodie'} (Click to View Profile)`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-[#ea580c] text-white flex items-center justify-center font-black text-[11px] shadow-sm flex-shrink-0">
                    {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left leading-tight hidden xs:block">
                    <div className="text-[11px] font-black text-zinc-950 group-hover:text-orange-950 truncate max-w-[85px] sm:max-w-[120px]">
                      {customer.name?.split(' ')[0] || 'Foodie'}
                    </div>
                    <div className="text-[9px] font-extrabold text-[#ea580c] flex items-center gap-0.5">
                      <span>₹{customer?.walletBalance || 0}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200 hover:border-red-200 text-xs font-bold transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Nav Drawer Button (Hamburger / Close) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-[#f97316]" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Navigation Drawer (<768px) */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-zinc-200 mt-2.5 animate-fadeIn space-y-2">
            
            {/* User Profile Card on Mobile Drawer */}
            {isAuthenticated ? (
              <div
                onClick={() => handleNavClick('profile')}
                className="p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-200/80 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#f97316] text-white flex items-center justify-center font-black text-sm shadow-md">
                    {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-black text-zinc-950">{customer?.name || 'Guest'}</div>
                    <div className="text-[10px] text-zinc-500 font-medium">{customer?.phone || customer?.email || ''} • {customer?.tier || 'VIP'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[#ea580c]">₹{customer?.walletBalance || 0}</div>
                  <div className="text-[9px] text-zinc-500 font-bold">{customer?.loyaltyPoints || 0} pts</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-1">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2.5 rounded-xl bg-[#f97316] text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register (+₹150)</span>
                </button>
              </div>
            )}

            <div className="space-y-1">
              
              {/* Explore */}
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  customerSubView === 'home'
                    ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-[#f97316]" />
                  <span>Explore Kitchens & Stores</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Cart */}
              <button
                onClick={() => handleNavClick('cart')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  customerSubView === 'cart'
                    ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#f97316]" />
                  <span>Shopping Cart</span>
                </div>
                {totalCartCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#f97316] text-white">
                    {totalCartCount} items
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {/* Only show Live Track, Group Feast, Profile when user is signed in */}
              {isAuthenticated && (
                <>
                  {/* Live Track */}
                  <button
                    onClick={() => handleNavClick('tracking')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      customerSubView === 'tracking'
                        ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#f97316]" />
                      <span>Live GPS Order Tracking</span>
                    </div>
                    {activeOrder ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Live Active
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {/* Profile */}
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      customerSubView === 'profile'
                        ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[#f97316]" />
                      <span>Account, Wallet & Addresses</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </>
              )}

              {/* Quick Auth / Wallet Top Up in Mobile Drawer */}
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#ea580c] text-xs font-black cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register (+₹150)</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 mt-2 shadow-sm">
                  <div
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-black">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Wallet Balance</div>
                      <div className="text-xs font-black text-zinc-950">₹{customer?.walletBalance || 0} • {customer?.loyaltyPoints || 0} pts</div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Android App Download Banner in Menu */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    handleNavClick('home');
                    setTimeout(() => {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Download Official Android App</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-black">GET APK</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </header>

      {/* Fixed Bottom Mobile Navigation Bar for Smartphones (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-zinc-200 shadow-2xl py-1.5 px-3 flex items-center justify-around select-none">
        
        {/* Explore */}
        <button
          onClick={() => {
            setCustomerSubView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer transition-colors ${
            customerSubView === 'home' ? 'text-[#f97316] font-black' : 'text-zinc-500 hover:text-zinc-900 font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 ${customerSubView === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setCustomerSubView('cart')}
          className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer relative transition-colors ${
            customerSubView === 'cart' ? 'text-[#f97316] font-black' : 'text-zinc-500 hover:text-zinc-900 font-semibold'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${customerSubView === 'cart' ? 'stroke-[2.5]' : ''}`} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#f97316] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        {/* When authenticated: show Track, Group Feast, Profile. Otherwise: show Sign In */}
        {isAuthenticated ? (
          <>
            {/* Live Track */}
            <button
              onClick={() => handleNavClick('tracking')}
              className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer relative transition-colors ${
                customerSubView === 'tracking' ? 'text-[#f97316] font-black' : 'text-zinc-500 hover:text-zinc-900 font-semibold'
              }`}
            >
              <div className="relative">
                <Clock className={`w-5 h-5 ${customerSubView === 'tracking' ? 'stroke-[2.5]' : ''}`} />
                {activeOrder && (
                  <span className="w-2 h-2 rounded-full bg-[#f97316] absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </div>
              <span className="text-[10px]">Track</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => setCustomerSubView('profile')}
              className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer transition-colors ${
                customerSubView === 'profile' ? 'text-[#f97316] font-black' : 'text-zinc-500 hover:text-zinc-900 font-semibold'
              }`}
            >
              <User className={`w-5 h-5 ${customerSubView === 'profile' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Profile</span>
            </button>
          </>
        ) : (
          /* When NOT signed in: Show Sign In option */
          <button
            onClick={() => {
              setCustomerSubView('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 p-1 cursor-pointer transition-colors ${
              customerSubView === 'login' ? 'text-[#f97316] font-black' : 'text-zinc-500 hover:text-zinc-900 font-semibold'
            }`}
          >
            <LogIn className={`w-5 h-5 ${customerSubView === 'login' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">Sign In</span>
          </button>
        )}

      </nav>

      {/* Address & GPS Location Selector Modal */}
      <AddressLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setAutoTriggerGPSModal(false);
        }}
        autoTriggerGPS={autoTriggerGPSModal}
      />
    </>
  );
};
