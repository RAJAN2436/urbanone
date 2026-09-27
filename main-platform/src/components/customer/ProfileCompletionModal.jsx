import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import confetti from 'canvas-confetti';
import {
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Home,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export const ProfileCompletionModal = () => {
  const { customer, completeProfile, dismissProfileModal, showToast, playSound } = usePlatform();

  const [fullName, setFullName] = useState(customer?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(
    customer?.phone ? customer.phone.replace(/\D/g, '').slice(-10) : ''
  );
  const [address, setAddress] = useState(customer?.addresses?.[0]?.street || '');
  const [landmark, setLandmark] = useState(customer?.addresses?.[0]?.landmark || 'Main Market Road, Near Clock Tower');
  const [pinCode, setPinCode] = useState(customer?.addresses?.[0]?.pinCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep form fields synced if customer updates
  useEffect(() => {
    if (customer?.name && !fullName) {
      setFullName(customer.name);
    }
    if (customer?.phone && !phoneNumber) {
      setPhoneNumber(customer.phone.replace(/\D/g, '').slice(-10));
    }
    if (customer?.addresses?.[0]?.street && !address) {
      setAddress(customer.addresses[0].street);
    }
    if (customer?.addresses?.[0]?.landmark) {
      setLandmark(customer.addresses[0].landmark);
    }
    if (customer?.addresses?.[0]?.pinCode && !pinCode) {
      setPinCode(customer.addresses[0].pinCode);
    }
  }, [customer]);

  const handleDismiss = () => {
    if (dismissProfileModal) {
      dismissProfileModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!address.trim() || address.trim().length < 4) {
      setErrorMsg('Please enter your house / street address in Ushait');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile({
        name: fullName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        landmark: landmark.trim(),
        pinCode: pinCode.trim()
      });

      setIsSubmitting(false);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      playSound('success');
      showToast(
        'Profile Completed! 🎉',
        'Your mobile number and delivery address have been securely saved.',
        'success'
      );

      if (dismissProfileModal) {
        dismissProfileModal();
      }
    } catch (err) {
      setIsSubmitting(false);
      playSound('ding');
      setErrorMsg(err.message || 'Failed to complete profile. Please try again.');
      showToast('Error', err.message || 'Could not save profile', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-auto relative animate-scaleUp">

        {/* Top Header Banner - Compact & Bright White Title */}
        <div className="bg-gradient-to-r from-orange-500 via-[#ea580c] to-[#c2410c] px-5 py-3.5 text-center relative flex-shrink-0">
          {/* Close / Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close modal"
            className="absolute right-3.5 top-3.5 w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-white mb-1">
            <span>One-Time Setup</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white font-['Outfit'] tracking-tight drop-shadow-sm">
            Complete Your Foodie Details
          </h2>
          <p className="text-[11px] sm:text-xs text-orange-100 mt-0.5 max-w-xs mx-auto">
            Required once for order delivery & live SMS notifications in Ushait
          </p>
        </div>

        {/* Form Body - Compact & Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 text-left">

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold text-zinc-700">
                Full Name <span className="text-orange-600">*</span>
              </label>
              {customer?.email && (
                <span className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                  {customer.email}
                </span>
              )}
            </div>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Rohan Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-700">
              Mobile Number (For Delivery & SMS) <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-14 pr-9 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-bold font-mono"
              />
              {phoneNumber.length === 10 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold flex items-center">
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {/* Delivery Street Address */}
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-700">
              Delivery Address (House / Flat / Street) <span className="text-orange-600">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-orange-500 absolute left-3 top-2.5" />
              <textarea
                required
                rows={2}
                placeholder="e.g. Flat 302, Green Apartment, Main Market Road, Ushait"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* Pin Code */}
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-700">
              Area PIN Code <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">#</span>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 224001"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-bold font-mono"
              />
              {pinCode.length === 6 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {/* Landmark / Locality Select */}
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-700">
              Locality / Landmark in Ushait
            </label>
            <div className="relative">
              <Home className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-bold cursor-pointer"
              >
                <option value="Main Market Road, Near Clock Tower">Main Market Road, Near Clock Tower</option>
                <option value="Station Road Commercial Complex">Station Road Commercial Complex</option>
                <option value="Mandi Gate & Sabzi Bazar">Mandi Gate & Sabzi Bazar</option>
                <option value="Civil Lines Residential Area">Civil Lines Residential Area</option>
                <option value="Near Ushait Government Hospital">Near Ushait Government Hospital</option>
                <option value="Urban Central Hub, Ushait">Urban Central Hub, Ushait</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1.5 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || phoneNumber.length < 10 || !address.trim()}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Start Ordering'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Skip Option */}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 text-center text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              Skip for now (I'll add address at checkout)
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-1 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <span>Encrypted • Filled only once per account</span>
          </div>

        </form>

      </div>
    </div>
  );
};
