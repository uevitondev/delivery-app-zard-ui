import { Injectable, computed, signal } from '@angular/core';
import { loadFromStorage, saveToStorage } from '@/shared/utils';
import { NotificationPort } from '../contracts/app.contracts';

const NOTIFICATIONS_STORAGE_KEY = 'deliveryapp.notifications';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  category: 'order' | 'promotion' | 'profile' | 'system';
  actionLabel?: string;
  link?: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements NotificationPort {
  private readonly notificationsSignal = signal<AppNotification[]>(
    loadFromStorage<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY, [], (items) =>
      items.map((item) => ({
        ...item,
        category: item.category ?? 'system',
        createdAt: new Date(item.createdAt),
      })),
    ),
  );

  readonly notifications = computed(() => this.notificationsSignal());
  readonly unreadCount = computed(() => this.notificationsSignal().filter((item) => !item.read).length);

  add(
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    options?: Pick<AppNotification, 'category' | 'actionLabel' | 'link'>,
  ) {
    const notification: AppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      message,
      type,
      category: options?.category ?? 'system',
      actionLabel: options?.actionLabel,
      link: options?.link,
      createdAt: new Date(),
      read: false,
    };

    this.notificationsSignal.update((items) => [notification, ...items].slice(0, 50));
    this.persist();
  }

  markAsRead(id: string) {
    this.notificationsSignal.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    this.persist();
  }

  markAllAsRead() {
    this.notificationsSignal.update((items) => items.map((item) => ({ ...item, read: true })));
    this.persist();
  }

  clearAll() {
    this.notificationsSignal.set([]);
    this.persist();
  }

  private persist() {
    saveToStorage(NOTIFICATIONS_STORAGE_KEY, this.notificationsSignal());
  }
}
