import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_MERCHANTS, INITIAL_RIDERS, INITIAL_ORDERS, SURGE_ZONES, PROMO_CODES } from '../mockData';
import { api } from '../services/api';
import { io } from 'socket.io-client';

const PlatformContext = createContext(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

export const PlatformProvider = ({ children }) => {
  // Navigation & View Mode
  const [activeApp, setActiveApp] = useState('customer'); // 'customer' | 'rider' | 'merchant' | 'admin' | 'split'
  const [customerSubView, setCustomerSubView] = useState('landing'); // 'home' | 'login' | 'register' | 'merchant' | 'cart' | 'tracking' | 'profile' | 'landing'
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(() => {
    try {
      return localStorage.getItem('kalsen_active_tracking_order_id') || null;
    } catch (e) {
      return null;
    }
  });

  const clearTrackingData = () => {
    setActiveTrackingOrderId(null);
    try {
      localStorage.removeItem('kalsen_active_tracking_order_id');
    } catch (e) {}
  };

  const updateActiveTrackingOrderId = (orderId) => {
    setActiveTrackingOrderId(orderId);
    try {
      if (orderId) {
        localStorage.setItem('kalsen_active_tracking_order_id', orderId);
      } else {
        localStorage.removeItem('kalsen_active_tracking_order_id');
      }
    } catch (e) {}
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kalsen_is_authenticated') === 'true';
  });

  // Core Datasets
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
  const [riders, setRiders] = useState(INITIAL_RIDERS);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_orders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(o => !o.id?.startsWith('ORD-88') && !o.id?.startsWith('ORD-9162') && !o.id?.startsWith('ORD-8671') && !o.id?.startsWith('demo-') && !o.id?.startsWith('mock-'));
        }
      }
    } catch (e) {}
    return INITIAL_ORDERS;
  });
  const [surgeZones, setSurgeZones] = useState(SURGE_ZONES);
  const [promos, setPromos] = useState([]);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(false); // REAL MODE: No simulation

  // Sync state from Live MongoDB Backend API
  const refreshFromBackend = async () => {
    try {
      const [merchantsRes, ordersRes, ridersRes, zonesRes, promosRes] = await Promise.allSettled([
        api.getMerchants(),
        api.getOrders(),
        api.getRiders(),
        api.getSurgeZones(),
        api.getPromos()
      ]);

      if (merchantsRes.status === 'fulfilled') {
        const list = Array.isArray(merchantsRes.value?.merchants) ? merchantsRes.value.merchants : [];
        setMerchants(list);
        try { localStorage.setItem('kalsen_merchants_data', JSON.stringify(list)); } catch (e) {}
      }
      if (ordersRes.status === 'fulfilled') {
        const list = Array.isArray(ordersRes.value?.orders) ? ordersRes.value.orders : [];
        setOrders(list);
        try { localStorage.setItem('kalsen_orders_data', JSON.stringify(list)); } catch (e) {}
        
        // Auto-clear tracking data if active tracked order has been delivered or cancelled
        if (activeTrackingOrderId) {
          const tracked = list.find(o => o.id === activeTrackingOrderId);
          if (tracked && (tracked.orderStatus === 'delivered' || tracked.orderStatus === 'cancelled')) {
            clearTrackingData();
          }
        }
      }
      if (ridersRes.status === 'fulfilled' && Array.isArray(ridersRes.value?.riders)) {
        setRiders(ridersRes.value.riders);
        try { localStorage.setItem('kalsen_riders_data', JSON.stringify(ridersRes.value.riders)); } catch (e) {}
      }
      if (zonesRes.status === 'fulfilled' && Array.isArray(zonesRes.value?.zones)) {
        setSurgeZones(zonesRes.value.zones);
        try { localStorage.setItem('kalsen_surge_zones_data', JSON.stringify(zonesRes.value.zones)); } catch (e) {}
      }
      if (promosRes.status === 'fulfilled' && Array.isArray(promosRes.value?.promos)) {
        setPromos(promosRes.value.promos);
      }
    } catch (err) {
      console.warn('[PlatformContext] Backend sync notice:', err.message);
    }
  };

  // Real-time data sync via Socket.io + SQLite backend initial sync
  useEffect(() => {
    refreshFromBackend();

    const socketUrl = import.meta.env.VITE_SERVER_URL 
      || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? `http://${window.location.hostname}:5000`
          : 'https://urbanone.onrender.com');

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    // Merchants update (live dish catalog, stock, and status updates)
    socket.on('merchants:updated', (payload) => {
      const list = Array.isArray(payload?.merchants) ? payload.merchants : (Array.isArray(payload) ? payload : null);
      if (list) {
        setMerchants(list);
        try { localStorage.setItem('kalsen_merchants_data', JSON.stringify(list)); } catch (e) {}
      }
    });

    // Orders update
    socket.on('orders:updated', (payload) => {
      const list = Array.isArray(payload?.orders) ? payload.orders : (Array.isArray(payload) ? payload : null);
      if (list) {
        setOrders(list);
        try { localStorage.setItem('kalsen_orders_data', JSON.stringify(list)); } catch (e) {}
        // Clear tracking data if the tracked order is marked delivered
        setActiveTrackingOrderId(prev => {
          if (!prev) return null;
          const match = list.find(o => o.id === prev);
          if (match && (match.orderStatus === 'delivered' || match.orderStatus === 'cancelled')) {
            try { localStorage.removeItem('kalsen_active_tracking_order_id'); } catch (e) {}
            return null;
          }
          return prev;
        });
      }
    });

    // Real-time Order Status Update from Merchant or Rider App
    socket.on('order:status_updated', (payload) => {
      const updatedOrder = payload?.order || payload;
      if (updatedOrder && updatedOrder.id) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
        if (updatedOrder.orderStatus === 'delivered' || updatedOrder.orderStatus === 'cancelled') {
          setActiveTrackingOrderId(prev => {
            if (prev === updatedOrder.id) {
              try { localStorage.removeItem('kalsen_active_tracking_order_id'); } catch (e) {}
              return null;
            }
            return prev;
          });
        }
      }
    });

    socket.on('order:updated', (payload) => {
      const updatedOrder = payload?.order || payload;
      if (updatedOrder && updatedOrder.id) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
        if (updatedOrder.orderStatus === 'delivered' || updatedOrder.orderStatus === 'cancelled') {
          setActiveTrackingOrderId(prev => {
            if (prev === updatedOrder.id) {
              try { localStorage.removeItem('kalsen_active_tracking_order_id'); } catch (e) {}
              return null;
            }
            return prev;
          });
        }
      }
    });

    // Real-time GPS location streaming from Delivery Partner
    socket.on('rider:location_updated', (data) => {
      if (data && data.orderId) {
        setOrders(prev => prev.map(o => {
          if (o.id === data.orderId) {
            return {
              ...o,
              riderLat: data.lat,
              riderLng: data.lng,
              riderCoords: { lat: data.lat, lng: data.lng, x: 40, y: 38 }
            };
          }
          return o;
        }));
      }
    });

    // Riders update
    socket.on('riders:updated', (payload) => {
      const list = Array.isArray(payload?.riders) ? payload.riders : (Array.isArray(payload) ? payload : null);
      if (list) {
        setRiders(list);
        try { localStorage.setItem('kalsen_riders_data', JSON.stringify(list)); } catch (e) {}
      }
    });

    // Surge zones update
    socket.on('surge:updated', (payload) => {
      const list = Array.isArray(payload?.zones) ? payload.zones : (Array.isArray(payload) ? payload : null);
      if (list) {
        setSurgeZones(list);
        try { localStorage.setItem('kalsen_surge_zones_data', JSON.stringify(list)); } catch (e) {}
      }
    });
    socket.on('surgeZones:updated', (payload) => {
      const list = Array.isArray(payload?.zones) ? payload.zones : (Array.isArray(payload) ? payload : null);
      if (list) {
        setSurgeZones(list);
        try { localStorage.setItem('kalsen_surge_zones_data', JSON.stringify(list)); } catch (e) {}
      }
    });

    // Promo codes update from MongoDB
    socket.on('promos:updated', (payload) => {
      const list = Array.isArray(payload?.promos) ? payload.promos : (Array.isArray(payload) ? payload : null);
      if (list) {
        setPromos(list);
      }
    });

    const interval = setInterval(refreshFromBackend, 3500);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  // Default empty guest profile (no demo data — only shows user-registered data)
  const EMPTY_GUEST_PROFILE = {
    id: '',
    name: '',
    phone: '',
    email: '',
    avatar: null,
    tier: 'Gold VIP',
    loyaltyPoints: 0,
    walletBalance: 0,
    streakCount: 0,
    referralCode: '',
    addresses: [],
    selectedAddressId: '',
    profileCompleted: false
  };

  // Customer Profile & State
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('kalsen_customer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) {}
    }
    return EMPTY_GUEST_PROFILE;
  });

  const formatCustomerData = (user, prev = {}) => {
    if (!user) return prev || EMPTY_GUEST_PROFILE;
    const rawAddresses = Array.isArray(user.addresses) && user.addresses.length > 0 
      ? user.addresses 
      : (Array.isArray(prev?.addresses) && prev.addresses.length > 0 ? prev.addresses : []);
    
    const safePhone = user.phone || prev?.phone || '';
    const safeName = user.name || prev?.name || '';
    
    const hasPhone = Boolean(safePhone && safePhone.replace(/\D/g, '').length >= 10);
    const hasAddress = Boolean(rawAddresses.length > 0 && rawAddresses[0]?.street);
    const hasName = Boolean(safeName && safeName.trim().length > 0);
    
    const isCompleted = user.profileCompleted === true || user.profile_completed === true || (hasPhone && hasAddress && hasName);

    return {
      id: user.id || user._id || prev?.id || `cust-${Date.now()}`,
      name: safeName,
      phone: safePhone,
      email: user.email || prev?.email || '',
      avatar: user.avatar || prev?.avatar || null,
      tier: user.tier || prev?.tier || 'Gold VIP',
      loyaltyPoints: user.loyaltyPoints ?? user.loyalty_points ?? prev?.loyaltyPoints ?? 200,
      walletBalance: user.walletBalance ?? user.wallet_balance ?? prev?.walletBalance ?? 150,
      streakCount: user.streakCount ?? user.streak_count ?? prev?.streakCount ?? 1,
      referralCode: user.referralCode || user.referral_code || prev?.referralCode || `KALSEN-${Date.now().toString().slice(-4)}`,
      addresses: rawAddresses,
      selectedAddressId: rawAddresses[0]?.id || prev?.selectedAddressId || '',
      profileCompleted: isCompleted
    };
  };

  const [isProfileModalDismissed, setIsProfileModalDismissed] = useState(false);
  const dismissProfileModal = () => setIsProfileModalDismissed(true);

  // Sync latest user profile from backend MongoDB on mount/login
  useEffect(() => {
    if (isAuthenticated && customer?.id) {
      api.getUserProfile(customer.id).then(res => {
        if (res?.user) {
          setCustomer(prev => {
            const updated = formatCustomerData(res.user, prev);
            try { localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
        }
      }).catch(err => {
        console.warn('[PlatformContext] User profile sync notice:', err.message);
      });
    }
  }, [isAuthenticated, customer?.id]);

  const login = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('kalsen_is_authenticated', 'true');
    setCustomer(prev => {
      const updated = formatCustomerData(userData, prev);
      localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const register = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('kalsen_is_authenticated', 'true');
    setCustomer(prev => {
      const updated = formatCustomerData(userData, prev);
      localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const completeProfile = async ({ name, phone, address, landmark, pinCode }) => {
    const userId = customer?.id || customer?._id;
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const formattedPhone = cleanPhone ? `+91 ${cleanPhone}` : '';
    const newAddressObj = {
      id: `a-${Date.now()}`,
      tag: 'Home',
      street: (address || '').trim(),
      landmark: (landmark || 'Main Market Road, Near Clock Tower').trim(),
      pinCode: (pinCode || '').trim(),
      coords: { x: 40, y: 40 }
    };

    // Optimistically update local state immediately so user is never frozen
    const updatedLocally = {
      ...customer,
      name: name?.trim() || customer?.name,
      phone: formattedPhone || customer?.phone,
      addresses: [newAddressObj, ...(customer?.addresses || []).filter(a => a.street !== newAddressObj.street)],
      selectedAddressId: newAddressObj.id,
      profileCompleted: true
    };

    setCustomer(updatedLocally);
    setIsProfileModalDismissed(true);
    try {
      localStorage.setItem('kalsen_customer_profile', JSON.stringify(updatedLocally));
    } catch (e) {}

    // Persist to backend MongoDB
    try {
      const res = await api.completeProfile({
        userId,
        name: name?.trim(),
        phone: cleanPhone,
        address: address?.trim(),
        landmark: landmark?.trim(),
        pinCode: pinCode?.trim()
      });

      if (res && res.user) {
        const synced = formatCustomerData({ ...res.user, profileCompleted: true }, updatedLocally);
        setCustomer(synced);
        try {
          localStorage.setItem('kalsen_customer_profile', JSON.stringify(synced));
        } catch (e) {}
        return synced;
      }
    } catch (err) {
      console.warn('[PlatformContext completeProfile sync notice]:', err.message);
    }
    return updatedLocally;
  };

  const isProfileIncomplete = Boolean(
    isAuthenticated &&
    customer &&
    customer.id &&
    !isProfileModalDismissed &&
    customer.profileCompleted !== true &&
    (
      !customer.phone ||
      (customer.phone || '').replace(/\D/g, '').length < 10 ||
      !customer.addresses ||
      customer.addresses.length === 0 ||
      !customer.addresses[0]?.street
    )
  );

  const logout = () => {
    setIsAuthenticated(false);
    setIsProfileModalDismissed(false);
    localStorage.setItem('kalsen_is_authenticated', 'false');
    localStorage.removeItem('kalsen_customer_profile');
    setCustomer(EMPTY_GUEST_PROFILE);
    showToast('Logged Out', 'You have been signed out safely', 'info');
    setCustomerSubView('home');
  };

  // Set active delivery address
  const setSelectedAddress = (addressId) => {
    if (!addressId) return;
    setCustomer(prev => {
      const updated = {
        ...prev,
        selectedAddressId: addressId
      };
      try {
        localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    const addr = (customer?.addresses || []).find(a => a.id === addressId);
    if (addr) {
      showToast('Delivery Address Updated', `Delivering to ${addr.tag || 'Address'}: ${addr.street}`, 'info');
    }
  };

  // Add new address to customer profile
  const addCustomerAddress = async ({ tag, street, landmark, pinCode, coords, setAsSelected = true }) => {
    if (!street || !street.trim()) return null;
    const newAddr = {
      id: `a-${Date.now()}`,
      tag: tag || 'Home',
      street: street.trim(),
      landmark: landmark || 'Ushait',
      pinCode: (pinCode || '').trim(),
      coords: coords || { x: 40, y: 40 }
    };
    setCustomer(prev => {
      const updated = {
        ...prev,
        addresses: [...(prev.addresses || []), newAddr],
        selectedAddressId: setAsSelected ? newAddr.id : (prev.selectedAddressId || newAddr.id)
      };
      try {
        localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const currentUserId = customer?.id || customer?._id;
    if (currentUserId) {
      try {
        await api.addAddress(currentUserId, newAddr);
      } catch (err) {
        console.warn('[PlatformContext addAddress notice]:', err.message);
      }
    }
    showToast('Address Saved', `New ${tag || 'Home'} address added successfully`, 'success');
    return newAddr;
  };

  // GPS Geolocation state & detection engine
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const detectGPSLocation = async () => {
    setIsLocatingGPS(true);
    showToast('Locating Device...', 'Detecting your delivery location...', 'info');

    // Helper to resolve coordinates into human-readable address
    const resolveLocationDetails = async (lat, lng, source = 'GPS') => {
      let detectedStreet = '';
      let detectedLandmark = '';
      let detectedPinCode = '';
      let detectedLocality = 'Ushait';

      // 1. Try backend reverse geocoder
      try {
        const backendRes = await api.reverseGeocode(lat, lng);
        if (backendRes && backendRes.success && backendRes.data) {
          const d = backendRes.data;
          detectedStreet = d.street || '';
          detectedLandmark = d.landmark || '';
          detectedPinCode = d.pinCode || '';
          detectedLocality = d.locality || 'Ushait';
        }
      } catch (e) {}

      // 2. Direct BigDataCloud client fallback
      if (!detectedStreet) {
        try {
          const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          if (bdcRes.ok) {
            const bdc = await bdcRes.json();
            detectedLocality = bdc.locality || bdc.city || 'Ushait';
            detectedPinCode = bdc.postcode || '243641';
            detectedStreet = `Main Road, ${detectedLocality}`;
            detectedLandmark = `${detectedLocality}, ${bdc.principalSubdivision || 'Uttar Pradesh'}`;
          }
        } catch (e) {}
      }

      // Ensure KalsenOne delivery zone PIN 243641 is set
      const finalPin = '243641';
      const finalLocality = 'Ushait';

      if (!detectedStreet || detectedStreet.includes('Agra') || detectedStreet.includes('Bareilly')) {
        detectedStreet = 'Main Market Road, Ushait';
        detectedLandmark = 'Near Clock Tower, Ushait';
      }

      return {
        id: `gps-${Date.now()}`,
        tag: source === 'GPS' ? 'Current GPS' : 'Detected Area',
        street: detectedStreet,
        landmark: detectedLandmark ? `${detectedLandmark} (${finalPin})` : `Ushait, UP (${finalPin})`,
        pinCode: finalPin,
        locality: finalLocality,
        source,
        coords: { lat, lng, x: 45, y: 45 }
      };
    };

    // Helper for Network IP / Local Ushait fallback
    const fetchFallbackLocation = async () => {
      return {
        id: `local-${Date.now()}`,
        tag: 'Ushait Center',
        street: 'Main Market Road, Ushait',
        landmark: 'Near Clock Tower, Ushait (Budaun)',
        pinCode: '243641',
        locality: 'Ushait',
        source: 'Hyperlocal Ushait (243641)',
        coords: { lat: 27.8048, lng: 79.2882, x: 45, y: 45 }
      };
    };

    return new Promise(async (resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        console.warn('[GPS] Geolocation unsupported, using network fallback');
        const fallback = await fetchFallbackLocation();
        setIsLocatingGPS(false);
        showToast('Location Detected 📍', `${fallback.street}`, 'info');
        resolve({ success: true, address: fallback, isFallback: true });
        return;
      }

      let hasHandled = false;

      // Safety timeout: if browser doesn't reply in 4.5 seconds, use fallback
      const timer = setTimeout(async () => {
        if (!hasHandled) {
          hasHandled = true;
          console.warn('[GPS Timeout] Using Network / Ushait location fallback');
          const fallback = await fetchFallbackLocation();
          setIsLocatingGPS(false);
          showToast('Location Detected (Auto) 📍', `${fallback.street}`, 'info');
          resolve({ success: true, address: fallback, isFallback: true });
        }
      }, 4500);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (hasHandled) return;
          hasHandled = true;
          clearTimeout(timer);

          const { latitude, longitude } = position.coords;
          console.log(`[GPS Acquired] Lat: ${latitude}, Lon: ${longitude}`);
          const details = await resolveLocationDetails(latitude, longitude, 'GPS');
          setIsLocatingGPS(false);
          showToast('GPS Location Detected! 📍', `${details.street}`, 'success');
          resolve({ success: true, address: details, isFallback: false });
        },
        async (error) => {
          if (hasHandled) return;
          hasHandled = true;
          clearTimeout(timer);

          console.warn('[Browser GPS Notice]:', error.message, '- Falling back to Network Location');
          const fallback = await fetchFallbackLocation();
          setIsLocatingGPS(false);
          showToast('Location Detected (Network) 📍', `${fallback.street}`, 'info');
          resolve({ success: true, address: fallback, isFallback: true });
        },
        {
          enableHighAccuracy: false, // Fast network/WiFi triangulation (works on PC & phone)
          timeout: 4000,
          maximumAge: 60000 // Cache for 1 min for fast repeated clicks
        }
      );
    });
  };

  // Confirm & Save verified GPS address
  const confirmGPSAddress = async (confirmedAddr) => {
    if (!confirmedAddr || !confirmedAddr.street) return;

    setCustomer(prev => {
      const filtered = (prev.addresses || []).filter(a => a.tag !== 'Current GPS' && a.id !== confirmedAddr.id);
      const updated = {
        ...prev,
        addresses: [confirmedAddr, ...filtered],
        selectedAddressId: confirmedAddr.id
      };
      try {
        localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const currentUserId = customer?.id || customer?._id;
    if (currentUserId) {
      try {
        await api.addAddress(currentUserId, confirmedAddr);
      } catch (err) {
        console.warn('[Sync GPS Address Error]:', err.message);
      }
    }

    showToast('GPS Address Confirmed 📍', `${confirmedAddr.street}`, 'success');
  };

  // Delete address from customer profile
  const deleteCustomerAddress = async (addressId) => {
    if (!addressId) return;

    setCustomer(prev => {
      const remaining = (prev.addresses || []).filter(a => a.id !== addressId);
      const nextSelected = prev.selectedAddressId === addressId
        ? (remaining[0]?.id || '')
        : prev.selectedAddressId;

      const updated = {
        ...prev,
        addresses: remaining,
        selectedAddressId: nextSelected
      };
      try {
        localStorage.setItem('kalsen_customer_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (customer?.id) {
      try {
        await api.deleteAddress(customer.id, addressId);
      } catch (err) {
        console.warn('[PlatformContext deleteAddress notice]:', err.message);
      }
    }

    showToast('Address Deleted', 'Address removed from your profile', 'info');
  };

  // Active Cart State - Clean & live (no demo mock items)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kalsen_customer_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.items)) return parsed;
      }
    } catch (e) {}
    return {
      merchantId: null,
      items: [],
      appliedPromo: null,
      tip: 0,
      useLoyaltyPoints: false,
      deliveryInstructions: ""
    };
  });

  // Sync active cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kalsen_customer_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Toast Notification Stream
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Audio effect helper (Web Audio API synthetics for instant feedback without external assets)
  const playSound = (type = 'ding') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'order') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context may be restricted by browser policy before first interaction
    }
  };

  // Cart operations
  const addToCart = (dish, customizationsText = '') => {
    const merchant = merchants.find(m => m.dishes.some(d => d.id === dish.id));
    if (!merchant) return;

    if (cart.items.length > 0 && cart.merchantId !== merchant.id) {
      if (window.confirm(`Your cart has items from ${merchants.find(m => m.id === cart.merchantId)?.name || 'another restaurant'}. Reset cart to order from ${merchant.name}?`)) {
        setCart({
          merchantId: merchant.id,
          items: [{ ...dish, quantity: 1, customizations: customizationsText }],
          appliedPromo: null,
          tip: 20,
          useLoyaltyPoints: false,
          deliveryInstructions: ""
        });
        showToast('Cart Updated', `Added ${dish.name} from ${merchant.name}`, 'success');
        playSound('order');
      }
      return;
    }

    const existingIndex = cart.items.findIndex(item => item.id === dish.id && (item.customizations || '') === customizationsText);
    if (existingIndex >= 0) {
      const updated = [...cart.items];
      updated[existingIndex].quantity += 1;
      setCart({ ...cart, merchantId: merchant.id, items: updated });
    } else {
      setCart({
        ...cart,
        merchantId: merchant.id,
        items: [...cart.items, { ...dish, quantity: 1, customizations: customizationsText }]
      });
    }
    showToast('Added to Cart', `${dish.name} added`, 'success');
    playSound('order');
  };

  const updateCartItemQuantity = (index, delta) => {
    const updated = [...cart.items];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart({
      ...cart,
      items: updated,
      merchantId: updated.length === 0 ? null : cart.merchantId
    });
  };

  const clearCart = () => {
    setCart({
      merchantId: null,
      items: [],
      appliedPromo: null,
      tip: 0,
      useLoyaltyPoints: false,
      deliveryInstructions: ""
    });
    try {
      localStorage.removeItem('kalsen_customer_cart');
    } catch (e) {}
  };

  // Place Order Workflow
  const placeOrder = (paymentMethod = "UPI (Google Pay)") => {
    if (!isAuthenticated) {
      showToast('Sign In Required', 'Please sign in or create an account to place your order.', 'warning');
      setCustomerSubView('login');
      return null;
    }

    const cartItems = Array.isArray(cart?.items) ? cart.items : [];
    if (cartItems.length === 0) return null;

    const safeMerchants = Array.isArray(merchants) && merchants.length > 0 ? merchants : INITIAL_MERCHANTS;
    const merchant = safeMerchants.find(m => m.id === cart?.merchantId) || safeMerchants[0] || INITIAL_MERCHANTS[0] || {};
    const itemTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const taxes = Math.round(itemTotal * 0.05);
    const deliveryFee = itemTotal > 400 ? 0 : 35;
    
    let discount = 0;
    if (cart?.appliedPromo) {
      if (cart.appliedPromo.discountPercent) {
        discount = Math.min(Math.round(itemTotal * (cart.appliedPromo.discountPercent / 100)), cart.appliedPromo.maxDiscount || 999);
      } else if (cart.appliedPromo.discountAmount) {
        discount = cart.appliedPromo.discountAmount;
      } else if (cart.appliedPromo.freeDelivery) {
        discount = deliveryFee;
      }
    }

    const loyaltyPoints = customer?.loyaltyPoints || 0;
    const loyaltyDiscount = cart?.useLoyaltyPoints ? Math.min(Math.floor(loyaltyPoints * 0.25), itemTotal) : 0;
    const grandTotal = Math.max(0, itemTotal + taxes + deliveryFee + (cart?.tip || 0) - discount - loyaltyDiscount);

    // If paid via wallet, check and deduct
    if (paymentMethod.includes('Wallet')) {
      if ((customer?.walletBalance || 0) < grandTotal) {
        showToast('Insufficient Balance', 'Please top up your Kalsen Wallet or choose UPI/Card', 'error');
        return null;
      }
      setCustomer(prev => ({ ...prev, walletBalance: (prev.walletBalance || 0) - grandTotal }));
    }

    // Deduct loyalty points if used, or award new points (10 pts per ₹100 spent)
    const earnedPoints = Math.floor(grandTotal / 10);
    setCustomer(prev => ({
      ...prev,
      loyaltyPoints: cart?.useLoyaltyPoints ? Math.max(0, (prev.loyaltyPoints || 0) - Math.floor(loyaltyDiscount / 0.25) + earnedPoints) : (prev.loyaltyPoints || 0) + earnedPoints,
      streakCount: (prev.streakCount || 0) + 1
    }));

    const safeAddresses = Array.isArray(customer?.addresses) && customer.addresses.length > 0 ? customer.addresses : [{ street: "Main Market Road", landmark: "Ushait", coords: { x: 45, y: 42 } }];
    const selectedAddr = safeAddresses.find(a => a.id === customer?.selectedAddressId) || safeAddresses[0];
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newOrderId,
      customerName: customer?.name || "Customer",
      customerPhone: customer?.phone || "+91 98765 43210",
      merchantId: merchant.id || "m1",
      merchantName: merchant.name || "Kalsen Kitchen",
      merchantCoords: merchant.coordinates || { x: 50, y: 50 },
      riderId: null,
      riderName: null,
      riderPhone: null,
      riderCoords: null,
      customerAddress: `${selectedAddr.street || 'Main Road'}, ${selectedAddr.landmark || 'Ushait'}`,
      customerCoords: selectedAddr.coords || { x: 45, y: 45 },
      items: [...cartItems],
      itemTotal,
      taxes,
      deliveryFee,
      discount: discount + loyaltyDiscount,
      tip: cart.tip || 0,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'PENDING_COD' : 'PAID',
      orderStatus: 'placed', // 'placed' -> 'accepted' -> 'preparing' -> 'ready_for_pickup' -> 'rider_assigned' -> 'picked_up' -> 'on_the_way' -> 'delivered'
      prepTimeRemaining: merchant.avgPrepTime || 20,
      etaMinutes: (merchant.avgPrepTime || 20) + 12,
      deliveryOtp: randomOtp,
      createdAt: new Date().toISOString(),
      messages: []
    };

    setOrders(prev => [newOrder, ...prev]);
    updateActiveTrackingOrderId(newOrderId);
    clearCart();

    // Persist order in SQLite Database asynchronously
    api.placeOrder({
      id: newOrderId,
      merchantId: merchant.id,
      items: cart.items,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: `${selectedAddr.street}, ${selectedAddr.landmark}`,
      itemTotal,
      taxes,
      deliveryFee,
      discountAmount: discount + loyaltyDiscount,
      grandTotal,
      deliveryOtp: randomOtp
    }).catch(err => console.warn('[SQLite DB Sync] Order save:', err.message));

    // Trigger celebration & audio
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    playSound('success');
    showToast('Order Placed Successfully! 🎉', `Order #${newOrderId} sent to ${merchant.name}`, 'success');

    // Auto switch customer view to tracking
    setCustomerSubView('tracking');

    return newOrder;
  };

  // Merchant Actions
  const merchantAcceptOrder = (orderId, prepTime = 18) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          orderStatus: 'accepted',
          prepTimeRemaining: prepTime,
          etaMinutes: prepTime + 10
        };
      }
      return ord;
    }));

    api.updateOrderStatus(orderId, 'accepted').catch(err => console.warn('[Backend Sync]', err.message));
    showToast('Merchant Accepted', `Chef started preparing Order #${orderId}`, 'info');
    playSound('order');
    // Real workflow: Delivery partner app will alert the online rider to accept delivery task
  };

  const merchantRejectOrder = (orderId, reason = "Kitchen overloaded") => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'cancelled', cancelReason: reason };
      }
      return ord;
    }));
    api.updateOrderStatus(orderId, 'cancelled').catch(err => console.warn('[SQLite Sync]', err.message));
    showToast('Order Rejected', `Order #${orderId} was cancelled by restaurant: ${reason}`, 'error');
    playSound('alert');
  };

  const merchantSetReadyForPickup = (orderId) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'ready_for_pickup', prepTimeRemaining: 0 };
      }
      return ord;
    }));
    api.updateOrderStatus(orderId, 'ready_for_pickup').catch(err => console.warn('[SQLite Sync]', err.message));
    showToast('Food Ready', `Order #${orderId} packed & waiting for pickup`, 'success');
  };

  // Rider Assignment Engine — fetches real online riders from backend, order is dispatched but
  // rider details are only revealed to customer once the delivery partner ACCEPTS the order
  const autoAssignRider = async (orderId) => {
    try {
      const res = await api.getRiders();
      const liveRiders = Array.isArray(res?.riders) ? res.riders : [];
      // Pick first approved + online rider who is not currently on an active delivery
      const availableRider = liveRiders.find(r =>
        r.isOnline &&
        (r.approvalStatus === 'approved' || r.kycVerified) &&
        !liveRiders.some(o => o.riderId === r.id)
      );

      if (!availableRider) {
        // No online approved rider — order stays as 'preparing', rider will pick it up
        console.log('[AutoDispatch] No online approved rider found. Order will be claimed by first available rider.');
        return;
      }

      // Update order status to rider_assigned on backend — delivery app rider will see it
      await api.updateOrderStatus(orderId, 'rider_assigned', {
        riderId: availableRider.id,
        riderName: availableRider.name,
        riderPhone: availableRider.phone
      });

      // Locally update state — riderName/Phone intentionally hidden until rider accepts
      setOrders(prev => prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: 'rider_assigned',
            riderId: availableRider.id,
            // Do NOT reveal riderName/Phone/Photo yet — only shown after acceptance
            riderName: null,
            riderPhone: null,
            riderPhoto: null
          };
        }
        return ord;
      }));

      showToast('Finding Your Rider 🛵', 'Dispatch sent to nearest online partner', 'info');
      playSound('order');
    } catch (err) {
      console.warn('[AutoDispatch Error]', err.message);
    }
  };

  // Rider Actions
  const riderArrivedAtMerchant = (orderId) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'at_merchant' };
      }
      return ord;
    }));
    api.updateOrderStatus(orderId, 'at_merchant').catch(err => console.warn('[SQLite Sync]', err.message));
    showToast('Rider Arrived', 'Rider has reached restaurant to pick up order', 'info');
  };

  const riderPickupOrder = (orderId) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, orderStatus: 'picked_up' };
      }
      return ord;
    }));

    api.updateOrderStatus(orderId, 'picked_up').catch(err => console.warn('[SQLite Sync]', err.message));

    // Start simulated movement towards customer
    setRiders(prev => prev.map(r => {
      if (r.currentOrderIds.includes(orderId)) {
        return { ...r, status: 'navigating_to_customer' };
      }
      return r;
    }));

    showToast('Order Picked Up! 🚀', `Rider is on the way to customer address`, 'success');
    playSound('order');
  };

  const riderDeliverOrder = (orderId, inputOtp) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return { success: false, msg: 'Order not found' };

    if (inputOtp && inputOtp !== targetOrder.deliveryOtp) {
      showToast('Invalid OTP', 'The customer OTP did not match! Please check with customer.', 'error');
      playSound('alert');
      return { success: false, msg: 'Incorrect OTP' };
    }

    const riderPayout = 65 + (targetOrder.tip || 0) + 15; // Base + Tip + Surge bonus

    // Update Order
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          orderStatus: 'delivered',
          paymentStatus: 'PAID',
          deliveredAt: new Date().toISOString()
        };
      }
      return ord;
    }));

    // Verify delivery PIN with SQLite DB
    api.verifyDeliveryOtp(orderId, inputOtp || targetOrder.deliveryOtp).catch(err => {
      console.warn('[SQLite DB Sync] Delivery PIN verification:', err.message);
    });

    // Update Rider earnings & cash
    setRiders(prev => prev.map(r => {
      if (r.id === targetOrder.riderId) {
        return {
          ...r,
          status: 'idle',
          currentOrderIds: r.currentOrderIds.filter(id => id !== orderId),
          deliveriesToday: r.deliveriesToday + 1,
          earningsToday: r.earningsToday + riderPayout,
          weeklyEarnings: r.weeklyEarnings + riderPayout,
          cashInHand: targetOrder.paymentMethod.includes('Cash') ? r.cashInHand + targetOrder.grandTotal : r.cashInHand
        };
      }
      return r;
    }));

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    playSound('success');
    showToast('Order Delivered! 🎉', `Order #${orderId} marked successfully delivered. Rider earned ₹${riderPayout}`, 'success');

    // Clear tracking data upon delivery
    clearTrackingData();

    return { success: true, msg: 'Delivered successfully' };
  };

  // In-App Chat
  const sendChatMessage = (orderId, sender, text) => {
    if (!text.trim()) return;
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const newMsg = {
          sender, // 'customer' | 'rider' | 'merchant'
          text,
          time: 'Just now'
        };
        return { ...ord, messages: [...(ord.messages || []), newMsg] };
      }
      return ord;
    }));
    playSound('order');
  };


  // Quick Demo Simulator
  const triggerFullSimulation = () => {
    // 1. Reset Cart & Add Gourmet Pizza
    const pizzaStore = merchants[0];
    const dish = pizzaStore.dishes[0];
    
    setCart({
      merchantId: pizzaStore.id,
      items: [{ ...dish, quantity: 2, customizations: "Sourdough Base + Extra Burrata" }],
      appliedPromo: PROMO_CODES[0],
      tip: 40,
      useLoyaltyPoints: false,
      deliveryInstructions: "Ring once, leave package at door step"
    });

    showToast('Demo Initialized 🎬', 'Artisan Pizza added to cart! Placing order now...', 'info');

    setTimeout(() => {
      placeOrder("UPI (PhonePe)");
    }, 1200);
  };

  // Merchant Selected Account for Merchant Portal
  const [activeMerchantId, setActiveMerchantId] = useState('m1');

  // Merchant Listing Management
  const addMerchantDish = (merchantId, newDish) => {
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
          dishes: [dishWithId, ...m.dishes]
        };
      }
      return m;
    }));

    // Persist to SQLite DB
    api.addDish(merchantId, dishWithId).catch(err => {
      console.warn('[SQLite DB Sync] Add dish:', err.message);
    });

    showToast('Listing Created! 🍽️', `"${dishWithId.name}" added to menu successfully`, 'success');
    playSound('success');
  };

  const updateMerchantDish = (merchantId, dishId, updatedDish) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: m.dishes.map(d => d.id === dishId ? { ...d, ...updatedDish } : d)
        };
      }
      return m;
    }));
    showToast('Listing Updated ✏️', 'Dish details saved and updated live on Customer App', 'info');
  };

  const deleteMerchantDish = (merchantId, dishId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: m.dishes.filter(d => d.id !== dishId)
        };
      }
      return m;
    }));
    showToast('Listing Removed 🗑️', 'Dish has been deleted from store menu', 'info');
  };

  const toggleDishStock = (merchantId, dishId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          dishes: m.dishes.map(d => d.id === dishId ? { ...d, inStock: !d.inStock } : d)
        };
      }
      return m;
    }));

    // Toggle in SQLite DB
    api.toggleDishStock(merchantId, dishId).catch(err => {
      console.warn('[SQLite DB Sync] Toggle stock:', err.message);
    });
  };

  const updateMerchantProfile = (merchantId, updatedFields) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, ...updatedFields };
      }
      return m;
    }));
    showToast('Store Profile Updated 🏪', 'Store settings and operational parameters saved', 'success');
  };

  const toggleMerchantOpenStatus = (merchantId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const nextState = !m.isOpen;
        showToast('Store Status Changed', `${m.name} is now ${nextState ? 'OPEN for online orders' : 'CLOSED temporarily'}`, nextState ? 'success' : 'info');
        return { ...m, isOpen: nextState };
      }
      return m;
    }));

    // Toggle in SQLite DB
    api.toggleMerchantStatus(merchantId).catch(err => {
      console.warn('[SQLite DB Sync] Toggle store status:', err.message);
    });
  };

  // ADMIN LISTING RANKING & POSITION DECISION ENGINE
  // Admin decides which merchant listing comes at the TOP of the Customer App!
  const pinMerchantToTop = async (merchantId) => {
    setMerchants(prev => {
      const target = prev.find(m => m.id === merchantId);
      if (!target) return prev;
      
      const rest = prev.filter(m => m.id !== merchantId);
      const reordered = [
        { ...target, adminRank: 1, isPromoted: true, isFeatured: true, adminBoostScore: 100, adminPriorityBadge: "🥇 #1 Top Spotlight" },
        ...rest.map((m, idx) => ({
          ...m,
          adminRank: idx + 2,
          adminBoostScore: Math.max(10, 95 - (idx + 1) * 10),
          adminPriorityBadge: m.adminPriorityBadge === '🥇 #1 Top Spotlight' ? null : m.adminPriorityBadge
        }))
      ];
      return reordered;
    });

    try {
      const res = await api.pinMerchantToTop(merchantId);
      if (res?.merchants) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Pin Top]', err.message);
    }

    showToast('Listing Pinned to #1 Top! 🚀', 'Admin set this merchant as the #1 Top Listing on Customer App', 'success');
    playSound('success');
  };

  const moveMerchantRank = async (merchantId, direction) => {
    let newOrderedMerchants = [];
    setMerchants(prev => {
      const sorted = [...prev].sort((a, b) => (a.adminRank || 99) - (b.adminRank || 99));
      const idx = sorted.findIndex(m => m.id === merchantId);
      if (idx === -1) return prev;

      if (direction === 'up' && idx > 0) {
        const temp = sorted[idx];
        sorted[idx] = sorted[idx - 1];
        sorted[idx - 1] = temp;
      } else if (direction === 'down' && idx < sorted.length - 1) {
        const temp = sorted[idx];
        sorted[idx] = sorted[idx + 1];
        sorted[idx + 1] = temp;
      }

      newOrderedMerchants = sorted.map((m, index) => ({
        ...m,
        adminRank: index + 1,
        adminBoostScore: Math.max(10, 100 - index * 8),
        adminPriorityBadge: (index === 0) ? '🥇 #1 Top Spotlight' : (m.adminPriorityBadge === '🥇 #1 Top Spotlight' ? null : m.adminPriorityBadge)
      }));

      return newOrderedMerchants;
    });

    try {
      const res = await api.moveMerchantRank(merchantId, direction);
      if (res?.merchants) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Move Rank]', err.message);
    }

    showToast('Customer Top Priority Updated 🔄', `Listing ranking adjusted by Admin for Customer App`, 'info');
  };

  const toggleMerchantPromoted = async (merchantId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        const nextPromoted = !m.isPromoted;
        showToast('Promotion Status Changed', nextPromoted ? `${m.name} is now SPONSORED / PROMOTED to top of search` : `${m.name} organic rank restored`, 'info');
        return {
          ...m,
          isPromoted: nextPromoted,
          adminBoostScore: nextPromoted ? Math.max(m.adminBoostScore || 50, 95) : Math.min(m.adminBoostScore || 50, 75)
        };
      }
      return m;
    }));

    try {
      const res = await api.toggleMerchantPromoted(merchantId);
      if (res?.merchants) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Promoted]', err.message);
    }
  };

  const toggleMerchantFeatured = async (merchantId) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, isFeatured: !m.isFeatured };
      }
      return m;
    }));

    try {
      const res = await api.toggleMerchantFeatured(merchantId);
      if (res?.merchants) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Featured]', err.message);
    }
  };

  const boostDebounceTimers = React.useRef({});
  const updateMerchantBoostScore = (merchantId, newScore) => {
    const numScore = Number(newScore);
    setMerchants(prev => {
      const updated = prev.map(m => m.id === merchantId ? { ...m, adminBoostScore: numScore } : m);
      return updated.sort((a, b) => (b.adminBoostScore || 0) - (a.adminBoostScore || 0)).map((m, i) => ({
        ...m,
        adminRank: i + 1,
        adminPriorityBadge: (i === 0) ? '🥇 #1 Top Spotlight' : (m.adminPriorityBadge === '🥇 #1 Top Spotlight' ? null : m.adminPriorityBadge)
      }));
    });

    if (boostDebounceTimers.current[merchantId]) {
      clearTimeout(boostDebounceTimers.current[merchantId]);
    }

    boostDebounceTimers.current[merchantId] = setTimeout(async () => {
      try {
        const res = await api.updateMerchantBoostScore(merchantId, numScore);
        if (res?.merchants) {
          setMerchants(res.merchants);
          localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
        }
      } catch (err) {
        console.warn('[SQLite DB Sync Boost Score]', err.message);
      }
    }, 250);

    showToast('Boost Score Updated', `Admin algorithmic boost score adjusted to ${newScore}`, 'info');
  };

  const updateMerchantApprovalStatus = async (merchantId, status) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        showToast('Merchant Governance', `${m.name} status set to "${status.toUpperCase()}" by Admin`, status === 'approved' ? 'success' : 'alert');
        return { ...m, adminApprovalStatus: status };
      }
      return m;
    }));

    try {
      const res = await api.updateMerchantApproval(merchantId, status);
      if (res?.merchants) {
        setMerchants(res.merchants);
        localStorage.setItem('kalsen_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Approval]', err.message);
    }
  };


  const updateMerchantCommission = (merchantId, commissionRate) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, commissionRate: Number(commissionRate) };
      }
      return m;
    }));
    showToast('Commission Rate Updated', `Commission rate updated to ${commissionRate}%`, 'info');
  };

  const updateMerchantRating = async (merchantId, newRating, newRatingCount) => {
    const numRating = parseFloat(Math.min(5.0, Math.max(1.0, Number(newRating) || 4.5)).toFixed(2));
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return {
          ...m,
          rating: numRating,
          ...(newRatingCount !== undefined ? { ratingCount: Number(newRatingCount) } : {})
        };
      }
      return m;
    }));

    try {
      const res = await api.updateMerchantRating(merchantId, numRating, newRatingCount);
      if (res?.merchants) {
        setMerchants(res.merchants);
      }
    } catch (err) {
      console.warn('[SQLite DB Sync Rating]', err.message);
    }

    showToast('Rating Updated ⭐', `Store rating adjusted to ${numRating} across Platform`, 'info');
  };

  return (
    <PlatformContext.Provider
      value={{
        activeApp,
        setActiveApp,
        customerSubView,
        setCustomerSubView,
        selectedMerchantId,
        setSelectedMerchantId,
        activeMerchantId,
        setActiveMerchantId,
        activeTrackingOrderId,
        setActiveTrackingOrderId: updateActiveTrackingOrderId,
        clearTrackingData,
        updateActiveTrackingOrderId,
        merchants,
        setMerchants,
        riders,
        setRiders,
        orders,
        setOrders,
        surgeZones,
        setSurgeZones,
        promos,
        setPromos,
        autoDispatchEnabled,
        setAutoDispatchEnabled,
        isAuthenticated,
        login,
        register,
        logout,
        completeProfile,
        isProfileIncomplete,
        dismissProfileModal,
        addCustomerAddress,
        deleteCustomerAddress,
        setSelectedAddress,
        isLocatingGPS,
        detectGPSLocation,
        confirmGPSAddress,
        customer,
        setCustomer,
        cart,
        setCart,
        addToCart,
        updateCartItemQuantity,
        clearCart,
        placeOrder,
        merchantAcceptOrder,
        merchantRejectOrder,
        merchantSetReadyForPickup,
        autoAssignRider,
        riderArrivedAtMerchant,
        riderPickupOrder,
        riderDeliverOrder,
        sendChatMessage,
        toast,
        showToast,
        playSound,
        triggerFullSimulation,
        // Merchant Portal CRUD
        addMerchantDish,
        updateMerchantDish,
        deleteMerchantDish,
        toggleDishStock,
        updateMerchantProfile,
        toggleMerchantOpenStatus,
        // Admin Ranking & Listing Decision Engine
        pinMerchantToTop,
        moveMerchantRank,
        toggleMerchantPromoted,
        toggleMerchantFeatured,
        updateMerchantBoostScore,
        updateMerchantApprovalStatus,
        updateMerchantCommission,
        updateMerchantRating,
        refreshFromBackend
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};
