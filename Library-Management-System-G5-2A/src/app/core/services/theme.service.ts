import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'lms-theme';
export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** User preference: 'light' | 'dark' | 'system' */
  readonly preference = signal<Theme>(this.readStored());

  /** Resolved: true when the UI should be dark (either by preference or system) */
  readonly isDark = computed(() => {
    const pref = this.preference();
    if (pref === 'dark') return true;
    if (pref === 'light') return false;
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  constructor() {
    this.applyToDocument(this.isDark());
    if (this.isBrowser) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.syncDocument());
    }
  }

  setTheme(theme: Theme): void {
    this.preference.set(theme);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {}
    }
    this.syncDocument();
  }

  /** Toggle between light and dark (ignores system for simplicity). */
  toggle(): void {
    const next = this.isDark() ? 'light' : 'dark';
    this.setTheme(next);
  }

  private readStored(): Theme {
    if (!this.isBrowser) return 'system';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch {}
    return 'system';
  }

  private syncDocument(): void {
    this.applyToDocument(this.isDark());
  }

  private applyToDocument(dark: boolean): void {
    if (!this.isBrowser || typeof document === 'undefined') return;
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
