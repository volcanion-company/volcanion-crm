'use client';

import { useTranslations } from 'next-intl';

/**
 * Custom hook wrapper for useTranslations with type safety
 * Usage: const { t } = useTranslation(); t('leads.title') => "Lead Management"
 */
export function useTranslation() {
  const t = useTranslations();
  return { t };
}

/**
 * Custom hook wrapper for useTranslations with type safety
 * Usage: const t = useT('leads'); t('title') => "Lead Management"
 */
export function useT(namespace?: string) {
  return useTranslations(namespace);
}

/**
 * Hook for common translations
 */
export function useCommonT() {
  return useTranslations('common');
}

/**
 * Hook for auth translations
 */
export function useAuthT() {
  return useTranslations('auth');
}

/**
 * Hook for navigation translations
 */
export function useNavT() {
  return useTranslations('navigation');
}

/**
 * Hook for error translations
 */
export function useErrorT() {
  return useTranslations('errors');
}
