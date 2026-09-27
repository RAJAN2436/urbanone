import mongoose from 'mongoose';

const surgeZoneSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  multiplier: { type: Number, default: 1.0 },
  orders_in_queue: { type: Number, default: 0 },
  available_riders: { type: Number, default: 10 },
  color: { type: String, default: '#f97316' }
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

export const SurgeZone = mongoose.model('SurgeZone', surgeZoneSchema);
