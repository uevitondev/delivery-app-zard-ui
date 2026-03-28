import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent } from '@/shared/components';
import { CartService } from '@/shared/core/services/cart.service';
import { ProfileService } from '@/shared/core/services/profile.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
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
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">sacola atual</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Carrinho</h1>
            </div>
          </div>
          <app-badge class="hidden md:inline-flex" variant="info" size="md">
            {{ cartService.itemCount() }} itens
          </app-badge>
        </div>
      </header>

      <main class="app-page py-6">
        @if (cartService.isEmpty()) {
          <div class="space-y-6">
            <app-card>
              <div class="py-14 text-center">
                <p class="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">sua sacola</p>
                <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Ainda esta vazia</h2>
                <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
                  Volte para a vitrine, abra uma colecao pronta ou reuse seus favoritos para montar o pedido.
                </p>
                <div class="mt-6 flex flex-wrap justify-center gap-3">
                  <app-button size="lg" (click)="goHome()">Voltar a loja</app-button>
                  <app-button variant="secondary" size="lg" (click)="goToCollections()">
                    Ver colecoes
                  </app-button>
                </div>
              </div>
            </app-card>

            @if (profileService.favoriteMenuItems().length > 0) {
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">reaproveite favoritos</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Itens que voce ja salvou</h3>
                <div class="mt-5 grid gap-3 md:grid-cols-2">
                  @for (item of profileService.favoriteMenuItems().slice(0, 4); track item.id) {
                    <button
                      type="button"
                      (click)="openRestaurant(item.restaurantId)"
                      class="rounded-[22px] bg-stone-50 px-4 py-4 text-left transition hover:bg-stone-100"
                    >
                      <p class="font-semibold text-stone-950">{{ item.name }}</p>
                      <p class="mt-1 text-sm text-stone-600">
                        {{ getRestaurantName(item.restaurantId) }} · R$ {{ item.price | number: '1.2-2' }}
                      </p>
                    </button>
                  }
                </div>
              </app-card>
            }

            @if (recentRestaurants().length > 0) {
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">retome rapido</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Restaurantes explorados recentemente</h3>
                <div class="mt-5 flex flex-wrap gap-3">
                  @for (restaurant of recentRestaurants(); track restaurant.id) {
                    <app-button variant="secondary" size="sm" (click)="openRestaurant(restaurant.id)">
                      {{ restaurant.name }}
                    </app-button>
                  }
                </div>
              </app-card>
            }
          </div>
        } @else {
          <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section class="space-y-4">
              @if (cartService.cart()?.restaurant) {
                <app-card>
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">restaurante</p>
                      <h2 class="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                        {{ cartService.cart()!.restaurant!.name }}
                      </h2>
                      <p class="mt-2 text-sm text-stone-600">
                        {{ cartService.cart()!.restaurant!.address }}
                      </p>
                    </div>
                    <div class="rounded-[22px] bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
                      Entrega em {{ cartService.cart()!.restaurant!.deliveryTime }} min
                    </div>
                  </div>
                </app-card>
              }

              @for (item of cartService.items(); track item.menuItem.id) {
                <app-card>
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-start gap-4">
                      <img
                        [src]="item.menuItem.image"
                        [alt]="item.menuItem.name"
                        class="h-24 w-24 rounded-[22px] object-cover"
                      />
                      <div class="min-w-0">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                          {{ item.menuItem.category }}
                        </p>
                        <h3 class="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                          {{ item.menuItem.name }}
                        </h3>
                        @if (item.notes) {
                          <p class="mt-2 text-sm text-stone-600">{{ item.notes }}</p>
                        }
                        <p class="mt-3 text-base font-semibold text-orange-600">
                          R$ {{ item.subtotal | number: '1.2-2' }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div class="inline-flex items-center rounded-full border border-stone-200 bg-white px-2 py-2 shadow-[0_8px_18px_rgba(118,60,24,0.08)]">
                        <button
                          (click)="decreaseQuantity(item.menuItem.id)"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                        >
                          −
                        </button>
                        <span class="min-w-8 text-center text-sm font-semibold text-stone-900">
                          {{ item.quantity }}
                        </span>
                        <button
                          (click)="increaseQuantity(item.menuItem.id)"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        (click)="removeItem(item.menuItem.id)"
                        class="text-sm font-semibold text-red-500 transition hover:text-red-600"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </app-card>
              }
            </section>

            <aside class="xl:sticky xl:top-24 xl:self-start">
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">resumo da compra</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Finalizar pedido</h2>

                <div class="mt-6 space-y-3 border-b border-stone-100 pb-5 text-sm">
                  <div class="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span class="font-semibold text-stone-900">R$ {{ cartService.subtotal() | number: '1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-stone-600">
                    <span>Entrega</span>
                    <span class="font-semibold text-stone-900">R$ {{ cartService.deliveryFee() | number: '1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-stone-600">
                    <span>Impostos</span>
                    <span class="font-semibold text-stone-900">R$ {{ cartService.tax() | number: '1.2-2' }}</span>
                  </div>
                </div>

                <div class="mt-5 flex items-end justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">total</p>
                    <p class="text-3xl font-semibold tracking-tight text-stone-950">
                      R$ {{ cartService.total() | number: '1.2-2' }}
                    </p>
                  </div>
                  <p class="text-sm text-stone-500">{{ cartService.itemCount() }} itens</p>
                </div>

                <div class="mt-6 space-y-3">
                  <app-button size="lg" [fullWidth]="true" (click)="goToCheckout()">
                    Continuar para checkout
                  </app-button>
                  <app-button variant="secondary" size="lg" [fullWidth]="true" (click)="goHome()">
                    Adicionar mais itens
                  </app-button>
                </div>
              </app-card>
            </aside>
          </div>
        }
      </main>
    </div>
  `,
})
export class CartComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly cartService = inject(CartService);
  readonly profileService = inject(ProfileService);
  private readonly restaurantService = inject(RestaurantService);
  readonly recentRestaurants = computed(() =>
    this.restaurantService
      .restaurants()
      .filter((restaurant) =>
        this.profileService
          .recentSearches()
          .some((term) => restaurant.name.toLowerCase().includes(term.toLowerCase())),
      )
      .slice(0, 3),
  );

  increaseQuantity(menuItemId: string) {
    const item = this.cartService.items().find((cartItem) => cartItem.menuItem.id === menuItemId);
    if (item) {
      this.cartService.updateQuantity(menuItemId, item.quantity + 1);
    }
  }

  decreaseQuantity(menuItemId: string) {
    const item = this.cartService.items().find((cartItem) => cartItem.menuItem.id === menuItemId);
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

  goToCollections() {
    this.router.navigate(['/collections']);
  }

  openRestaurant(restaurantId: string) {
    this.restaurantService.selectRestaurant(restaurantId);
    this.router.navigate(['/restaurant', restaurantId]);
  }

  getRestaurantName(restaurantId: string) {
    return this.restaurantService.getRestaurantById(restaurantId)?.name || 'Restaurante parceiro';
  }
}
