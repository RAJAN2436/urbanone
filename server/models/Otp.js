import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  otp: { type: String, required: true },
  expires_at: { type: Number, required: true },
  attempts: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Otp = mongoose.model('Otp', otpSchema);
