import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  username: { type: String, sparse: true, index: true, lowercase: true, trim: true },
  password_hash: { type: String, default: null },
  email: { type: String, sparse: true, lowercase: true, trim: true },
  phone: { type: String, default: null },
  owner_name: { type: String, default: null },
  name: { type: String, required: true },
  category: { type: String, default: 'Food' },
  cuisine: { type: String },
  rating: { type: Number, default: 4.8 },
  rating_count: { type: Number, default: 100 },
  delivery_time: { type: String, default: '20-25 min' },
  cost_for_two: { type: String, default: '₹450' },
  image: { type: String },
  banner: { type: String },
  address: { type: String, required: true },
  coords_x: { type: Number, default: 40.0 },
  coords_y: { type: Number, default: 40.0 },
  is_open: { type: Boolean, default: true },
  avg_prep_time: { type: Number, default: 15 },
  commission_rate: { type: Number, default: 12 },
  tier: { type: String, default: 'Gold' },
  admin_rank: { type: Number, default: 1, index: true },
  admin_boost_score: { type: Number, default: 90 },
  is_featured: { type: Boolean, default: false },
  is_promoted: { type: Boolean, default: false },
  admin_approval_status: { type: String, default: 'approved' },
  admin_priority_badge: { type: String, default: null },
  offers: { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.password_hash;
      return ret;
    }
  }
});

export const Merchant = mongoose.model('Merchant', merchantSchema);
