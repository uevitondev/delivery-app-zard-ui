import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderRating, OrderStatus } from '@/shared/models';
import { loadFromStorage, saveToStorage } from '@/shared/utils';
import { ToastService } from './toast.service';
import { OrderPort } from '../contracts/app.contracts';

const ORDERS_STORAGE_KEY = 'deliveryapp.orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService implements OrderPort {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = '/api/orders';
  private readonly statusTimers = new Map<string, number[]>();

  // Signals
  private readonly ordersSignal = signal<Order[]>(
    loadFromStorage<Order[]>(ORDERS_STORAGE_KEY, [], (orders) =>
      orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
        actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
        rating: order.rating
          ? {
              ...order.rating,
              ratedAt: new Date(order.rating.ratedAt),
            }
          : undefined,
      })),
    ),
  );
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

  constructor() {
    this.persistOrders();
    this.ordersSignal().forEach((order) => this.scheduleStatusProgression(order));
  }

  async getOrders(): Promise<Order[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Em produção: this.http.get<Order[]>(this.apiUrl)
      return this.ordersSignal();
    } catch {
      this.errorSignal.set('Nao foi possivel carregar os pedidos.');
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSignal().find((order) => order.id === id);
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    this.errorSignal.set(null);

    try {
      // Em produção: this.http.post<Order>(this.apiUrl, order)
      const newOrder: Order = {
        ...order,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      const orders = this.ordersSignal();
      this.ordersSignal.set([newOrder, ...orders]);
      this.persistOrders();
      this.scheduleStatusProgression(newOrder);

      return newOrder;
    } catch {
      this.errorSignal.set('Nao foi possivel criar o pedido.');
      throw new Error('CREATE_ORDER_FAILED');
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    this.errorSignal.set(null);

    try {
      const orders = this.ordersSignal();
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        this.ordersSignal.set([...orders]);
        this.persistOrders();
        this.handleStatusSideEffects(orders[orderIndex]);
      }

      // Em produção: this.http.patch(`${this.apiUrl}/${orderId}`, { status })
    } catch {
      this.errorSignal.set('Nao foi possivel atualizar o status do pedido.');
      throw new Error('UPDATE_ORDER_STATUS_FAILED');
    }
  }

  cancelOrder(orderId: string) {
    this.clearScheduledUpdates(orderId);
    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  async rateOrder(orderId: string, rating: OrderRating) {
    this.errorSignal.set(null);

    try {
      const orders = this.ordersSignal();
      const orderIndex = orders.findIndex((o) => o.id === orderId);

      if (orderIndex !== -1) {
        orders[orderIndex].rating = rating;
        this.ordersSignal.set([...orders]);
        this.persistOrders();
      }

      // Em produção: this.http.post(`${this.apiUrl}/${orderId}/rate`, rating)
    } catch {
      this.errorSignal.set('Nao foi possivel registrar a avaliacao do pedido.');
      throw new Error('RATE_ORDER_FAILED');
    }
  }

  private persistOrders() {
    saveToStorage(ORDERS_STORAGE_KEY, this.ordersSignal());
  }

  private scheduleStatusProgression(order: Order) {
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED ||
      this.statusTimers.has(order.id)
    ) {
      return;
    }

    const statusSequence = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ];

    const currentIndex = statusSequence.indexOf(order.status);
    const nextStatuses = statusSequence.slice(Math.max(currentIndex + 1, 1));
    const delays = [4000, 9000, 15000, 22000];
    const timers: number[] = [];

    nextStatuses.forEach((status, index) => {
      const timerId = window.setTimeout(() => {
        void this.updateOrderStatus(order.id, status);
      }, delays[index] ?? delays[delays.length - 1]);
      timers.push(timerId);
    });

    this.statusTimers.set(order.id, timers);
  }

  private clearScheduledUpdates(orderId: string) {
    const timers = this.statusTimers.get(orderId) ?? [];
    timers.forEach((timerId) => window.clearTimeout(timerId));
    this.statusTimers.delete(orderId);
  }

  private handleStatusSideEffects(order: Order) {
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      this.clearScheduledUpdates(order.id);
    }

    const messages: Partial<Record<OrderStatus, string>> = {
      [OrderStatus.CONFIRMED]: 'Pedido confirmado pelo restaurante.',
      [OrderStatus.PREPARING]: 'Seu pedido entrou em preparo.',
      [OrderStatus.OUT_FOR_DELIVERY]: 'O entregador saiu com seu pedido.',
      [OrderStatus.DELIVERED]: 'Pedido entregue. Bom apetite!',
      [OrderStatus.CANCELLED]: 'Pedido cancelado.',
    };

    const message = messages[order.status];
    if (message) {
      this.toastService.show(message, order.status === OrderStatus.CANCELLED ? 'warning' : 'info', 3200, {
        title: order.restaurant?.name ?? 'Atualizacao do pedido',
        category: 'order',
        actionLabel: 'Abrir pedido',
        link: `/orders/${order.id}`,
      });
    }
  }
}
