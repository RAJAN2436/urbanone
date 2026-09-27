import React, { useState } from 'react';
import { useRider } from '../context/RiderContext';
import {
  Store,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  ExternalLink,
  Navigation2
} from 'lucide-react';

export const ActiveDeliveryCard = ({ order: propOrder }) => {
  const {
    activeOrder,
    arriveAtMerchant,
    confirmPickup,
    startDelivery,
    verifyAndDeliver
  } = useRider();

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [itemsChecked, setItemsChecked] = useState({});

  const order = propOrder || activeOrder;
  if (!order) return null;

  const status = order.orderStatus; // 'rider_assigned' | 'at_merchant' | 'picked_up' | 'on_the_way'

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    const res = await verifyAndDeliver(order.id, enteredOtp);
    setIsVerifying(false);
    if (res?.success) {
      setOtpModalOpen(false);
      setEnteredOtp('');
    }
  };

  const toggleItemCheck = (idx) => {
    setItemsChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allItemsChecked = (order.items || []).every((_, i) => itemsChecked[i]);

  return (
    <div className="space-y-4">
      {/* Main Delivery Task Card */}
      <div className="rider-card rider-card-active p-5 space-y-4 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-3xl">
        
        {/* Step Progress Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-orange-400">
              TASK: #{order.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-[#f97316] text-[10px] font-black uppercase tracking-wider">
              {status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Step Pill Indicators */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className={`p-2 rounded-xl border text-[11px] font-bold ${
              ['rider_assigned', 'at_merchant'].includes(status)
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}>
              1. Reach Kitchen
            </div>
            <div className={`p-2 rounded-xl border text-[11px] font-bold ${
              status === 'at_merchant'
                ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                : status === 'picked_up' || status === 'on_the_way'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}>
              2. Pickup Parcel
            </div>
            <div className={`p-2 rounded-xl border text-[11px] font-bold ${
              status === 'on_the_way'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}>
              3. Handover PIN
            </div>
          </div>
        </div>

        {/* Phase 1: Going to Merchant */}
        {status === 'rider_assigned' && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                <Store className="w-4 h-4" />
                <span>Navigate to Merchant Pickup</span>
              </div>
              <a
                href={`tel:${order.merchantPhone || '+91 98450 11223'}`}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Call Kitchen</span>
              </a>
            </div>

            <div>
              <div className="text-sm font-black text-white">{order.merchantName}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Clock Tower Chowk, Ushait Center (243641)</div>
            </div>

            <button
              onClick={() => arriveAtMerchant(order.id)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Store className="w-4 h-4" />
              <span>I Have Arrived at Merchant</span>
            </button>
          </div>
        )}

        {/* Phase 2: At Merchant / Pickup Checklist */}
        {status === 'at_merchant' && (
          <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xs">
                <PackageCheck className="w-4 h-4" />
                <span>Order Item Checklist</span>
              </div>
              <span className="text-[10px] text-zinc-400">Verify before packing</span>
            </div>

            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleItemCheck(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    itemsChecked[idx]
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      itemsChecked[idx] ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-zinc-700'
                    }`}>
                      {itemsChecked[idx] && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">{item.quantity}x {item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-400">₹{item.price}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                confirmPickup(order.id);
                startDelivery(order.id);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirm Pickup & Start Delivery</span>
            </button>
          </div>
        )}

        {/* Phase 3: Out for Delivery to Customer */}
        {['picked_up', 'on_the_way'].includes(status) && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Deliver to Customer</span>
              </div>
              <a
                href={`tel:${order.customerPhone || ''}`}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Call Customer</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-sm font-black text-white">{order.customerName}</div>
              <div className="text-xs text-orange-400 font-semibold">{order.deliveryAddress}</div>
            </div>

            {/* Google Maps Navigation Button for Customer Location */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress || order.customerAddress || 'Ushait 243641')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Navigation2 className="w-4 h-4" />
              <span>Open Customer Location in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* OTP Handover Verification Action */}
            <button
              onClick={() => setOtpModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>Arrived at Customer — Verify Delivery OTP</span>
            </button>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 4-DIGIT DELIVERY OTP HANDOVER MODAL */}
      {/* ========================================================= */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Customer Delivery OTP
              </h3>
              <p className="text-xs text-zinc-400">
                Ask the customer for the 4-digit PIN code displayed on their tracking screen.
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="••••"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-48 text-center py-3 rounded-2xl bg-zinc-950 border border-zinc-700 text-3xl font-mono font-black text-white tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 4 || isVerifying}
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveDeliveryCard;
