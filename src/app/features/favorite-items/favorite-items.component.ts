import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, MenuItemCardComponent } from '@/shared/components';
import { CartService } from '@/shared/core/services/cart.service';
import { ProfileService } from '@/shared/core/services/profile.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { ToastService } from '@/shared/core/services/toast.service';
import { MenuItem } from '@/shared/models';

@Component({
  selector: 'app-favorite-items',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, MenuItemCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">colecao pessoal</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Pratos favoritos</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        @if (profileService.favoriteMenuItems().length === 0) {
          <z-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">sem itens salvos</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Monte sua lista de pratos preferidos</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
                Salve pratos no cardapio dos restaurantes para repetir pedidos com muito mais rapidez.
              </p>
              <div class="mt-6 flex justify-center">
                <button z-button zSize="lg" (click)="goHome()">Explorar restaurantes</button>
              </div>
            </div>
          </z-card>
        } @else {
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">atalho rapido</p>
              <h2 class="section-title">Seus itens salvos</h2>
            </div>
            <p class="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">
              {{ profileService.favoriteMenuItems().length }} pratos prontos para repetir
            </p>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            @for (item of profileService.favoriteMenuItems(); track item.id) {
              <app-menu-item-card
                [item]="item"
                [isFavorite]="true"
                (addToCart)="addToCart(item)"
                (toggleFavorite)="toggleFavoriteItem(item)"
              />
            }
          </div>

          <div class="mt-6">
            <z-card>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">dica</p>
              <h3 class="mt-2 text-xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Quer ver mais detalhes?</h3>
              <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Abra o restaurante de origem para personalizar observacoes e explorar itens relacionados.
              </p>
              <div class="mt-4 flex flex-wrap gap-3">
                @for (item of profileService.favoriteMenuItems().slice(0, 3); track item.id) {
                  <button z-button zType="secondary" zSize="sm" (click)="goToRestaurant(item.restaurantId)">
                    {{ getRestaurantName(item.restaurantId) }}
                  </button>
                }
              </div>
            </z-card>
          </div>
        }
      </main>
    </div>
  `,
})
export class FavoriteItemsComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly profileService = inject(ProfileService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToRestaurant(restaurantId: string) {
    this.restaurantService.selectRestaurant(restaurantId);
    this.router.navigate(['/restaurant', restaurantId]);
  }

  addToCart(item: MenuItem) {
    this.cartService.addItem(item, 1);
    this.toastService.show(`${item.name} adicionado ao carrinho.`, 'success', 3200, {
      title: 'Carrinho atualizado',
      category: 'system',
      actionLabel: 'Abrir carrinho',
      link: '/cart',
    });
  }

  toggleFavoriteItem(item: MenuItem) {
    this.profileService.toggleFavoriteMenuItem(item.id);
    this.toastService.show(`${item.name} removido dos favoritos.`, 'info', 3200, {
      title: 'Favoritos atualizados',
      category: 'profile',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }

  getRestaurantName(restaurantId: string) {
    return this.restaurantService.getRestaurantById(restaurantId)?.name || 'Restaurante parceiro';
  }
}
