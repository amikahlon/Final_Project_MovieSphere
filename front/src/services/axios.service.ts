import axios from 'axios';
import { store } from '../store/store';
import { selectTokens } from '../store/slices/userSlice';

const axiosInstance = axios.create({
  baseURL: `http://localhost:${import.meta.env.VITE_SERVER_PORT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const { accessToken } = selectTokens(state);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default axiosInstance;
