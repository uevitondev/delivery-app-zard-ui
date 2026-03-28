import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from './notification.service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  persist?: boolean;
  title?: string;
  category?: 'order' | 'promotion' | 'profile' | 'system';
  actionLabel?: string;
  link?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly notificationService = inject(NotificationService);
  private readonly toastsSignal = signal<ToastItem[]>([]);

  readonly toasts = computed(() => this.toastsSignal());

  show(
    message: string,
    type: ToastType = 'info',
    durationMs: number = 3200,
    options?: ToastOptions,
  ) {
    const toast: ToastItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      type,
    };

    this.toastsSignal.update((items) => [...items, toast]);

    if (options?.persist ?? true) {
      this.notificationService.add(options?.title ?? this.getDefaultTitle(type), message, type, {
        category: options?.category ?? 'system',
        actionLabel: options?.actionLabel,
        link: options?.link,
      });
    }

    window.setTimeout(() => {
      this.dismiss(toast.id);
    }, durationMs);
  }

  dismiss(id: string) {
    this.toastsSignal.update((items) => items.filter((item) => item.id !== id));
  }

  private getDefaultTitle(type: ToastType) {
    const titles: Record<ToastType, string> = {
      success: 'Tudo certo',
      error: 'Algo deu errado',
      info: 'Atualizacao',
      warning: 'Atencao',
    };

    return titles[type];
  }
}
