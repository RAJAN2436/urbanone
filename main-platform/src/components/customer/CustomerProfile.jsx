import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePlatform } from '../../context/PlatformContext';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import {
  Wallet,
  Award,
  Clock,
  RotateCcw,
  Share2,
  MapPin,
  Plus,
  Gift,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
  X,
  Home,
  Briefcase,
  Heart,
  Trash2,
  LocateFixed,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';

export const CustomerProfile = () => {
  const {
    customer,
    setCustomer,
    orders,
    addToCart,
    setCustomerSubView,
    showToast,
    addCustomerAddress,
    deleteCustomerAddress,
    setSelectedAddress,
    detectGPSLocation,
    isLocatingGPS
  } = usePlatform();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { uploadImage: uploadAvatar, uploading: avatarUploading, progress: avatarProgress } = useCloudinaryUpload();
  const avatarInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload a photo smaller than 8MB', 'error');
      return;
    }
    if (showToast) showToast('Uploading Photo... ☁️', 'Saving profile photo to Cloudinary CDN', 'info');
    const url = await uploadAvatar(file, 'kalsen-platform/customers');
    if (url) {
      setCustomer(prev => ({
        ...prev,
        avatar: url,
        photo: url
      }));
      if (showToast) showToast('Photo Updated! ✅', 'Profile photo saved to Cloudinary', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload photo to Cloudinary', 'error');
    }
  };

  const handleDeleteAddress = (addrId) => {
    if (confirmDeleteId === addrId) {
      deleteCustomerAddress(addrId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(addrId);
    }
  };
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [isAddingMoney, setIsAddingMoney] = useState(false);

  // Add New Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddrTag, setNewAddrTag] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrPinCode, setNewAddrPinCode] = useState('');

  const handleAddMoney = () => {
    setCustomer(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + topUpAmount
    }));
    showToast('Wallet Reloaded', `Added ₹${topUpAmount} to your Kalsen Wallet`, 'success');
    setIsAddingMoney(false);
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart(item, item.customizations || '');
    });
    setCustomerSubView('cart');
    showToast('Items Added', 'Previous order added to cart!', 'info');
  };

  const copyReferral = () => {
    if (!customer.referralCode) return;
    navigator.clipboard.writeText(customer.referralCode);
    showToast('Code Copied!', 'Share with friends: Get ₹50 when they place their first order', 'success');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) {
      showToast('Address Required', 'Please enter street / house address', 'error');
      return;
    }
    addCustomerAddress({
      tag: newAddrTag,
      street: newAddrStreet.trim(),
      landmark: newAddrLandmark.trim() || 'Ushait Center',
      pinCode: newAddrPinCode.trim()
    });
    setIsAddressModalOpen(false);
    setNewAddrStreet('');
    setNewAddrLandmark('');
    setNewAddrPinCode('');
    setNewAddrTag('Home');
  };

  const safeName = customer?.name || 'Guest';
  const safeAddresses = Array.isArray(customer?.addresses) ? customer.addresses : [];
  
  // Only genuine orders placed by the current user (no default/mock orders)
  const safeOrders = Array.isArray(orders) 
    ? orders.filter(ord => {
        if (!ord) return false;
        if (ord.id?.startsWith('ORD-88') || ord.id?.startsWith('ORD-9162') || ord.id?.startsWith('ORD-8671') || ord.id?.startsWith('demo-') || ord.id?.startsWith('mock-')) {
          return false;
        }
        if (customer?.phone || customer?.email || customer?.id) {
          const userPhone = (customer.phone || '').replace(/\D/g, '');
          const orderPhone = (ord.customerPhone || '').replace(/\D/g, '');
          const matchPhone = Boolean(userPhone && orderPhone && (userPhone.includes(orderPhone) || orderPhone.includes(userPhone)));
          const matchEmail = Boolean(customer.email && ord.customerEmail && ord.customerEmail.toLowerCase() === customer.email.toLowerCase());
          const matchId = Boolean(customer.id && (ord.customerId === customer.id || ord.customer_id === customer.id));
          return matchPhone || matchEmail || matchId;
        }
        return false;
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-20 px-3 sm:px-6">
      
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500 to-[#ea580c] text-white shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#ea580c] font-black text-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {customer?.avatar || customer?.photo ? (
                <img src={customer.avatar || customer.photo} alt={safeName} className="w-full h-full object-cover" />
              ) : (
                safeName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'G'
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
              title="Upload profile photo to Cloudinary"
            >
              {avatarUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">{safeName}</h2>
              {customer?.tier && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  {customer.tier}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-orange-100 font-medium">
                {customer?.email || ''}{customer?.email && customer?.phone ? ' • ' : ''}{customer?.phone || ''}
              </p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Camera className="w-2.5 h-2.5" />
                {avatarUploading ? `${avatarProgress}%` : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="px-6 py-4 rounded-2xl bg-white text-zinc-950 text-right shadow-xl relative z-10">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Available Points</div>
          <div className="text-2xl font-black text-[#f97316] font-['Outfit']">{customer?.loyaltyPoints || 0} Pts</div>
          <div className="text-[10px] text-zinc-500 font-bold">Worth ₹{Math.floor((customer?.loyaltyPoints || 0) * 0.25)} discount</div>
        </div>
      </div>

      {/* Wallet & Referral Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kalsen Prepaid Wallet */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-[#f97316]" />
              <span>Kalsen 1-Tap Wallet</span>
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c]">
              Active
            </span>
          </div>

          <div>
            <div className="text-xs text-zinc-500">Current Balance</div>
            <div className="text-3xl font-black text-zinc-950 mt-0.5 font-['Outfit']">₹{customer?.walletBalance || 0}</div>
          </div>

          {isAddingMoney ? (
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                {[200, 500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      topUpAmount === amt ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMoney}
                className="w-full btn-orange-primary text-xs font-bold py-3 cursor-pointer"
              >
                Confirm Add ₹{topUpAmount} via UPI
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingMoney(true)}
              className="w-full py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#ea580c] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#f97316]" />
              <span>Top-Up Wallet</span>
            </button>
          )}
        </div>

        {/* Referral Program */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50/80 to-white border border-orange-200 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs uppercase tracking-wider">
              <Gift className="w-4 h-4 text-[#f97316]" />
              <span>Refer & Earn ₹50 Cash</span>
            </div>
            <h4 className="text-base font-bold text-zinc-950 mt-2">Get ₹50 for every foodie friend</h4>
            <p className="text-xs text-zinc-600 mt-1 font-medium leading-relaxed">
              Your friend gets flat 50% off on their first feast, and you get ₹50 directly in your Kalsen wallet!
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <span className="flex-1 font-mono font-bold text-xs text-[#ea580c] pl-3">
              {customer?.referralCode || 'N/A'}
            </span>
            <button
              onClick={copyReferral}
              className="px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
        </div>

      </div>

      {/* Past Orders */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2 font-['Outfit']">
          <Clock className="w-4 h-4 text-[#f97316]" />
          <span>Past Orders</span>
        </h3>

        {safeOrders.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-bold text-zinc-500">No past orders yet</p>
            <p className="text-xs mt-1">Place your first order to see history here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-950">{ord.merchantName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-[#ea580c]'
                    }`}>
                      {ord.orderStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">
                    {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <div className="text-[11px] text-zinc-500">
                    Paid ₹{ord.grandTotal} • {new Date(ord.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleReorder(ord)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:border-orange-300 text-zinc-900 font-bold text-xs shadow-sm transition-all w-fit cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Reorder</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Addresses */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2 font-['Outfit']">
            <MapPin className="w-4 h-4 text-[#f97316]" />
            <span>Saved Addresses</span>
          </h3>
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {safeAddresses.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-bold text-zinc-500">No saved addresses</p>
            <p className="text-xs mt-1">Add your first delivery address to get started!</p>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#ea580c] font-bold text-xs hover:bg-orange-100 cursor-pointer transition-colors"
            >
              + Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeAddresses.map((addr) => {
              const isSelected = customer?.selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-4 rounded-2xl border min-h-[155px] flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/80 border-orange-400 shadow-sm ring-1 ring-orange-400/40'
                      : 'bg-zinc-50 hover:bg-zinc-100/70 border-zinc-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-zinc-950 uppercase tracking-wider">{addr.tag}</span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isSelected ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ea580c] text-white shadow-2xs">Default</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedAddress(addr.id)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-[#ea580c] cursor-pointer px-1.5 py-0.5 rounded hover:bg-white transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        {confirmDeleteId === addr.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 cursor-pointer px-1 py-0.5"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 cursor-pointer px-2 py-0.5 rounded-lg transition-colors flex items-center gap-0.5"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete address"
                            className="w-6 h-6 rounded-lg bg-white hover:bg-red-50 hover:text-red-500 text-zinc-400 border border-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2 mt-1 leading-snug">{addr.street}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{addr.landmark}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] mt-2">
                    <span className="font-bold text-zinc-500">PIN: {addr.pinCode || '243641'}</span>
                    {isSelected && (
                      <span className="font-extrabold text-[#ea580c] text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Delivering Here
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* In-Grid Add New Address Card with matching Height & Width */}
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="p-5 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-orange-400 bg-zinc-50/50 hover:bg-orange-50/30 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#ea580c] transition-all cursor-pointer group min-h-[155px] shadow-2xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 group-hover:border-orange-300 group-hover:scale-105 flex items-center justify-center text-zinc-400 group-hover:text-[#ea580c] transition-all shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-black">Add New Address</span>
              <span className="text-[10px] text-zinc-400 font-medium">Home, Work, or Ushait Spot</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD NEW ADDRESS MODAL (Fixed Width & Height, Full Viewport Portal) */}
      {/* ========================================================================= */}
      {isAddressModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999, margin: 0 }}
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div 
            className="w-full max-w-[460px] max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden relative animate-scaleUp my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-white to-orange-50/30 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 font-['Outfit']">
                    Add Delivery Address
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Save address for quick delivery in Ushait (243641)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">

              {/* Direct GPS Button in Modal */}
              <button
                type="button"
                onClick={async () => {
                  const res = await detectGPSLocation();
                  if (res?.address) {
                    setNewAddrStreet(res.address.street || '');
                    setNewAddrLandmark(res.address.landmark || 'Near Clock Tower, Ushait');
                    setNewAddrPinCode('243641');
                  }
                }}
                disabled={isLocatingGPS}
                className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200 text-[#ea580c] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                {isLocatingGPS ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                <span>{isLocatingGPS ? 'Detecting Location in Ushait...' : 'Auto-fill Location via GPS / Ushait'}</span>
              </button>

              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest my-0.5">
                <div className="flex-1 h-px bg-zinc-200" />
                <span>address details</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              {/* Tag Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tag: 'Home', icon: Home },
                    { tag: 'Work', icon: Briefcase },
                    { tag: 'Other', icon: Heart }
                  ].map(({ tag, icon: Icon }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewAddrTag(tag)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newAddrTag === tag
                          ? 'bg-[#ea580c] text-white border-orange-500 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Street / House */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">
                  House / Flat / Street Name <span className="text-orange-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. House No. 24, Main Market Road, Near Clock Tower"
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium resize-none shadow-xs"
                />
              </div>

              {/* Landmark and Pin Code in 2-Column Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">Landmark / Area</label>
                  <input
                    type="text"
                    placeholder="Near Clock Tower"
                    value={newAddrLandmark}
                    onChange={(e) => setNewAddrLandmark(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                    <span>PIN Code</span>
                    <span className="text-[10px] text-emerald-600 font-bold">243641</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">#</span>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="243641"
                      value={newAddrPinCode}
                      onChange={(e) => setNewAddrPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-6 pr-2.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold font-mono shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={!newAddrStreet.trim()}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700 disabled:from-zinc-200 disabled:to-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Delivery Address</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
