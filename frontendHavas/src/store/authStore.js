import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { authService } from "@/services/authService";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ token });
  },

  initialize: () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          set({
            token,
            user: decoded,
            role: decoded.role || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        localStorage.removeItem("accessToken");
      }
    } catch {
      localStorage.removeItem("accessToken");
    }
    set({ isLoading: false });
  },

  login: async (email, password, role) => {
    const { data } = await authService.login(email, password, role);
    const { accessToken, refreshToken, user } = data;
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      Cookies.set("refreshToken", refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
    }
    const decoded = user || jwtDecode(accessToken);
    set({
      token: accessToken,
      user: decoded,
      role: decoded.role || null,
      isAuthenticated: true,
    });
  },

  register: async (formData) => {
    const { data } = await authService.register(formData);
    return data;
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // déconnexion locale même si l'appel API échoue
    }
    localStorage.removeItem("accessToken");
    Cookies.remove("refreshToken");
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
