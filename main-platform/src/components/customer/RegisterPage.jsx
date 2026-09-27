import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UrbanLogo } from '../common/UrbanLogo';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  User,
  Mail,
  Lock,
  Gift,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Compass,
  AlertCircle,
  X,
  Phone,
  MapPin,
  Home
} from 'lucide-react';

export const RegisterPage = () => {
  const {
    register,
    setCustomerSubView,
    showToast,
    playSound,
    cart
  } = usePlatform();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('Main Market Road, Near Clock Tower');
  const [pinCode, setPinCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('URBAN50');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Selector Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Email & Password Registration with 1-time complete details
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for order delivery & live SMS');
      return;
    }

    if (!street.trim() || street.trim().length < 4) {
      setErrorMsg('Please enter your delivery street / house address in Ushait');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and a password');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: cleanPhone,
        street: street.trim(),
        landmark: landmark.trim(),
        pinCode: pinCode.trim(),
        referralCode: referralCode
      });

      setIsLoading(false);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Register with completed profile directly so user is NEVER asked again
      register({
        ...res.user,
        phone: `+91 ${cleanPhone}`,
        addresses: [{
          id: `a-${Date.now()}`,
          tag: 'Home',
          street: street.trim(),
          landmark: landmark.trim(),
          pinCode: pinCode.trim(),
          coords: { x: 42, y: 42 }
        }],
        profileCompleted: true,
        bonusApplied: true
      });

      playSound('success');
      showToast('Account Created! 🎉', 'Welcome to UrbanOne! Profile completed & ₹150 welcome bonus credited.', 'success');
      if (cart?.items?.length > 0) {
        setCustomerSubView('cart');
      } else {
        setCustomerSubView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsLoading(false);
      playSound('ding');
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      showToast('Registration Error', err.message || 'Could not register account', 'error');
    }
  };

  // Handle Google Sign Up / Account Select
  const handleGoogleSelect = async (selectedEmail, selectedName, avatarUrl) => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await api.googleAuth({
        email: selectedEmail.trim().toLowerCase(),
        name: selectedName || selectedEmail.split('@')[0],
        googleId: `google_${Date.now()}`,
        avatar: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`
      });

      setIsGoogleLoading(false);
      setIsGoogleModalOpen(false);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      register(res.user);

      playSound('success');
      showToast(
        'Google Account Linked! 🎉',
        res.isNew ? 'Account created! Please complete your profile.' : `Welcome back, ${res.user.name}!`,
        'success'
      );
      if (cart?.items?.length > 0) {
        setCustomerSubView('cart');
      } else {
        setCustomerSubView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsGoogleLoading(false);
      playSound('ding');
      setErrorMsg(err.message || 'Google sign up failed');
      showToast('Google Sign Up Error', err.message || 'Could not authenticate with Google', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div
            onClick={() => setCustomerSubView('landing')}
            className="cursor-pointer inline-block"
            title="UrbanOne - Landing Page"
          >
            <UrbanLogo size="lg" showSubtitle={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit'] tracking-tight pt-2">
            Create Foodie Account
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium">
            Join 50,000+ happy foodies in Ushait & get ₹150 instant bonus
          </p>
        </div>

        {/* Card Form */}
        <div className="clean-card p-6 sm:p-8 space-y-6 shadow-xl border border-zinc-200">
          
          {/* Welcome Promo Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#ea580c] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <Gift className="w-5 h-5 text-amber-200 flex-shrink-0 animate-bounce" />
              <div>
                <div className="text-xs font-black">₹150 Welcome Credit Applied</div>
                <div className="text-[10px] text-orange-100">Code: URBAN50 • Valid on your first 3 orders</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white font-black text-[10px] backdrop-blur-sm">
              NEW FOODIE
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GOOGLE SIGN UP BUTTON */}
          {/* ========================================================================= */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-800 font-extrabold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-3 group hover:shadow-md"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign Up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider absolute">
              or sign up with email
            </span>
          </div>

          {/* ========================================================================= */}
          {/* EMAIL SIGN UP FORM */}
          {/* ========================================================================= */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Full Name <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Mobile Number (For Delivery & SMS) <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-16 pr-10 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium font-mono"
                />
                {phoneNumber.length === 10 && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold flex items-center">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Street Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Delivery Address (House / Flat / Street) <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-3" />
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flat 302, Green Apartment, Main Market Road, Ushait"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium resize-none"
                />
              </div>
            </div>

            {/* Locality / Landmark */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Locality / Landmark in Ushait
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-bold cursor-pointer"
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

            {/* PIN Code + Email row */}
            <div className="grid grid-cols-2 gap-3">
              {/* PIN Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  Area PIN Code <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">#</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 224001"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-zinc-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Blank placeholder to keep grid layout */}
              <div />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral / Promo Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Referral or Welcome Code</label>
              <div className="relative">
                <Gift className="w-4 h-4 text-[#f97316] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="URBAN50"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm text-zinc-900 font-mono font-black focus:outline-none focus:border-orange-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                  +₹150 Applied
                </span>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-2.5 pt-1 text-xs text-zinc-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
              />
              <span>
                I agree to the <span className="text-[#ea580c] font-bold">Terms of Service</span>, <span className="text-[#ea580c] font-bold">Privacy Policy</span>, and receiving order delivery updates in Ushait.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms || !fullName.trim() || phoneNumber.length < 10 || !street.trim() || !email.trim() || password.length < 4}
              className="w-full py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{isLoading ? 'Creating Your Account...' : 'Create Account & Claim ₹150'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </form>

          {/* Switch to Sign In */}
          <div className="pt-2 border-t border-zinc-200 text-center space-y-3">
            <p className="text-xs text-zinc-600 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setCustomerSubView('login')}
                className="font-black text-[#ea580c] hover:underline cursor-pointer"
              >
                Sign In Instead
              </button>
            </p>

            <button
              type="button"
              onClick={() => setCustomerSubView('home')}
              className="text-xs text-zinc-500 hover:text-zinc-900 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#f97316]" />
              <span>Back to Home</span>
            </button>
          </div>

        </div>

        {/* Trust Guarantees */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Escrow Protection</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Zero Platform Fees on 1st Order</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT SELECTOR MODAL */}
      {/* ========================================================================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-zinc-950 font-['Outfit']">
                    Sign up with Google
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">to register for UrbanOne Food</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Select Accounts */}
            <div className="p-4 space-y-2">
              <p className="text-[11px] font-bold text-zinc-500 px-1">Choose an account:</p>
              
              <button
                type="button"
                onClick={() => handleGoogleSelect('aaditya.sharma@gmail.com', 'Aaditya Sharma')}
                className="w-full p-3 rounded-2xl border border-zinc-200 hover:border-orange-400 hover:bg-orange-50/50 flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center flex-shrink-0">
                  AS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-900 truncate">Aaditya Sharma</div>
                  <div className="text-[11px] text-zinc-500 truncate">aaditya.sharma@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSelect('priya.patel@gmail.com', 'Priya Patel')}
                className="w-full p-3 rounded-2xl border border-zinc-200 hover:border-orange-400 hover:bg-orange-50/50 flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 font-black text-sm flex items-center justify-center flex-shrink-0">
                  PP
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-900 truncate">Priya Patel</div>
                  <div className="text-[11px] text-zinc-500 truncate">priya.patel@gmail.com</div>
                </div>
              </button>

              {/* Or enter custom Google Gmail */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <p className="text-[11px] font-bold text-zinc-500 px-1">Or use your Gmail:</p>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-medium"
                />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 font-medium"
                />
                <button
                  type="button"
                  disabled={!googleCustomEmail.trim() || isGoogleLoading}
                  onClick={() => handleGoogleSelect(googleCustomEmail, googleCustomName)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black disabled:bg-zinc-200 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isGoogleLoading ? 'Registering...' : 'Sign Up with This Account'}</span>
                </button>
              </div>

            </div>

            <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
              <span className="text-[10px] text-zinc-400">Google OAuth 2.0 Secure Session</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
