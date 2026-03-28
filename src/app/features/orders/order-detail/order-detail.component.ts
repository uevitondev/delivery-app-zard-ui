import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingComponent,
  TextareaComponent,
} from '@/shared/components';
import { CartService } from '@/shared/core/services/cart.service';
import { OrderService } from '@/shared/core/services/order.service';
import { ToastService } from '@/shared/core/services/toast.service';
import { Order, OrderRating, OrderStatus } from '@/shared/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    ButtonComponent,
    TextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly location = inject(Location);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private readonly orderId = signal<string | null>(null);
  order = computed(() => {
    const orderId = this.orderId();
    if (!orderId) {
      return null;
    }

    return this.orderService.orders().find((item) => item.id === orderId) ?? null;
  });
  loading = signal(true);
  error = signal<string | null>(null);
  ratingScore = signal(5);
  ratingComment = signal('');

  canRate = computed(
    () => this.order()?.status === OrderStatus.DELIVERED && !this.order()?.rating,
  );
  readonly trackingStatus = computed(() => {
    const order = this.order();
    if (!order) {
      return null;
    }

    const statusMeta: Record<
      OrderStatus,
      { title: string; copy: string; progress: number; accent: string; pulse: string }
    > = {
      [OrderStatus.PENDING]: {
        title: 'Pedido recebido',
        copy: 'O restaurante recebeu sua solicitacao e esta validando os detalhes.',
        progress: 12,
        accent: 'from-amber-400 via-orange-400 to-orange-500',
        pulse: 'bg-amber-400',
      },
      [OrderStatus.CONFIRMED]: {
        title: 'Pedido confirmado',
        copy: 'Tudo certo. A cozinha ja separou a fila e vai iniciar o preparo.',
        progress: 28,
        accent: 'from-orange-400 via-orange-500 to-red-500',
        pulse: 'bg-orange-500',
      },
      [OrderStatus.PREPARING]: {
        title: 'Cozinha em preparo',
        copy: 'Seu pedido esta sendo montado agora com prioridade do restaurante.',
        progress: 55,
        accent: 'from-orange-500 via-red-500 to-rose-500',
        pulse: 'bg-red-500',
      },
      [OrderStatus.READY]: {
        title: 'Pedido pronto',
        copy: 'O pacote esta finalizado e aguardando retirada do entregador.',
        progress: 72,
        accent: 'from-emerald-400 via-emerald-500 to-teal-500',
        pulse: 'bg-emerald-500',
      },
      [OrderStatus.OUT_FOR_DELIVERY]: {
        title: 'Entregador a caminho',
        copy: 'Seu pedido saiu para entrega e esta se aproximando do endereco.',
        progress: 86,
        accent: 'from-sky-400 via-cyan-500 to-blue-500',
        pulse: 'bg-sky-500',
      },
      [OrderStatus.DELIVERED]: {
        title: 'Pedido entregue',
        copy: 'Entrega concluida. Aproveite sua refeicao e avalie a experiencia.',
        progress: 100,
        accent: 'from-emerald-400 via-teal-500 to-lime-500',
        pulse: 'bg-emerald-500',
      },
      [OrderStatus.CANCELLED]: {
        title: 'Pedido cancelado',
        copy: 'Esse pedido foi encerrado e nao seguira no fluxo de entrega.',
        progress: 0,
        accent: 'from-stone-400 via-stone-500 to-stone-600',
        pulse: 'bg-stone-500',
      },
    };

    return statusMeta[order.status];
  });
  readonly courierProfile = computed(() => {
    const order = this.order();
    if (!order) {
      return null;
    }

    const names = ['Lucas', 'Marina', 'Diego', 'Camila', 'Rafael'];
    const vehicles = ['Moto', 'Bike', 'Scooter'];
    const etaMinutes = Math.max(
      1,
      Math.round(
        ((order.estimatedDelivery?.getTime() ?? Date.now()) - Date.now()) / 60000,
      ),
    );
    const numericSeed = Number(order.id.replace(/\D/g, '').slice(-4) || '1');

    return {
      name: names[numericSeed % names.length],
      vehicle: vehicles[numericSeed % vehicles.length],
      initials: names[numericSeed % names.length].slice(0, 1),
      etaMinutes: order.status === OrderStatus.DELIVERED ? 0 : etaMinutes,
      lastUpdate:
        order.status === OrderStatus.OUT_FOR_DELIVERY
          ? 'Passou pela rota principal e esta vindo pela sua regiao.'
          : order.status === OrderStatus.PREPARING
            ? 'O entregador foi acionado e deve retirar em breve.'
            : order.status === OrderStatus.CONFIRMED
              ? 'O restaurante confirmou o pedido e estimou o preparo.'
              : order.status === OrderStatus.DELIVERED
                ? 'Entrega finalizada com sucesso.'
                : 'Aguardando evolucao das proximas etapas.',
    };
  });
  readonly routeStops = computed(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    const status = order.status;
    const currentIndex =
      status === OrderStatus.DELIVERED
        ? 3
        : status === OrderStatus.OUT_FOR_DELIVERY
          ? 2
          : status === OrderStatus.PREPARING || status === OrderStatus.READY
            ? 1
            : 0;

    return [
      {
        title: 'Restaurante confirmou',
        subtitle: order.restaurant?.name ?? 'Loja parceira',
        active: currentIndex >= 0,
      },
      {
        title: 'Retirada no balcão',
        subtitle: 'Pedido embalado para envio',
        active: currentIndex >= 1,
      },
      {
        title: 'Em deslocamento',
        subtitle: 'Entrega indo para seu endereco',
        active: currentIndex >= 2,
      },
      {
        title: 'Destino final',
        subtitle: `${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.city}`,
        active: currentIndex >= 3,
      },
    ];
  });
  timelineSteps = computed(() => {
    const status = this.order()?.status ?? OrderStatus.PENDING;
    const steps = [
      { key: OrderStatus.PENDING, label: 'Recebido', copy: 'Seu pedido entrou na fila do restaurante.' },
      { key: OrderStatus.CONFIRMED, label: 'Confirmado', copy: 'O restaurante aceitou o pedido.' },
      { key: OrderStatus.PREPARING, label: 'Preparando', copy: 'A cozinha esta montando seu pedido.' },
      { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Em rota', copy: 'O entregador saiu para entrega.' },
      { key: OrderStatus.DELIVERED, label: 'Entregue', copy: 'Pedido entregue no endereco informado.' },
    ];

    const currentIndex = steps.findIndex((step) => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: currentIndex >= index,
      current: currentIndex === index,
    }));
  });

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.orderId.set(orderId);
      this.loadOrder(orderId);
    }
  }

  private async loadOrder(orderId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const existingOrder = this.orderService.getOrderById(orderId);
      if (existingOrder) {
        return;
      }

      const orders = await this.orderService.getOrders();
      const foundOrder = orders.find((item) => item.id === orderId);

      if (!foundOrder) {
        this.error.set('Pedido nao encontrado');
      }
    } catch {
      this.error.set('Erro ao carregar pedido');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }

  async submitRating() {
    const order = this.order();
    if (!order) return;

    const rating: OrderRating = {
      score: this.ratingScore(),
      restaurantRating: this.ratingScore(),
      deliveryRating: this.ratingScore(),
      comment: this.ratingComment() || undefined,
      ratedAt: new Date(),
    };

    await this.orderService.rateOrder(order.id, rating);
    this.toastService.show('Avaliacao enviada com sucesso.', 'success', 3200, {
      title: 'Pedido avaliado',
      category: 'order',
      actionLabel: 'Ver pedidos',
      link: '/orders',
    });
  }

  reorder() {
    const order = this.order();
    if (!order) return;

    this.cartService.loadOrder(order);
    this.toastService.show('Itens do pedido adicionados ao carrinho.', 'success', 3200, {
      title: 'Carrinho atualizado',
      category: 'order',
      actionLabel: 'Abrir carrinho',
      link: '/cart',
    });
    this.router.navigate(['/cart']);
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      out_for_delivery: 'Em Entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  }

  getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const variantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'warning',
      ready: 'success',
      out_for_delivery: 'info',
      delivered: 'success',
      cancelled: 'danger',
    };
    return variantMap[status] || 'default';
  }

  getPaymentMethodLabel() {
    const method = this.order()?.paymentMethod;
    if (!method) {
      return '';
    }

    const labels: Record<string, string> = {
      credit_card: method.label || `Cartao final ${method.lastDigits ?? '****'}`,
      debit_card: method.label || `Debito final ${method.lastDigits ?? '****'}`,
      pix: method.label || 'PIX',
      cash: method.label || 'Dinheiro',
      wallet: method.label || 'Carteira',
    };

    return labels[method.type] || method.label || method.type;
  }
}
