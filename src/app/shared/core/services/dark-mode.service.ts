import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

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
    // Aplica o tema inicial e reage a mudanças
    effect(() => {
      this.applyTheme(this.resolvedTheme(), this.mode());
    });

    // Escuta mudanças no tema do sistema
    this.mediaQuery?.addEventListener('change', () => {
      if (this.mode() === 'system') {
        // O effect já vai reagir automaticamente
        this.mode.set('system');
      }
    });
  }

  setTheme(mode: ThemeMode) {
    this.mode.set(mode);
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {
      // localStorage pode não estar disponível
    }
  }

  toggleTheme() {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(this.mode());
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.setTheme(nextMode);
  }

  private getInitialMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // localStorage pode não estar disponível
    }
    return 'system';
  }

  private applyTheme(theme: 'light' | 'dark', mode: ThemeMode) {
    const root = this.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.dataset['theme'] = mode;
  }
}