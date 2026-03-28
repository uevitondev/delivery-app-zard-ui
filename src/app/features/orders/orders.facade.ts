import { computed, inject, Injectable, signal } from '@angular/core';
import { OrderPort } from '@/shared/core/contracts/app.contracts';
import { ORDER_PORT } from '@/shared/core/contracts/domain-tokens';

@Injectable({
  providedIn: 'root',
})
export class OrdersFacade {
  readonly orderPort = inject(ORDER_PORT) as OrderPort;
  readonly loading = signal(true);
  readonly orders = computed(() => this.orderPort.orders());

  async loadOrders() {
    this.loading.set(true);
    try {
      await this.orderPort.getOrders();
    } finally {
      this.loading.set(false);
    }
  }
}
