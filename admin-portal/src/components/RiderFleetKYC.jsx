import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { CheckCircle, Plus, UserPlus, X, Trash2, Upload, Camera } from 'lucide-react';

export const RiderFleetKYC = () => {
  const { riders, approveRiderKYC, updateRiderApproval, createRider, deleteRider } = useAdmin();
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  const fileInputRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [vehicleType, setVehicleType] = useState('Electric Scooter (Ather 450X)');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'urban-platform/riders');
      if (url) {
        setPhoto(url);
      }
    } catch (err) {
      console.error('Rider photo upload failed:', err);
    }
  };

  const handleRegisterRider = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitting(true);
    await createRider({
      name: name.trim(),
      phone: phone.trim(),
      photo: photo || undefined,
      vehicleType,
      vehicleNumber: vehicleNumber.trim()
    });
    setIsSubmitting(false);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setPhoto('');
  };

  const riderList = Array.isArray(riders) ? riders : [];

  return (
    <div className="clean-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-zinc-950 font-['Outfit']">Rider Fleet Roster & Video KYC Approvals</h3>
          <p className="text-xs text-zinc-500">{riderList.length} Active delivery partners stored in MongoDB</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Onboard Rider to MongoDB</span>
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleRegisterRider} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Register Live Rider to MongoDB</h4>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Rider Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Vehicle Type</label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Registration Plate</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full clean-input px-3 py-2 text-xs border border-zinc-200 rounded-xl"
              />
            </div>
          </div>

          {/* Rider Photo (Cloudinary) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-zinc-600">Rider Photo (Cloudinary CDN)</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                <span>{uploading ? `Uploading (${progress}%)...` : 'Upload to Cloudinary'}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              {photo && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0">
                  <img src={photo} alt="Rider Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="url"
                placeholder="https://res.cloudinary.com/... or upload image above"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="flex-1 clean-input px-3 py-1.5 text-xs text-zinc-900 border border-zinc-200 rounded-xl font-mono text-[11px]"
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
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !phone.trim()}
            className="btn-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving to MongoDB...' : 'Save Delivery Partner to MongoDB'}
          </button>
        </form>
      )}

      {riderList.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl space-y-2">
          <div className="text-2xl">🛵</div>
          <h4 className="text-xs font-bold text-zinc-800">No Delivery Partners in Database</h4>
          <p className="text-[11px] text-zinc-500">
            Click <strong>"Onboard Rider to MongoDB"</strong> above to register delivery fleet partners into the live database.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {riderList.map((r) => {
            const isApproved = r.approvalStatus === 'approved' || r.kycVerified;
            const isRejected = r.approvalStatus === 'rejected';
            const isPending = !isApproved && !isRejected;

            return (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0 shadow-xs">
                    <img src={r.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} alt={r.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-sm font-extrabold text-zinc-950">{r.name}</h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                        {r.vehicleType || 'EV Scooter'}
                      </span>
                      {isPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                          ⏳ Pending Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                          ✓ Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300">
                          ✕ Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>📞 {r.phone}</span>
                      {r.email && <span>• ✉️ {r.email}</span>}
                      {r.vehicleNumber && <span>• 🛵 {r.vehicleNumber}</span>}
                    </p>
                    {r.drivingLicenseNumber && (
                      <p className="text-[11px] font-mono font-bold text-orange-600 mt-0.5 bg-orange-50/80 px-2 py-0.5 rounded border border-orange-200/60 inline-block">
                        DL: {r.drivingLicenseNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-zinc-100 text-zinc-500 border border-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    OFFLINE
                  </span>

                  {isPending ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => (updateRiderApproval ? updateRiderApproval(r.id, 'approved') : approveRiderKYC(r.id))}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Rider</span>
                      </button>
                      <button
                        onClick={() => (updateRiderApproval ? updateRiderApproval(r.id, 'rejected') : null)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-1.5 px-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  ) : isApproved ? (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Partner
                    </span>
                  ) : (
                    <button
                      onClick={() => (updateRiderApproval ? updateRiderApproval(r.id, 'approved') : approveRiderKYC(r.id))}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      Re-Approve
                    </button>
                  )}

                  {/* Delete Delivery Partner Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete delivery partner "${r.name}" from MongoDB database?`)) {
                        deleteRider(r.id);
                      }
                    }}
                    title={`Delete ${r.name}`}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
