import React, { useState, useRef } from 'react';
import { useRider } from '../context/RiderContext';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import {
  User, ShieldCheck, Star, Bike, FileCheck, Phone, AlertTriangle,
  BellRing, Compass, HelpCircle, ChevronRight, LogOut, Clock,
  Sparkles, Pencil, X, Camera, Save, Mail, Car, CreditCard,
  Upload, Loader2, CheckCircle
} from 'lucide-react';

export default function RiderProfileView({ onPlayLanding }) {
  const { riderProfile, isOnline, toggleDuty, stats, authRider, logoutRider, updateRiderProfile, showToast } = useRider();
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  const fileInputRef = useRef(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast('File Too Large', 'Please upload a photo smaller than 8MB', 'error');
      return;
    }

    if (showToast) showToast('Uploading Photo... ☁️', 'Uploading directly to Cloudinary CDN', 'info');
    const url = await uploadImage(file, 'kalsen-platform/riders');
    if (url) {
      setForm(f => ({ ...f, photo: url }));
      setUploadSuccess(true);
      if (showToast) showToast('Photo Uploaded! ✅', 'Saved to Cloudinary CDN. Click "Save Changes" to apply.', 'success');
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      if (showToast) showToast('Upload Failed', 'Could not upload photo. Please check your network or try again.', 'error');
    }
  };

  const displayPhoto = authRider?.photo || riderProfile?.photo;
  const displayName = authRider?.fullName || authRider?.name || riderProfile?.name || 'Rider';
  const displayPhone = authRider?.mobileNumber || authRider?.phone || riderProfile?.phone || '';
  const displayEmail = authRider?.email || riderProfile?.email || '';
  const displayDl = authRider?.drivingLicenseNumber || riderProfile?.drivingLicenseNumber || '';
  const displayVehicleModel = riderProfile?.vehicle?.model || authRider?.vehicleType || '';
  const displayVehicleNumber = authRider?.vehicleNumber || riderProfile?.vehicle?.number || '';

  const [form, setForm] = useState({
    name: '', phone: '', email: '', photo: '',
    drivingLicenseNumber: '', vehicleModel: '', vehicleNumber: '',
  });

  const openEdit = () => {
    setForm({
      name: displayName !== 'Rider' ? displayName : '',
      phone: displayPhone,
      email: displayEmail,
      photo: displayPhoto || '',
      drivingLicenseNumber: displayDl,
      vehicleModel: displayVehicleModel,
      vehicleNumber: displayVehicleNumber,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateRiderProfile({
      name: form.name, fullName: form.name,
      phone: form.phone, mobileNumber: form.phone,
      email: form.email, photo: form.photo,
      drivingLicenseNumber: form.drivingLicenseNumber,
      vehicleType: form.vehicleModel, vehicleNumber: form.vehicleNumber,
      vehicle: { model: form.vehicleModel, number: form.vehicleNumber, type: 'Electric 2-Wheeler' }
    });
    setSaving(false);
    setEditOpen(false);
  };

  const ic = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all';

  const onlineClass = isOnline ? 'bg-emerald-500' : 'bg-zinc-400';
  const toggleClass = soundEnabled ? 'bg-orange-500' : 'bg-zinc-200';
  const knobClass = soundEnabled ? 'right-0.5' : 'left-0.5';

  return (
    <div className="pb-24 pt-2 px-3.5 w-full max-w-full min-w-0 space-y-3.5 animate-fadeIn overflow-x-hidden">

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs relative overflow-hidden min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-500/20 overflow-hidden">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center text-white text-lg font-black">
                  {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold ${onlineClass}`}>
              &#9679;
            </span>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-extrabold text-zinc-900 truncate">{displayName}</h2>
              <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full flex items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> PRO RIDER
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">{displayPhone}{displayEmail ? ' • ' + displayEmail : ''}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {riderProfile.rating || '5.0'}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[11px] text-zinc-600 font-medium truncate">{stats.completedOrders} trips</span>
            </div>
          </div>

          <button onClick={openEdit} className="shrink-0 w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center justify-center transition-colors cursor-pointer" title="Edit Profile">
            <Pencil className="w-3.5 h-3.5 text-orange-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-zinc-100 text-center min-w-0">
          <div className="bg-zinc-50 rounded-xl p-1.5 min-w-0 overflow-hidden">
            <span className="text-[9px] text-zinc-400 font-semibold block uppercase truncate">Duty Status</span>
            <span className="text-[11px] font-bold text-zinc-800 flex items-center justify-center gap-1 mt-0.5 truncate">
              <Clock className="w-2.5 h-2.5 text-orange-500 shrink-0" /> {isOnline ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className="bg-zinc-50 rounded-xl p-1.5 min-w-0 overflow-hidden">
            <span className="text-[9px] text-zinc-400 font-semibold block uppercase truncate">On-Time</span>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 block truncate">100%</span>
          </div>
          <div className="bg-zinc-50 rounded-xl p-1.5 min-w-0 overflow-hidden">
            <span className="text-[9px] text-zinc-400 font-semibold block uppercase truncate">Distance</span>
            <span className="text-[11px] font-bold text-zinc-800 mt-0.5 block truncate">
              {stats.completedOrders > 0 ? (stats.completedOrders * 1.6).toFixed(1) + ' km' : '0.0 km'}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Bike className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">Registered Vehicle</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
            <button onClick={openEdit} className="w-7 h-7 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer">
              <Pencil className="w-3 h-3 text-zinc-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 min-w-0 gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="text-xs font-extrabold text-zinc-900 truncate">{displayVehicleModel || 'Not Set'}</div>
            <div className="text-[10px] text-zinc-500 truncate">Electric 2-Wheeler • Green Fleet</div>
          </div>
          <div className="px-2 py-1 rounded-lg bg-zinc-900 text-white font-mono text-[11px] font-bold tracking-wider shrink-0 whitespace-nowrap">
            {displayVehicleNumber || 'RC Pending'}
          </div>
        </div>
      </div>

      {/* KYC */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-2 min-w-0 overflow-hidden">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">KYC &amp; Compliance</h3>
        {[
          { label: 'Commercial Driving License', status: authRider?.approvalStatus === 'approved' ? 'Approved' : 'Pending', expiry: displayDl ? 'DL: ' + displayDl : 'Not submitted' },
          { label: 'Aadhaar Identity Card', status: 'Approved', expiry: 'Verified' },
          { label: 'Vehicle Registration Certificate (RC)', status: 'Approved', expiry: 'Verified' },
          { label: 'Comprehensive Motor Insurance', status: 'Approved', expiry: 'Valid till Nov 2026' }
        ].map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-none gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-xs font-semibold text-zinc-800 block truncate">{doc.label}</span>
                <span className="text-[10px] text-zinc-400 font-mono block truncate">{doc.expiry}</span>
              </div>
            </div>
            <span className={`shrink-0 text-[10px] font-bold ${doc.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {doc.status === 'Approved' ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3 min-w-0 overflow-hidden">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Preferences</h3>
        <div className="flex items-center justify-between py-1 min-w-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><BellRing className="w-3.5 h-3.5" /></div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-xs font-semibold text-zinc-800 block truncate">High Alert Chime</span>
              <span className="text-[10px] text-zinc-400 block truncate">Play loud ringtone on order</span>
            </div>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${toggleClass}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${knobClass}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-1 min-w-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Compass className="w-3.5 h-3.5" /></div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-xs font-semibold text-zinc-800 block truncate">Default Navigation</span>
              <span className="text-[10px] text-zinc-400 block truncate">Google Maps Live Navigation</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">Google Maps</span>
        </div>
        {onPlayLanding && (
          <div className="flex items-center justify-between py-1 min-w-0 gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5" /></div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-xs font-semibold text-zinc-800 block truncate">Landing Intro Sequence</span>
                <span className="text-[10px] text-zinc-400 block truncate">Replay partner animation</span>
              </div>
            </div>
            <button onClick={onPlayLanding} className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer shrink-0">Replay</button>
          </div>
        )}
      </div>

      {/* SOS */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-3.5 flex items-center justify-between min-w-0 gap-2 overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0"><AlertTriangle className="w-4 h-4" /></div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-rose-900 truncate">Rider Safety SOS</h4>
            <p className="text-[10px] text-rose-700 truncate">Instant dispatch &amp; emergency alert</p>
          </div>
        </div>
        <button onClick={() => setSosModalOpen(true)} className="px-3 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded-xl shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap">SOS Alert</button>
      </div>

      {/* Support & Logout */}
      <div className="space-y-2">
        <a href="tel:18001234567" className="w-full bg-white rounded-2xl p-3.5 border border-zinc-200/80 shadow-xs flex items-center justify-between text-zinc-700 hover:text-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold">24x7 Partner Support Hotline</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </a>
        <button onClick={toggleDuty} className="w-full bg-zinc-100 hover:bg-zinc-200 rounded-2xl p-3 text-xs font-bold text-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <LogOut className="w-4 h-4 text-zinc-500" /> {isOnline ? 'End Shift & Go Offline' : 'Start Duty & Go Online'}
        </button>
        <button onClick={logoutRider} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-2xl p-3 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <LogOut className="w-4 h-4 text-rose-600" /> Sign Out Partner Account
        </button>
      </div>

      {/* Edit Profile Bottom Sheet */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">Edit Profile</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Update your personal &amp; vehicle details</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Profile Photo Cloudinary Upload (Link option removed) */}
              <div className="flex flex-col items-center gap-3 py-3 px-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg overflow-hidden">
                    {form.photo ? (
                      <img src={form.photo} alt="preview" className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center text-white text-3xl font-black">
                        {(form.name || 'R').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Camera Click Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                    title="Upload profile photo"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-0.5 text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-1.5 text-center w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to Cloudinary ({progress}%)...</span>
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Uploaded to Cloudinary! ✅</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo to Cloudinary</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Stored on Cloudinary CDN • Direct photo upload
                  </span>

                  {uploading && (
                    <div className="w-48 bg-zinc-200 rounded-full h-1.5 overflow-hidden mt-1">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[11px] font-black text-zinc-600 uppercase tracking-wider">Personal Info</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" className={ic} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Mobile Number
                  </label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className={ic} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rider@example.com" className={ic} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Driving License No.
                  </label>
                  <input type="text" value={form.drivingLicenseNumber} onChange={e => setForm(f => ({ ...f, drivingLicenseNumber: e.target.value }))} placeholder="e.g. UP-14-2023-0098412" className={ic} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
                  <Car className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[11px] font-black text-zinc-600 uppercase tracking-wider">Vehicle Details</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Vehicle Model</label>
                  <input type="text" value={form.vehicleModel} onChange={e => setForm(f => ({ ...f, vehicleModel: e.target.value }))} placeholder="e.g. Ather 450X, Honda Activa" className={ic} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Vehicle Number Plate</label>
                  <input type="text" value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))} placeholder="e.g. UP14AB1234" className={ic + ' font-mono uppercase tracking-widest'} />
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
              <div className="pb-4" />
            </div>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-rose-300 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-rose-600 mb-1">Rider Emergency SOS</h3>
            <p className="text-xs text-zinc-600 mb-4">Need immediate assistance? Choose an action below. Your live GPS coordinates will be automatically shared.</p>
            <div className="space-y-2 mb-4">
              <a href="tel:112" className="w-full py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30">
                <Phone className="w-4 h-4" /> Dial National Emergency (112)
              </a>
              <a href="tel:9876543210" className="w-full py-3 rounded-2xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call Kalsen Dispatch Team
              </a>
            </div>
            <button onClick={() => setSosModalOpen(false)} className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer">Cancel Emergency</button>
          </div>
        </div>
      )}
    </div>
  );
}
