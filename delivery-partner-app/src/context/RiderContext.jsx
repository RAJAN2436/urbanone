import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

const RiderContext = createContext(null);

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error('useRider must be used within a RiderProvider');
  }
  return context;
};

// Default Ushait Town Center coordinates (PIN 243641)
const USHAIT_CENTER_COORDS = { lat: 27.8048, lng: 79.2882 };

// Helper to retrieve active server URL with mobile & custom IP persistence
export const getActiveServerUrl = () => {
  try {
    const saved = localStorage.getItem('kalsen_custom_server_url');
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
  } catch (e) {}
  return import.meta.env.VITE_API_URL 
    || import.meta.env.VITE_SERVER_URL
    || 'https://urbanone.onrender.com';
};

export const API_BASE = getActiveServerUrl();
export const apiUrl = (path) => `${getActiveServerUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

export const RiderProvider = ({ children }) => {
  // Authenticated Rider Account (from Login/Register)
  const [authRider, setAuthRider] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_rider_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear stale Arjun Verma / r1 demo data
        if (parsed && (parsed.id === 'r1' || parsed.name === 'Arjun Verma')) {
          localStorage.removeItem('kalsen_rider_auth');
          localStorage.removeItem('kalsen_rider_profile');
          localStorage.setItem('kalsen_rider_online', 'false');
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  });

  // Dynamic Server URL Management for Mobile & Cross-Network Access
  const [serverUrl, setServerUrl] = useState(() => getActiveServerUrl());

  const updateServerUrl = (newUrl) => {
    const cleanUrl = newUrl?.trim().replace(/\/+$/, '') || 'https://urbanone.onrender.com';
    try {
      localStorage.setItem('kalsen_custom_server_url', cleanUrl);
    } catch (e) {}
    setServerUrl(cleanUrl);
    showToast('Server Updated 🌐', `Connecting to: ${cleanUrl}`, 'info');
    setTimeout(() => { window.location.reload(); }, 600);
  };

  const resetServerUrl = () => {
    try {
      localStorage.removeItem('kalsen_custom_server_url');
    } catch (e) {}
    const defaultUrl = 'https://urbanone.onrender.com';
    setServerUrl(defaultUrl);
    showToast('Server Reset 🔄', `Reset to: ${defaultUrl}`, 'info');
    setTimeout(() => { window.location.reload(); }, 600);
  };

  // Rider Profile - Clean defaults connected to platform or authenticated rider
  const [rider, setRider] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_rider_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          todayTrips: Number(parsed.todayTrips) || 0,
          todayEarnings: Number(parsed.todayEarnings) || 0,
          codCashInHand: Number(parsed.codCashInHand) || 0,
          totalDeliveries: Number(parsed.totalDeliveries) || 0,
          vehicle: typeof parsed.vehicle === 'object' && parsed.vehicle !== null ? parsed.vehicle : {
            model: 'Ather 450X (EV Pro)',
            number: parsed.vehicleNumber || '',
            type: 'Electric 2-Wheeler'
          }
        };
      }
    } catch (e) {}
    return {
      id: `rider-${Date.now()}`,
      name: '',
      badge: 'Fleet Partner',
      phone: '',
      email: '',
      drivingLicenseNumber: '',
      vehicle: {
        model: '',
        number: '',
        type: 'Electric 2-Wheeler'
      },
      battery: 88,
      rating: 5.0,
      ratingCount: 0,
      todayTrips: 0,
      todayEarnings: 0,
      codCashInHand: 0,
      totalDeliveries: 0,
      onlineHours: '0h 00m',
      hubLocation: 'Ushait Center (243641)'
    };
  });

  const [isOnline, setIsOnline] = useState(() => {
    return localStorage.getItem('kalsen_rider_online') !== 'false';
  });

  // Current GPS coordinates of Rider
  const [currentLocation, setCurrentLocation] = useState(USHAIT_CENTER_COORDS);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const socketRef = useRef(null);
  const incomingTimerRef = useRef(null);
  const dismissedOrderIdsRef = useRef(new Set());
  const activeOrderIdRef = useRef(null);

  // Toast Notification helper
  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Sound effects
  const playSound = (type = 'alert') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'incoming') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  // Live GPS tracking from device (HTML5 Geolocation)
  useEffect(() => {
    let watchId = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentLocation(coords);

          // Broadcast live location to server socket
          if (socketRef.current && isOnline) {
            socketRef.current.emit('rider:location_update', {
              riderId: rider.id,
              orderId: activeOrderIdRef.current,
              lat: coords.lat,
              lng: coords.lng,
              coords,
              timestamp: Date.now()
            });
          }
        },
        (err) => {
          console.warn('[Rider GPS] Using Ushait fallback:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, rider.id]);

  // Fetch initial orders & initialize socket
  useEffect(() => {
    fetchOrders();

    const socketUrl = API_BASE;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ [Rider Socket] Connected to Kalsen Backend');
      socket.emit('join:rider', rider.id);
    });

    socket.on('orders:updated', (payload) => {
      const list = Array.isArray(payload?.orders) ? payload.orders : (Array.isArray(payload) ? payload : null);
      if (list) {
        setOrders(list);
      }
    });

    const handleDispatch = (payload) => {
      const newOrder = payload?.order || payload;
      if (!newOrder?.id || !isOnline) return;
      if (payload?.dispatchType === 'assigned' && newOrder.riderId && newOrder.riderId !== rider.id && newOrder.riderId !== authRider?.id) {
        return;
      }
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      const waiting = ['accepted', 'preparing', 'ready', 'ready_for_pickup'].includes(newOrder.orderStatus);
      if (waiting && !newOrder.riderId) {
        setIncomingOrder(newOrder);
        playSound('incoming');
        showToast('Delivery Request 🛵', `Merchant accepted order #${newOrder.id}. Accept to pick up.`, 'info');
      }
    };

    socket.on('rider:dispatch', handleDispatch);

    socket.on('order:status_updated', (payload) => {
      const updatedOrder = payload?.order || payload;
      if (updatedOrder && updatedOrder.id) {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
      }
    });

    socket.on('order:updated', (payload) => {
      const updatedOrder = payload?.order || payload;
      if (updatedOrder && updatedOrder.id) {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
      }
    });

    socket.on('rider:approval_updated', (payload) => {
      if (payload && (!authRider || payload.riderId === authRider.id)) {
        const isApprovedNow = payload.approvalStatus === 'approved' || payload.kycVerified;
        setAuthRider((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            approvalStatus: payload.approvalStatus,
            kycVerified: isApprovedNow
          };
          try { localStorage.setItem('kalsen_rider_auth', JSON.stringify(next)); } catch (e) {}
          return next;
        });

        if (isApprovedNow) {
          playSound('success');
          showToast('Account Approved! 🎉', 'Kalsen Admin has approved your application! You can now start taking deliveries.', 'success');
        }
      }
    });

    socket.on('riders:updated', (payload) => {
      const list = Array.isArray(payload?.riders) ? payload.riders : (Array.isArray(payload) ? payload : null);
      if (list && authRider) {
        const match = list.find(r => r.id === authRider.id || (authRider.phone && r.phone?.includes(authRider.phone.replace(/\D/g, '').slice(-10))));
        if (match) {
          const isApprovedNow = match.approvalStatus === 'approved' || match.kycVerified;
          setAuthRider((prev) => {
            const next = {
              ...prev,
              ...match,
              approvalStatus: match.approvalStatus || (isApprovedNow ? 'approved' : 'pending'),
              kycVerified: isApprovedNow
            };
            try { localStorage.setItem('kalsen_rider_auth', JSON.stringify(next)); } catch (e) {}
            return next;
          });
        }
      }
    });

    const pollInterval = setInterval(fetchOrders, 3500);

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [isOnline, rider.id, authRider?.id]);

  // Auto-poll approval status if pending
  useEffect(() => {
    if (!authRider || authRider.approvalStatus === 'approved' || authRider.kycVerified) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(apiUrl(`/api/auth/rider/${authRider.id}/status`));
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.rider) {
            const isApprovedNow = data.rider.approvalStatus === 'approved' || data.rider.kycVerified;
            if (isApprovedNow && authRider.approvalStatus !== 'approved') {
              setAuthRider(data.rider);
              try { localStorage.setItem('kalsen_rider_auth', JSON.stringify(data.rider)); } catch (e) {}
              playSound('success');
              showToast('Account Approved! 🎉', 'Admin has approved your registration! Dispatch duty is unlocked.', 'success');
            }
          }
        }
      } catch (e) {}
    }, 3500);

    return () => clearInterval(interval);
  }, [authRider?.id, authRider?.approvalStatus, authRider?.kycVerified]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(apiUrl('/api/orders'));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {}
  };

  const isApproved = Boolean(authRider && (authRider.approvalStatus === 'approved' || authRider.kycVerified));

  // Toggle duty status
  const toggleOnlineStatus = () => {
    if (!authRider) {
      showToast('Login Required', 'Please sign in or register to go online', 'error');
      return;
    }
    if (!isApproved) {
      showToast('Approval Pending ⏳', 'Your application is awaiting admin verification before you can go online', 'error');
      return;
    }
    const nextState = !isOnline;
    setIsOnline(nextState);
    localStorage.setItem('kalsen_rider_online', nextState.toString());
    const dutyId = authRider?.id || rider.id;
    fetch(apiUrl(`/api/riders/${dutyId}/duty`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: nextState })
    }).catch(() => {});
    if (socketRef.current?.connected) {
      socketRef.current.emit('rider:duty_update', { riderId: dutyId, isOnline: nextState });
    }
    if (nextState) {
      playSound('success');
      showToast('You are Online!', 'Ready to receive delivery orders from Ushait platform', 'success');
    } else {
      playSound('alert');
      showToast('You are Offline', 'No new delivery requests will be sent', 'info');
      setIncomingOrder(null);
    }
  };

  // Auth Operations
  const registerRider = async (formData) => {
    try {
      const res = await fetch(apiUrl('/api/auth/rider/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success && data.rider) {
        setAuthRider(data.rider);
        try {
          localStorage.setItem('kalsen_rider_auth', JSON.stringify(data.rider));
        } catch (e) {}
        playSound('success');
        return { success: true, rider: data.rider, message: data.message };
      } else {
        showToast('Registration Error', data.message || 'Failed to submit registration', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network Error', err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const loginRider = async (identifier, password) => {
    try {
      const res = await fetch(apiUrl('/api/auth/rider/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.rider) {
        setAuthRider(data.rider);
        try {
          localStorage.setItem('kalsen_rider_auth', JSON.stringify(data.rider));
        } catch (e) {}
        playSound('success');
        showToast(`Welcome back!`, `${data.rider.name}, you are signed in`, 'success');
        return { success: true, rider: data.rider };
      } else {
        return { success: false, message: data.message || 'Invalid mobile number/email or password' };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logoutRider = () => {
    try {
      localStorage.removeItem('kalsen_rider_auth');
      localStorage.setItem('kalsen_rider_online', 'false');
    } catch (e) {}
    setAuthRider(null);
    setIsOnline(false);
    showToast('Logged Out', 'Signed out from delivery partner fleet', 'info');
  };

  // Update rider profile details (name, phone, email, vehicle, photo)
  const updateRiderProfile = async (updates) => {
    // Optimistic local update first
    setAuthRider((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      try { localStorage.setItem('kalsen_rider_auth', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setRider((prev) => ({ ...prev, ...updates }));
    try {
      localStorage.setItem('kalsen_rider_profile', JSON.stringify({ ...rider, ...updates }));
    } catch (e) {}

    // Persist to server
    const targetId = authRider?.id || rider?.id;
    if (targetId) {
      try {
        const res = await fetch(apiUrl(`/api/auth/rider/${targetId}/profile`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.rider) {
            setAuthRider(data.rider);
            try { localStorage.setItem('kalsen_rider_auth', JSON.stringify(data.rider)); } catch (e) {}
          }
        }
      } catch (e) {}
    }

    playSound('success');
    showToast('Profile Updated! ✅', 'Your details have been saved successfully', 'success');
    return { success: true };
  };

  const checkApprovalStatus = async () => {
    if (!authRider?.id) return null;
    try {
      const res = await fetch(apiUrl(`/api/auth/rider/${authRider.id}/status`));
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.rider) {
          const isNowApproved = data.rider.approvalStatus === 'approved' || data.rider.kycVerified;
          setAuthRider(data.rider);
          try {
            localStorage.setItem('kalsen_rider_auth', JSON.stringify(data.rider));
          } catch (e) {}
          return data;
        }
      }
    } catch (e) {}
    return null;
  };

  // The logged-in rider's resolved ID (used for order matching)
  const currentRiderId = authRider?.id || rider.id;
  const activeOrder = orders.find(
    (o) =>
      ['rider_assigned', 'at_merchant', 'picked_up', 'on_the_way'].includes(o.orderStatus) &&
      o.riderId === currentRiderId
  ) || null;
  activeOrderIdRef.current = activeOrder?.id || null;

  // Identify orders awaiting delivery pickup placed from main platform (Only after Merchant has accepted)
  const availableOrders = orders.filter(
    (o) =>
      ['accepted', 'preparing', 'ready', 'ready_for_pickup'].includes(o.orderStatus) &&
      !o.riderId
  );

  // Completed deliveries from real platform orders
  const completedDeliveries = orders.filter(
    (o) => o.orderStatus === 'delivered' || o.isOtpVerified
  );

  // Auto-alert rider when a pending order is waiting and rider has no active task
  useEffect(() => {
    if (isOnline && !activeOrder && !incomingOrder && availableOrders.length > 0) {
      const unhandledOrder = availableOrders.find((o) => !dismissedOrderIdsRef.current.has(o.id));
      if (unhandledOrder) {
        setIncomingOrder(unhandledOrder);
        playSound('incoming');
      }
    }
  }, [isOnline, activeOrder?.id, availableOrders.length, incomingOrder]);

  // Real-time GPS location streaming to server and all connected portals
  useEffect(() => {
    if (!isOnline || !activeOrder || !socketRef.current) return;
    socketRef.current.emit('join:order', activeOrder.id);

    const streamInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('rider:location_update', {
          riderId: currentRiderId,
          riderName: rider.name,
          orderId: activeOrder.id,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          heading: 45
        });
      }
    }, 5000);

    return () => clearInterval(streamInterval);
  }, [isOnline, activeOrder?.id, currentRiderId, currentLocation.lat, currentLocation.lng]);

  // Accept incoming delivery order from main platform
  const acceptIncomingOrder = async (orderId) => {
    if (incomingTimerRef.current) clearTimeout(incomingTimerRef.current);
    const orderToAccept = incomingOrder?.id === orderId ? incomingOrder : orders.find((o) => o.id === orderId);
    setIncomingOrder(null);

    // Use resolved IDs — authRider.id takes priority over the raw default rider.id
    const resolvedRiderId = authRider?.id || rider.id;
    const resolvedRiderName = authRider?.name || authRider?.fullName || rider.name;
    const resolvedRiderPhone = authRider?.phone || authRider?.mobileNumber || rider.phone;

    const payload = {
      status: 'rider_assigned',
      riderId: resolvedRiderId,
      riderName: resolvedRiderName,
      riderPhone: resolvedRiderPhone,
      lat: currentLocation.lat,
      lng: currentLocation.lng
    };

    try {
      const res = await fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'rider_assigned', riderId: resolvedRiderId, ...payload } : o))
        );
      } else {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === orderId);
          if (exists) {
            return prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'rider_assigned', riderId: resolvedRiderId, ...payload } : o));
          }
          if (orderToAccept) {
            return [{ ...orderToAccept, orderStatus: 'rider_assigned', riderId: resolvedRiderId, ...payload }, ...prev];
          }
          return prev;
        });
      }
    } catch (e) {
      if (orderToAccept) {
        setOrders((prev) => [{ ...orderToAccept, orderStatus: 'rider_assigned', riderId: resolvedRiderId, ...payload }, ...prev.filter(o => o.id !== orderId)]);
      }
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('rider:location_update', {
        riderId: resolvedRiderId,
        orderId,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
    }

    playSound('success');
    showToast('Order Accepted! 🛵', 'Head to the restaurant for pickup', 'success');
  };

  // Reject / skip incoming order
  const rejectIncomingOrder = () => {
    if (incomingOrder?.id) {
      dismissedOrderIdsRef.current.add(incomingOrder.id);
    }
    setIncomingOrder(null);
    showToast('Order Skipped', 'Order remains available in your Tasks queue', 'info');
  };

  // Step 1: Rider arrives at merchant store
  const arriveAtMerchant = async (orderId) => {
    const payload = { 
      status: 'at_merchant',
      lat: currentLocation.lat,
      lng: currentLocation.lng 
    };

    try {
      await fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'at_merchant' } : o))
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit('rider:location_update', {
        riderId: rider.id,
        orderId,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
    }

    playSound('success');
    showToast('Arrived at Store 🏬', 'Show order ID to kitchen staff', 'info');
  };

  // Step 2: Rider picks up parcel from merchant
  const confirmPickup = async (orderId) => {
    const payload = { 
      status: 'picked_up',
      lat: currentLocation.lat,
      lng: currentLocation.lng 
    };

    try {
      await fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'picked_up' } : o))
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit('rider:location_update', {
        riderId: rider.id,
        orderId,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
    }

    playSound('success');
    showToast('Food Picked Up! 📦', 'Bag secured in thermal compartment', 'success');
  };

  // Step 3: Rider starts driving towards customer address
  const startDelivery = async (orderId) => {
    const payload = { 
      status: 'on_the_way',
      lat: currentLocation.lat,
      lng: currentLocation.lng 
    };

    try {
      await fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'on_the_way' } : o))
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit('rider:location_update', {
        riderId: rider.id,
        orderId,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
    }

    playSound('success');
    showToast('Out for Delivery 🚀', 'Heading to customer destination in Ushait', 'success');
  };

  // Step 4: Verify Delivery OTP with Customer Handover
  const verifyAndDeliver = async (orderId, otpCode) => {
    if (!otpCode || otpCode.length !== 4) {
      showToast('Invalid PIN', 'Please ask customer for 4-digit Delivery OTP', 'error');
      return { success: false, message: 'Invalid 4-digit PIN' };
    }

    try {
      const res = await fetch(apiUrl(`/api/orders/${orderId}/verify-delivery-otp`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Confetti celebration
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}

        const tripEarning = 45;
        setRider((prev) => ({
          ...prev,
          todayTrips: (prev.todayTrips || 0) + 1,
          todayEarnings: (prev.todayEarnings || 0) + tripEarning,
          totalDeliveries: (prev.totalDeliveries || 0) + 1
        }));

        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'delivered', isOtpVerified: true } : o))
        );

        playSound('success');
        showToast('Delivery Successful! 🎉', `+₹${tripEarning} credited to your payout balance`, 'success');
        return { success: true };
      } else {
        showToast('Incorrect OTP PIN', data.message || 'OTP does not match. Please verify with customer.', 'error');
        return { success: false, message: data.message };
      }
    } catch (e) {
      showToast('Verification Failed', 'Network error verifying OTP', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  // Google Maps Turn-by-Turn Navigation Trigger
  const openGoogleMapsNavigation = (destLat, destLng, destName = 'Destination') => {
    const lat = destLat || 27.8048;
    const lng = destLng || 79.2882;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `google.navigation:q=${lat},${lng}&mode=d`;
      setTimeout(() => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }, 800);
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(destName)}`,
        '_blank'
      );
    }
  };

  // Real-time dynamic stats strictly derived from real platform orders
  const totalTripPayout = completedDeliveries.reduce((sum, o) => sum + (o.deliveryFee || 45), 0);
  const totalCodCollected = completedDeliveries
    .filter((o) => {
      const pm = (o.paymentMethod || '').toLowerCase();
      return pm.includes('cash') || pm.includes('cod');
    })
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const stats = {
    todayEarnings: totalTripPayout,
    completedOrders: completedDeliveries.length,
    walletBalance: totalTripPayout,
    cashCollected: totalCodCollected,
    customerTips: 0
  };

  // Real past deliveries list derived directly from platform orders
  const pastDeliveries = completedDeliveries.map((o) => {
    const payout = o.deliveryFee || 45;
    const timeStr = o.createdAt
      ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now';
    return {
      id: o.id,
      merchant: o.merchantName || 'Kalsen Merchant',
      customer: `${o.customerName || 'Customer'} • ${o.deliveryAddress || 'Ushait'}`,
      distance: '1.4 km',
      payout,
      time: timeStr,
      totalAmount: o.grandTotal,
      paymentMethod: o.paymentMethod || 'Online UPI'
    };
  });

  const activeRider = {
    ...rider,
    id: authRider?.id || rider.id,
    name: authRider?.name || authRider?.fullName || rider.name,
    phone: authRider?.phone || authRider?.mobileNumber || rider.phone,
    email: authRider?.email || rider.email,
    photo: authRider?.photo || rider.photo,
    drivingLicenseNumber: authRider?.drivingLicenseNumber || rider.drivingLicenseNumber,
    vehicle: typeof authRider?.vehicle === 'object' && authRider.vehicle !== null
      ? authRider.vehicle
      : {
          model: authRider?.vehicleType || rider.vehicle?.model || 'Electric 2-Wheeler',
          number: authRider?.vehicleNumber || rider.vehicle?.number || '',
          type: 'Electric 2-Wheeler'
        },
    approvalStatus: authRider?.approvalStatus || (authRider?.kycVerified ? 'approved' : 'pending'),
    kycVerified: Boolean(authRider?.kycVerified || authRider?.approvalStatus === 'approved')
  };

  return (
    <RiderContext.Provider
      value={{
        rider: activeRider,
        setRider,
        riderProfile: activeRider,
        authRider,
        isApproved,
        isLoggedIn: Boolean(authRider && authRider.id),
        registerRider,
        loginRider,
        logoutRider,
        updateRiderProfile,
        checkApprovalStatus,
        isOnline,
        toggleOnlineStatus,
        toggleDuty: toggleOnlineStatus,
        currentLocation,
        riderLocation: currentLocation,
        orders,
        activeOrder,
        availableOrders,
        incomingOrder,
        setIncomingOrder,
        acceptIncomingOrder,
        rejectIncomingOrder,
        arriveAtMerchant,
        confirmPickup,
        startDelivery,
        verifyAndDeliver,
        openGoogleMapsNavigation,
        toast,
        showToast,
        playSound,
        stats,
        pastDeliveries,
        isConnected: true,
        serverUrl,
        updateServerUrl,
        resetServerUrl
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};
