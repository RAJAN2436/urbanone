import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tag: { type: String, default: 'Home' },
  street: { type: String, required: true },
  landmark: { type: String },
  pinCode: { type: String, default: '' },
  coords: {
    x: { type: Number, default: 40.0 },
    y: { type: Number, default: 40.0 }
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: 'Kalsen Foodie' },
  phone: { type: String, sparse: true, index: true, default: null },
  email: { type: String, sparse: true, index: true, lowercase: true, trim: true },
  password_hash: { type: String, default: null },
  google_id: { type: String, sparse: true, default: null },
  avatar: { type: String, default: null },
  profile_completed: { type: Boolean, default: false },
  tier: { type: String, default: 'Gold VIP' },
  loyalty_points: { type: Number, default: 200 },
  wallet_balance: { type: Number, default: 150.0 },
  streak_count: { type: Number, default: 1 },
  referral_code: { type: String },
  addresses: [addressSchema],
  created_at: { type: Date, default: Date.now }
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

export const User = mongoose.model('User', userSchema);
