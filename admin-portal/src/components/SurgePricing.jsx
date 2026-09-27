import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Zap, Plus, X } from 'lucide-react';

export const SurgePricing = () => {
  const { surgeZones, updateSurgeMultiplier, createSurgeZone } = useAdmin();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [availableRiders, setAvailableRiders] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await createSurgeZone({
      name: name.trim(),
      multiplier: Number(multiplier),
      availableRiders: Number(availableRiders)
    });
    setIsSubmitting(false);
    setShowAddModal(false);
    setName('');
    setMultiplier(1.0);
  };

  const zoneList = Array.isArray(surgeZones) ? surgeZones : [];

  return (
    <div className="space-y-5">
      <div className="clean-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl font-black text-zinc-950 font-['Outfit'] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f97316]" />
            <span>Surge Pricing Trigger Rules & Demand Forecasting</span>
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone to MongoDB</span>
          </button>
        </div>

        {showAddModal && (
          <form onSubmit={handleCreateZone} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Define New Surge Zone in MongoDB</h4>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Zone / Sector Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ushait Railway Sector"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Initial Multiplier (x)</label>
                <input
                  type="number"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Available Fleet Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={availableRiders}
                  onChange={(e) => setAvailableRiders(e.target.value)}
                  className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to MongoDB...' : 'Save Surge Zone to MongoDB'}
            </button>
          </form>
        )}

        {zoneList.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl space-y-2">
            <div className="text-2xl">📍</div>
            <h4 className="text-xs font-bold text-zinc-800">No Surge Zones in Database</h4>
            <p className="text-[11px] text-zinc-500">
              Click <strong>"Add Zone to MongoDB"</strong> above to store live operational delivery sectors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zoneList.map((zone) => (
              <div key={zone.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-950">{zone.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{zone.ordersInQueue} Orders in Queue • {zone.availableRiders} Idle Riders</p>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-xl shadow-sm ${
                    zone.multiplier > 1.3 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {zone.multiplier}x Surge
                  </span>
                </div>

                {/* Multiplier Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                    <span>Multiplier Control</span>
                    <span className="font-mono font-black text-[#ea580c]">{zone.multiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={zone.multiplier}
                    onChange={(e) => updateSurgeMultiplier(zone.id, e.target.value)}
                    className="w-full accent-[#f97316] cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
