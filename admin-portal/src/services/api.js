// UrbanOne Unified Backend API Client (Admin Portal)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://urbanone.onrender.com/api';

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
      throw new Error(data?.message || `Request failed with status ${res.status}`);
    }
    return data || {};
  } catch (err) {
    console.warn(`[Admin API Warning] (${endpoint}):`, err.message);
    throw err;
  }
};

export const api = {
  checkHealth: () => apiRequest('/health'),
  getAdminMetrics: () => apiRequest('/admin/metrics'),
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
  deleteMerchant: async (id) => {
    try {
      return await apiRequest(`/merchants/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        return await apiRequest(`/admin/merchants/${id}`, {
          method: 'DELETE'
        });
      }
      throw err;
    }
  },
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
  getOrders: () => apiRequest('/orders'),
  updateOrderStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  verifyDeliveryOtp: (orderId, otp) => apiRequest(`/orders/${orderId}/verify-delivery-otp`, {
    method: 'POST',
    body: JSON.stringify({ otp })
  }),
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
  getPromos: () => apiRequest('/promos'),
  createPromo: (data) => apiRequest('/promos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  approveRiderKYC: (riderId, kycVerified = true) => apiRequest(`/admin/riders/${riderId}/kyc`, {
    method: 'PATCH',
    body: JSON.stringify({ kycVerified })
  }),
  updateRiderApproval: (riderId, status = 'approved') => apiRequest(`/admin/riders/${riderId}/approval`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  deleteRider: (riderId) => apiRequest(`/admin/riders/${riderId}`, {
    method: 'DELETE'
  }),
  updateSurgeMultiplier: (zoneId, multiplier) => apiRequest(`/admin/surge-zones/${zoneId}`, {
    method: 'PATCH',
    body: JSON.stringify({ multiplier })
  })
};
