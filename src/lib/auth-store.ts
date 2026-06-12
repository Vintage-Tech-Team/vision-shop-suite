import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";
import { authApi } from "./api";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        localStorage.setItem("sm_token", token);
        localStorage.setItem("sm_user", JSON.stringify(user));
        set({ user, token });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          /* ignore */
        }
        localStorage.removeItem("sm_token");
        localStorage.removeItem("sm_user");
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        const token = get().token || localStorage.getItem("sm_token");
        if (!token) return;
        set({ isLoading: true });
        try {
          const { data } = await authApi.me();
          set({ user: data.data, token });
        } catch {
          localStorage.removeItem("sm_token");
          set({ user: null, token: null });
        } finally {
          set({ isLoading: false });
        }
      },

      isAdmin: () => get().user?.role === "admin",
      isAuthenticated: () => !!get().user && !!get().token,
    }),
    {
      name: "stitch-makers-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
