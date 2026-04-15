import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Safe LocalStorage access that works with SSR.
 * Use this in services so the app does not break during server-side render.
 */
export function getLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as { localStorage?: Storage };
    if (w.localStorage) return w.localStorage;
  } catch {
    // not in browser or localStorage disabled
  }
  return null;
}

/**
 * Factory that uses PLATFORM_ID to return localStorage only in browser.
 * Use in services: private storage = inject(STORAGE) or provide STORAGE in app.config.
 */
export function createStorage(platformId: object): Storage | null {
  return isPlatformBrowser(platformId) ? (typeof localStorage !== 'undefined' ? localStorage : null) : null;
}
