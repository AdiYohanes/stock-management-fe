import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginUser, UserRole } from "@/lib/validators/auth";

interface AuthState {
  /** Preserved email for "Remember me" */
  preservedEmail: string;
  /** Whether "Remember me" is checked */
  rememberMe: boolean;
  /** Currently authenticated user (null if not logged in) */
  user: LoginUser | null;

  /** Actions */
  setPreservedEmail: (email: string) => void;
  clearPreservedEmail: () => void;
  setRememberMe: (value: boolean) => void;
  setUser: (user: LoginUser) => void;
  clearUser: () => void;
  logout: () => void;

  /** Check if current user has a specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if a valid session exists (token + user in store) */
  checkSession: () => boolean;
}

/**
 * Auth store with persistence.
 * Handles login state, session validation, and RBAC role checks.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      preservedEmail: "",
      rememberMe: false,
      user: null,

      setPreservedEmail: (email) => set({ preservedEmail: email }),
      clearPreservedEmail: () => set({ preservedEmail: "" }),
      setRememberMe: (value) => set({ rememberMe: value }),
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        set({ user: null });
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      checkSession: () => {
        if (typeof window === "undefined") return false;
        const token = localStorage.getItem("access_token");
        const { user } = get();
        return !!token && !!user;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        preservedEmail: state.rememberMe ? state.preservedEmail : "",
        rememberMe: state.rememberMe,
        user: state.user,
      }),
    }
  )
);
