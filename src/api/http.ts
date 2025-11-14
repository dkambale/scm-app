import axios, { AxiosInstance } from "axios";
import { storage } from "../utils/storage";
import { Platform } from "react-native";

const API_AUTH_KEY = "SCM-AUTH";

// Resolve API base URL with platform-specific adjustments.
// On Android emulator 'localhost' refers to the device. Use 10.0.2.2 to reach
// the host machine when running on Android emulator. For physical devices
// and web, prefer setting EXPO_PUBLIC_API_BASE_URL to your machine LAN IP.
let baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ;
try {
  if (Platform.OS === "android" && baseURL.includes("localhost")) {
    baseURL = baseURL.replace("localhost", "10.0.2.2");
  }
} catch {
  // Platform may not be defined in some environments; ignore and keep baseURL.
}

// Helpful runtime log to confirm which baseURL is being used.
// Remove or guard this in production if noisy.
console.log("[api] resolved baseURL ->", baseURL);

// -----------------------------------------------------------
// 1. Authenticated Client (for requests that require a token)
// -----------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // MODIFIED: Increased timeout to 60 seconds (was 20000)
});

// -----------------------------------------------------------
// 2. Public Client (for requests that DO NOT require a token, like signup)
// -----------------------------------------------------------
export const publicApiClient: AxiosInstance = axios.create({ // EXPORTED
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // MODIFIED: Increased timeout to 60 seconds (was 20000)
});


// If a request contains FormData, remove the forced JSON Content-Type so
// the runtime/axios can set the proper multipart/form-data boundary header.
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (
        config &&
        config.data &&
        typeof FormData !== "undefined" &&
        config.data instanceof FormData
      ) {
        config.headers = config.headers ?? {};
        delete (config.headers as any)["Content-Type"];
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We must apply the FormData interceptor to the public client as well,
// though it's less likely to be used for non-auth endpoints.
publicApiClient.interceptors.request.use(
  (config) => {
    try {
      if (
        config &&
        config.data &&
        typeof FormData !== "undefined" &&
        config.data instanceof FormData
      ) {
        config.headers = config.headers ?? {};
        delete (config.headers as any)["Content-Type"];
      }
    } catch {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Auth Token Injection (Only for apiClient)
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

// Response Interceptor for 401 (Only for apiClient)
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
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  getUser: async () => (await userDetails.getRaw())?.data || null,
 
  getPermissions: async () =>
    (await userDetails.getRaw())?.data?.role?.permissions || [],
  getUserType: async () => (await userDetails.getRaw())?.data?.type || "GUEST",
  isLoggedIn: async () => !!(await userDetails.getRaw())?.accessToken,
};

export default apiClient; // The default export remains the authenticated client