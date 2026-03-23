import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { OrderService } from '@/shared/core/services/order.service';
import { Order } from '@/shared/models';
import { CardComponent, BadgeComponent } from '@/shared/components';
import { signal } from '@angular/core';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly location = inject(Location);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  private async loadOrder(orderId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const orders = await this.orderService.getOrders();
      const foundOrder = orders.find((o) => o.id === orderId);

      if (foundOrder) {
        this.order.set(foundOrder);
      } else {
        this.error.set('Pedido não encontrado');
      }
    } catch (err) {
      this.error.set('Erro ao carregar pedido');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
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
}
