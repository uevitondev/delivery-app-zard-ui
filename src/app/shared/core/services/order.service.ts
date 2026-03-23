import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderStatus } from '@/shared/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/orders';

  // Signals
  private readonly ordersSignal = signal<Order[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed
  readonly orders = computed(() => this.ordersSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  readonly activeOrders = computed(() =>
    this.ordersSignal().filter(
      (order) => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED,
    ),
  );

  readonly deliveredOrders = computed(() =>
    this.ordersSignal().filter((order) => order.status === OrderStatus.DELIVERED),
  );

  getOrders(): Promise<Order[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Em produção: this.http.get<Order[]>(this.apiUrl)
    // Por enquanto, retornar array vazio
    this.loadingSignal.set(false);
    return Promise.resolve([]);
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSignal().find((order) => order.id === id);
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    // Em produção: this.http.post<Order>(this.apiUrl, order)
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const orders = this.ordersSignal();
    this.ordersSignal.set([newOrder, ...orders]);

    return Promise.resolve(newOrder);
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const orders = this.ordersSignal();
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      this.ordersSignal.set([...orders]);
    }

    // Em produção: this.http.patch(`${this.apiUrl}/${orderId}`, { status })
    return Promise.resolve();
  }

  cancelOrder(orderId: string) {
    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  rateOrder(orderId: string, rating: any) {
    const orders = this.ordersSignal();
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex !== -1) {
      orders[orderIndex].rating = rating;
      this.ordersSignal.set([...orders]);
    }

    // Em produção: this.http.post(`${this.apiUrl}/${orderId}/rate`, rating)
    return Promise.resolve();
  }
}
