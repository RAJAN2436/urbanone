import { database } from '../config/db.js';
import { emitNewOrder, emitOrderStatusUpdate, emitOrdersUpdate, emitRiderDispatch } from '../services/socketService.js';

const DISPATCH_STATUSES = ['accepted', 'preparing', 'ready', 'ready_for_pickup'];
const ASSIGNED_STATUSES = ['rider_assigned', 'at_merchant', 'picked_up', 'on_the_way'];

export const OrderPresenter = {
  getAll: async (req, res) => {
    try {
      const { merchantId } = req.query;
      let orders = await database.getAllOrders();
      if (merchantId) {
        orders = orders.filter(o => o.merchantId === merchantId);
      }
      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const orders = await database.getAllOrders();
      const order = orders.find(o => o.id === req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  clearAll: async (req, res) => {
    try {
      await database.clearOrders();
      await emitOrdersUpdate([]);
      return res.json({ success: true, message: 'All demo and past orders cleared successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const {
        id,
        customerId,
        customerEmail,
        merchantId,
        items,
        customerName,
        customerPhone,
        deliveryAddress,
        grandTotal,
        itemTotal,
        taxes,
        deliveryFee,
        discountAmount,
        deliveryOtp: customOtp,
        merchantLat,
        merchantLng,
        customerLat,
        customerLng,
        pickupAddress
      } = req.body;

      const allMerchants = await database.getAllMerchants();
      const merchant = (await database.getMerchantById(merchantId)) || allMerchants[0];

      const orderId = id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const deliveryOtp = customOtp || Math.floor(1000 + Math.random() * 9000).toString();

      const newOrder = await database.createOrder({
        id: orderId,
        customerId: customerId || null,
        customerEmail: customerEmail || null,
        customerName: customerName || 'Customer',
        customerPhone: customerPhone || '',
        merchantId: merchant?.id || 'm1',
        merchantName: merchant?.name || 'Urban Kitchen Ushait',
        riderId: null,
        riderName: null,
        riderPhone: null,
        grandTotal: grandTotal || 549,
        itemTotal: itemTotal || grandTotal || 549,
        taxes: taxes || 25,
        deliveryFee: deliveryFee || 30,
        discountAmount: discountAmount || 0,
        orderStatus: 'placed',
        deliveryOtp,
        deliveryAddress: deliveryAddress || merchant?.address || 'Main Market Road, Ushait',
        pickupAddress: pickupAddress || merchant?.address || 'Clock Tower Chowk, Ushait (243641)',
        merchantLat: merchantLat || 27.8062,
        merchantLng: merchantLng || 79.2895,
        customerLat: customerLat || 27.8035,
        customerLng: customerLng || 79.2858
      }, items || []);

      console.log(`[Order Placed] Order #${newOrder.id} waiting for merchant ${newOrder.merchantName} to accept`);

      await emitNewOrder(newOrder);

      return res.status(201).json({
        success: true,
        message: `Order #${newOrder.id} sent to merchant dashboard`,
        order: newOrder
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status, riderId, riderName, riderPhone, lat, lng, riderLat, riderLng } = req.body;
      const nextStatus = status === 'ready' ? 'ready_for_pickup' : status;

      const extra = {
        riderId,
        riderName,
        riderPhone,
        riderLat: lat || riderLat,
        riderLng: lng || riderLng
      };

      const updatedOrder = await database.updateOrderStatus(req.params.id, nextStatus, extra);
      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      await emitOrderStatusUpdate(updatedOrder);

      if (DISPATCH_STATUSES.includes(updatedOrder.orderStatus) && !updatedOrder.riderId) {
        emitRiderDispatch(updatedOrder);
      }

      if (ASSIGNED_STATUSES.includes(updatedOrder.orderStatus) && updatedOrder.riderId) {
        emitRiderDispatch({ ...updatedOrder, dispatchType: 'assigned' });
      }

      return res.json({
        success: true,
        message: `Order #${req.params.id} status updated to ${updatedOrder.orderStatus}`,
        order: updatedOrder
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  updateLocation: async (req, res) => {
    try {
      const { lat, lng, riderId } = req.body;
      if (lat == null || lng == null) {
        return res.status(400).json({ success: false, message: 'lat and lng are required' });
      }
      await database.updateRiderLocation(req.params.id, Number(lat), Number(lng), riderId || null);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  verifyDeliveryOtp: async (req, res) => {
    try {
      const { otp } = req.body;
      const result = await database.verifyDeliveryOtp(req.params.id, otp);

      if (!result.success) {
        return res.status(400).json(result);
      }

      const allOrders = await database.getAllOrders();
      const updatedOrder = allOrders.find(o => o.id === req.params.id);
      if (updatedOrder) {
        await emitOrderStatusUpdate(updatedOrder);
      } else {
        await emitOrdersUpdate();
      }

      return res.json({
        success: true,
        message: `PIN Verified! Order #${req.params.id} marked as delivered.`
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
