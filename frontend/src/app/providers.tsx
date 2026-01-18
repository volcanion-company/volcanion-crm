'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { DialogProvider, useDialog } from '@/components/ui/Dialog';
import { Toaster } from 'sonner';

// Extend Window interface for dialog context
interface DialogContextValue {
  showDialog: (options: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error'; confirmText?: string; cancelText?: string; showCancel?: boolean }) => Promise<boolean>;
  showAlert: (options: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error'; confirmText?: string }) => Promise<void>;
}

declare global {
  interface Window {
    __dialogContext?: DialogContextValue;
  }
}

function DialogContextInjector() {
  const dialogContext = useDialog();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__dialogContext = dialogContext;
    }
  }, [dialogContext]);
  
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <DialogProvider>
            <DialogContextInjector />
            {children}
            <Toaster richColors position="top-right" expand={true} />
            <ReactQueryDevtools initialIsOpen={false} />
          </DialogProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
