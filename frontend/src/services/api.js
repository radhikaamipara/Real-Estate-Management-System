import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and user is on protected route, clear session
      const token = localStorage.getItem('token');
      if (token && window.location.pathname.match(/\/(buyer|agent|admin)/)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Format Indian Currency Helper
export const formatCurrencyINR = (amount, purpose = 'Buy') => {
  if (amount === undefined || amount === null) return '₹ 0';
  const val = Number(amount);
  
  if (purpose && purpose.toLowerCase() === 'rent') {
    return `₹ ${val.toLocaleString('en-IN')} / mo`;
  }
  
  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2);
    return `₹ ${cr.replace(/\.00$/, '')} Cr`;
  } else if (val >= 100000) {
    const lk = (val / 100000).toFixed(2);
    return `₹ ${lk.replace(/\.00$/, '')} Lakh`;
  } else {
    return `₹ ${val.toLocaleString('en-IN')}`;
  }
};

export default api;
