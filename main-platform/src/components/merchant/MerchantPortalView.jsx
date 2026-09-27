import React, { useState, useRef } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Flame,
  Star,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  ChefHat,
  PackageCheck,
  Send,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Check,
  X,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  Sliders,
  Award,
  Zap,
  Tag
} from 'lucide-react';

export const MerchantPortalView = () => {
  const {
    merchants,
    activeMerchantId,
    orders,
    merchantAcceptOrder,
    merchantRejectOrder,
    merchantSetReadyForPickup,
    addMerchantDish,
    updateMerchantDish,
    deleteMerchantDish,
    toggleDishStock,
    updateMerchantProfile,
    showToast,
    playSound
  } = usePlatform();

  // Active Merchant
  const currentMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0];

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'kds' | 'analytics' | 'store' | 'reviews' | 'payouts'
  const [prepTimeInput, setPrepTimeInput] = useState(18);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [merchantReplyText, setMerchantReplyText] = useState({});
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');

  const { uploadImage: uploadDishImage, uploading: dishUploading, progress: dishProgress } = useCloudinaryUpload();
  const dishFileInputRef = useRef(null);

  // Modal / Form state for Add/Edit Listing
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);

  const handleDishPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload a photo smaller than 8MB', 'error');
      return;
    }
    if (showToast) showToast('Uploading Photo... ☁️', 'Saving dish photo to Cloudinary CDN', 'info');
    const url = await uploadDishImage(file, 'urban-platform/dishes');
    if (url) {
      setDishFormData(prev => ({ ...prev, image: url }));
      if (showToast) showToast('Photo Uploaded! ✅', 'Saved to Cloudinary CDN', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload photo to Cloudinary', 'error');
    }
  };

  const initialDishForm = {
    name: '',
    price: '',
    category: 'Artisan Pizzas',
    isVeg: true,
    isBestseller: false,
    description: '',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    customizations: []
  };

  const [dishFormData, setDishFormData] = useState(initialDishForm);

  // Store Profile Edit Form State
  const [storeFormData, setStoreFormData] = useState({
    name: currentMerchant.name,
    cuisine: currentMerchant.cuisine,
    address: currentMerchant.address,
    avgPrepTime: currentMerchant.avgPrepTime || 18,
    offers: currentMerchant.offers || '',
    banner: currentMerchant.banner || ''
  });

  // Filter orders for this merchant
  const merchantOrders = orders.filter(o => o.merchantId === currentMerchant.id);
  const newOrders = merchantOrders.filter(o => o.orderStatus === 'placed');
  const inKitchenOrders = merchantOrders.filter(o => o.orderStatus === 'accepted' || o.orderStatus === 'preparing');
  const readyOrPickedOrders = merchantOrders.filter(o =>
    ['ready_for_pickup', 'rider_assigned', 'at_merchant', 'picked_up', 'on_the_way'].includes(o.orderStatus)
  );
  const completedOrders = merchantOrders.filter(o => o.orderStatus === 'delivered');

  const todayRevenue = merchantOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const netPayout = Math.round(todayRevenue * ((100 - (currentMerchant.commissionRate || 15)) / 100));

  // Handle open modal for create
  const handleOpenAddModal = () => {
    setEditingDishId(null);
    setDishFormData(initialDishForm);
    setIsAddDishModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEditModal = (dish) => {
    setEditingDishId(dish.id);
    setDishFormData({
      name: dish.name,
      price: dish.price,
      category: dish.category || 'Special',
      isVeg: dish.isVeg ?? true,
      isBestseller: dish.isBestseller ?? false,
      description: dish.description || '',
      image: dish.image || '',
      inStock: dish.inStock ?? true,
      customizations: dish.customizations || []
    });
    setIsAddDishModalOpen(true);
  };

  // Submit Add or Edit Listing
  const handleSaveDish = (e) => {
    e.preventDefault();
    if (!dishFormData.name.trim() || !dishFormData.price) {
      showToast('Validation Error', 'Please fill in Dish Name and Price', 'error');
      return;
    }

    if (editingDishId) {
      // Edit existing
      updateMerchantDish(currentMerchant.id, editingDishId, {
        name: dishFormData.name,
        price: Number(dishFormData.price),
        category: dishFormData.category,
        isVeg: dishFormData.isVeg,
        isBestseller: dishFormData.isBestseller,
        description: dishFormData.description,
        image: dishFormData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        inStock: dishFormData.inStock
      });
    } else {
      // Create new
      addMerchantDish(currentMerchant.id, {
        name: dishFormData.name,
        price: Number(dishFormData.price),
        category: dishFormData.category,
        isVeg: dishFormData.isVeg,
        isBestseller: dishFormData.isBestseller,
        description: dishFormData.description || 'Special signature item prepared fresh to order.',
        image: dishFormData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        inStock: dishFormData.inStock
      });
    }

    setIsAddDishModalOpen(false);
    setDishFormData(initialDishForm);
  };

  const handleSaveStoreProfile = (e) => {
    e.preventDefault();
    updateMerchantProfile(currentMerchant.id, {
      name: storeFormData.name,
      cuisine: storeFormData.cuisine,
      address: storeFormData.address,
      avgPrepTime: Number(storeFormData.avgPrepTime),
      offers: storeFormData.offers,
      banner: storeFormData.banner
    });
  };

  // Categories list
  const categories = ['All', ...new Set(currentMerchant.dishes.map(d => d.category || 'General'))];

  // Filtered dishes
  const filteredDishes = currentMerchant.dishes.filter(d => {
    if (menuFilterCategory !== 'All' && d.category !== menuFilterCategory) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = (d.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28 text-slate-100">
      
      {/* Top Banner: Store Summary & Admin Ranking Visibility Status */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0">
            <img src={currentMerchant.image} alt={currentMerchant.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-white font-['Outfit']">{currentMerchant.name}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentMerchant.tier} Tier ({currentMerchant.commissionRate}% Commission)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentMerchant.cuisine} • {currentMerchant.address}</p>
          </div>
        </div>

        {/* Customer App Ranking & Priority Status (Decided by Admin) */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Customer App Ranking:</span>
              <span className="text-amber-400 font-extrabold">
                {currentMerchant.adminPriorityBadge || `#${currentMerchant.adminRank || 1} Rank`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Admin Boost: <strong className="text-emerald-400">{currentMerchant.adminBoostScore || 90}/100</strong></span>
              <span>•</span>
              <span className={currentMerchant.isPromoted ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                {currentMerchant.isPromoted ? '⚡ Admin Promoted' : 'Organic Listing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Orders</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{merchantOrders.length}</div>
          <div className="text-[10px] text-emerald-400 font-bold">● {newOrders.length} Waiting in Kitchen</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">₹{todayRevenue}</div>
          <div className="text-[10px] text-slate-400 font-medium">Net Payout: ₹{netPayout}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Menu Items</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{currentMerchant.dishes.length}</div>
          <div className="text-[10px] text-sky-400 font-bold">
            {currentMerchant.dishes.filter(d => d.inStock).length} In Stock Ready
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Store Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-current" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">⭐ {currentMerchant.rating}</div>
          <div className="text-[10px] text-slate-400">{currentMerchant.ratingCount} Verified reviews</div>
        </div>
      </div>

      {/* Merchant Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 border-transparent shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DISH & PRODUCT LISTING MANAGEMENT (FULL CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="space-y-5">
          {/* Header Bar: Search, Category Filter, and Add Listing CTA */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search listings by dish name or ingredient..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMenuFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      menuFilterCategory === cat
                        ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Listing Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Listing</span>
            </button>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className={`p-4 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                  dish.inStock ? 'border-slate-800 hover:border-slate-700 shadow-md' : 'border-red-900/40 bg-slate-900/60 opacity-75'
                }`}
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-40 rounded-xl overflow-hidden border border-slate-800 mb-3 bg-slate-950">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    
                    {/* Food Type Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase shadow-md ${
                        dish.isVeg
                          ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500'
                          : 'bg-rose-950/90 text-rose-400 border-rose-500'
                      }`}>
                        {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                      </span>
                      {dish.isBestseller && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                          ⭐ BESTSELLER
                        </span>
                      )}
                    </div>

                    {/* Stock Status Pill */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shadow-md ${
                        dish.inStock ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                      }`}>
                        {dish.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                        {dish.category || 'Specialty'}
                      </span>
                      <h4 className="text-sm font-extrabold text-white leading-snug mt-0.5">{dish.name}</h4>
                    </div>
                    <div className="text-base font-black text-white font-mono flex-shrink-0">
                      ₹{dish.price}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                {/* Listing Action Controls */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  {/* In Stock Toggle */}
                  <button
                    onClick={() => toggleDishStock(currentMerchant.id, dish.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      dish.inStock
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    {dish.inStock ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{dish.inStock ? 'In Stock' : 'Mark Out of Stock'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(dish)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all"
                      title="Edit dish listing details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDishToDelete(dish)}
                      className="btn-delete-icon p-2 cursor-pointer"
                      title="Delete dish listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {filteredDishes.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No listings found</h4>
              <p className="text-xs text-slate-400 mt-1">Try changing category or create a new dish item.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Add Dish Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE KITCHEN DISPLAY SYSTEM (KDS) */}
      {/* ========================================================================= */}
      {activeTab === 'kds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: NEW INCOMING ORDERS */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-sm font-black text-white">New Incoming</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                  {newOrders.length} Orders
                </span>
              </div>

              {newOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                  No new pending orders right now.
                </div>
              ) : (
                newOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/50 shadow-xl space-y-3 animate-pulse">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">#{ord.id}</span>
                      <span className="text-xs font-bold text-white font-mono">₹{ord.grandTotal}</span>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between text-xs">
                          <span className="text-slate-200 font-bold">{item.quantity}x {item.name}</span>
                          <span className="text-slate-400">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {ord.deliveryInstructions && (
                      <div className="p-2 rounded-lg bg-slate-950 text-[11px] text-amber-300">
                        Note: {ord.deliveryInstructions}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => merchantAcceptOrder(ord.id, prepTimeInput)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        Accept ({prepTimeInput}m)
                      </button>
                      <button
                        onClick={() => merchantRejectOrder(ord.id, 'Kitchen at capacity')}
                        className="px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* COLUMN 2: IN-KITCHEN PREPARING */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-black text-white">Cooking & Prep</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                  {inKitchenOrders.length} Active
                </span>
              </div>

              {inKitchenOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                  Kitchen queue clear.
                </div>
              ) : (
                inKitchenOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">#{ord.id}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        ⏳ ~{ord.prepTimeRemaining || 12} min left
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-1 flex justify-between text-xs">
                          <span className="text-slate-200">{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => merchantSetReadyForPickup(ord.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 transition-all"
                    >
                      Food Ready for Pickup 📦
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* COLUMN 3: PACKED & RIDER PICKUP */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black text-white">Packed / Picked Up</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  {readyOrPickedOrders.length}
                </span>
              </div>

              {readyOrPickedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                  No orders waiting for pickup.
                </div>
              ) : (
                readyOrPickedOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">#{ord.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-slate-300">Rider: {ord.riderName || 'Assigning rider...'}</div>
                    <div className="text-slate-400">Customer: {ord.customerName}</div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STORE PROFILE & TIMINGS */}
      {/* ========================================================================= */}
      {activeTab === 'store' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Restaurant Profile & Operational Settings</h3>
            <p className="text-xs text-slate-400">Update your store branding, average prep time, and customer promotions.</p>
          </div>

          <form onSubmit={handleSaveStoreProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Restaurant Name</label>
              <input
                type="text"
                value={storeFormData.name}
                onChange={(e) => setStoreFormData({ ...storeFormData, name: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cuisines / Categories</label>
                <input
                  type="text"
                  value={storeFormData.cuisine}
                  onChange={(e) => setStoreFormData({ ...storeFormData, cuisine: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Average Prep Time (Minutes)</label>
                <input
                  type="number"
                  value={storeFormData.avgPrepTime}
                  onChange={(e) => setStoreFormData({ ...storeFormData, avgPrepTime: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Store Address</label>
              <input
                type="text"
                value={storeFormData.address}
                onChange={(e) => setStoreFormData({ ...storeFormData, address: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Active Offer Text Banner</label>
              <input
                type="text"
                value={storeFormData.offers}
                onChange={(e) => setStoreFormData({ ...storeFormData, offers: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Save Store Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAILY EARNINGS & PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">Total GMV (Orders Delivered)</div>
              <div className="text-3xl font-black text-white font-mono">₹{todayRevenue}</div>
              <div className="text-[11px] text-emerald-400 font-bold">100% Settled via Gateway</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">Platform Commission ({currentMerchant.commissionRate}%)</div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                ₹{Math.round(todayRevenue * (currentMerchant.commissionRate / 100))}
              </div>
              <div className="text-[11px] text-slate-400">Deducted automatically</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">Net Merchant Payout</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">₹{netPayout}</div>
              <button
                onClick={() => showToast('Payout Initiated 🏦', `Instant payout of ₹${netPayout} transferred to your bank account`, 'success')}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all mt-2"
              >
                Request Instant Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CUSTOMER REVIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Customer Feedback & Food Ratings</h3>
              <p className="text-xs text-slate-400">Maintain high rating to boost your placement on the Customer App.</p>
            </div>
            <div className="text-xl font-black text-amber-400">⭐ {currentMerchant.rating} / 5.0</div>
          </div>

          {[
            { id: 1, user: 'Pooja Reddy', rating: 5, time: '2 hours ago', dish: 'Black Truffle Burrata Pizza', comment: 'Extremely fresh burrata and crisp crust! Best pizza in Indiranagar.' },
            { id: 2, user: 'Siddharth Rao', rating: 5, time: 'Yesterday', dish: 'Classic Italian Tiramisu Jar', comment: 'Authentic espresso soak and creamy mascarpone. Delivered on time!' }
          ].map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white">{rev.user} • <span className="text-amber-400">{'★'.repeat(rev.rating)}</span></div>
                <span className="text-slate-500 text-[11px]">{rev.time}</span>
              </div>
              <div className="text-slate-300">{rev.comment}</div>
              <div className="text-[11px] text-amber-400/80 font-bold">Ordered: {rev.dish}</div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT LISTING MODAL */}
      {/* ========================================================================= */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingDishId ? 'Edit Dish Listing' : 'Add New Listing to Menu'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Will update instantly on Customer App
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDishModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDish} className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dish / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quattro Formaggi Sourdough Pizza"
                  value={dishFormData.name}
                  onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="499"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Artisan Pizzas"
                    value={dishFormData.category}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Food Type (Veg / Non-Veg) & Bestseller Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dietary Type</label>
                  <select
                    value={dishFormData.isVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setDishFormData({ ...dishFormData, isVeg: e.target.value === 'veg' })}
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="non-veg">🔴 Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tag as Bestseller</label>
                  <select
                    value={dishFormData.isBestseller ? 'yes' : 'no'}
                    onChange={(e) => setDishFormData({ ...dishFormData, isBestseller: e.target.value === 'yes' })}
                    className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="yes">⭐ Yes, Tag Bestseller</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Cloudinary Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Dish Photo (Cloudinary CDN)</label>
                  <button
                    type="button"
                    onClick={() => dishFileInputRef.current?.click()}
                    disabled={dishUploading}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{dishUploading ? `Uploading (${dishProgress}%)...` : 'Upload to Cloudinary'}</span>
                  </button>
                  <input
                    type="file"
                    ref={dishFileInputRef}
                    accept="image/*"
                    onChange={handleDishPhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {dishFormData.image && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                      <img src={dishFormData.image} alt="Dish Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/... or paste image link"
                    value={dishFormData.image}
                    onChange={(e) => setDishFormData({ ...dishFormData, image: e.target.value })}
                    className="flex-1 bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>

                {dishUploading && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1.5">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${dishProgress}%` }}
                    />
                  </div>
                )}
                
                {/* Image Quick Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {[
                    { label: '🍕 Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
                    { label: '🍝 Pasta', url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=80' },
                    { label: '🍛 Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
                    { label: '🍰 Dessert', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80' },
                    { label: '🥑 Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDishFormData({ ...dishFormData, image: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description & Ingredients</label>
                <textarea
                  rows={2}
                  placeholder="Describe ingredients, cooking style, portion size..."
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all"
                >
                  {editingDishId ? 'Save Listing Changes' : 'Publish Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM LUXURY DELETE CONFIRMATION MODAL (REPLACES NATIVE BROWSER POPUP) */}
      {/* ========================================================================= */}
      {dishToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative text-zinc-900 animate-in zoom-in-95 duration-200">
            
            {/* Warning Icon Badge */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm shadow-red-500/10">
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">Delete Menu Listing?</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Permanent action on store catalog</p>
              </div>
            </div>

            {/* Dish Details Preview Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0">
                <img src={dishToDelete.image} alt={dishToDelete.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-zinc-900 truncate">{dishToDelete.name}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{dishToDelete.category} • ₹{dishToDelete.price}</p>
              </div>
            </div>

            {/* Warning Text */}
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Are you sure you want to remove <strong className="text-zinc-950">"{dishToDelete.name}"</strong>? This will immediately remove it from the live Customer App in Ushait.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDishToDelete(null)}
                className="btn-light-secondary flex-1 py-3 text-xs font-bold cursor-pointer"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMerchantDish(currentMerchant.id, dishToDelete.id);
                  setDishToDelete(null);
                }}
                className="btn-delete-primary flex-1 py-3 text-xs font-black cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
