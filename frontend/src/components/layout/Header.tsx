'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, Bell } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export function Header() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="text-sm">
            <div className="font-medium">{user?.email}</div>
            <div className="text-xs text-muted-foreground">{user?.role}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
