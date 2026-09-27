import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { isOrderOwnedByCustomer } from '../../utils/orderOwnership';
import {
  ArrowLeft,
  CheckCircle,
  Bike,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Send,
  MapPin,
  X,
  Package,
  Navigation2
} from 'lucide-react';

export const OrderTrackingView = () => {
  const {
    customer,
    activeTrackingOrderId,
    clearTrackingData,
    orders,
    merchants,
    riders,
    setCustomerSubView,
    sendChatMessage
  } = usePlatform();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTags, setReviewTags] = useState(['Hot & Fresh', 'Fast Delivery']);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Filter orders strictly belonging to current logged-in customer
  const userOrders = Array.isArray(orders)
    ? orders.filter(o => isOrderOwnedByCustomer(o, customer))
    : [];

  // Only track the designated order or user's active in-progress order
  const order = (activeTrackingOrderId ? userOrders.find(o => o.id === activeTrackingOrderId) : null)
    || userOrders.find(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const merchant = merchants.find(m => m.id === order?.merchantId) || merchants[0];
  const rider = riders.find(r => r.id === order?.riderId || (order?.riderName && r.name && r.name.toLowerCase().includes(order.riderName.toLowerCase()))) || riders[0];

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-950 font-['Outfit']">No Active Deliveries</h3>
        <p className="text-xs text-zinc-500 font-medium">
          All orders have been delivered! Ready to explore artisan dishes or groceries?
        </p>
        <button
          onClick={() => {
            clearTrackingData();
            setCustomerSubView('home');
          }}
          className="btn-orange-primary text-xs font-bold py-3 px-6 shadow-md"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  // Stepper milestones
  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Received' },
    { key: 'accepted', label: 'Confirmed', desc: 'Kitchen accepted' },
    { key: 'preparing', label: 'Cooking', desc: 'Chef preparing' },
    { key: 'picked_up', label: 'On Route', desc: 'Rider picked up' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'placed': return 0;
      case 'accepted': return 1;
      case 'preparing':
      case 'ready_for_pickup':
      case 'rider_assigned':
      case 'at_merchant': return 2;
      case 'picked_up':
      case 'on_the_way': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(order.id, 'customer', chatInput);
    setChatInput('');
  };

  const handleQuickChat = (text) => {
    sendChatMessage(order.id, 'customer', text);
  };

  const toggleReviewTag = (tag) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(reviewTags.filter(t => t !== tag));
    } else {
      setReviewTags([...reviewTags, tag]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 md:pb-20 px-3 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setCustomerSubView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="btn-light-secondary text-xs font-bold py-2 px-3.5 flex items-center gap-2 cursor-pointer shadow-sm hover:border-orange-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Order:</span>
          <span className="text-xs font-mono font-bold text-[#ea580c] px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200">
            #{order.id}
          </span>
          {order.orderStatus === 'delivered' && (
            <button
              onClick={() => {
                clearTrackingData();
                setCustomerSubView('home');
              }}
              className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1"
              title="Clear Tracking & Return Home"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Clear Track Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Status Banner */}
      <div className={`rounded-3xl p-5 border shadow-sm ${
        order.orderStatus === 'delivered'
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          : 'bg-gradient-to-r from-orange-50 via-white to-amber-50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              order.orderStatus === 'delivered' ? 'text-emerald-600' : 'text-[#f97316]'
            }`}>
              {order.orderStatus === 'delivered' ? '✅ Delivered' : '🔴 Live Order'}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 mt-0.5 font-['Outfit']">
              {order.orderStatus === 'delivered'
                ? 'Order Delivered Successfully 🎉'
                : order.orderStatus === 'picked_up' || order.orderStatus === 'on_the_way'
                ? 'Rider is on the way to you 🛵'
                : order.orderStatus === 'accepted' || order.orderStatus === 'preparing'
                ? 'Kitchen is preparing your order 👨‍🍳'
                : order.orderStatus === 'rider_assigned' || order.orderStatus === 'at_merchant'
                ? 'Rider heading to restaurant 🛵'
                : 'Order received by restaurant ⏳'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
              Delivering to: <span className="text-zinc-900 font-bold ml-1">{order.customerAddress}</span>
            </p>
          </div>

          {order.orderStatus !== 'delivered' && (
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-orange-300 text-center flex-shrink-0 shadow-md">
              <div className="text-[10px] font-bold text-[#ea580c] uppercase">ETA</div>
              <div className="text-xl font-black text-zinc-950 font-['Outfit']">~{order.etaMinutes || 10} min</div>
            </div>
          )}
        </div>
      </div>

      {/* Order Progress Stepper */}
      <div className="rounded-3xl bg-white border border-zinc-200 shadow-sm p-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Order Progress</h3>
        <div className="grid grid-cols-5 gap-1 relative">
          {/* Background progress line */}
          <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-zinc-100 z-0">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCurrent
                    ? 'bg-[#f97316] text-white ring-4 ring-orange-500/30 shadow-md animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-zinc-400 border border-zinc-200'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[9px] font-bold ${isCompleted ? 'text-zinc-950' : 'text-zinc-400'}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-zinc-400 hidden md:block">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OTP & Rider Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Secure Delivery OTP Box */}
        <div className="md:col-span-5 p-5 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-orange-50 border border-orange-300 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#f97316]" />
              <span>Delivery PIN</span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] font-bold uppercase">
              Show to Rider
            </span>
          </div>

          <div className="text-center py-4">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
              Your 4-Digit Secure PIN
            </div>
            <div className="text-5xl font-black font-mono tracking-widest text-[#f97316]">
              {order.deliveryOtp || '----'}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium mt-3">
              Share with rider at handover to confirm delivery
            </p>
          </div>
        </div>

        {/* Assigned Rider Contact Card */}
        <div className="md:col-span-7 p-5 rounded-3xl bg-white border border-zinc-200 flex flex-col justify-between space-y-4 shadow-sm">
          {order.riderName && ['picked_up', 'on_the_way', 'delivered'].includes(order.orderStatus) ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-100 shadow-sm bg-zinc-100 flex-shrink-0">
                    <img
                      src={rider?.photo || order.riderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={order.riderName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider">Your Rider</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <h4 className="text-sm font-extrabold text-zinc-950">{order.riderName}</h4>
                      <span className="flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c]">
                        <Star className="w-3 h-3 fill-current text-[#f97316]" /> {rider?.rating || '5.0'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                      {rider?.vehicleType || 'Electric Scooter'} • {order.riderVehicleNumber || rider?.vehicleNumber || ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${order.riderPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] text-xs font-bold transition-colors shadow-sm border border-orange-200"
                    title="Call Rider"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors shadow-sm relative"
                    title="Chat with Rider"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>Chat</span>
                    {order.messages && order.messages.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#f97316] absolute -top-0.5 -right-0.5 animate-ping" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium flex items-center gap-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-500" />
                  {order.orderStatus === 'delivered' ? 'Delivery complete' : 'En route to you'}
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {order.orderStatus === 'delivered' ? 'Done' : 'Live'}
                </span>
              </div>
            </>
          ) : order.orderStatus === 'rider_assigned' || order.orderStatus === 'at_merchant' ? (
            <div className="flex flex-col items-center justify-center py-5 space-y-3 text-center">
              <div className="relative w-14 h-14">
                <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                <Bike className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Rider heading to kitchen</p>
                <p className="text-[11px] text-zinc-500 mt-1">Rider details will appear once they pick up your order</p>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">
                Awaiting Pickup
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-5 space-y-2 text-center">
              <Bike className="w-10 h-10 text-zinc-200" />
              <p className="text-sm font-bold text-zinc-700">Delivery Partner</p>
              <p className="text-xs text-zinc-400">Will be assigned once food is ready</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#f97316]" />
            Items ({order.items.length})
          </h4>
          <span className="text-xs font-bold text-zinc-950">₹{order.grandTotal} • {order.paymentMethod}</span>
        </div>

        <div className="space-y-2 divide-y divide-zinc-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="pt-2 flex justify-between items-center text-xs">
              <span className="text-zinc-700">
                <span className="font-bold text-zinc-950">{item.quantity}x</span> {item.name}
              </span>
              <span className="font-semibold text-zinc-500">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-zinc-100 space-y-1.5">
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Delivery Fee</span><span>₹{order.deliveryFee}</span>
            </div>
          )}
          {order.taxes > 0 && (
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Taxes & Fees</span><span>₹{order.taxes}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span>Discount</span><span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-1 border-t border-zinc-100">
            <span>Total Paid</span>
            <span className="text-[#f97316]">₹{order.grandTotal}</span>
          </div>
        </div>

        {/* Post-Delivery Completed Banner */}
        {order.orderStatus === 'delivered' && (
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-0.5">
                <CheckCircle className="w-4 h-4" />
                <span>Delivery Completed</span>
              </div>
              <h5 className="text-sm font-extrabold text-zinc-950">Feast Delivered Successfully 🎉</h5>
              <p className="text-xs text-zinc-600 mt-0.5">Clear tracking data to reset live radar and return to home.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!reviewSubmitted && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn-orange-primary text-xs font-bold py-2 px-3.5 cursor-pointer"
                >
                  Rate Feast
                </button>
              )}
              <button
                onClick={() => {
                  clearTrackingData();
                  setCustomerSubView('home');
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Clear Track Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-App Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-zinc-200 shadow-2xl flex flex-col h-[85vh] sm:h-[520px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-orange-500 bg-zinc-100">
                  <img src={rider.photo} alt={rider.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950">{rider.name} (Rider)</h4>
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Route
                  </p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-zinc-400 hover:text-zinc-950 cursor-pointer p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
              <div className="text-center">
                <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                  Order #{order.id} Live Channel
                </span>
              </div>

              {order.messages && order.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                    msg.sender === 'customer'
                      ? 'bg-[#f97316] text-white rounded-br-none shadow-sm'
                      : 'bg-zinc-100 text-zinc-900 rounded-bl-none border border-zinc-200'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-75 block text-right mt-1 font-medium">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Canned Responses */}
            <div className="p-2 bg-zinc-50 border-t border-zinc-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['Please leave at gate', 'Calling you now', 'Ring bell once please', 'How far are you?'].map((quick, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleQuickChat(quick)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-[11px] text-zinc-700 hover:border-orange-400 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your rider..."
                className="flex-1 clean-input text-xs"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 space-y-4 animate-scale-up text-zinc-950 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-zinc-950 font-['Outfit']">Rate Your Feast</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-zinc-950 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="text-xs text-zinc-500 font-medium">Rate {merchant.name}</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-[#f97316] text-[#f97316]' : 'text-zinc-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 uppercase">What did you love?</label>
              <div className="flex flex-wrap gap-2">
                {['Hot & Fresh', 'Neat Packaging', 'Polite Rider', 'Fast Delivery', 'Super Tasty', 'Generous Portion'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleReviewTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      reviewTags.includes(tag)
                        ? 'bg-orange-50 text-[#ea580c] border-orange-300'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewSubmitted(true);
                clearTrackingData();
                setCustomerSubView('home');
              }}
              className="w-full btn-orange-primary text-xs font-bold py-3.5 cursor-pointer"
            >
              Submit Rating & Return Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
