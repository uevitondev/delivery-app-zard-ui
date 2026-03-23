import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { CartService } from '@/shared/core/services/cart.service';
import { CardComponent, ButtonComponent } from '@/shared/components';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button (click)="goBack()" class="text-2xl hover:text-blue-600 transition-colors mr-4">
            ←
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Carrinho</h1>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-8">
        @if (cartService.isEmpty()) {
          <app-card>
            <div class="text-center py-8">
              <p class="text-4xl mb-4">🛒</p>
              <p class="text-gray-600 text-lg mb-6">Seu carrinho está vazio</p>
              <app-button variant="primary" size="lg" [fullWidth]="true" (click)="goHome()">
                Voltar à loja
              </app-button>
            </div>
          </app-card>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Items -->
            <div class="lg:col-span-2">
              <!-- Restaurant Info -->
              @if (cartService.cart()?.restaurants) {
                <app-card [header]="cartService.cart()!.restaurants!.name" class="mb-6">
                  <p class="text-sm text-gray-600">
                    {{ cartService.cart()!.restaurants!.address }}
                  </p>
                </app-card>
              }

              <!-- Items List -->
              <div class="space-y-4">
                @for (item of cartService.items(); track item.menuItem.id) {
                  <app-card>
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h3 class="font-bold text-gray-900">
                          {{ item.menuItem.name }}
                        </h3>
                        @if (item.notes) {
                          <p class="text-sm text-gray-600 mt-1">Nota: {{ item.notes }}</p>
                        }
                        <p class="text-sm font-semibold text-gray-900 mt-3">
                          R$ {{ item.subtotal | number: '1.2-2' }}
                        </p>
                      </div>

                      <!-- Quantity Controls -->
                      <div class="flex items-center gap-2 ml-4">
                        <app-button
                          variant="secondary"
                          size="sm"
                          [disabled]="item.quantity <= 1"
                          (click)="decreaseQuantity(item.menuItem.id)"
                        >
                          −
                        </app-button>
                        <span class="w-6 text-center font-semibold">
                          {{ item.quantity }}
                        </span>
                        <app-button
                          variant="secondary"
                          size="sm"
                          (click)="increaseQuantity(item.menuItem.id)"
                        >
                          +
                        </app-button>
                        <button
                          (click)="removeItem(item.menuItem.id)"
                          class="text-red-600 hover:text-red-700 ml-2 text-lg"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </app-card>
                }
              </div>
            </div>

            <!-- Summary -->
            <div class="lg:col-span-1">
              <app-card class="sticky top-24">
                <h3 class="font-bold text-lg mb-4 text-gray-900">Resumo</h3>

                <div class="space-y-3 mb-4 border-b pb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="text-gray-900 font-semibold">
                      R$ {{ cartService.subtotal() | number: '1.2-2' }}
                    </span>
                  </div>

                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Taxa de entrega</span>
                    <span class="text-gray-900 font-semibold">
                      R$ {{ cartService.deliveryFee() | number: '1.2-2' }}
                    </span>
                  </div>

                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Impostos</span>
                    <span class="text-gray-900 font-semibold">
                      R$ {{ cartService.tax() | number: '1.2-2' }}
                    </span>
                  </div>
                </div>

                <div class="flex justify-between mb-6 border-t pt-4">
                  <span class="font-bold text-gray-900">Total</span>
                  <span class="font-bold text-xl text-blue-600">
                    R$ {{ cartService.total() | number: '1.2-2' }}
                  </span>
                </div>

                <app-button variant="primary" size="lg" [fullWidth]="true" (click)="goToCheckout()">
                  Ir para checkout
                </app-button>

                <app-button
                  variant="secondary"
                  size="lg"
                  [fullWidth]="true"
                  (click)="goHome()"
                  class="mt-3"
                >
                  Continuar comprando
                </app-button>
              </app-card>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CartComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly cartService = inject(CartService);

  increaseQuantity(menuItemId: string) {
    const item = this.cartService.items().find((i) => i.menuItem.id === menuItemId);
    if (item) {
      this.cartService.updateQuantity(menuItemId, item.quantity + 1);
    }
  }

  decreaseQuantity(menuItemId: string) {
    const item = this.cartService.items().find((i) => i.menuItem.id === menuItemId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(menuItemId, item.quantity - 1);
    }
  }

  removeItem(menuItemId: string) {
    this.cartService.removeItem(menuItemId);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    this.location.back();
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
