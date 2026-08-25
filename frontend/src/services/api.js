const API_BASE_URL = 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('karigar_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        if (typeof errData.detail === 'string') {
          errorDetail = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          errorDetail = errData.detail.map(d => d.msg || d.detail || JSON.stringify(d)).join(', ');
        }
      }
    } catch (e) {
      // JSON parse fallback
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Auth API
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  // AI & Pricing API
  async analyzeProduct(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const res = await fetch(`${API_BASE_URL}/analyze-product`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },

  async suggestPrice(pricingData) {
    const res = await fetch(`${API_BASE_URL}/suggest-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(pricingData),
    });
    return handleResponse(res);
  },

  // Product CRUD API
  async createProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
