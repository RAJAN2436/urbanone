// KalsenOne Unified Backend API Client (Customer, Merchant & Admin)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://urbanone.onrender.com/api';

// Helper for fetch with JSON and error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    let data = null;
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {}
    }

    if (!res.ok) {
      if (data && data.message) {
        throw new Error(data.message);
      }
      if (res.status === 401) {
        throw new Error('Incorrect password or email. Please check your credentials.');
      }
      if (res.status === 404) {
        throw new Error('Service endpoint not available. Please restart backend server (node server/server.js).');
      }
      throw new Error(`Server error (Status ${res.status})`);
    }

    return data || {};
  } catch (err) {
    console.warn(`[Backend API Warning] (${endpoint}):`, err.message);
    throw err;
  }
};

export const api = {
  // Health check & Admin Analytics
  checkHealth: () => apiRequest('/health'),
  getAdminMetrics: () => apiRequest('/admin/metrics'),
  reverseGeocode: (lat, lon) => apiRequest(`/geocode/reverse?lat=${lat}&lon=${lon}`),

  // Auth & Real MongoDB OTP Engine
  sendOtp: (phone) => apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  }),

  verifyOtp: (phone, otp) => apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  }),

  loginWithPassword: (emailOrPhone, password) => apiRequest('/auth/login-password', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone, password })
  }),

  requestPasswordReset: (emailOrPhone) => apiRequest('/auth/forgot-password/request', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone })
  }),

  resetPassword: (emailOrPhone, otp, newPassword) => apiRequest('/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ emailOrPhone, otp, newPassword })
  }),

  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  googleAuth: (googleData) => apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData)
  }),

  completeProfile: (profileData) => apiRequest('/auth/complete-profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  }),

  getUserProfile: (userId) => apiRequest(`/auth/user/${userId}`),

  addAddress: (userId, addressData) => apiRequest(`/auth/user/${userId}/address`, {
    method: 'POST',
    body: JSON.stringify(addressData)
  }),

  deleteAddress: (userId, addressId) => apiRequest(`/auth/user/${userId}/address/${addressId}`, {
    method: 'DELETE'
  }),

  // Merchants & Menus (MERN Stack)
  getMerchants: () => apiRequest('/merchants'),
  getMerchantById: (id) => apiRequest(`/merchants/${id}`),
  createMerchant: (data) => apiRequest('/merchants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateMerchant: (id, data) => apiRequest(`/merchants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  addDish: (merchantId, dishData) => apiRequest(`/merchants/${merchantId}/dishes`, {
    method: 'POST',
    body: JSON.stringify(dishData)
  }),
  updateDish: (merchantId, dishId, dishData) => apiRequest(`/merchants/${merchantId}/dishes/${dishId}`, {
    method: 'PUT',
    body: JSON.stringify(dishData)
  }),
  deleteDish: (merchantId, dishId) => apiRequest(`/merchants/${merchantId}/dishes/${dishId}`, {
    method: 'DELETE'
  }),
  toggleDishStock: (merchantId, dishId) => apiRequest(`/merchants/${merchantId}/dishes/${dishId}/stock`, {
    method: 'PATCH'
  }),
  toggleMerchantStatus: (merchantId) => apiRequest(`/merchants/${merchantId}/status`, {
    method: 'PATCH'
  }),

  // Admin Listing Rank, Promoted, & Approvals (MongoDB)
  pinMerchantToTop: (merchantId) => apiRequest(`/admin/merchants/${merchantId}/pin-top`, {
    method: 'PATCH'
  }),
  reorderMerchants: (merchantIds) => apiRequest('/admin/merchants/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ merchantIds })
  }),
  moveMerchantRank: (merchantId, direction) => apiRequest(`/admin/merchants/${merchantId}/rank`, {
    method: 'PATCH',
    body: JSON.stringify({ direction })
  }),
  updateMerchantBoostScore: (merchantId, score) => apiRequest(`/admin/merchants/${merchantId}/boost`, {
    method: 'PATCH',
    body: JSON.stringify({ score })
  }),
  toggleMerchantPromoted: (merchantId) => apiRequest(`/admin/merchants/${merchantId}/promoted`, {
    method: 'PATCH'
  }),
  toggleMerchantFeatured: (merchantId) => apiRequest(`/admin/merchants/${merchantId}/featured`, {
    method: 'PATCH'
  }),
  updateMerchantApproval: (merchantId, status) => apiRequest(`/admin/merchants/${merchantId}/approval`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  updateMerchantRating: (merchantId, rating, ratingCount) => apiRequest(`/admin/merchants/${merchantId}/rating`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, ratingCount })
  }),

  // Orders & Contactless Handover OTP (MongoDB)
  getOrders: (merchantId = '') => apiRequest(merchantId ? `/orders?merchantId=${merchantId}` : '/orders'),
  placeOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  updateOrderStatus: (orderId, status, extraData = {}) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...extraData })
  }),
  verifyDeliveryOtp: (orderId, otp) => apiRequest(`/orders/${orderId}/verify-delivery-otp`, {
    method: 'POST',
    body: JSON.stringify({ otp })
  }),

  // Fleet & Logistics (MongoDB Driven)
  getRiders: () => apiRequest('/riders'),
  createRider: (data) => apiRequest('/riders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSurgeZones: () => apiRequest('/surge-zones'),
  createSurgeZone: (data) => apiRequest('/surge-zones', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Promos & Discounts (MongoDB Driven)
  getPromos: () => apiRequest('/promos'),
  createPromo: (data) => apiRequest('/promos', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
