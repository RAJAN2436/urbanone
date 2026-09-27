// KalsenOne Unified Backend API Client (Merchant Portal)

const API_BASE_URL = 'http://localhost:5000/api';

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
    console.warn(`[Merchant API Warning] (${endpoint}):`, err.message);
    throw err;
  }
};

export const api = {
  checkHealth: () => apiRequest('/health'),
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
  getOrders: (merchantId = '') => apiRequest(merchantId ? `/orders?merchantId=${merchantId}` : '/orders'),
  updateOrderStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  merchantLogin: async (username, password) => {
    try {
      return await apiRequest('/auth/merchant/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    } catch (e) {
      return await apiRequest('/merchants/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    }
  },
  merchantRegister: async (data) => {
    try {
      return await apiRequest('/auth/merchant/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (e) {
      return await apiRequest('/merchants/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  }
};
