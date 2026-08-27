const getApiBaseUrl = () => {
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (isLocalHost) {
    return envUrl || 'http://127.0.0.1:8000';
  }

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  return 'https://karigar-ai-8nik.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();


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

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('karigar_token');
        localStorage.removeItem('karigar_user');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in to save products.');
      }
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

  async generateCatalog(confirmedAttributes) {
    const res = await fetch(`${API_BASE_URL}/generate-catalog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(confirmedAttributes),
    });
    return handleResponse(res);
  },

  async generateStory(productName, material, craftType) {
    const res = await fetch(`${API_BASE_URL}/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        product_name: productName,
        material: material,
        craft_type: craftType,
      }),
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

  // Multilingual Translation API
  async translate(catalogData, targetLanguage = 'hi') {
    const res = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...catalogData,
        target_language: targetLanguage,
      }),
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
