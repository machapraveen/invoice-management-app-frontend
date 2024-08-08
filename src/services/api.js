import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server responded with error:", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      return Promise.reject({ error: "No response from server" });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
      return Promise.reject({ error: "Error setting up request" });
    }
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (email, password) => api.post('/auth/register', { email, password });
export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const updateProduct = (id, updates) => {
  const { _id, __v, ...productWithoutIdAndVersion } = updates;
  return api.patch(`/products/${id}`, productWithoutIdAndVersion);
};
export const createInvoice = (invoiceData) => api.post('/invoices', invoiceData);
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const getSalesData = () => api.get('/dashboard/sales');
export const getTopProducts = () => api.get('/dashboard/top-products');

export default api;