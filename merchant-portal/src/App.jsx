import React, { useState } from 'react';
import { MerchantProvider, useMerchant } from './context/MerchantContext';
import { MerchantHeader } from './components/MerchantHeader';
import { AdminRankingBanner } from './components/AdminRankingBanner';
import { ListingManager } from './components/ListingManager';
import { KitchenDisplaySystem } from './components/KitchenDisplaySystem';
import { StoreSettings } from './components/StoreSettings';
import { EarningsLedger } from './components/EarningsLedger';
import { CustomerReviews } from './components/CustomerReviews';
import { MerchantLogin } from './components/MerchantLogin';
import {
  Layers,
  ChefHat,
  Store,
  DollarSign,
  Star,
  Flame,
  Bell
} from 'lucide-react';

const StoreOnboardingModal = () => {
  const { createMerchant } = useMerchant();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('Main Market Road, Ushait');
  const [costForTwo, setCostForTwo] = useState('₹450');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await createMerchant({
      name: name.trim(),
      category,
      cuisine: cuisine || (category === 'Food' ? 'North Indian, Street Food' : category),
      address: address.trim(),
      costForTwo,
      image: category === 'Food'
        ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
        : (category === 'Grocery'
          ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80')
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="clean-card p-6 sm:p-8 max-w-lg w-full space-y-6 bg-white border border-zinc-200 shadow-xl rounded-3xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
            🏪
          </div>
          <h2 className="text-2xl font-black text-zinc-950 font-['Outfit']">Register Your Store Listing</h2>
          <p className="text-xs text-zinc-500 font-medium">
            No mock demo data active. Create your live restaurant or shop profile to start publishing listings to the Customer App!
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-zinc-700">
          <div>
            <label className="block mb-1 text-zinc-500">Store / Restaurant Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ushait Biryani & Fast Food"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 font-medium border border-zinc-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-zinc-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full clean-input px-3 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
              >
                <option value="Food">Food / Restaurant</option>
                <option value="Grocery">Grocery & Mart</option>
                <option value="Pharmacy">Pharmacy & Health</option>
                <option value="Bakery">Bakery & Sweets</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-zinc-500">Approx Cost for Two</label>
              <input
                type="text"
                value={costForTwo}
                onChange={(e) => setCostForTwo(e.target.value)}
                className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-zinc-500">Cuisine / Speciality</label>
            <input
              type="text"
              placeholder="e.g. Mughlai, Chinese, Snacks"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-1 text-zinc-500">Store Address in Ushait</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full btn-primary py-3 rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : '🚀 Launch Store & Start Adding Menu'}
          </button>
        </form>
      </div>
    </div>
  );
};

const MerchantPortalAppContent = () => {
  const { currentMerchant, isMerchantAuthenticated, orders, toast } = useMerchant();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'kds' | 'store' | 'payouts' | 'reviews'

  if (!isMerchantAuthenticated || !currentMerchant) {
    return <MerchantLogin />;
  }

  const orderList = Array.isArray(orders) ? orders : [];
  const merchantOrders = orderList.filter(o => o.merchantId === currentMerchant.id);
  const newOrders = merchantOrders.filter(o => o.orderStatus === 'placed');
  const inKitchenOrders = merchantOrders.filter(o => o.orderStatus === 'accepted' || o.orderStatus === 'preparing');

  const todayRevenue = merchantOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const netPayout = Math.round(todayRevenue * ((100 - (currentMerchant.commissionRate || 15)) / 100));

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Merchant Header matching Customer App Header */}
      <MerchantHeader />

      {/* Main Merchant Portal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28">
        
        {/* Top Banner: Store Summary & Admin Ranking Visibility Status */}
        <AdminRankingBanner />

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="clean-card p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
              <span>Today's Orders</span>
              <Flame className="w-4 h-4 text-[#f97316]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">{merchantOrders.length}</div>
            <div className="text-[11px] text-emerald-700 font-bold">● {newOrders.length} Waiting in Kitchen</div>
          </div>

          <div className="clean-card p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
              <span>Gross Sales</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">₹{todayRevenue}</div>
            <div className="text-[11px] text-zinc-500 font-medium">Net Payout: ₹{netPayout}</div>
          </div>

          <div className="clean-card p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
              <span>Active Menu Items</span>
              <Layers className="w-4 h-4 text-[#f97316]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">{currentMerchant.dishes.length}</div>
            <div className="text-[11px] text-[#ea580c] font-bold">
              {currentMerchant.dishes.filter(d => d.inStock).length} In Stock Ready
            </div>
          </div>

          <div className="clean-card p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
              <span>Store Rating</span>
              <Star className="w-4 h-4 text-[#f97316] fill-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono">⭐ {currentMerchant.rating}</div>
            <div className="text-[11px] text-zinc-500 font-medium">{currentMerchant.ratingCount} Verified reviews</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200">
          {[
            { id: 'menu', label: 'Dish & Product Listings', icon: Layers, count: currentMerchant.dishes.length },
            { id: 'kds', label: 'Live Kitchen Display (KDS)', icon: ChefHat, count: newOrders.length + inKitchenOrders.length },
            { id: 'store', label: 'Store Profile & Settings', icon: Store },
            { id: 'payouts', label: 'Daily Earnings & Payouts', icon: DollarSign },
            { id: 'reviews', label: 'Customer Ratings & Reviews', icon: Star }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#f97316] text-white border-[#f97316] shadow-md shadow-orange-500/25 font-extrabold'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-white text-[#ea580c]' : 'bg-orange-100 text-[#ea580c]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Views */}
        {activeTab === 'menu' && <ListingManager />}
        {activeTab === 'kds' && <KitchenDisplaySystem />}
        {activeTab === 'store' && <StoreSettings />}
        {activeTab === 'payouts' && <EarningsLedger />}
        {activeTab === 'reviews' && <CustomerReviews />}

      </main>

      {/* Real-time Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 bg-white text-zinc-900 border-zinc-200 ${
            toast.type === 'error' ? 'border-red-400' : 'border-orange-400'
          }`}>
            <div className="w-7 h-7 rounded-xl bg-[#f97316] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-950">{toast.title}</h4>
              <p className="text-xs text-zinc-600 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MerchantProvider>
      <MerchantPortalAppContent />
    </MerchantProvider>
  );
}
