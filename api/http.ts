import axios, { AxiosInstance } from 'axios';
import { storage } from '../utils/storage';

const API_AUTH_KEY = 'SCM-AUTH';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const raw = await storage.getItem(API_AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.accessToken;
        if (token) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await storage.removeItem(API_AUTH_KEY);
    }
    return Promise.reject(error);
  }
);

export const userDetails = {
  getRaw: async (): Promise<any | null> => {
    const raw = await storage.getItem(API_AUTH_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  getUser: async () => (await userDetails.getRaw())?.data || null,
  getAccountId: async () => (await userDetails.getRaw())?.data?.accountId || null,
  getPermissions: async () => (await userDetails.getRaw())?.data?.role?.permissions || [],
  getUserType: async () => (await userDetails.getRaw())?.data?.type || 'GUEST',
  isLoggedIn: async () => !!(await userDetails.getRaw())?.accessToken,
};

export default apiClient;


