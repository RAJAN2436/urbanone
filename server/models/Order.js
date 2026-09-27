import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

export const ORDER_STATUSES = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'ready_for_pickup',
  'rider_assigned',
  'at_merchant',
  'picked_up',
  'on_the_way',
  'delivered',
  'cancelled'
];

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  customer_id: { type: String, default: null, index: true },
  customer_email: { type: String, default: null, index: true },
  customer_name: { type: String, default: 'Customer' },
  customer_phone: { type: String },
  merchant_id: { type: String, index: true },
  merchant_name: { type: String },
  rider_id: { type: String, default: null, index: true },
  rider_name: { type: String, default: null },
  rider_phone: { type: String, default: null },
  item_total: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  delivery_fee: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  grand_total: { type: Number, required: true },
  order_status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'placed',
    index: true
  },
  delivery_otp: { type: String, required: true },
  is_otp_verified: { type: Boolean, default: false },
  delivery_address: { type: String },
  pickup_address: { type: String },
  items: [orderItemSchema],
  rider_lat: { type: Number, default: null },
  rider_lng: { type: Number, default: null },
  merchant_lat: { type: Number, default: 27.8062 },
  merchant_lng: { type: Number, default: 79.2895 },
  customer_lat: { type: Number, default: 27.8035 },
  customer_lng: { type: Number, default: 79.2858 },
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

export const Order = mongoose.model('Order', orderSchema);
