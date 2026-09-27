import React, { useState } from 'react';
import { useMerchant } from '../context/MerchantContext';
import {
  ChefHat,
  Flame,
  PackageCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const KitchenDisplaySystem = () => {
  const {
    currentMerchant,
    orders,
    merchantAcceptOrder,
    merchantRejectOrder,
    merchantSetReadyForPickup
  } = useMerchant();

  const [prepTime, setPrepTime] = useState(18);

  const orderList = Array.isArray(orders) ? orders : [];
  const merchantOrders = currentMerchant ? orderList.filter(o => o.merchantId === currentMerchant.id) : [];
  const newOrders = merchantOrders.filter(o => o.orderStatus === 'placed');
  const inKitchenOrders = merchantOrders.filter(o => o.orderStatus === 'accepted' || o.orderStatus === 'preparing');
  const readyOrPickedOrders = merchantOrders.filter(o =>
    ['ready_for_pickup', 'rider_assigned', 'at_merchant', 'picked_up', 'on_the_way'].includes(o.orderStatus)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: NEW INCOMING ORDERS */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-ping" />
              <h3 className="text-sm font-black text-zinc-950">New Incoming</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c]">
              {newOrders.length} Orders
            </span>
          </div>

          {newOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-zinc-200 text-zinc-400 text-xs shadow-sm">
              No new pending orders right now.
            </div>
          ) : (
            newOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-white border-2 border-orange-300 shadow-lg shadow-orange-500/10 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-[#ea580c]">#{ord.id}</span>
                  <span className="text-xs font-extrabold text-zinc-950 font-mono">₹{ord.grandTotal}</span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {(ord.items || []).map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between text-xs">
                      <span className="text-zinc-900 font-bold">{item.quantity}x {item.name}</span>
                      <span className="text-zinc-500">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {ord.deliveryInstructions && (
                  <div className="p-2 rounded-xl bg-orange-50 text-[11px] text-[#ea580c] font-medium border border-orange-100">
                    Note: {ord.deliveryInstructions}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => merchantAcceptOrder(ord.id, prepTime)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    Accept ({prepTime}m)
                  </button>
                  <button
                    onClick={() => merchantRejectOrder(ord.id, 'Kitchen at capacity')}
                    className="px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer"
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
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-black text-zinc-950">Cooking & Prep</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {inKitchenOrders.length} Active
            </span>
          </div>

          {inKitchenOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-zinc-200 text-zinc-400 text-xs shadow-sm">
              Kitchen queue clear.
            </div>
          ) : (
            inKitchenOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-indigo-700">#{ord.id}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    ⏳ ~{ord.prepTimeRemaining || 12} min left
                  </span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {(ord.items || []).map((item, idx) => (
                    <div key={idx} className="py-1 flex justify-between text-xs">
                      <span className="text-zinc-800 font-medium">{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => merchantSetReadyForPickup(ord.id)}
                  className="btn-primary w-full py-2.5 text-xs font-black cursor-pointer"
                >
                  Food Ready for Pickup 📦
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUMN 3: PACKED & RIDER PICKUP */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-zinc-950">Packed / Picked Up</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {readyOrPickedOrders.length}
            </span>
          </div>

          {readyOrPickedOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-zinc-200 text-zinc-400 text-xs shadow-sm">
              No orders waiting for pickup.
            </div>
          ) : (
            readyOrPickedOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-emerald-700">#{ord.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-zinc-700 font-medium">Rider: {ord.riderName || 'Assigning rider...'}</div>
                <div className="text-zinc-500">Customer: {ord.customerName}</div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
