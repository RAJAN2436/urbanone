import { Server as SocketIOServer } from 'socket.io';
import { database } from '../config/db.js';

let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.io] ⚡ Client connected: ${socket.id}`);

    socket.on('join:merchant', (merchantId) => {
      socket.join(`merchant_${merchantId}`);
      console.log(`[Socket.io] Merchant joined room merchant_${merchantId}`);
    });

    socket.on('join:admin', () => {
      socket.join('admin_room');
      console.log(`[Socket.io] Admin joined room admin_room`);
    });

    socket.on('join:rider', (riderId) => {
      socket.join('riders_room');
      if (riderId) socket.join(`rider_${riderId}`);
      console.log(`[Socket.io] Rider ${riderId || ''} joined riders_room`);
    });

    socket.on('join:order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on('rider:location_update', async (data) => {
      const lat = data?.lat ?? data?.coords?.lat;
      const lng = data?.lng ?? data?.coords?.lng;
      const payload = {
        ...data,
        lat,
        lng,
        timestamp: data?.timestamp || Date.now()
      };
      if (database.updateRiderLocation) {
        try {
          await database.updateRiderLocation(data?.orderId, lat, lng, data?.riderId);
        } catch (e) {}
      }
      ioInstance.emit('rider:location_updated', payload);
      if (data?.orderId) {
        ioInstance.to(`order_${data.orderId}`).emit('rider:location_updated', payload);
      }
    });

    socket.on('rider:duty_update', async (data) => {
      const riderId = data?.riderId;
      const isOnline = Boolean(data?.isOnline);
      if (riderId) {
        try {
          const updated = await database.updateRiderOnlineStatus(riderId, isOnline);
          await emitRidersUpdate(updated);
        } catch (e) {}
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitMerchantsUpdate = async (merchants) => {
  if (!ioInstance) return;
  const data = merchants || await database.getAllMerchants();
  ioInstance.emit('merchants:updated', { merchants: data, timestamp: Date.now() });
};

export const emitOrdersUpdate = async (orders) => {
  if (!ioInstance) return;
  const data = orders || await database.getAllOrders();
  ioInstance.emit('orders:updated', { orders: data, timestamp: Date.now() });
};

export const emitNewOrder = async (order) => {
  if (!ioInstance) return;
  ioInstance.emit('order:placed', { order, timestamp: Date.now() });
  if (order?.merchantId) {
    ioInstance.to(`merchant_${order.merchantId}`).emit('merchant:order:new', { order, timestamp: Date.now() });
  }
  ioInstance.to('admin_room').emit('order:new', { order, timestamp: Date.now() });
  await emitOrdersUpdate();
};

export const emitRiderDispatch = (order) => {
  if (!ioInstance || !order) return;
  const payload = { order, timestamp: Date.now() };
  ioInstance.to('riders_room').emit('rider:dispatch', payload);
  ioInstance.emit('rider:dispatch', payload);
};

export const emitOrderStatusUpdate = async (order) => {
  if (!ioInstance) return;
  ioInstance.emit('order:status_updated', { order, timestamp: Date.now() });
  ioInstance.emit('order:updated', { order, timestamp: Date.now() });
  if (order?.id) {
    ioInstance.to(`order_${order.id}`).emit('order:status_updated', { order, timestamp: Date.now() });
    ioInstance.to(`order_${order.id}`).emit('order:updated', { order, timestamp: Date.now() });
  }
  await emitOrdersUpdate();
};

export const emitRiderLocationUpdate = (data) => {
  if (!ioInstance || !data) return;
  ioInstance.emit('rider:location_updated', data);
  if (data.orderId) {
    ioInstance.to(`order_${data.orderId}`).emit('rider:location_updated', data);
  }
};

export const emitRidersUpdate = async (riders) => {
  if (!ioInstance) return;
  const data = riders || await database.getAllRiders();
  ioInstance.emit('riders:updated', { riders: data, timestamp: Date.now() });
};

export const emitSurgeZonesUpdate = async (zones) => {
  if (!ioInstance) return;
  const data = zones || await database.getAllSurgeZones();
  ioInstance.emit('surge:updated', { zones: data, timestamp: Date.now() });
};

export const emitPromoCodesUpdate = async (promos) => {
  if (!ioInstance) return;
  const data = promos || await database.getAllPromoCodes();
  ioInstance.emit('promos:updated', { promos: data, timestamp: Date.now() });
};
