import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_MERCHANTS, INITIAL_RIDERS, SURGE_ZONES } from '../mockData';
import { api } from '../services/api';
import { io } from 'socket.io-client';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [merchants, setMerchants] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_merchants_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => m.id !== 'm1' && m.id !== 'm2');
        }
      }
    } catch (e) {}
    return INITIAL_MERCHANTS;
  });

  const [riders, setRiders] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_riders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r.id !== 'r1' && r.id !== 'r2');
        }
      }
    } catch (e) {}
    return INITIAL_RIDERS;
  });

  const [surgeZones, setSurgeZones] = useState(() => {
    try {
      const saved = localStorage.getItem('urban_surge_zones_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(z => z.id !== 'z1' && z.id !== 'z2' && z.id !== 'z3');
        }
      }
    } catch (e) {}
    return SURGE_ZONES;
  });

  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [toast, setToast] = useState(null);

  // Sync state from Live Backend API & MongoDB
  const refreshFromBackend = async () => {
    try {
      const [merchantsRes, ridersRes, zonesRes, ordersRes, metricsRes] = await Promise.allSettled([
        api.getMerchants(),
        api.getRiders(),
        api.getSurgeZones(),
        api.getOrders(),
        api.getAdminMetrics()
      ]);

      if (merchantsRes.status === 'fulfilled') {
        const list = merchantsRes.value?.merchants || [];
        setMerchants(list);
        try { localStorage.setItem('urban_merchants_data', JSON.stringify(list)); } catch (e) {}
      }

      if (ridersRes.status === 'fulfilled') {
        const list = ridersRes.value?.riders || [];
        setRiders(list);
        try { localStorage.setItem('urban_riders_data', JSON.stringify(list)); } catch (e) {}
      }

      if (zonesRes.status === 'fulfilled') {
        const list = zonesRes.value?.zones || [];
        setSurgeZones(list);
        try { localStorage.setItem('urban_surge_zones_data', JSON.stringify(list)); } catch (e) {}
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value?.orders || []);
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value);
      }
    } catch (err) {
      console.warn('[AdminContext] Backend sync notice:', err.message);
    }
  };

  useEffect(() => {
    refreshFromBackend();
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://urbanone.onrender.com';
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('merchants:updated', (payload) => {
      const list = Array.isArray(payload?.merchants) ? payload.merchants : (Array.isArray(payload) ? payload : null);
      if (list) {
        setMerchants(list);
        localStorage.setItem('urban_merchants_data', JSON.stringify(list));
      }
    });

    socket.on('orders:updated', (payload) => {
      const list = Array.isArray(payload?.orders) ? payload.orders : (Array.isArray(payload) ? payload : null);
      if (list) setOrders(list);
    });

    socket.on('riders:updated', (data) => {
      const list = Array.isArray(data?.riders) ? data.riders : (Array.isArray(data) ? data : null);
      if (list) {
        setRiders(list);
        try { localStorage.setItem('urban_riders_data', JSON.stringify(list)); } catch (e) {}
      }
    });

    socket.on('surgeZones:updated', (data) => {
      if (Array.isArray(data)) setSurgeZones(data);
    });

    const interval = setInterval(refreshFromBackend, 6000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  // Sync state across localStorage for cross-app synchronization
  useEffect(() => {
    localStorage.setItem('urban_merchants_data', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('urban_riders_data', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('urban_surge_zones_data', JSON.stringify(surgeZones));
  }, [surgeZones]);

  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const playSound = (type = 'ding') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
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

  // MERCHANT ONBOARDING & DELETION (MongoDB Connected)
  const createMerchant = async (merchantData) => {
    try {
      const res = await api.createMerchant(merchantData);
      if (res?.merchant) {
        const list = res.merchants || [...merchants, res.merchant];
        setMerchants(list);
        try { localStorage.setItem('urban_merchants_data', JSON.stringify(list)); } catch (e) {}
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        playSound('success');
        showToast('Store Registered! 🏪', `"${res.merchant.name}" successfully registered in MongoDB`, 'success');
        return res.merchant;
      }
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
      throw err;
    }
  };

  const deleteMerchant = async (merchantId) => {
    try {
      const target = merchants.find(m => m.id === merchantId);
      const res = await api.deleteMerchant(merchantId);
      if (res?.merchants) {
        setMerchants(res.merchants);
        try { localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants)); } catch (e) {}
      } else {
        setMerchants(prev => prev.filter(m => m.id !== merchantId));
      }
      playSound('ding');
      showToast('Store Deleted 🗑️', `Store "${target?.name || merchantId}" removed from MongoDB`, 'info');
      return true;
    } catch (err) {
      showToast('Deletion Error', err.message, 'error');
      throw err;
    }
  };

  // ADMIN LISTING TOP RANKING DECISION ENGINE
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
        localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync Pin Top]', err.message);
    }

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    playSound('success');
    showToast('Pinned to Top 1! 🚀', 'Admin set this merchant as the #1 Top Listing in MongoDB', 'success');
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
        localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync Move Rank]', err.message);
    }

    showToast('Customer Top Priority Updated 🔄', `Listing moved ${direction} by Admin and saved to DB`, 'info');
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
        localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync Promoted]', err.message);
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
        localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync Featured]', err.message);
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
          localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
        }
      } catch (err) {
        console.warn('[Backend Sync Boost Score]', err.message);
      }
    }, 250);
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
        localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
      }
    } catch (err) {
      console.warn('[Backend Sync Approval]', err.message);
    }
  };

  const updateMerchantCommission = (merchantId, commissionRate) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        return { ...m, commissionRate: Number(commissionRate) };
      }
      return m;
    }));

    api.updateMerchant(merchantId, { commissionRate: Number(commissionRate) }).catch(err => console.warn('[Backend Sync]', err.message));
    showToast('Commission Rate Updated', `Commission rate updated to ${commissionRate}% in MongoDB`, 'info');
  };

  const ratingDebounceTimers = React.useRef({});
  const updateMerchantRating = (merchantId, newRating, newRatingCount) => {
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

    if (ratingDebounceTimers.current[merchantId]) {
      clearTimeout(ratingDebounceTimers.current[merchantId]);
    }

    ratingDebounceTimers.current[merchantId] = setTimeout(async () => {
      try {
        const res = await api.updateMerchantRating(merchantId, numRating, newRatingCount);
        if (res?.merchants) {
          setMerchants(res.merchants);
          localStorage.setItem('urban_merchants_data', JSON.stringify(res.merchants));
        }
      } catch (err) {
        console.warn('[Backend Sync Rating]', err.message);
      }
    }, 250);

    showToast('Rating Updated ⭐', `Store rating adjusted to ${numRating} across Platform`, 'info');
  };

  const approveRiderKYC = async (riderId) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, kycVerified: true, approvalStatus: 'approved' } : r));
    showToast('KYC Approved ✅', 'Driver background check & video KYC verified', 'success');

    try {
      const res = await api.approveRiderKYC(riderId, true);
      if (res?.riders) {
        setRiders(res.riders);
        localStorage.setItem('urban_riders_data', JSON.stringify(res.riders));
      }
    } catch (err) {
      console.warn('[Backend Sync KYC]', err.message);
    }
  };

  const updateRiderApproval = async (riderId, status = 'approved') => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, approvalStatus: status, kycVerified: status === 'approved' } : r));
    showToast(
      status === 'approved' ? 'Rider Approved! 🛵' : 'Application Rejected',
      `Rider has been ${status}. Status broadcasted across platform.`,
      status === 'approved' ? 'success' : 'info'
    );

    try {
      const res = await api.updateRiderApproval(riderId, status);
      if (res?.riders) {
        setRiders(res.riders);
        localStorage.setItem('urban_riders_data', JSON.stringify(res.riders));
      }
    } catch (err) {
      console.warn('[Backend Sync Rider Approval]', err.message);
    }
  };

  const updateSurgeMultiplier = async (zoneId, newMultiplier) => {
    const num = Number(newMultiplier);
    setSurgeZones(prev => prev.map(z => z.id === zoneId ? { ...z, multiplier: num } : z));
    showToast('Surge Multiplier Updated ⚡', `Surge set to ${num}x for zone`, 'info');

    try {
      const res = await api.updateSurgeMultiplier(zoneId, num);
      if (res?.zones) {
        setSurgeZones(res.zones);
        localStorage.setItem('urban_surge_zones_data', JSON.stringify(res.zones));
      }
    } catch (err) {
      console.warn('[Backend Sync Surge]', err.message);
    }
  };

  const createRider = async (riderData) => {
    try {
      const res = await api.createRider(riderData);
      if (res?.riders) {
        setRiders(res.riders);
        try { localStorage.setItem('urban_riders_data', JSON.stringify(res.riders)); } catch (e) {}
        showToast('Rider Registered! 🛵', `Delivery partner ${riderData.name} saved in MongoDB`, 'success');
        return res.riders;
      }
    } catch (err) {
      showToast('Error Registering Rider', err.message, 'error');
    }
  };

  const deleteRider = async (riderId) => {
    setRiders(prev => prev.filter(r => r.id !== riderId));
    showToast('Delivery Partner Deleted', 'Partner removed from active fleet roster', 'info');

    try {
      const res = await api.deleteRider(riderId);
      if (res?.riders) {
        setRiders(res.riders);
        try { localStorage.setItem('urban_riders_data', JSON.stringify(res.riders)); } catch (e) {}
      }
    } catch (err) {
      console.warn('[Backend Sync Delete Rider]', err.message);
    }
  };

  const createSurgeZone = async (zoneData) => {
    try {
      const res = await api.createSurgeZone(zoneData);
      if (res?.zones) {
        setSurgeZones(res.zones);
        try { localStorage.setItem('urban_surge_zones_data', JSON.stringify(res.zones)); } catch (e) {}
        showToast('Surge Zone Added! 📍', `Zone "${zoneData.name}" saved in MongoDB`, 'success');
        return res.zones;
      }
    } catch (err) {
      showToast('Error Creating Zone', err.message, 'error');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        merchants,
        setMerchants,
        createMerchant,
        deleteMerchant,
        riders,
        setRiders,
        createRider,
        surgeZones,
        setSurgeZones,
        createSurgeZone,
        orders,
        metrics,
        autoDispatchEnabled,
        setAutoDispatchEnabled,
        pinMerchantToTop,
        moveMerchantRank,
        toggleMerchantPromoted,
        toggleMerchantFeatured,
        updateMerchantBoostScore,
        updateMerchantApprovalStatus,
        updateMerchantCommission,
        updateMerchantRating,
        approveRiderKYC,
        updateRiderApproval,
        deleteRider,
        updateSurgeMultiplier,
        refreshFromBackend,
        toast,
        showToast
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
