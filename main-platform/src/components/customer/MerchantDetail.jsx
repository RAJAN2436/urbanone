import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Tag,
  Leaf,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Info,
  X
} from 'lucide-react';

export const MerchantDetail = () => {
  const {
    selectedMerchantId,
    merchants,
    setCustomerSubView,
    addToCart,
    cart
  } = usePlatform();

  const merchant = merchants.find(m => m.id === selectedMerchantId) || merchants[0] || null;
  const [selectedCustomizingDish, setSelectedCustomizingDish] = useState(null);
  const [selectedCrust, setSelectedCrust] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  if (!merchant) {
    return (
      <div className="clean-card p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-3xl space-y-4 my-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto text-3xl">
          🏪
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Store Not Available</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          This store is not found or no stores are currently registered.
        </p>
        <button
          onClick={() => setCustomerSubView('home')}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-block"
        >
          Back to Stores
        </button>
      </div>
    );
  }

  const dishes = Array.isArray(merchant.dishes) ? merchant.dishes : [];
  const categories = ['All', ...new Set(dishes.map(d => d.category))];

  const filteredDishes = activeCategory === 'All'
    ? dishes
    : dishes.filter(d => d.category === activeCategory);

  const handleOpenCustomization = (dish) => {
    if (dish.customizations && dish.customizations.length > 0) {
      setSelectedCustomizingDish(dish);
      const defaultCrust = dish.customizations.find(c => c.name === 'Crust')?.options[0]?.name || '';
      setSelectedCrust(defaultCrust);
      setSelectedToppings([]);
    } else {
      addToCart(dish);
    }
  };

  const handleConfirmCustomization = () => {
    if (!selectedCustomizingDish) return;
    const parts = [];
    if (selectedCrust) parts.push(selectedCrust);
    if (selectedToppings.length > 0) parts.push(selectedToppings.join(', '));
    const customText = parts.join(' • ');

    addToCart(selectedCustomizingDish, customText);
    setSelectedCustomizingDish(null);
  };

  const cartCountForDish = (dishId) => {
    return cart.items
      .filter(item => item.id === dishId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-20 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => {
          setCustomerSubView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="btn-light-secondary text-xs font-bold py-2 px-3.5 flex items-center gap-2 cursor-pointer shadow-sm hover:border-orange-400"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurants</span>
      </button>

      {/* Restaurant Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-xl bg-white">
        <div className="h-64 w-full relative">
          <img
            src={merchant.banner || merchant.image}
            alt={merchant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-[#f97316] text-white uppercase tracking-wider shadow">
                  {merchant.tier} Partner
                </span>
                <span className="text-xs text-zinc-200 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                  {merchant.address}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
                {merchant.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium">
                {merchant.cuisine}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white text-zinc-950 text-center shadow-xl">
                <div className="flex items-center justify-center gap-1 font-extrabold text-base">
                  <Star className="w-4 h-4 fill-current text-[#f97316]" />
                  <span>{merchant.rating}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold">{merchant.ratingCount}+ reviews</div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white text-zinc-950 text-center shadow-xl">
                <div className="flex items-center justify-center gap-1 text-[#f97316] font-extrabold text-base">
                  <Clock className="w-4 h-4" />
                  <span>{merchant.deliveryTime}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">Prep: ~{merchant.avgPrepTime} min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Bar */}
        {merchant.offers && (
          <div className="px-6 py-2.5 bg-orange-500 text-white flex items-center gap-2 text-xs font-bold">
            <Tag className="w-4 h-4" />
            <span>{merchant.offers}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/25'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Dishes */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <span>Available Dishes</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold">
            {filteredDishes.length} items
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDishes.map((dish) => {
            const count = cartCountForDish(dish.id);
            return (
              <div
                key={dish.id}
                className="p-5 rounded-3xl bg-white border border-zinc-200 hover:border-orange-300 hover:shadow-lg transition-all flex gap-4 justify-between relative group"
              >
                {/* Info Column */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                      dish.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    </span>
                    {dish.isBestseller && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200">
                        ★ Bestseller
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-zinc-950 group-hover:text-[#f97316] transition-colors">
                    {dish.name}
                  </h4>

                  <div className="text-sm font-extrabold text-[#f97316]">
                    ₹{dish.price}
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
                    {dish.description}
                  </p>
                </div>

                {/* Image & Add Button Column */}
                <div className="w-28 flex flex-col items-center justify-between">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenCustomization(dish)}
                    className="mt-2 w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md shadow-orange-500/25 flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{count > 0 ? `ADD (${count})` : 'ADD'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customization Modal */}
      {selectedCustomizingDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-zinc-200 shadow-2xl p-5 sm:p-6 space-y-5 animate-scale-up text-zinc-950 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#f97316] uppercase tracking-wider">
                  Customise your feast
                </span>
                <h3 className="text-lg font-extrabold text-zinc-950 font-['Outfit']">
                  {selectedCustomizingDish.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 font-bold">
                  Base Price: <span className="text-zinc-950">₹{selectedCustomizingDish.price}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomizingDish(null)}
                className="p-1.5 rounded-xl bg-zinc-100 text-zinc-500 hover:text-zinc-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crust Options */}
            {selectedCustomizingDish.customizations?.find(c => c.name === 'Crust') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase">
                  Select Crust (Required)
                </label>
                <div className="space-y-1.5">
                  {selectedCustomizingDish.customizations.find(c => c.name === 'Crust').options.map((opt) => (
                    <div
                      key={opt.name}
                      onClick={() => setSelectedCrust(opt.name)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer text-xs font-bold transition-all ${
                        selectedCrust === opt.name
                          ? 'bg-orange-50 border-[#f97316] text-zinc-950'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedCrust === opt.name ? 'border-[#f97316] bg-[#f97316]' : 'border-zinc-400'
                        }`}>
                          {selectedCrust === opt.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      <span className="text-zinc-500">
                        {opt.price === 0 ? 'Free' : `+₹${opt.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Toppings */}
            {selectedCustomizingDish.customizations?.find(c => c.name === 'Extra Topping') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase">
                  Add Extra Toppings (Optional)
                </label>
                <div className="space-y-1.5">
                  {selectedCustomizingDish.customizations.find(c => c.name === 'Extra Topping').options.map((opt) => {
                    const isChecked = selectedToppings.includes(opt.name);
                    return (
                      <div
                        key={opt.name}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedToppings(selectedToppings.filter(t => t !== opt.name));
                          } else {
                            setSelectedToppings([...selectedToppings, opt.name]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-orange-50 border-[#f97316] text-zinc-950'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'border-[#f97316] bg-[#f97316]' : 'border-zinc-400'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{opt.name}</span>
                        </div>
                        <span className="text-zinc-500">+₹{opt.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm CTA */}
            <button
              onClick={handleConfirmCustomization}
              className="w-full btn-orange-primary text-xs font-bold py-3.5 cursor-pointer shadow-lg"
            >
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
