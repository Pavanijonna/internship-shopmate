import axios from "axios";

export const API_BASE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)) ||
  (typeof process !== "undefined" && process.env && (process.env.REACT_APP_API_URL || process.env.VITE_API_URL)) ||
  "https://internship-shopmate.onrender.com"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Ensure all API calls route through the base URL with clean relative paths
  if (config.url && !config.url.startsWith("http://") && !config.url.startsWith("https://")) {
    const baseEndsWithApi = config.baseURL && config.baseURL.replace(/\/$/, "").endsWith("/api");
    const urlStartsWithApi = config.url.startsWith("/api") || config.url.startsWith("api/");

    if (!baseEndsWithApi && !urlStartsWithApi) {
      config.url = `/api${config.url.startsWith("/") ? "" : "/"}${config.url}`;
    } else if (baseEndsWithApi && urlStartsWithApi) {
      config.url = config.url.replace(/^\/?api/, "");
      if (!config.url.startsWith("/")) {
        config.url = `/${config.url}`;
      }
    }
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const authBase = API_BASE_URL.replace(/\/$/, "");
          const refreshUrl = authBase.endsWith("/api") ? `${authBase}/users/refresh` : `${authBase}/api/users/refresh`;
          const res = await axios.post(refreshUrl, { refreshToken });
          const newAccessToken = res.data.accessToken;
          if (res.status === 200) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export default api;