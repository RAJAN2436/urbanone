import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMerchant } from '../context/MerchantContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

const QUICK_BANNER_PRESETS = [
  { name: 'Biryani Feast', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Woodfire Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80' },
  { name: 'North Indian', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Burger & Grill', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Bakery & Cake', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Fresh Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80' }
];

export const AdminRankingBanner = () => {
  const { currentMerchant, updateMerchantProfile, showToast } = useMerchant();
  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { uploadImage: uploadBannerImage, uploading: bannerUploading, progress: bannerProgress } = useCloudinaryUpload();

  if (!currentMerchant) return null;

  const currentCover = currentMerchant.banner || currentMerchant.image;

  const handleOpenModal = () => {
    setSelectedBanner(currentMerchant.banner || currentMerchant.image || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please choose an image under 8MB', 'error');
      return;
    }

    if (showToast) showToast('Uploading Banner... ☁️', 'Uploading banner to Cloudinary CDN', 'info');
    const url = await uploadBannerImage(file, 'urban-platform/banners');
    if (url) {
      setSelectedBanner(url);
      if (showToast) showToast('Banner Uploaded! ✅', 'Saved to Cloudinary. Click "Save & Set Cover" to apply.', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload banner to Cloudinary', 'error');
    }
  };

  const handleSaveBanner = async () => {
    if (!selectedBanner) return;
    setIsSaving(true);
    try {
      await updateMerchantProfile(currentMerchant.id, {
        banner: selectedBanner
      });
      if (showToast) {
        showToast('Banner Updated! 🎨', 'Store cover image has been saved to MongoDB & Customer App', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      if (showToast) showToast('Banner Update Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden border border-orange-200/80 shadow-lg shadow-orange-500/5 group">
        
        {/* Background Ambient Store Banner Cover */}
        {currentCover && (
          <div className="absolute inset-0 z-0">
            <img
              src={currentCover}
              alt="Store Cover Backdrop"
              className="w-full h-full object-cover opacity-15 filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50/95 via-white/95 to-orange-50/80" />
          </div>
        )}

        {/* Soft Glow */}
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-orange-400/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Store Info & Logo */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-300 shadow-md flex-shrink-0 bg-white group/avatar">
              <img
                src={currentMerchant.image || currentCover}
                alt={currentMerchant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950 font-['Outfit']">
                  {currentMerchant.name}
                </h1>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200 shadow-sm">
                  {currentMerchant.tier} Partner ({currentMerchant.commissionRate}% Fee)
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-medium mt-1">
                {currentMerchant.cuisine} • {currentMerchant.address}
              </p>
            </div>
          </div>

          {/* Right Action & Placement Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Quick Change Banner Button */}
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-orange-50 border border-orange-200 hover:border-orange-400 text-zinc-800 hover:text-zinc-950 text-xs font-black shadow-sm transition-all cursor-pointer"
              title="Change restaurant storefront cover banner image"
            >
              <Camera className="w-4 h-4 text-[#f97316]" />
              <span>Change Store Banner</span>
            </button>

            {/* Customer App Placement Badge */}
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm p-3 sm:p-3.5 rounded-2xl border border-orange-200 shadow-md shadow-orange-500/5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#f97316] flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-extrabold text-zinc-900 flex items-center gap-1">
                  <span>Customer App Placement:</span>
                  <span className="text-[#ea580c] font-black">
                    {currentMerchant.adminPriorityBadge || `#${currentMerchant.adminRank || 1} Rank`}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 font-medium">
                  <span>Boost: <strong className="text-emerald-700">{currentMerchant.adminBoostScore || 90}/100</strong></span>
                  <span>•</span>
                  <span className={currentMerchant.isPromoted ? 'text-[#ea580c] font-bold' : 'text-zinc-500'}>
                    {currentMerchant.isPromoted ? '⚡ Sponsored' : 'Organic'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* QUICK BANNER EDIT MODAL */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-md overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999, margin: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg sm:max-w-xl max-h-[90vh] flex flex-col bg-white border border-zinc-200 shadow-2xl rounded-3xl overflow-hidden relative my-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 sm:py-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">Change Store Banner Image</h3>
                  <p className="text-xs text-zinc-500 font-medium">Shown on the Customer App restaurant header</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Live Banner Preview Box */}
              <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden border-2 border-zinc-200 bg-zinc-100 shadow-inner group flex-shrink-0">
                {selectedBanner ? (
                  <img
                    src={selectedBanner}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <ImageIcon className="w-8 h-8 stroke-1" />
                    <span className="text-xs font-semibold">Enter a link or pick a preset below</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                  <span className="text-sm font-black font-['Outfit'] drop-shadow">{currentMerchant.name}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider font-bold">Preview</span>
                </div>
              </div>

              {/* Upload or Enter URL */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Banner Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or your image link"
                      value={selectedBanner}
                      onChange={(e) => setSelectedBanner(e.target.value)}
                      className="flex-1 clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={bannerUploading}
                      className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{bannerUploading ? `Uploading (${bannerProgress}%)...` : 'Upload to Cloudinary'}</span>
                    </button>
                  </div>
                  {bannerUploading && (
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${bannerProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Hidden file picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Curated Presets */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>Curated High-Definition Presets:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_BANNER_PRESETS.map((preset, idx) => {
                      const isSelected = selectedBanner === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedBanner(preset.url)}
                          className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                            isSelected ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-zinc-200 hover:border-orange-300'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-bold text-white truncate drop-shadow">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2.5 flex-shrink-0 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving || !selectedBanner}
                onClick={handleSaveBanner}
                className="btn-primary px-6 py-2.5 text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Apply Banner to Store</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};
