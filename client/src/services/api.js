import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    
    const isAuthCheck = url.includes('/auth/me') || url.includes('/auth/login');
    
    if (status === 401 && isAuthCheck) {
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 500 || !error.response) {
      console.error('Server Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;