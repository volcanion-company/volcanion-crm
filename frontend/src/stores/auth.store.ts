import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { AUTH_CONFIG } from '@/config/constants';

interface AuthState {
  user: User | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTenantId: (tenantId: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantId: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTenantId: (tenantId) => set({ tenantId }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.EXPIRES_AT_KEY);
        }
        set({ user: null, tenantId: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
