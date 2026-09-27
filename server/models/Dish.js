import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  merchant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Main Course' },
  is_veg: { type: Boolean, default: true },
  is_bestseller: { type: Boolean, default: false },
  image: { type: String },
  description: { type: String },
  in_stock: { type: Boolean, default: true }
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

export const Dish = mongoose.model('Dish', dishSchema);
