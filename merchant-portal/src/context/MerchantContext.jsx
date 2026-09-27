import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_MERCHANTS, INITIAL_MERCHANT_ORDERS } from '../mockData';
import { api } from '../services/api';
import { io } from 'socket.io-client';

const MerchantContext = createContext(null);

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};

export const MerchantProvider = ({ children }) => {
  const [activeMerchantId, setActiveMerchantId] = useState(() => {
    const saved = localStorage.getItem('kalsen_active_merchant_id');
    return (saved === 'm1' || saved === 'm2') ? '' : (saved || '');
  });

  const [merchants, setMerchants] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_merchants_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => m.id !== 'm1' && m.id !== 'm2');
        }
      }
    } catch (e) {}
    return INITIAL_MERCHANTS;
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_orders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(o => !o.id?.startsWith('ORD-88'));
        }
      }
    } catch (e) {}
    return INITIAL_MERCHANT_ORDERS;
  });

  const [merchantToken, setMerchantToken] = useState(() => {
    return localStorage.getItem('kalsen_merchant_token') || null;
  });

  const [merchantUser, setMerchantUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_merchant_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const isMerchantAuthenticated = Boolean(merchantToken && merchantUser);

  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  // Sync state from Live Backend API & MongoDB
  const refreshFromBackend = async () => {
    try {
      const [merchantsRes, ordersRes] = await Promise.allSettled([
        api.getMerchants(),
        api.getOrders()
      ]);

      if (merchantsRes.status === 'fulfilled') {
        const list = merchantsRes.value?.merchants || [];
        setMerchants(list);
        try { localStorage.setItem('kalsen_merchants_data', JSON.stringify(list)); } catch (e) {}
      }

      if (ordersRes.status === 'fulfilled') {
        const list = ordersRes.value?.orders || [];
        setOrders(list);
        try { localStorage.setItem('kalsen_orders_data', JSON.stringify(list)); } catch (e) {}
      }
    } catch (err) {
      console.warn('[MerchantContext] Backend sync notice:', err.message);
    }
  };

  const createMerchant = async (merchantData) => {
    try {
      const res = await api.createMerchant(merchantData);
      if (res?.merchant) {
        setActiveMerchantId(res.merchant.id);
        const list = res.merchants || [res.merchant];
        setMerchants(list);
        try {
          localStorage.setItem('kalsen_active_merchant_id', res.merchant.id);
          localStorage.setItem('kalsen_merchants_data', JSON.stringify(list));
        } catch (e) {}
        showToast('Store Registered! 🏪', `"${res.merchant.name}" is now live on the platform!`, 'success');
        return res.merchant;
      }
    } catch (err) {
      showToast('Error Creating Store', err.message, 'error');
    }
  };

  const loginMerchant = async (username, password) => {
    try {
      const res = await api.merchantLogin(username, password);
      if (res?.token && res?.merchant) {
        setMerchantToken(res.token);
        setMerchantUser(res.merchant);
        setActiveMerchantId(res.merchant.id);
        localStorage.setItem('kalsen_merchant_token', res.token);
        localStorage.setItem('kalsen_merchant_user', JSON.stringify(res.merchant));
        localStorage.setItem('kalsen_active_merchant_id', res.merchant.id);
        showToast('Login Successful 🚀', `Welcome back, ${res.merchant.name}!`, 'success');
        playSound('success');
        return res.merchant;
      }
    } catch (err) {
      showToast('Login Failed', err.message || 'Invalid username or password', 'error');
      throw err;
    }
  };

  const registerMerchantAccount = async (merchantData) => {
    try {
      const res = await api.merchantRegister(merchantData);
      if (res?.token && res?.merchant) {
        setMerchantToken(res.token);
        setMerchantUser(res.merchant);
        setActiveMerchantId(res.merchant.id);
        localStorage.setItem('kalsen_merchant_token', res.token);
        localStorage.setItem('kalsen_merchant_user', JSON.stringify(res.merchant));
        localStorage.setItem('kalsen_active_merchant_id', res.merchant.id);
        showToast('Store Registered! 🏪', `"${res.merchant.name}" is now live on the platform!`, 'success');
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        playSound('success');
        return res.merchant;
      }
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
      throw err;
    }
  };

  const logoutMerchant = () => {
    setMerchantToken(null);
    setMerchantUser(null);
    setActiveMerchantId('');
    localStorage.removeItem('kalsen_merchant_token');
    localStorage.removeItem('kalsen_merchant_user');
    localStorage.removeItem('kalsen_active_merchant_id');
    showToast('Signed Out', 'You have been signed out of Merchant OS', 'info');
  };

  useEffect(() => {
    refreshFromBackend();
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const merchantId = localStorage.getItem('kalsen_active_merchant_id');
      if (merchantId) socket.emit('join:merchant', merchantId);
    });

    socket.on('orders:updated', (payload) => {
      const list = Array.isArray(payload?.orders) ? payload.orders : (Array.isArray(payload) ? payload : null);
      if (list) {
        setOrders(list);
        localStorage.setItem('kalsen_orders_data', JSON.stringify(list));
      }
    });

    socket.on('merchant:order:new', (payload) => {
      const order = payload?.order || payload;
      if (order?.id) {
        setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
        playSound('order');
        showToast('New Order Request 🛎️', `Order #${order.id} is waiting for your acceptance`, 'info');
      }
    });

    socket.on('order:status_updated', (payload) => {
      const updatedOrder = payload?.order || payload;
      if (updatedOrder && updatedOrder.id) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
      }
    });

    socket.on('rider:location_updated', (data) => {
      if (data && data.orderId) {
        setOrders(prev => prev.map(o => {
          if (o.id === data.orderId) {
            return {
              ...o,
              riderLat: data.lat,
              riderLng: data.lng
            };
          }
          return o;
        }));
      }
    });

    socket.on('merchants:updated', (payload) => {
      const list = Array.isArray(payload?.merchants) ? payload.merchants : (Array.isArray(payload) ? payload : null);
      if (list) {
        setMerchants(list);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(list));
      }
    });

    const interval = setInterval(refreshFromBackend, 6000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeMerchantId && socketRef.current?.connected) {
      socketRef.current.emit('join:merchant', activeMerchantId);
    }
  }, [activeMerchantId]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kalsen_active_merchant_id', activeMerchantId);
  }, [activeMerchantId]);

  useEffect(() => {
    localStorage.setItem('kalsen_merchants_data', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('kalsen_orders_data', JSON.stringify(orders));
  }, [orders]);

  // Toast helper
  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Audio effect helper
  const playSound = (type = 'ding') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'order') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {}
  };

  // Current Merchant
  const merchantList = Array.isArray(merchants) ? merchants : [];
  const currentMerchant = isMerchantAuthenticated
    ? (merchantList.find(m => m.id === activeMerchantId) || merchantList.find(m => m.id === merchantUser?.id) || merchantUser || null)
    : null;

  // Listing CRUD
  const addMerchantDish = async (merchantId, newDish) => {
    const dishWithId = {
      ...newDish,
      id: newDish.id || `dish-${Date.now()}`,
      inStock: newDish.inStock ?? true,
      isBestseller: newDish.isBestseller ?? false
    };

    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: [dishWithId, ...(m.dishes || [])]
        };
      }
      return m;
    }));

    showToast('Listing Published! 🍽️', `"${dishWithId.name}" added to menu on Customer App`, 'success');
    playSound('success');

    try {
      const res = await api.addDish(merchantId, dishWithId);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync addDish]', err.message);
    }
  };

  const updateMerchantDish = async (merchantId, dishId, updatedDish) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: (m.dishes || []).map(d => d.id === dishId ? { ...d, ...updatedDish } : d)
        };
      }
      return m;
    }));

    showToast('Listing Updated ✏️', 'Dish details updated live in Database', 'info');

    try {
      const res = await api.updateDish(merchantId, dishId, updatedDish);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync updateDish]', err.message);
    }
  };

  const deleteMerchantDish = async (merchantId, dishId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: (m.dishes || []).filter(d => d.id !== dishId)
        };
      }
      return m;
    }));

    showToast('Listing Removed 🗑️', 'Dish deleted from store menu in Database', 'info');

    try {
      const res = await api.deleteDish(merchantId, dishId);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync deleteDish]', err.message);
    }
  };

  const toggleDishStock = async (merchantId, dishId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: (m.dishes || []).map(d => d.id === dishId ? { ...d, inStock: !d.inStock } : d)
        };
      }
      return m;
    }));

    try {
      const res = await api.toggleDishStock(merchantId, dishId);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync toggleStock]', err.message);
    }
  };

  const updateMerchantProfile = async (merchantId, updatedFields) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, ...updatedFields };
      }
      return m;
    }));

    showToast('Store Profile Updated 🏪', 'Operational parameters saved in Database', 'success');

    try {
      const res = await api.updateMerchant(merchantId, updatedFields);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync updateProfile]', err.message);
    }
  };

  const toggleMerchantOpenStatus = async (merchantId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const nextState = !m.isOpen;
        showToast('Store Status Changed', `${m.name} is now ${nextState ? 'OPEN for online orders' : 'CLOSED temporarily'}`, nextState ? 'success' : 'info');
        return { ...m, isOpen: nextState };
      }
      return m;
    }));

    try {
      const res = await api.toggleMerchantStatus(merchantId);
      if (res?.merchants && Array.isArray(res.merchants)) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync toggleStatus]', err.message);
    }
  };

  // KDS Actions (Synced to Main Backend)
  const merchantAcceptOrder = (orderId, prepTime = 18) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          orderStatus: 'accepted',
          prepTimeRemaining: prepTime
        };
      }
      return ord;
    }));

    api.updateOrderStatus(orderId, 'accepted').catch(err => console.warn('[Backend Sync]', err.message));
    showToast('Order Accepted! 👨‍🍳', `Chef started preparing. Delivery partners have been notified.`, 'info');
    playSound('order');
  };

  const merchantRejectOrder = (orderId, reason = 'Kitchen overloaded') => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'cancelled', cancelReason: reason };
      }
      return ord;
    }));

    api.updateOrderStatus(orderId, 'cancelled').catch(err => console.warn('[Backend Sync]', err.message));
    showToast('Order Rejected', `Order #${orderId} was cancelled`, 'error');
  };

  const merchantSetReadyForPickup = (orderId) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'ready_for_pickup', prepTimeRemaining: 0 };
      }
      return ord;
    }));

    api.updateOrderStatus(orderId, 'ready_for_pickup').catch(err => console.warn('[Backend Sync]', err.message));
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast('Food Ready 📦', `Order #${orderId} packed & waiting for delivery rider`, 'success');
    playSound('success');
  };

  return (
    <MerchantContext.Provider
      value={{
        activeMerchantId,
        setActiveMerchantId,
        merchantUser,
        isMerchantAuthenticated,
        loginMerchant,
        registerMerchantAccount,
        logoutMerchant,
        merchants,
        setMerchants,
        currentMerchant,
        orders,
        setOrders,
        createMerchant,
        addMerchantDish,
        updateMerchantDish,
        deleteMerchantDish,
        toggleDishStock,
        updateMerchantProfile,
        toggleMerchantOpenStatus,
        merchantAcceptOrder,
        merchantRejectOrder,
        merchantSetReadyForPickup,
        refreshFromBackend,
        toast,
        showToast,
        playSound
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
};
