import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { OrderService } from '@/shared/core/services/order.service';
import { CardComponent, ButtonComponent, BadgeComponent } from '@/shared/components';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button (click)="goBack()" class="text-2xl hover:text-blue-600 transition-colors mr-4">
            ←
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-8">
        @if (orders().length === 0) {
          <app-card>
            <div class="text-center py-8">
              <p class="text-4xl mb-4">📦</p>
              <p class="text-gray-600 text-lg mb-6">Você ainda não fez nenhum pedido</p>
              <app-button variant="primary" size="lg" [fullWidth]="true" (click)="goHome()">
                Voltar à loja
              </app-button>
            </div>
          </app-card>
        } @else {
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <app-card>
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <!-- Header -->
                    <div class="flex items-center gap-3 mb-3">
                      <span class="text-2xl">📦</span>
                      <div>
                        <h3 class="font-bold text-gray-900">Pedido #{{ order.id.slice(-6) }}</h3>
                        <p class="text-sm text-gray-600">
                          {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                    </div>

                    <!-- Items -->
                    <div class="mb-3 text-sm text-gray-600">
                      @for (item of order.items; track item.menuItem.id) {
                        <p>{{ item.menuItem.name }} (x{{ item.quantity }})</p>
                      }
                    </div>

                    <!-- Status -->
                    <div class="flex items-center gap-2 mb-3">
                      <app-badge [variant]="getStatusVariant(order.status)" size="sm">
                        {{ getStatusLabel(order.status) }}
                      </app-badge>
                    </div>

                    <!-- Valores -->
                    <div class="flex items-center gap-4 text-sm">
                      <span class="text-gray-600">
                        Subtotal: R$ {{ order.subtotal | number: '1.2-2' }}
                      </span>
                      <span class="text-gray-600">
                        Entrega: R$ {{ order.deliveryFee | number: '1.2-2' }}
                      </span>
                    </div>
                  </div>

                  <!-- Total e Ação -->
                  <div class="flex flex-col items-end gap-3 ml-4">
                    <div class="text-right">
                      <p class="text-sm text-gray-600">Total</p>
                      <p class="text-xl font-bold text-blue-600">
                        R$ {{ order.total | number: '1.2-2' }}
                      </p>
                    </div>
                    <app-button variant="secondary" size="sm" (click)="viewOrderDetail(order.id)">
                      Ver Detalhes
                    </app-button>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class OrdersComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly orderService = inject(OrderService);

  orders = computed(() => this.orderService.orders());

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  viewOrderDetail(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: '⏳ Pendente',
      confirmed: '✅ Confirmado',
      preparing: '👨‍🍳 Preparando',
      on_the_way: '🚗 A Caminho',
      delivered: '🎉 Entregue',
      cancelled: '❌ Cancelado',
    };
    return labels[status] || status;
  }

  getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      on_the_way: 'info',
      delivered: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  }
}
