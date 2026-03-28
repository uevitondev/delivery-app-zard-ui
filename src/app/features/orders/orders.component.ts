import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent, LoadingComponent } from '@/shared/components';
import { OrderStatus } from '@/shared/models';
import { OrdersFacade } from './orders.facade';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">historico</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Meus pedidos</h1>
            </div>
          </div>
          <app-badge variant="info" size="md">{{ orders().length }} pedidos</app-badge>
        </div>
      </header>

      <main class="app-page py-6">
        @if (loading()) {
          <app-loading variant="list" [count]="4" />
        } @else if (orders().length === 0) {
          <app-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">sem historico</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Voce ainda nao fez pedidos</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
                Explore a vitrine, monte seu carrinho e acompanhe tudo por aqui.
              </p>
              <div class="mt-6 flex justify-center">
                <app-button size="lg" (click)="goHome()">Voltar a loja</app-button>
              </div>
            </div>
          </app-card>
        } @else {
          <div class="grid gap-4">
            @for (order of orders(); track order.id) {
              <app-card>
                <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-3">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                        Pedido #{{ order.id.slice(-6) }}
                      </p>
                      <app-badge [variant]="getStatusVariant(order.status)" size="md">
                        {{ getStatusLabel(order.status) }}
                      </app-badge>
                    </div>

                    <p class="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                      {{ order.restaurant?.name || 'Pedido em andamento' }}
                    </p>
                    <p class="mt-1 text-sm text-stone-500">
                      {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </p>

                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (item of order.items; track item.menuItem.id) {
                        <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                          {{ item.quantity }}x {{ item.menuItem.name }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="flex flex-col gap-4 rounded-[24px] bg-stone-50 px-5 py-4 lg:min-w-64">
                    <div class="flex items-end justify-between gap-4">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">total</p>
                        <p class="text-2xl font-semibold tracking-tight text-stone-950">
                          R$ {{ order.total | number: '1.2-2' }}
                        </p>
                      </div>
                      <p class="text-sm text-stone-500">{{ order.items.length }} itens</p>
                    </div>

                    <app-button variant="secondary" [fullWidth]="true" (click)="viewOrderDetail(order.id)">
                      Ver detalhes
                    </app-button>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly facade = inject(OrdersFacade);
  readonly loading = this.facade.loading;
  readonly orders = this.facade.orders;

  async ngOnInit() {
    await this.facade.loadOrders();
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  viewOrderDetail(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      [OrderStatus.PENDING]: 'Pendente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PREPARING]: 'Preparando',
      [OrderStatus.READY]: 'Pronto',
      [OrderStatus.OUT_FOR_DELIVERY]: 'A caminho',
      [OrderStatus.DELIVERED]: 'Entregue',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] || status;
  }

  getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.CONFIRMED]: 'info',
      [OrderStatus.PREPARING]: 'info',
      [OrderStatus.READY]: 'success',
      [OrderStatus.OUT_FOR_DELIVERY]: 'info',
      [OrderStatus.DELIVERED]: 'success',
      [OrderStatus.CANCELLED]: 'danger',
    };
    return variants[status] || 'default';
  }
}
