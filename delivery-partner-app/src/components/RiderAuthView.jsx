import React, { useState, useRef } from 'react';
import { useRider } from '../context/RiderContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Bike, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  LogOut,
  Settings
} from 'lucide-react';

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
];

export default function RiderAuthView() {
  const { 
    authRider, 
    loginRider, 
    registerRider, 
    logoutRider, 
    checkApprovalStatus, 
    showToast,
    serverUrl,
    updateServerUrl,
    resetServerUrl
  } = useRider();

  const [mode, setMode] = useState('register'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  // Server Connection Configuration
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(serverUrl || 'https://urbanone.onrender.com');
  const [testResult, setTestResult] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  const handleTestConnection = async () => {
    setTestingPing(true);
    setTestResult(null);
    try {
      const target = customUrlInput.trim().replace(/\/+$/, '');
      const t0 = Date.now();
      const res = await fetch(`${target}/api/health`, { method: 'GET' });
      const elapsed = Date.now() - t0;
      if (res.ok) {
        setTestResult({ ok: true, msg: `Online (${elapsed}ms) ✅` });
      } else {
        setTestResult({ ok: false, msg: `Server returned HTTP ${res.status}` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Unreachable: ${e.message}` });
    } finally {
      setTestingPing(false);
    }
  };

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [photo, setPhoto] = useState(PRESET_PHOTOS[0]);
  const [vehicleType, setVehicleType] = useState('Electric Scooter (EV Pro)');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const { uploadImage, uploading: photoUploading } = useCloudinaryUpload();

  // Handle Photo File Upload with Cloudinary
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('File Too Large', 'Please upload a photo smaller than 8MB', 'error');
        return;
      }
      showToast('Uploading Photo... ☁️', 'Saving photo to Cloudinary CDN', 'info');
      const url = await uploadImage(file, 'kalsen-platform/riders');
      if (url) {
        setPhoto(url);
        showToast('Photo Uploaded! ✅', 'Profile photo saved to Cloudinary', 'success');
      } else {
        showToast('Upload Failed', 'Could not upload photo to Cloudinary', 'error');
      }
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password || !drivingLicenseNumber.trim()) {
      showToast('Missing Fields', 'Please complete all required fields including Driving License', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await registerRider({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
      photo,
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase()
    });
    setIsSubmitting(false);

    if (result?.success) {
      showToast('Application Sent! 📋', 'Waiting for Kalsen Admin approval', 'success');
    } else if (result?.message?.toLowerCase().includes('already exists')) {
      showToast('Account Exists 🔑', 'You already have an account! Please sign in with your password.', 'info');
      setLoginIdentifier(phone.trim() || email.trim());
      setMode('login');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      showToast('Missing Credentials', 'Please enter your mobile/email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await loginRider(loginIdentifier.trim(), loginPassword);
    setIsSubmitting(false);

    if (!result?.success) {
      showToast('Login Failed', result?.message || 'Invalid credentials', 'error');
    }
  };

  // Manual status check for pending approval
  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    const res = await checkApprovalStatus();
    setIsRefreshing(false);

    if (res?.rider?.approvalStatus === 'approved' || res?.rider?.kycVerified) {
      showToast('Approved! 🎉', 'Your application is approved. Welcome to the fleet!', 'success');
    } else {
      showToast('Still Pending', 'Application is under review by Kalsen Fleet Admin', 'info');
    }
  };

  // =========================================================================
  // VIEW: PENDING ADMIN APPROVAL SCREEN
  // =========================================================================
  if (authRider && (authRider.approvalStatus === 'pending' || (!authRider.kycVerified && authRider.approvalStatus !== 'approved'))) {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 text-center bg-zinc-950 text-white min-h-full relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 pt-2">
          {/* Pending Animated Shield Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 relative z-10">
              <Clock className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-amber-500/40">
              ⏳ Awaiting Admin Approval
            </div>
            <h2 className="text-xl font-black text-white font-['Outfit']">
              Application Under Review
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Your registration request and Driving License have been sent to the Kalsen Fleet Admin.
            </p>
          </div>

          {/* Rider Details Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-800 flex-shrink-0">
                <img 
                  src={authRider.photo || PRESET_PHOTOS[0]} 
                  alt={authRider.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-white truncate">{authRider.name}</h4>
                <p className="text-xs text-zinc-400 truncate">{authRider.phone}</p>
                <span className="text-[10px] text-amber-400 font-mono block">ID: #{authRider.id}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Driving License:</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  {authRider.drivingLicenseNumber || 'UP-24-2023-DL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Registered Vehicle:</span>
                <span className="font-bold text-zinc-300">
                  {authRider.vehicleNumber || 'Pending Details'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Dispatch Status:</span>
                <span className="font-bold text-amber-400">Duty switch locked</span>
              </div>
            </div>
          </div>

          {/* Real-time Status Notice */}
          <p className="text-[11px] text-zinc-400 leading-tight">
            💡 <strong className="text-zinc-300">Instant Unlock:</strong> Once the admin clicks approve in the Admin Portal, this screen will automatically unlock.
          </p>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="space-y-2 pt-4 pb-2">
          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Status...' : 'Check Approval Status'}</span>
          </button>

          <button
            onClick={logoutRider}
            className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Back to Login / Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: LOGIN & REGISTER AUTH FORM
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col w-full bg-white text-zinc-900 min-h-full">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white p-6 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/30">
            K
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight uppercase">Kalsen Partner Fleet</h1>
            <p className="text-[11px] text-zinc-400">Hyperlocal Delivery Network • Ushait</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 mt-2">
          {mode === 'register' 
            ? 'Register with your driving license to join our electric delivery fleet.'
            : 'Sign in to access your dispatch routes, live map, and earnings.'}
        </p>

        {/* Dual Tab Toggle Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-800/80 rounded-2xl mt-4 border border-zinc-700">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register Partner
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Content Body (Full Height) */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {mode === 'register' ? (
            /* ======================================================= */
            /* REGISTER FORM (Name, Phone, Email, Password, DL, Photo) */
            /* ======================================================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Photo Selector & Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                  Profile Photo *
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500/60 bg-zinc-100 flex-shrink-0 shadow-md">
                    <img src={photo} alt="Rider Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Upload custom photo"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-zinc-700 block mb-1">
                      Choose preset or upload:
                    </span>
                    <div className="flex items-center gap-1.5 mb-2">
                      {PRESET_PHOTOS.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPhoto(src)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            photo === src ? 'border-orange-500 scale-105 shadow-sm' : 'border-zinc-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={src} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" /> {photoUploading ? 'Uploading to Cloudinary...' : 'Upload to Cloudinary'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Mobile Number & Email (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="rider@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Driving License Number (Crucial Field for Admin Approval) */}
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-orange-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>Driving License Number (DL) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                    Admin Verified
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. UP24-2023-0091824"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-orange-300 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <p className="text-[10px] text-zinc-500">
                  Enter your official commercial/transport driving license number for admin KYC.
                </p>
              </div>

              {/* Vehicle Number Plate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    License Plate (RC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UP-24-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-800 placeholder:font-sans placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isSubmitting ? 'Submitting to Admin...' : 'Send Request to Admin for Approval'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Sign In to Fleet
                </button>
              </p>
            </form>
          ) : (
            /* ======================================================= */
            /* LOGIN FORM (Full Height Mobile Display) */
            /* ======================================================= */
            <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col justify-between min-h-[360px]">
              <div className="space-y-4 pt-1">
                <div>
                  <h2 className="text-base font-extrabold text-zinc-900 font-['Outfit']">
                    Welcome Back, Partner!
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Sign in with your mobile number or email to access dispatch.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210 or rider@gmail.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-300 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
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

                {/* Quick Info Badge */}
                <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/70 flex items-center gap-2.5 mt-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <p className="text-[11px] text-orange-950 font-medium leading-snug">
                    Instant sync with Ushait live customer and kitchen orders.
                  </p>
                </div>
              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="space-y-3 pt-6 pb-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Verifying...' : 'Sign In to Partner Fleet'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    New delivery partner? Register with Driving License
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Server Connection Status & Config for Mobile Devices */}
          <div className="mt-4 pt-3 border-t border-zinc-200/80 text-center">
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-[10px] font-bold text-zinc-600 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Server: {serverUrl?.replace('http://', '').replace('https://', '')}</span>
              <Settings className="w-3 h-3 text-zinc-400 ml-1" />
            </button>

            {showServerConfig && (
              <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                  <span>Backend Server URL</span>
                  <button 
                    type="button" 
                    onClick={resetServerUrl} 
                    className="text-orange-600 text-[10px] hover:underline cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://urbanone.onrender.com"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 text-xs font-mono bg-white"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={testingPing}
                    onClick={handleTestConnection}
                    className="flex-1 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {testingPing ? 'Pinging...' : 'Test Connection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateServerUrl(customUrlInput)}
                    className="flex-1 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Save & Connect
                  </button>
                </div>
                {testResult && (
                  <p className={`text-[10px] font-bold pt-0.5 ${testResult.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {testResult.msg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
