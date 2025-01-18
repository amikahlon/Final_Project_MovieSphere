import axios from 'axios';

// Create a base Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Your backend server URL
});

// Add a request interceptor to automatically include the Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
