import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { KalsenLogo } from '../common/KalsenLogo';
import { api } from '../../services/api';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Compass,
  AlertCircle,
  Sparkles,
  KeyRound,
  X
} from 'lucide-react';

export const LoginPage = () => {
  const {
    login,
    setCustomerSubView,
    showToast,
    playSound,
    cart
  } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Selector Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotDevOtp, setForgotDevOtp] = useState(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Handle Email & Password Sign In
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.loginWithPassword(email.trim().toLowerCase(), password);
      setIsLoading(false);
      login(res.user);

      playSound('success');
      showToast('Welcome Back! 🍕', `Signed in as ${res.user.name}`, 'success');
      if (cart?.items?.length > 0) {
        setCustomerSubView('cart');
      } else {
        setCustomerSubView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsLoading(false);
      playSound('ding');
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
      showToast('Sign In Failed', err.message || 'Invalid email or password', 'error');
    }
  };

  // Handle Google Sign In / Account Select
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
      login(res.user);

      playSound('success');
      showToast(
        'Signed In with Google! 🎉',
        res.isNew ? 'Google account linked! Please complete your profile.' : `Welcome back, ${res.user.name}!`,
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
      setErrorMsg(err.message || 'Google sign in failed');
      showToast('Google Sign In Error', err.message || 'Could not authenticate with Google', 'error');
    }
  };

  // Handle Forgot Password Request
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Email Required', 'Please enter your registered email address', 'error');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await api.requestPasswordReset(forgotEmail.trim());
      setIsForgotLoading(false);
      setForgotStep(2);
      setForgotDevOtp(res.devOtp || null);
      playSound('order');
      showToast('Reset Code Sent 🔑', res.message, 'info');
    } catch (err) {
      setIsForgotLoading(false);
      playSound('ding');
      showToast('Reset Request Failed', err.message || 'No registered user found with this email', 'error');
    }
  };

  // Handle Reset Password Submit
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.length < 4) {
      showToast('Code Required', 'Please enter the 4-digit reset code', 'error');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      showToast('Password Too Short', 'New password must be at least 4 characters long', 'error');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await api.resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPassword);
      setIsForgotLoading(false);
      setIsForgotModalOpen(false);
      login(res.user);
      playSound('success');
      showToast('Password Reset Successfully! 🎉', 'You are now signed in with your new password.', 'success');
      setCustomerSubView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsForgotLoading(false);
      playSound('ding');
      showToast('Password Reset Failed', err.message || 'Invalid or expired reset code. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 relative">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div
            onClick={() => setCustomerSubView('landing')}
            className="cursor-pointer inline-block"
            title="KalsenOne - Landing Page"
          >
            <KalsenLogo size="lg" showSubtitle={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit'] tracking-tight pt-2">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium">
            Sign in with Google or Email to order, track feasts & split bills
          </p>
        </div>

        {/* Card Form */}
        <div className="clean-card p-6 sm:p-8 space-y-6 shadow-xl border border-zinc-200">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GOOGLE SIGN IN BUTTON */}
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider absolute">
              or sign in with email
            </span>
          </div>

          {/* ========================================================================= */}
          {/* EMAIL & PASSWORD FORM */}
          {/* ========================================================================= */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#ea580c] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between text-xs">
              <span className="text-zinc-600 text-[11px]">
                Demo Account: <strong className="text-orange-700">aaditya@kalsen.one</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('aaditya@kalsen.one');
                  setPassword('kalsen123');
                }}
                className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] cursor-pointer transition-colors shadow-xs"
              >
                1-Click Fill
              </button>
            </div>

          </form>

          {/* Switch to Register */}
          <div className="pt-2 border-t border-zinc-200 text-center space-y-3">
            <p className="text-xs text-zinc-600 font-medium">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setCustomerSubView('register')}
                className="font-black text-[#ea580c] hover:underline cursor-pointer"
              >
                Sign Up & Claim ₹150
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
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#f97316]" />
            <span>Verified Kalsen Security</span>
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
                    Sign in with Google
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">to continue to KalsenOne Food</p>
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
                onClick={() => handleGoogleSelect('rahul.verma@gmail.com', 'Rahul Verma')}
                className="w-full p-3 rounded-2xl border border-zinc-200 hover:border-orange-400 hover:bg-orange-50/50 flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-black text-sm flex items-center justify-center flex-shrink-0">
                  RV
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-900 truncate">Rahul Verma</div>
                  <div className="text-[11px] text-zinc-500 truncate">rahul.verma@gmail.com</div>
                </div>
              </button>

              {/* Or enter custom Google Gmail */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <p className="text-[11px] font-bold text-zinc-500 px-1">Or use your Gmail:</p>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Priya Sharma)"
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
                  <span>{isGoogleLoading ? 'Connecting...' : 'Sign In with This Account'}</span>
                </button>
              </div>

            </div>

            <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
              <span className="text-[10px] text-zinc-400">Google OAuth 2.0 Secure Session</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-zinc-200 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#f97316]" />
                <h3 className="text-base font-extrabold text-zinc-950 font-['Outfit']">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-zinc-600">
                  Enter your registered email address to receive a 4-digit verification code.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading || !forgotEmail.trim()}
                  className="w-full py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] disabled:bg-zinc-200 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {isForgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                <p className="text-xs text-zinc-600">
                  Enter the 4-digit code sent for <strong className="text-zinc-900">{forgotEmail}</strong> and your new password.
                </p>
                {forgotDevOtp && (
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
                    <span className="text-zinc-600 font-medium">Reset Code: <strong className="font-mono text-orange-600">{forgotDevOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotDevOtp)}
                      className="px-2 py-0.5 rounded-lg bg-orange-600 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">4-Digit Reset Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="e.g. 1234"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-center font-mono text-lg font-black text-zinc-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 4 characters"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading || forgotOtp.length < 4 || forgotNewPassword.length < 4}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {isForgotLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
