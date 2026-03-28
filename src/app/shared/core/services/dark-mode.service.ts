import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ZardDarkModeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'zard-theme';
  private readonly mediaQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  readonly mode = signal<ThemeMode>(this.getInitialMode());
  readonly resolvedTheme = computed<'light' | 'dark'>(() => {
    const mode = this.mode();
    if (mode === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }

    return mode;
  });

  constructor() {
    this.applyTheme(this.resolvedTheme(), this.mode());

    this.mediaQuery?.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.applyTheme(this.resolvedTheme(), this.mode());
      }
    });
  }

  setTheme(mode: ThemeMode) {
    this.mode.set(mode);
    localStorage.setItem(this.storageKey, mode);
    this.applyTheme(this.resolvedTheme(), mode);
  }

  toggleTheme() {
    const nextMode: ThemeMode = this.mode() === 'system' ? 'light' : this.mode() === 'light' ? 'dark' : 'system';
    this.setTheme(nextMode);
  }

  private getInitialMode(): ThemeMode {
    if (typeof localStorage === 'undefined') {
      return 'system';
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private applyTheme(theme: 'light' | 'dark', mode: ThemeMode) {
    const root = this.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.dataset['theme'] = mode;
  }
}
