'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  showAlert: (options: Omit<DialogOptions, 'showCancel' | 'cancelText'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
  });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showDialog = (opts: DialogOptions): Promise<boolean> => {
    setOptions({ ...opts, showCancel: opts.showCancel ?? true });
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const showAlert = (opts: Omit<DialogOptions, 'showCancel' | 'cancelText'>): Promise<void> => {
    setOptions({ ...opts, showCancel: false, confirmText: opts.confirmText || 'OK' });
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => () => {
        resolve();
        return true;
      });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  const iconMap = {
    info: <Info className="h-6 w-6 text-blue-600" />,
    success: <CheckCircle className="h-6 w-6 text-green-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    error: <XCircle className="h-6 w-6 text-red-600" />,
  };

  const bgColorMap = {
    info: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
  };

  return (
    <DialogContext.Provider value={{ showDialog, showAlert }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={options.showCancel ? handleCancel : undefined}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            {/* Close button (only if showCancel) */}
            {options.showCancel && (
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {/* Content */}
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 rounded-full p-3 ${bgColorMap[options.type || 'info']}`}>
                  {iconMap[options.type || 'info']}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {options.title}
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {options.message}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 justify-end mt-6">
                {options.showCancel && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    {options.cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    options.type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : options.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                      : options.type === 'success'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {options.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

// Convenience functions
export const dialog = {
  confirm: async (options: Omit<DialogOptions, 'showCancel'>): Promise<boolean> => {
    // This will be set by the provider in the app
    if (typeof window !== 'undefined' && window.__dialogContext) {
      return window.__dialogContext.showDialog({ ...options, showCancel: true });
    }
    // Fallback to native confirm
    return window.confirm(`${options.title}\n\n${options.message}`);
  },
  
  alert: async (options: Omit<DialogOptions, 'showCancel' | 'cancelText'>): Promise<void> => {
    if (typeof window !== 'undefined' && window.__dialogContext) {
      return window.__dialogContext.showAlert(options);
    }
    // Fallback to native alert
    window.alert(`${options.title}\n\n${options.message}`);
  },
};
