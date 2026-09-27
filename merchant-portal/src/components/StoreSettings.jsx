import React, { useState, useRef } from 'react';
import { useMerchant } from '../context/MerchantContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import {
  Store,
  Clock,
  MapPin,
  Tag,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  RefreshCw,
  ExternalLink,
  Eye
} from 'lucide-react';

const BANNER_PRESETS = [
  {
    name: 'Biryani & Mughlai',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80',
    category: 'Food'
  },
  {
    name: 'Woodfire Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    category: 'Food'
  },
  {
    name: 'North Indian Thali',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop&q=80',
    category: 'Food'
  },
  {
    name: 'Burger & Street Fast Food',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
    category: 'Food'
  },
  {
    name: 'Artisan Bakery & Sweets',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    category: 'Bakery'
  },
  {
    name: 'Cafe, Shakes & Desserts',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    category: 'Beverage'
  },
  {
    name: 'Supermarket & Groceries',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    category: 'Grocery'
  },
  {
    name: 'Traditional Indian Sweets',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop&q=80',
    category: 'Sweets'
  }
];

export const StoreSettings = () => {
  const { currentMerchant, updateMerchantProfile, showToast } = useMerchant();
  const { uploadImage: uploadBanner, uploading: bannerUploading, progress: bannerProgress } = useCloudinaryUpload();
  const { uploadImage: uploadLogo, uploading: logoUploading, progress: logoProgress } = useCloudinaryUpload();
  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentMerchant?.name || '',
    cuisine: currentMerchant?.cuisine || '',
    address: currentMerchant?.address || '',
    avgPrepTime: currentMerchant?.avgPrepTime || 18,
    offers: currentMerchant?.offers || '',
    banner: currentMerchant?.banner || currentMerchant?.image || '',
    image: currentMerchant?.image || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!currentMerchant) return null;

  const handleBannerFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload an image smaller than 8MB', 'error');
      return;
    }
    if (showToast) showToast('Uploading Banner... ☁️', 'Uploading to Cloudinary CDN', 'info');
    const url = await uploadBanner(file);
    if (url) {
      setFormData(prev => ({ ...prev, banner: url }));
      if (showToast) showToast('Banner Uploaded! ✅', 'CDN link saved. Click "Save Changes" to apply.', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload. Check Cloudinary config in .env', 'error');
    }
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload a logo smaller than 5MB', 'error');
      return;
    }
    if (showToast) showToast('Uploading Logo... ☁️', 'Uploading to Cloudinary CDN', 'info');
    const url = await uploadLogo(file);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      if (showToast) showToast('Logo Uploaded! ✅', 'CDN link saved. Click "Save Changes" to apply.', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload logo. Check Cloudinary config in .env', 'error');
    }
  };

  const handleSelectPreset = (url) => {
    setFormData(prev => ({ ...prev, banner: url }));
    if (showToast) showToast('Preset Applied ✨', 'Preset banner selected. Click "Save Changes" to publish.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMerchantProfile(currentMerchant.id, {
        name: formData.name.trim(),
        cuisine: formData.cuisine.trim(),
        address: formData.address.trim(),
        avgPrepTime: Number(formData.avgPrepTime) || 15,
        offers: formData.offers.trim(),
        banner: formData.banner.trim(),
        image: formData.image.trim() || formData.banner.trim()
      });
      if (showToast) {
        showToast('Store Updated! 🏪', 'Store banner & operational settings saved in MongoDB.', 'success');
      }
    } catch (err) {
      if (showToast) showToast('Update Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      {/* Visual Identity & Cover Banner Card */}
      <div className="w-full clean-card p-6 sm:p-10 bg-white border border-zinc-200/90 shadow-sm rounded-3xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-[#ea580c] text-xs font-black uppercase tracking-wider mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Storefront Visual Identity</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
            Cover Banner & Branding
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            This banner is displayed at the top of your restaurant profile on the Customer App (Port 5173).
          </p>
        </div>

        {/* Live Banner Preview */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
            <span>Live Cover Banner Preview</span>
            <span className="text-[11px] text-zinc-400 font-normal">Recommended: 1200 x 400 (3:1 wide ratio)</span>
          </div>
          
          <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden border-2 border-zinc-200/90 bg-zinc-100 shadow-md group">
            {formData.banner ? (
              <img
                src={formData.banner}
                alt="Store Banner Preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                <ImageIcon className="w-10 h-10 stroke-1" />
                <span className="text-xs font-semibold">No Banner Image Selected</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* In-Preview Overlay Details */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden shadow-lg bg-white flex-shrink-0">
                  <img
                    src={formData.image || formData.banner || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-black text-lg font-['Outfit'] drop-shadow">
                    {formData.name || currentMerchant.name}
                  </h4>
                  <p className="text-zinc-200 text-xs font-medium drop-shadow flex items-center gap-1.5">
                    <span>{formData.cuisine || currentMerchant.cuisine}</span>
                    <span>•</span>
                    <span className="text-orange-400 font-bold">{formData.offers || currentMerchant.offers || '20% OFF'}</span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:block">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md text-white border border-white/30 uppercase tracking-wider">
                  Customer App Preview
                </span>
              </div>
             {/* Quick Upload Action Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={bannerUploading}
                className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer border border-white/20 disabled:opacity-70"
              >
                {bannerUploading ? (
                  <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {bannerProgress}%</>
                ) : (
                  <><Upload className="w-3.5 h-3.5 text-orange-400" /> Upload to Cloudinary</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input type="file" ref={bannerInputRef} accept="image/*" onChange={handleBannerFileUpload} className="hidden" />
        <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoFileUpload} className="hidden" />

        {/* Banner Input Options */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Banner Image — Upload to Cloudinary or paste URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://res.cloudinary.com/... or any CDN link"
                value={formData.banner}
                onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                className="flex-1 clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={bannerUploading}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 disabled:opacity-70"
              >
                {bannerUploading ? (
                  <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {bannerProgress}%</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload</>
                )}
              </button>
            </div>
          </div>

          {/* Curated Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
                <span>Or Select from Curated High-Definition Food &amp; Store Banners:</span>
              </label>
              <span className="text-[11px] text-zinc-400">1-Click Apply</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BANNER_PRESETS.map((preset, idx) => {
                const isSelected = formData.banner === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                        : 'border-zinc-200 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate drop-shadow">
                      {preset.name}
                    </span>

                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Store Logo / Thumbnail Avatar */}
        <div className="pt-4 border-t border-zinc-100">
          <label className="block text-xs font-bold text-zinc-700 mb-1.5">
            Store Logo / Thumbnail — Upload to Cloudinary or paste URL
          </label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0">
              <img
                src={formData.image || formData.banner}
                alt="Logo Thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                }}
              />
            </div>
            <input
              type="url"
              placeholder="https://res.cloudinary.com/... or logo URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="flex-1 clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-medium"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 disabled:opacity-70"
            >
              {logoUploading ? (
                <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {logoProgress}%</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Upload</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Operational Parameters Card */}
      <div className="w-full clean-card p-6 sm:p-10 bg-white border border-zinc-200/90 shadow-sm rounded-3xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-black uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Store Identity & Operations</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
            Store Details & Customer Offers
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Configure how your restaurant appears in search, categories, and checkout in Ushait.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-900 mb-1.5">Store / Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full clean-input px-3.5 py-2.5 text-zinc-900 font-medium border border-zinc-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-900 mb-1.5">Cuisines / Food Speciality</label>
              <input
                type="text"
                placeholder="e.g. North Indian, Biryani, Kebabs"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full clean-input px-3.5 py-2.5 text-zinc-900 font-medium border border-zinc-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-900 mb-1.5">Average Kitchen Prep Time (Minutes)</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={formData.avgPrepTime}
                  onChange={(e) => setFormData({ ...formData, avgPrepTime: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full clean-input pr-3.5 py-2.5 text-zinc-900 font-medium border border-zinc-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-900 mb-1.5">Store Address in Ushait</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full clean-input pr-3.5 py-2.5 text-zinc-900 font-medium border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-900 mb-1.5">Customer Promo / Discount Badge</label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. 20% OFF UPTO ₹100 | USE URBAN50"
                value={formData.offers}
                onChange={(e) => setFormData({ ...formData, offers: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full clean-input pr-3.5 py-2.5 text-zinc-900 font-medium border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">
              Changes synchronize instantly to MongoDB and Customer App
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-7 py-3 text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
    </div>
  );
};
