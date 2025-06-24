import axios from "axios";

import { store } from "../redux/store"; // Import the Redux store
import { logout } from "../redux/userSlice"; // Import the logout action

// Centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to dynamically set the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response; // Pass through successful responses
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch logout action
      store.dispatch(logout());
      // Remove token from localStorage
      localStorage.removeItem("token");
      // Redirect to sign-in page
      // Check if already on sign-in page to prevent redirect loop
      if (window.location.pathname !== "/auth/signin") {
        window.location.href = "/auth/signin";
      }
    }
    return Promise.reject(error); // Pass through other errors
  }
);

export default apiClient;
