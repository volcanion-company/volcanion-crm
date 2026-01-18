'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingPage } from '@/components/ui/Loading';
import { AUTH_CONFIG } from '@/config/constants';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const storedUser = localStorage.getItem('auth-storage');
      
      if (!token) {
        console.error('[AuthGuard] No token found - redirecting to login');
        router.replace('/auth/login');
        return;
      }

      // Sync user from localStorage if not in store yet
      if (storedUser && !user) {
        try {
          const authData = JSON.parse(storedUser);
          if (authData.state?.user) {
            setUser(authData.state.user);
          }
        } catch (e) {
          console.error('[AuthGuard] Failed to parse auth data:', e);
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, user, setUser]);

  if (isChecking) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
