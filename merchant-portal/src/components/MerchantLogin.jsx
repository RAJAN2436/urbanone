import React, { useState } from 'react';
import { useMerchant } from '../context/MerchantContext';
import {
  Store,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  ChefHat,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const MerchantLogin = () => {
  const { loginMerchant, registerMerchantAccount } = useMerchant();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('Food');
  const [regCuisine, setRegCuisine] = useState('');
  const [regAddress, setRegAddress] = useState('Main Market Road, Ushait');
  const [regCostForTwo, setRegCostForTwo] = useState('₹450');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) return;

    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginMerchant(loginUsername.trim(), loginPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPassword) return;

    setErrorMessage(null);
    setIsLoading(true);
    try {
      await registerMerchantAccount({
        name: regName.trim(),
        username: regUsername.trim() || regName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: regPassword,
        phone: regPhone.trim(),
        category: regCategory,
        cuisine: regCuisine.trim() || (regCategory === 'Food' ? 'North Indian, Street Food' : regCategory),
        address: regAddress.trim(),
        costForTwo: regCostForTwo
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Background Decor Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-orange-400/10 via-amber-300/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative z-10 max-w-md w-full clean-card p-6 sm:p-8 bg-white border border-zinc-200/90 shadow-2xl rounded-3xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-[#ea580c] text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-orange-500/25">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit'] tracking-tight">
              Urban<span className="text-[#f97316]">Partner</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Merchant OS • Kitchen & Store Management Portal
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-zinc-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-zinc-950 shadow-sm font-extrabold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Sign In with Password
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-zinc-950 shadow-sm font-extrabold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Register New Store
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold text-zinc-700">
            <div>
              <label className="block mb-1.5 text-zinc-600">Username, Email, or Store Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. royalbiryani or store email"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full clean-input pr-3.5 py-3 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-600">Password</label>
                <span className="text-[11px] text-zinc-400 font-normal">Default: merchant123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  className="w-full clean-input py-3 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium focus:border-orange-500"
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

            <button
              type="submit"
              disabled={isLoading || !loginUsername.trim() || !loginPassword}
              className="w-full btn-primary py-3 rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating in MongoDB...</span>
              ) : (
                <>
                  <span>Sign In to Merchant OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-semibold text-zinc-700">
            <div>
              <label className="block mb-1 text-zinc-600">Store / Restaurant Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ushait Biryani Palace"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-zinc-600">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ushaitbiryani"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-zinc-600">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-zinc-600">Category *</label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full clean-input px-3 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                >
                  <option value="Food">Food / Restaurant</option>
                  <option value="Grocery">Grocery & Mart</option>
                  <option value="Bakery">Bakery & Sweets</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-zinc-600">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-zinc-600">Cuisine / Speciality</label>
              <input
                type="text"
                placeholder="e.g. Mughlai, Kebabs, Rolls"
                value={regCuisine}
                onChange={(e) => setRegCuisine(e.target.value)}
                className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block mb-1 text-zinc-600">Store Address in Ushait</label>
              <input
                type="text"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !regName.trim() || !regPassword}
              className="w-full btn-primary py-3 rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Registering Store in MongoDB...</span>
              ) : (
                <>
                  <span>🚀 Launch Store & Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Badge */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured via MongoDB Password Hashing (SHA-256)</span>
        </div>

      </div>

    </div>
  );
};
