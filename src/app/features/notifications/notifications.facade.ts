import { computed, inject, Injectable, signal } from '@angular/core';
import { NotificationPort } from '@/shared/core/contracts/app.contracts';
import { NOTIFICATION_PORT } from '@/shared/core/contracts/domain-tokens';

@Injectable({
  providedIn: 'root',
})
export class NotificationsFacade {
  readonly notificationPort = inject(NOTIFICATION_PORT) as NotificationPort;
  readonly loading = signal(true);
  readonly selectedCategory = signal<'all' | 'order' | 'promotion' | 'profile' | 'system'>('all');
  readonly categories = [
    { value: 'all' as const, label: 'Tudo' },
    { value: 'order' as const, label: 'Pedidos' },
    { value: 'promotion' as const, label: 'Promocoes' },
    { value: 'profile' as const, label: 'Perfil' },
    { value: 'system' as const, label: 'Sistema' },
  ];
  readonly filteredNotifications = computed(() => {
    const category = this.selectedCategory();
    const notifications = this.notificationPort.notifications();
    return category === 'all'
      ? notifications
      : notifications.filter((notification) => notification.category === category);
  });

  initialize() {
    queueMicrotask(() => this.loading.set(false));
  }

  selectCategory(category: 'all' | 'order' | 'promotion' | 'profile' | 'system') {
    this.selectedCategory.set(category);
  }
}
