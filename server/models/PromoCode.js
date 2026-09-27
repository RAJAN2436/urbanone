import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  freeDelivery: { type: Boolean, default: false },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
