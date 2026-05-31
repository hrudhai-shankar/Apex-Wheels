const BASE_URL = 'http://localhost:5000/api';

/**
 * Common API request handler that handles token injection and parses standard errors.
 */
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Inject token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

// API calls grouped by module
const api = {
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    getProfile: () => request('/auth/profile'),
    createUpgradeOrder: () => request('/auth/upgrade-order', {
      method: 'POST',
    }),
    verifyUpgrade: (paymentDetails) => request('/auth/upgrade-verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    }),
  },
  
  cars: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          queryParams.append(key, val);
        }
      });
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return request(`/cars${queryString}`);
    },
    getById: (id) => request(`/cars/${id}`),
    create: (carData) => request('/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    }),
    update: (id, carData) => request(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    }),
    delete: (id) => request(`/cars/${id}`, {
      method: 'DELETE',
    }),
  },
  
  bookings: {
    createOrder: (bookingData) => request('/bookings/order', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
    verifyPayment: (paymentDetails) => request('/bookings/verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    }),
    getMyBookings: () => request('/bookings/my-bookings'),
    getAllBookings: () => request('/bookings'),
    getCarBookings: (carId) => request(`/bookings/car/${carId}`),
  },

  users: {
    getAll: () => request('/users'),
    delete: (id) => request(`/users/${id}`, {
      method: 'DELETE',
    }),
  }
};

export default api;
