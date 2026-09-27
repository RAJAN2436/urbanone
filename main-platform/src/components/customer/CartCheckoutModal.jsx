import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { INITIAL_MERCHANTS } from '../../mockData';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Gift,
  Award,
  Wallet,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  X,
  Lock,
  LogIn
} from 'lucide-react';

export const CartCheckoutModal = () => {
  const {
    cart,
    setCart,
    merchants,
    customer,
    updateCartItemQuantity,
    clearCart,
    placeOrder,
    setCustomerSubView,
    promos,
    isAuthenticated,
    showToast
  } = usePlatform();

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay)');
  const [selectedTip, setSelectedTip] = useState(cart?.tip ?? 30);
  const [promoMessage, setPromoMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const safeMerchants = Array.isArray(merchants) && merchants.length > 0 ? merchants : INITIAL_MERCHANTS;
  const merchant = safeMerchants.find(m => m.id === cart?.merchantId) || safeMerchants[0] || INITIAL_MERCHANTS[0] || {};

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];

  // Bill Computations
  const itemTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const taxes = Math.round(itemTotal * 0.05); // 5% GST
  const deliveryFee = itemTotal > 400 || cart?.appliedPromo?.freeDelivery ? 0 : 35;

  let promoDiscount = 0;
  if (cart?.appliedPromo) {
    if (cart.appliedPromo.discountPercent) {
      promoDiscount = Math.min(
        Math.round(itemTotal * (cart.appliedPromo.discountPercent / 100)),
        cart.appliedPromo.maxDiscount || 999
      );
    } else if (cart.appliedPromo.discountAmount) {
      promoDiscount = cart.appliedPromo.discountAmount;
    } else if (cart.appliedPromo.freeDelivery) {
      promoDiscount = 35;
    }
  }

  const loyaltyPoints = customer?.loyaltyPoints || 0;
  const walletBalance = customer?.walletBalance ?? 0;
  const loyaltyDiscountValue = cart?.useLoyaltyPoints
    ? Math.min(Math.floor(loyaltyPoints * 0.25), itemTotal)
    : 0;

  const grandTotal = Math.max(0, itemTotal + taxes + deliveryFee + selectedTip - promoDiscount - loyaltyDiscountValue);

  const handleApplyPromo = (promo) => {
    if (itemTotal < promo.minOrder) {
      setPromoMessage({ type: 'error', text: `Min order ₹${promo.minOrder} required for ${promo.code}` });
      return;
    }
    setCart({ ...cart, appliedPromo: promo });
    setPromoMessage({ type: 'success', text: `Coupon ${promo.code} applied!` });
  };

  const handleRemovePromo = () => {
    setCart({ ...cart, appliedPromo: null });
    setPromoMessage(null);
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      showToast('Sign In Required', 'Please sign in or create an account to complete checkout and place your order.', 'warning');
      setCustomerSubView('login');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      placeOrder(paymentMethod);
      setIsProcessing(false);
    }, 1000);
  };

  const safeAddresses = Array.isArray(customer?.addresses) && customer.addresses.length > 0
    ? customer.addresses
    : [{ id: 'a1', tag: 'Home', street: 'Main Market Road, Ushait', landmark: 'Near Ushait Clock Tower' }];
  const selectedAddress = safeAddresses.find(a => a.id === customer?.selectedAddressId) || safeAddresses[0];

  const merchantImage = merchant.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80';
  const merchantName = merchant.name || 'Urban Partner Kitchen';
  const merchantAddress = (merchant.address || 'Ushait, UP').split(',')[0];
  const prepTime = (merchant.avgPrepTime || 20) + 10;

  if (cartItems.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#f97316] shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-950 font-['Outfit']">Your Cart is Empty</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
          Explore delicious artisan dishes and grocery essentials from top kitchens in Ushait.
        </p>
        <button
          onClick={() => setCustomerSubView('home')}
          className="btn-orange-primary text-xs font-bold"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-20 px-3 sm:px-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setCustomerSubView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="btn-light-secondary text-xs font-bold py-2 px-3.5 flex items-center gap-2 cursor-pointer shadow-sm hover:border-orange-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Ordering</span>
        </button>

        <button
          onClick={clearCart}
          className="btn-delete text-xs"
          title="Empty entire cart"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Sign-In Required Banner if User is Not Authenticated */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-zinc-950 font-['Outfit']">Sign In Required to Checkout</h4>
              <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                Please sign in or create an account to set your delivery address, receive live OTP tracking, and complete your order.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setCustomerSubView('login')}
              className="flex-1 sm:flex-initial btn-orange-primary text-xs font-bold py-2.5 px-4 shadow-md flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setCustomerSubView('register')}
              className="flex-1 sm:flex-initial btn-light-secondary text-xs font-bold py-2.5 px-4 flex items-center justify-center"
            >
              Register
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Items & Delivery Details */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Restaurant Header */}
          <div className="p-4 rounded-3xl bg-white border border-zinc-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-200">
                <img src={merchantImage} alt={merchantName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-950">{merchantName}</h3>
                <p className="text-[11px] text-zinc-500">{merchantAddress}</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200">
              ⚡ ~{prepTime} Mins
            </span>
          </div>

          {/* Cart Items List */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Order Items ({cartItems.length})
            </h4>

            <div className="divide-y divide-zinc-100">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 mt-1 ${
                      item.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-zinc-950">{item.name}</h5>
                      {item.customizations && (
                        <p className="text-[10px] text-[#ea580c] font-medium">{item.customizations}</p>
                      )}
                      <span className="text-xs font-bold text-zinc-500">₹{item.price} each</span>
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 border border-zinc-200">
                    <button
                      onClick={() => updateCartItemQuantity(idx, -1)}
                      className="text-zinc-600 hover:text-zinc-950 p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-zinc-950 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(idx, 1)}
                      className="text-[#f97316] hover:text-[#ea580c] p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-xs font-black text-zinc-950 w-14 text-right">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {isAuthenticated ? (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-950">
                  <MapPin className="w-4 h-4 text-[#f97316]" />
                  <span>Deliver to: {selectedAddress.tag}</span>
                </div>
                <span className="text-[11px] text-[#ea580c] font-bold cursor-pointer hover:underline">Change Address</span>
              </div>
              <p className="text-xs text-zinc-600">
                {selectedAddress.street}, {selectedAddress.landmark}
              </p>

              <input
                type="text"
                value={cart?.deliveryInstructions || ''}
                onChange={(e) => setCart({ ...cart, deliveryInstructions: e.target.value })}
                placeholder="Instructions for rider (e.g. Leave with guard, don't ring bell)..."
                className="w-full clean-input text-xs mt-2"
              />
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-orange-50/60 border border-orange-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-950">
                  <MapPin className="w-4 h-4 text-[#f97316]" />
                  <span>Delivery Address</span>
                </div>
                <button
                  onClick={() => setCustomerSubView('login')}
                  className="text-[11px] text-[#ea580c] font-bold hover:underline cursor-pointer"
                >
                  Sign In to Set
                </button>
              </div>
              <p className="text-xs text-zinc-600">
                Please sign in to choose or add your delivery address in Ushait.
              </p>
            </div>
          )}

          {/* Tip Delivery Partner */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-950">
                <HeartHandshake className="w-4 h-4 text-[#f97316]" />
                <span>Rider Tip (100% goes to your partner)</span>
              </div>
              {selectedTip > 0 && <span className="text-xs font-extrabold text-[#ea580c]">+₹{selectedTip}</span>}
            </div>

            <div className="flex items-center gap-2">
              {[0, 20, 30, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedTip(amount);
                    setCart({ ...cart, tip: amount });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedTip === amount
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {amount === 0 ? 'No Tip' : `₹${amount}`}
                </button>
              ))}
            </div>
          </div>
          </div>

  

        {/* Right Column: Promos & Bill */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Promo Coupons */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-950">
              <Tag className="w-4 h-4 text-[#f97316]" />
              <span>Available Coupons & Offers</span>
            </div>

            {cart.appliedPromo ? (
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-300 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-[#ea580c]">{cart.appliedPromo.code} Applied!</span>
                  <p className="text-[10px] text-zinc-600">Saving ₹{promoDiscount} on this feast</p>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="btn-remove text-[11px] py-1 px-2.5"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(promos) ? promos : []).length === 0 ? (
                  <p className="text-[11px] text-zinc-500 font-medium">No coupons active currently in database.</p>
                ) : (
                  (promos || []).map((promo) => (
                    <div
                      key={promo.code}
                      className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-orange-300 flex items-center justify-between text-xs transition-all"
                    >
                      <div>
                        <span className="font-mono font-bold text-zinc-950">{promo.code}</span>
                        <p className="text-[10px] text-zinc-500">{promo.description}</p>
                      </div>
                      <button
                        onClick={() => handleApplyPromo(promo)}
                        className="px-3 py-1 rounded-xl bg-orange-100 text-[#ea580c] hover:bg-orange-200 text-[11px] font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            {promoMessage && (
              <p className={`text-[11px] font-semibold ${promoMessage.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {promoMessage.text}
              </p>
            )}
          </div>

          {/* Loyalty Points */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-50 to-white border border-orange-200 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-950">
                <Award className="w-4 h-4 text-[#f97316]" />
                <span>Urban Rewards ({loyaltyPoints} pts)</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-bold">1 pt = ₹0.25</span>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-zinc-600">
                Redeem for <span className="font-bold text-zinc-950">₹{Math.floor(loyaltyPoints * 0.25)} discount</span>
              </p>
              <input
                type="checkbox"
                checked={Boolean(cart?.useLoyaltyPoints)}
                onChange={(e) => setCart({ ...cart, useLoyaltyPoints: e.target.checked })}
                className="w-4 h-4 accent-[#f97316] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-2.5 shadow-sm">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Payment Method
            </h4>

            <div className="space-y-2">
              {[
                { id: 'UPI (Google Pay)', label: 'UPI (Google Pay / PhonePe / Paytm)', icon: QrCode, subtitle: 'Fast 1-Click Payment' },
                { id: 'Urban Wallet', label: `Urban Wallet (Balance ₹${walletBalance})`, icon: Wallet, subtitle: 'Instant 1-Tap Checkout' },
                { id: 'Credit / Debit Card', label: 'Credit or Debit Card', icon: CreditCard, subtitle: 'Visa, Mastercard, RuPay' },
                { id: 'Cash on Delivery', label: 'Cash on Delivery / Pay at Gate', icon: Banknote, subtitle: 'Cash or UPI upon delivery' }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-orange-50/80 border-[#f97316] shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <pm.icon className={`w-4 h-4 ${paymentMethod === pm.id ? 'text-[#f97316]' : 'text-zinc-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-zinc-950">{pm.label}</div>
                      <div className="text-[10px] text-zinc-500">{pm.subtitle}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === pm.id ? 'border-[#f97316] bg-[#f97316]' : 'border-zinc-400'
                  }`}>
                    {paymentMethod === pm.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-md">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Bill Summary
            </h4>

            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>Item Total</span>
              <span className="text-zinc-950">₹{itemTotal}</span>
            </div>

            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>GST & Packaging</span>
              <span className="text-zinc-950">₹{taxes}</span>
            </div>

            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>Delivery Partner Fee</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
            </div>

            {selectedTip > 0 && (
              <div className="flex justify-between text-xs text-[#ea580c] font-bold">
                <span>Rider Tip</span>
                <span>+₹{selectedTip}</span>
              </div>
            )}

            {promoDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Promo Discount ({cart.appliedPromo?.code})</span>
                <span>-₹{promoDiscount}</span>
              </div>
            )}

            {loyaltyDiscountValue > 0 && (
              <div className="flex justify-between text-xs text-[#ea580c] font-bold">
                <span>Loyalty Discount</span>
                <span>-₹{loyaltyDiscountValue}</span>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-zinc-950">To Pay</span>
                <p className="text-[10px] text-emerald-600 font-bold">You saved ₹{promoDiscount + loyaltyDiscountValue} today</p>
              </div>
              <span className="text-2xl font-black text-[#f97316] font-['Outfit']">₹{grandTotal}</span>
            </div>

            {/* Place Order CTA */}
            {isAuthenticated ? (
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="mt-3 w-full py-4 rounded-2xl btn-orange-primary text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Secure Payment...' : `Pay ₹${grandTotal} & Place Order`}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  showToast('Sign In Required', 'Please sign in or create an account to complete checkout.', 'warning');
                  setCustomerSubView('login');
                }}
                className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to Checkout & Place Order</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
