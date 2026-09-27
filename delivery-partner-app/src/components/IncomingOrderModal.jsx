import React, { useState, useEffect } from 'react';
import { useRider } from '../context/RiderContext';
import {
  Zap,
  Store,
  MapPin,
  ArrowRight,
  X,
  Check
} from 'lucide-react';

export const IncomingOrderModal = () => {
  const { incomingOrder, acceptIncomingOrder, rejectIncomingOrder } = useRider();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!incomingOrder) return;
    setTimeLeft(30);
    setIsSubmitting(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          rejectIncomingOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOrder]);

  const handleAccept = async () => {
    if (isSubmitting || !incomingOrder?.id) return;
    setIsSubmitting(true);
    await acceptIncomingOrder(incomingOrder.id);
  };

  const handleReject = () => {
    if (isSubmitting) return;
    rejectIncomingOrder();
  };

  if (!incomingOrder) return null;

  const estimatedPayout = incomingOrder.deliveryFee || 45;
  const distanceKm = 1.4;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-orange-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top 30-Second Countdown Progress Bar */}
        <div className="w-full h-2 bg-zinc-800 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-[#ea580c] transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 font-black animate-bounce">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest">
                  New Order Request
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold">
                  {timeLeft}s
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white font-['Outfit']">
                {incomingOrder.id} • Express Delivery
              </h3>
            </div>
          </div>

          <button
            onClick={rejectIncomingOrder}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payout & Distance Banner */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Guaranteed Payout</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">₹{estimatedPayout}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">+ 100% Customer Tips</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Trip Distance</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{distanceKm} km</div>
            <div className="text-[10px] text-zinc-400 font-semibold">Within Ushait (243641)</div>
          </div>
        </div>

        {/* Route Details */}
        <div className="p-4 space-y-3">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">Pickup Restaurant</div>
              <div className="text-xs font-bold text-white truncate mt-0.5">
                {incomingOrder.merchantName || 'Urban Merchant'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {incomingOrder.pickupAddress || 'Clock Tower Chowk, Ushait (243641)'}
              </div>
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Customer Drop-off</div>
              <div className="text-xs font-bold text-white truncate mt-0.5">
                {incomingOrder.customerName || 'Customer'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {incomingOrder.deliveryAddress || 'Ushait Area'}
              </div>
            </div>
          </div>
        </div>

        {/* Accept / Decline Action Buttons */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-3">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className={`flex-1 py-3.5 rounded-2xl bg-zinc-800 text-zinc-300 font-black text-xs transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700 cursor-pointer active:scale-95'
            }`}
          >
            Pass ({timeLeft}s)
          </button>

          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className={`flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ea580c] text-white font-black text-xs shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'opacity-70 cursor-not-allowed scale-[0.98]'
                : 'hover:from-orange-600 hover:to-orange-700 cursor-pointer active:scale-95'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Accepting Delivery...' : `Accept Delivery (+₹${estimatedPayout})`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default IncomingOrderModal;
