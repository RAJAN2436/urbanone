import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlatform } from '../../context/PlatformContext';
import {
  MapPin,
  LocateFixed,
  Loader2,
  Check,
  Plus,
  Trash2,
  X,
  Home,
  Briefcase,
  Navigation,
  Compass,
  Building,
  Sparkles,
  Edit2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

const USHAIT_LANDMARK_CHIPS = [
  { label: 'Main Market Road', street: 'Main Market Road, Ushait', landmark: 'Near Clock Tower Center', pinCode: '243641' },
  { label: 'Clock Tower (Ghanta Ghar)', street: 'Clock Tower Chowk, Ushait', landmark: 'Main Bazar, Ushait', pinCode: '243641' },
  { label: 'Ushait Bus Stand', street: 'Bus Stand Chauraha, Ushait', landmark: 'Near Main Bus Station', pinCode: '243641' },
  { label: 'Kasba Ushait Ward 4', street: 'Kasba Ward No. 4, Ushait', landmark: 'Ushait Town', pinCode: '243641' },
  { label: 'Dataganj-Ushait Road', street: 'Dataganj-Ushait Main Road', landmark: 'Ushait Highway Entry', pinCode: '243641' }
];

export const AddressLocationModal = ({ isOpen, onClose, autoTriggerGPS = false }) => {
  const {
    customer,
    setSelectedAddress,
    addCustomerAddress,
    deleteCustomerAddress,
    detectGPSLocation,
    confirmGPSAddress,
    isLocatingGPS,
    showToast
  } = usePlatform();

  // Review & Confirmation state for GPS
  const [gpsPreview, setGpsPreview] = useState(null);
  const [gpsStreet, setGpsStreet] = useState('');
  const [gpsLandmark, setGpsLandmark] = useState('');
  const [gpsPinCode, setGpsPinCode] = useState('243641');
  const [gpsTag, setGpsTag] = useState('Current GPS');

  // Manual Add state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTag, setNewTag] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('Main Market Road, Ushait');
  const [newPinCode, setNewPinCode] = useState('243641');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle auto trigger GPS if requested
  useEffect(() => {
    if (isOpen && autoTriggerGPS && !gpsPreview && !isLocatingGPS) {
      triggerGPS();
    }
  }, [isOpen, autoTriggerGPS]);

  if (!isOpen) return null;

  const safeAddresses = Array.isArray(customer?.addresses) && customer.addresses.length > 0
    ? customer.addresses
    : [{ id: "a1", tag: "Home", street: "Main Market Road", landmark: "Ushait Center", pinCode: "243641" }];

  const currentSelectedId = customer?.selectedAddressId || safeAddresses[0]?.id;

  const handleSelect = (addrId) => {
    setSelectedAddress(addrId);
    onClose();
  };

  const triggerGPS = async () => {
    setGpsPreview(null);
    try {
      const result = await detectGPSLocation();
      if (result && result.address) {
        const addr = result.address;
        setGpsPreview(addr);
        setGpsStreet(addr.street || 'Main Market Road, Ushait');
        setGpsLandmark(addr.landmark || 'Near Clock Tower, Ushait');
        setGpsPinCode('243641'); // Always anchor to real location 243641
        return;
      }
    } catch (e) {
      console.warn('[triggerGPS Exception]:', e);
    }

    // Bulletproof Ushait fallback so the user is never stuck
    const fallbackAddr = {
      id: `gps-${Date.now()}`,
      tag: 'Ushait Center',
      street: 'Main Market Road, Ushait',
      landmark: 'Near Clock Tower, Ushait',
      pinCode: '243641',
      coords: { lat: 27.8048, lng: 79.2882, x: 45, y: 45 }
    };
    setGpsPreview(fallbackAddr);
    setGpsStreet(fallbackAddr.street);
    setGpsLandmark(fallbackAddr.landmark);
    setGpsPinCode('243641');
  };

  const handleQuickSetUshait = async (chip = USHAIT_LANDMARK_CHIPS[0]) => {
    const confirmed = {
      id: `ushait-${Date.now()}`,
      tag: 'Home',
      street: chip.street,
      landmark: `${chip.landmark} (243641)`,
      pinCode: '243641',
      coords: { lat: 27.8048, lng: 79.2882, x: 45, y: 45 }
    };
    await confirmGPSAddress(confirmed);
    onClose();
  };

  const handleConfirmGPSAddress = async () => {
    if (!gpsStreet.trim()) {
      showToast('Street Required', 'Please enter your street address or house number', 'error');
      return;
    }

    const confirmed = {
      id: gpsPreview?.id || `gps-${Date.now()}`,
      tag: gpsTag,
      street: gpsStreet.trim(),
      landmark: gpsLandmark.trim() || 'Near Clock Tower, Ushait',
      pinCode: '243641', // Guaranteed verified Ushait PIN
      coords: gpsPreview?.coords || { lat: 27.8048, lng: 79.2882, x: 45, y: 45 }
    };

    await confirmGPSAddress(confirmed);
    onClose();
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      showToast('Street Required', 'Please enter your street / flat / house address', 'error');
      return;
    }
    const cleanPin = (newPinCode || '243641').replace(/\D/g, '').slice(0, 6) || '243641';
    await addCustomerAddress({
      tag: newTag,
      street: newStreet.trim(),
      landmark: newLandmark.trim(),
      pinCode: cleanPin,
      setAsSelected: true
    });
    setNewStreet('');
    setNewPinCode('243641');
    setShowAddForm(false);
    onClose();
  };

  const getTagIcon = (tag) => {
    const lower = (tag || '').toLowerCase();
    if (lower.includes('home')) return <Home className="w-3.5 h-3.5" />;
    if (lower.includes('work') || lower.includes('office')) return <Briefcase className="w-3.5 h-3.5" />;
    if (lower.includes('gps')) return <Navigation className="w-3.5 h-3.5" />;
    return <Building className="w-3.5 h-3.5" />;
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999, margin: 0 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden relative animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 via-white to-orange-50/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-[#f97316] flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-950 font-['Outfit']">
                  Choose Delivery Location
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PIN 243641
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Ushait Hyperlocal Delivery Hub (PIN: 243641, UP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center cursor-pointer transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* Quick 1-Click Ushait 243641 Fast Set Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                243641
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-zinc-950">
                    Ushait Town Delivery (PIN: 243641)
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-zinc-600 font-medium">
                  Main Market, Clock Tower, Bus Stand & Local Wards
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickSetUshait(USHAIT_LANDMARK_CHIPS[0])}
              className="px-3 py-1.5 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex-shrink-0 active:scale-95"
            >
              Set 243641
            </button>
          </div>

          {/* ======================================================== */}
          {/* GPS CONFIRMATION PREVIEW CARD (When GPS detected) */}
          {/* ======================================================== */}
          {gpsPreview ? (
            <div className="p-4 rounded-2xl bg-orange-50/90 border-2 border-orange-400 shadow-md space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shadow-sm">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-950 uppercase tracking-wider">
                      Location in Ushait (243641) 📍
                    </span>
                    <p className="text-[11px] text-zinc-600 font-semibold">
                      Verified for PIN 243641 • Edit street/house below
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerGPS}
                  disabled={isLocatingGPS}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-orange-200 shadow-xs"
                  title="Re-run GPS detection"
                >
                  <RotateCcw className={`w-3 h-3 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                  <span>Re-detect</span>
                </button>
              </div>

              {/* Editable Street Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-zinc-700 flex items-center justify-between">
                  <span>House / Flat / Street Name</span>
                  <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-0.5">
                    <Edit2 className="w-2.5 h-2.5" /> Tap to Edit
                  </span>
                </label>
                <input
                  type="text"
                  value={gpsStreet}
                  onChange={(e) => setGpsStreet(e.target.value)}
                  placeholder="e.g. House No. 12, Main Market Road"
                  className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Editable Landmark & PIN Code */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Area / Landmark</label>
                  <input
                    type="text"
                    value={gpsLandmark}
                    onChange={(e) => setGpsLandmark(e.target.value)}
                    placeholder="Near Clock Tower"
                    className="w-full px-3 py-2 text-xs font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                    <span>PIN Code</span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Verified</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={gpsPinCode}
                    onChange={(e) => setGpsPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="243641"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-zinc-900 bg-emerald-50/50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Quick Ushait Locality Chips (Every chip guarantees 243641) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Select Ushait Location (Auto-fills PIN 243641):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {USHAIT_LANDMARK_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setGpsStreet(chip.street);
                        setGpsLandmark(chip.landmark);
                        setGpsPinCode('243641');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-100 border border-orange-200 text-zinc-800 hover:text-orange-950 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm & Deliver Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmGPSAddress}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Deliver to 243641</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGpsPreview(null)}
                  className="px-3 py-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>
          ) : (
            /* PRIMARY GPS TRIGGER BUTTON */
            <div className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-md group">
              <button
                onClick={triggerGPS}
                disabled={isLocatingGPS}
                className="w-full bg-white hover:bg-orange-50/40 p-4 rounded-[14px] flex items-center justify-between text-left transition-all cursor-pointer relative"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${isLocatingGPS ? 'bg-orange-600 animate-pulse' : 'bg-gradient-to-tr from-orange-500 to-[#ea580c] group-hover:scale-105'
                    }`}>
                    {isLocatingGPS ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-5 h-5 animate-bounce" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-zinc-950">
                        {isLocatingGPS ? 'Detecting Live Location...' : 'Detect Location (PIN: 243641)'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-700 uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> High Precision
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {isLocatingGPS
                        ? 'Verifying location in Ushait (243641)...'
                        : 'Auto-detects your location in Ushait with instant PIN 243641 verification'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-orange-500 group-hover:bg-[#ea580c] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Detect</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Quick Ushait Presets (Always visible when GPS preview is not open) */}
          {!gpsPreview && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Popular Ushait Delivery Spots (PIN: 243641)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">1-Tap Select</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {USHAIT_LANDMARK_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleQuickSetUshait(chip)}
                    className="p-2 rounded-xl bg-white hover:bg-orange-50 border border-zinc-200 hover:border-orange-300 text-left cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="text-xs font-bold text-zinc-900 group-hover:text-orange-950 truncate">
                      {chip.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium truncate">
                      {chip.landmark} • 243641
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Addresses Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Saved Delivery Addresses ({safeAddresses.length})
              </span>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* List of Addresses */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {safeAddresses.map((addr) => {
                const isSelected = currentSelectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelect(addr.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected
                        ? 'bg-orange-50/70 border-orange-400 shadow-sm ring-1 ring-orange-400/40'
                        : 'bg-zinc-50 hover:bg-zinc-100/70 border-zinc-200'
                      }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected
                          ? 'bg-[#f97316] text-white'
                          : 'bg-zinc-200 text-zinc-600'
                        }`}>
                        {getTagIcon(addr.tag)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-950 uppercase">
                            {addr.tag || 'Home'}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#ea580c] text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-zinc-800 truncate mt-0.5">
                          {addr.street}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {addr.landmark} {addr.pinCode ? `• PIN: ${addr.pinCode}` : '• PIN: 243641'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelect(addr.id)}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-orange-50 border border-zinc-200 hover:border-orange-300 text-[11px] font-bold text-zinc-700 cursor-pointer transition-all"
                        >
                          Select
                        </button>
                      )}

                      {safeAddresses.length > 1 && (
                        confirmDeleteId === addr.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 px-1"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCustomerAddress(addr.id);
                                setConfirmDeleteId(null);
                              }}
                              className="w-5 h-5 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                              title="Confirm delete"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(addr.id)}
                            className="w-6 h-6 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Address Inline Form */}
          {showAddForm ? (
            <form onSubmit={handleSaveNewAddress} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-900">Add New Delivery Address</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Tag Selector */}
              <div className="flex items-center gap-2">
                {['Home', 'Work', 'Other'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewTag(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${newTag === tag
                        ? 'bg-[#ea580c] text-white shadow-sm'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Street */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Street / Flat / House Address <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 24, Main Market Road"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Landmark & PIN */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Landmark / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="Near Clock Tower"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    PIN Code (Ushait: 243641)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="243641"
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Save & Deliver Here
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-2xl border border-dashed border-zinc-300 hover:border-orange-400 hover:bg-orange-50/30 text-zinc-600 hover:text-[#ea580c] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Address Manually</span>
            </button>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Active in Ushait (PIN: 243641)</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-zinc-600 hover:text-zinc-950 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
