import mongoose from 'mongoose';

const riderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  driving_license_number: { type: String },
  photo: { type: String },
  vehicle_type: { type: String },
  vehicle_number: { type: String },
  rating: { type: Number, default: 5.0 },
  deliveries_count: { type: Number, default: 0 },
  deliveries_today: { type: Number, default: 0 },
  earnings_today: { type: Number, default: 0 },
  weekly_earnings: { type: Number, default: 0 },
  cash_in_hand: { type: Number, default: 0 },
  is_online: { type: Boolean, default: false },
  status: { type: String, default: 'idle' },
  coords_x: { type: Number, default: 40.0 },
  coords_y: { type: Number, default: 40.0 },
  kyc_verified: { type: Boolean, default: false },
  approval_status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  battery_percentage: { type: Number, default: 100 }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const Rider = mongoose.model('Rider', riderSchema);
