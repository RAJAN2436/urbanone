import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMerchant } from '../context/MerchantContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import {
  Plus,
  Search,
  Check,
  X,
  Edit3,
  Trash2,
  Layers,
  Sparkles,
  Tag,
  Star,
  ImageIcon,
  Upload
} from 'lucide-react';

export const ListingManager = () => {
  const {
    currentMerchant,
    addMerchantDish,
    updateMerchantDish,
    deleteMerchantDish,
    toggleDishStock,
    showToast
  } = useMerchant();

  const { uploadImage: uploadDishImage, uploading: dishImageUploading, progress: dishImageProgress } = useCloudinaryUpload();
  const dishImageInputRef = useRef(null);

  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);

  const initialForm = {
    name: '',
    price: '',
    category: 'Artisan Pizzas',
    isVeg: true,
    isBestseller: false,
    description: '',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    inStock: true
  };

  const [formData, setFormData] = useState(initialForm);

  const handleDishImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload an image smaller than 5MB', 'error');
      return;
    }
    if (showToast) showToast('Uploading Image... ☁️', 'Uploading dish photo to Cloudinary', 'info');
    const url = await uploadDishImage(file);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      if (showToast) showToast('Image Uploaded! ✅', 'Dish photo saved to Cloudinary CDN', 'success');
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload image. Check Cloudinary config in .env', 'error');
    }
  };

  const dishes = currentMerchant?.dishes || [];
  const categories = ['All', ...new Set(dishes.map(d => d.category || 'General'))];

  const filteredDishes = dishes.filter(d => {
    if (menuFilterCategory !== 'All' && d.category !== menuFilterCategory) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = (d.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingDishId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dish) => {
    setEditingDishId(dish.id);
    setFormData({
      name: dish.name,
      price: dish.price,
      category: dish.category || 'Special',
      isVeg: dish.isVeg ?? true,
      isBestseller: dish.isBestseller ?? false,
      description: dish.description || '',
      image: dish.image || '',
      inStock: dish.inStock ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('Missing Fields', 'Please fill in dish name and price', 'error');
      return;
    }

    if (editingDishId) {
      updateMerchantDish(currentMerchant.id, editingDishId, {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        isVeg: formData.isVeg,
        isBestseller: formData.isBestseller,
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        inStock: formData.inStock
      });
    } else {
      addMerchantDish(currentMerchant.id, {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        isVeg: formData.isVeg,
        isBestseller: formData.isBestseller,
        description: formData.description || 'Special chef recipe prepared fresh to order.',
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        inStock: formData.inStock
      });
    }

    setIsModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar: Search, Category Filter, and Add Listing CTA */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search store listings by name or ingredient..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full clean-input pl-9 pr-4 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setMenuFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  menuFilterCategory === cat
                    ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm shadow-orange-500/20 font-extrabold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add New Listing Button */}
        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className={`clean-card overflow-hidden flex flex-col justify-between p-4 ${
              !dish.inStock ? 'opacity-70 border-red-200 bg-zinc-50/50' : ''
            }`}
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-zinc-100">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                
                {/* Food Type Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase shadow-sm ${
                    dish.isVeg
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}>
                    {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                  </span>
                  {dish.isBestseller && (
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#f97316] text-white shadow-sm">
                      ⭐ BESTSELLER
                    </span>
                  )}
                </div>

                {/* Stock Status Pill */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm ${
                    dish.inStock ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {dish.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </div>
              </div>

              {/* Title & Category */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#ea580c] uppercase tracking-wider">
                    {dish.category || 'Specialty'}
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-950 leading-snug mt-0.5">{dish.name}</h4>
                </div>
                <div className="text-base font-black text-zinc-950 font-mono flex-shrink-0">
                  ₹{dish.price}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 font-medium mt-2 line-clamp-2 leading-relaxed">
                {dish.description}
              </p>
            </div>

            {/* Listing Action Controls */}
            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
              {/* In Stock Toggle */}
              <button
                onClick={() => toggleDishStock(currentMerchant.id, dish.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  dish.inStock
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                }`}
              >
                {dish.inStock ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
                <span>{dish.inStock ? 'In Stock' : 'Mark Out of Stock'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(dish)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all border border-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Edit dish listing details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Listing Button */}
                <button
                  onClick={() => setDishToDelete(dish)}
                  className="btn-delete text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  title="Delete dish listing"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-zinc-200 shadow-sm">
          <Layers className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-zinc-950">No listings found</h4>
          <p className="text-xs text-zinc-500 mt-1">Create a new dish or product item for your store.</p>
          <button
            onClick={handleOpenAdd}
            className="btn-primary mt-4 px-5 py-2 text-xs"
          >
            Add Listing Now
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
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
            {/* Header */}
            <div className="px-6 py-4 sm:py-5 border-b border-zinc-100 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#f97316] flex items-center justify-center font-bold shadow-xs">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950">
                    {editingDishId ? 'Edit Dish Listing' : 'Add New Listing to Menu'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Live updates sync instantly to Customer App
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div>
                  <label className="block font-bold text-zinc-900 mb-1.5">Dish / Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quattro Formaggi Sourdough Pizza"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full clean-input p-3 text-xs font-medium text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-900 mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="499"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full clean-input p-3 font-mono font-bold text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-900 mb-1.5">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Artisan Pizzas"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full clean-input p-3 text-xs font-medium text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-900 mb-1.5">Dietary Type</label>
                    <select
                      value={formData.isVeg ? 'veg' : 'non-veg'}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                      className="w-full clean-input p-3 text-xs font-medium text-zinc-900 cursor-pointer bg-white"
                    >
                      <option value="veg">🟢 Vegetarian</option>
                      <option value="non-veg">🔴 Non-Vegetarian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-900 mb-1.5">Tag as Bestseller</label>
                    <select
                      value={formData.isBestseller ? 'yes' : 'no'}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.value === 'yes' })}
                      className="w-full clean-input p-3 text-xs font-medium text-zinc-900 cursor-pointer bg-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">⭐ Yes, Tag Bestseller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-zinc-900 text-xs">Dish Image (Cloudinary CDN)</label>
                    <button
                      type="button"
                      onClick={() => dishImageInputRef.current?.click()}
                      disabled={dishImageUploading}
                      className="text-xs font-bold text-[#ea580c] hover:text-orange-700 flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {dishImageUploading ? `Uploading (${dishImageProgress}%)...` : 'Upload to Cloudinary'}
                    </button>
                    <input
                      type="file"
                      ref={dishImageInputRef}
                      accept="image/*"
                      onChange={handleDishImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    {formData.image && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 bg-zinc-100">
                        <img src={formData.image} alt="Dish preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="url"
                      placeholder="https://res.cloudinary.com/... or paste image URL"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 clean-input p-2.5 text-xs text-zinc-900"
                    />
                  </div>

                  {dishImageUploading && (
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${dishImageProgress}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-zinc-500 font-bold">Presets:</span>
                    {[
                      { label: '🍕 Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
                      { label: '🍝 Pasta', url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=80' },
                      { label: '🍛 Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
                      { label: '🍰 Dessert', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80' },
                      { label: '🥑 Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-orange-50 text-zinc-700 hover:text-[#ea580c] border border-zinc-200 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-900 mb-1.5">Description & Ingredients</label>
                  <textarea
                    rows={2}
                    placeholder="Ingredients, portion size..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full clean-input p-3 text-xs text-zinc-900 resize-none"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3 flex-shrink-0 bg-zinc-50/50">
                {editingDishId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const dish = currentMerchant.dishes.find(d => d.id === editingDishId);
                      if (dish) {
                        setIsModalOpen(false);
                        setDishToDelete(dish);
                      }
                    }}
                    className="btn-delete px-3.5 py-2 text-xs cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete Listing</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2 text-xs cursor-pointer"
                  >
                    {editingDishId ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* CUSTOM LUXURY DELETE CONFIRMATION MODAL (REPLACES NATIVE BROWSER POPUP) */}
      {/* ========================================================================= */}
      {dishToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-md overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999, margin: 0 }}
          onClick={() => setDishToDelete(null)}
        >
          <div 
            className="w-full max-w-md max-h-[90vh] flex flex-col bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scaleUp overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm shadow-red-500/10">
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-950 font-['Outfit']">Delete Menu Listing?</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Permanent action on store catalog</p>
              </div>
            </div>

            {/* Dish Details Preview Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0">
                <img src={dishToDelete.image} alt={dishToDelete.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-zinc-900 truncate">{dishToDelete.name}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{dishToDelete.category} • ₹{dishToDelete.price}</p>
              </div>
            </div>

            {/* Warning Text */}
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Are you sure you want to remove <strong className="text-zinc-950">"{dishToDelete.name}"</strong>? This will immediately remove it from the Customer App in Ushait.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDishToDelete(null)}
                className="btn-secondary flex-1 py-3 text-xs font-bold cursor-pointer"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMerchantDish(currentMerchant.id, dishToDelete.id);
                  setDishToDelete(null);
                }}
                className="btn-delete-primary flex-1 py-3 text-xs font-black cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
