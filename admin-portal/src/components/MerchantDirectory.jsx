import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import {
  Store,
  Plus,
  Trash2,
  ExternalLink,
  Percent,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ShoppingBag,
  Sliders,
  Upload,
  Loader2
} from 'lucide-react';

const PRESET_IMAGES = {
  Food: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  Pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
  Cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80'
};

export const MerchantDirectory = () => {
  const {
    merchants,
    createMerchant,
    deleteMerchant,
    updateMerchantCommission,
    updateMerchantApprovalStatus
  } = useAdmin();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('Main Market Road, Ushait');
  const [costForTwo, setCostForTwo] = useState('₹400');
  const [commissionRate, setCommissionRate] = useState(15);
  const [tier, setTier] = useState('Gold');
  const [avgPrepTime, setAvgPrepTime] = useState(25);
  const [customImage, setCustomImage] = useState('');
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  const fileInputRef = useRef(null);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'kalsen-platform/merchants');
      if (url) {
        setCustomImage(url);
      }
    } catch (err) {
      console.error('Merchant image upload error:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createMerchant({
        name: name.trim(),
        category,
        cuisine: cuisine.trim() || (category === 'Food' ? 'North Indian, Mughlai' : category),
        address: address.trim(),
        costForTwo,
        commissionRate: Number(commissionRate) || 15,
        tier,
        avgPrepTime: Number(avgPrepTime) || 25,
        image: customImage.trim() || PRESET_IMAGES[category] || PRESET_IMAGES.Food
      });

      setShowAddModal(false);
      setName('');
      setCuisine('');
      setCustomImage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteMerchant(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const merchantList = Array.isArray(merchants) ? merchants : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="clean-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#ea580c] text-xs font-black uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>MongoDB Merchant Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-['Outfit']">
            Merchant Partner <span className="text-[#f97316]">Registry & Governance</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
            Register new merchant restaurants or shops, manage commission rates, or delete store listings permanently from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-3 px-5 flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Merchant</span>
          </button>
        </div>
      </div>

      {/* Directory Roster */}
      {merchantList.length === 0 ? (
        <div className="clean-card p-12 text-center bg-white border border-dashed border-zinc-300 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto text-3xl shadow-sm">
            🏪
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 font-['Outfit']">No Merchants in MongoDB</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
              No store listings currently exist in the database. Click <strong>"Register New Merchant"</strong> to add your first restaurant or grocery store into MongoDB.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2.5 px-5 font-bold cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register First Merchant</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {merchantList.map((m) => {
            const dishesCount = Array.isArray(m.dishes) ? m.dishes.length : 0;
            const isOpen = m.isOpen ?? m.is_open ?? true;

            return (
              <div
                key={m.id}
                className="clean-card p-5 sm:p-6 bg-white border border-zinc-200 hover:border-orange-300 transition-all shadow-sm space-y-4 flex flex-col justify-between"
              >
                {/* Top: Image + Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0 relative">
                    <img
                      src={m.image || PRESET_IMAGES.Food}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-zinc-950 truncate">{m.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1">{m.cuisine || m.category}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-orange-100 text-[#ea580c] border border-orange-200 flex-shrink-0">
                        {m.tier || 'Gold'} Tier
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate max-w-[120px]">{m.address || 'Ushait, UP'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-zinc-800">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{m.rating || 5.0}</span>
                      </span>
                      <span>•</span>
                      <span className="text-zinc-600 font-bold">{dishesCount} dishes</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Commission Setting */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-600 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#f97316]" />
                      <span>Platform Commission Rate</span>
                    </span>
                    <span className="font-mono text-[#ea580c] font-black">{m.commissionRate || 15}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={m.commissionRate || 15}
                    onChange={(e) => updateMerchantCommission(m.id, e.target.value)}
                    className="w-full accent-[#f97316] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>5% (Partner Saver)</span>
                    <span>30% (VIP Promoted)</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {isOpen ? '● Live Open' : '○ Closed'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">ID: {m.id}</span>
                  </div>

                  <button
                    onClick={() => setDeleteCandidate(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Store</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTER NEW MERCHANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="clean-card bg-white p-6 sm:p-8 max-w-lg w-full rounded-3xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
                  🏪
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">Register New Merchant</h3>
                  <p className="text-[11px] text-zinc-500">Save store directly to MongoDB collection</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-zinc-700">
              <div>
                <label className="block mb-1 text-zinc-600">Store / Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Biryani & Kabab Palace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-zinc-600">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full clean-input px-3 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                  >
                    <option value="Food">Food / Restaurant</option>
                    <option value="Grocery">Grocery & Mart</option>
                    <option value="Bakery">Bakery & Sweets</option>
                    <option value="Pharmacy">Pharmacy & Health</option>
                    <option value="Cafe">Cafe & Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-zinc-600">Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full clean-input px-3 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                  >
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold VIP</option>
                    <option value="Platinum">Platinum Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-zinc-600">Cuisine / Specialities</label>
                <input
                  type="text"
                  placeholder="e.g. Lucknowi Biryani, Mughlai, Fast Food"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-zinc-600">Cost for Two</label>
                  <input
                    type="text"
                    value={costForTwo}
                    onChange={(e) => setCostForTwo(e.target.value)}
                    className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-zinc-600">Commission Rate (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="35"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-zinc-600">Store Address in Ushait</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-600 font-medium text-xs">Merchant Store Image (Cloudinary)</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploading ? `Uploading (${progress}%)...` : 'Upload to Cloudinary'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {customImage && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0">
                      <img src={customImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/... or paste image URL"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    className="flex-1 clean-input px-3.5 py-2.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                {uploading && (
                  <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden mt-1.5">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Upload file directly to Cloudinary or leave blank for category preset
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering in MongoDB...' : '🚀 Save Store to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clean-card bg-white p-6 sm:p-7 max-w-md w-full rounded-3xl shadow-2xl space-y-4 border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">
                Delete Merchant Store?
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{deleteCandidate.name}"</strong>? This will remove the store and all its menu dishes from MongoDB. This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting from DB...' : 'Yes, Delete from MongoDB'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
