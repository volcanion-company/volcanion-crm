'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const t = useTranslations('common');
  const tAuth = useTranslations('auth');
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate();
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const menuItems = [
    {
      key: 'profile',
      label: t('profile'),
      icon: User,
      onClick: handleProfile,
    },
    {
      key: 'settings',
      label: t('settings'),
      icon: Settings,
      onClick: handleSettings,
    },
    {
      key: 'divider',
      divider: true,
    },
    {
      key: 'logout',
      label: tAuth('logout'),
      icon: LogOut,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
          'hover:bg-accent',
          isOpen && 'bg-accent'
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-sm">
          {getInitials(user?.firstName, user?.lastName)}
        </div>
        <div className="hidden md:flex md:flex-col md:items-start">
          <div className="text-sm font-medium leading-none">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {user?.email}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'hidden md:block h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-popover shadow-lg z-50 animate-in slide-in-from-top-2">
          {/* User Info Header */}
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            {user?.role && (
              <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {user.role}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key}
                    className="my-1 h-px bg-border"
                  />
                );
              }

              const Icon = item.icon!;
              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    'hover:bg-accent',
                    item.danger
                      ? 'text-destructive hover:text-destructive'
                      : 'text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
