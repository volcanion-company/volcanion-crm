'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Ticket,
  CheckSquare,
  Workflow,
  Mail,
  BarChart3,
  Settings,
  UserCircle2,
  Zap,
  ShoppingCart,
  FileText,
  FileCheck,
  UserCog,
  Shield,
} from 'lucide-react';

// Organize navigation into logical groups (Business Flow Order)
const navigationGroups = [
  {
    title: 'overview',
    items: [
      { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'marketing',
    items: [
      { key: 'campaigns', href: '/campaigns', icon: Mail },
      { key: 'leads', href: '/leads', icon: UserCircle2 },
    ],
  },
  {
    title: 'sales',
    items: [
      { key: 'customers', href: '/customers', icon: Building2 },
      { key: 'contacts', href: '/contacts', icon: Users },
      { key: 'deals', href: '/deals', icon: TrendingUp },
      { key: 'quotations', href: '/quotations', icon: FileText },
      { key: 'contracts', href: '/contracts', icon: FileCheck },
      { key: 'orders', href: '/orders', icon: ShoppingCart },
    ],
  },
  {
    title: 'support',
    items: [
      { key: 'tickets', href: '/tickets', icon: Ticket },
    ],
  },
  {
    title: 'automation',
    items: [
      { key: 'activities', href: '/activities', icon: CheckSquare },
      { key: 'workflows', href: '/workflows', icon: Workflow },
    ],
  },
  {
    title: 'administration',
    items: [
      { key: 'users', href: '/users', icon: UserCog },
      { key: 'roles', href: '/roles', icon: Shield },
    ],
  },
  {
    title: 'analytics',
    items: [
      { key: 'reports', href: '/reports', icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo & Brand */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Volcanion CRM
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Enterprise SaaS Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title} className={cn(groupIndex > 0 && 'mt-6')}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.title)}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 flex-shrink-0 transition-transform',
                      isActive && 'scale-110'
                    )} />
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Settings - Separate at bottom */}
        <div className="mt-6 pt-6 border-t">
          <Link
            href="/settings"
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className={cn(
              'h-5 w-5 flex-shrink-0 transition-transform',
              pathname === '/settings' && 'scale-110 rotate-90'
            )} />
            <span>{t('settings')}</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3 bg-muted/30">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 <span className="font-semibold">Volcanion CRM</span>
        </p>
      </div>
    </div>
  );
}
