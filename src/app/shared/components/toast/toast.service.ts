import { Injectable, signal } from '@angular/core';

export interface ToastConfig {
  id?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number; // ms, 0 para permanente
}

export interface Toast extends ToastConfig {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private toastIdCounter = 0;

  toasts$ = this.toasts.asReadonly();

  show(config: ToastConfig): string {
    const id = config.id || `toast-${++this.toastIdCounter}`;
    const toast: Toast = {
      ...config,
      id,
      duration: config.duration ?? 3000,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto dismiss se duration > 0
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }

  success(message: string, duration = 3000): string {
    return this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): string {
    return this.show({ type: 'error', message, duration });
  }

  info(message: string, duration = 3000): string {
    return this.show({ type: 'info', message, duration });
  }

  warning(message: string, duration = 4000): string {
    return this.show({ type: 'warning', message, duration });
  }
}
