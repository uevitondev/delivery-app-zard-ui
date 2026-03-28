import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent } from '@/shared/components';
import { CartService } from '@/shared/core/services/cart.service';
import { ProfileService } from '@/shared/core/services/profile.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { ToastService } from '@/shared/core/services/toast.service';
import { MenuItem, Restaurant } from '@/shared/models';

interface AppCollection {
  id: string;
  title: string;
  description: string;
  accent: string;
  restaurant: Restaurant;
  items: MenuItem[];
  total: number;
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
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
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">editorial</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Colecoes</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        <div class="mb-6 max-w-3xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">curadoria do app</p>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            Combos pensados para momentos diferentes do seu dia
          </h2>
          <p class="mt-3 text-sm leading-6 text-stone-600">
            Escolha uma colecao pronta para acelerar a decisao e levar um pedido inteiro direto para o carrinho.
          </p>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          @for (collection of collections(); track collection.id) {
            <app-card>
              <div class="rounded-[26px] bg-gradient-to-br p-6 text-white" [ngClass]="collection.accent">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">colecao</p>
                <h3 class="mt-2 text-3xl font-semibold tracking-tight">{{ collection.title }}</h3>
                <p class="mt-3 max-w-xl text-sm leading-6 text-white/80">{{ collection.description }}</p>
                <div class="mt-4 flex items-center gap-3 text-sm text-white/80">
                  <span>{{ collection.restaurant.name }}</span>
                  <span>•</span>
                  <span>{{ collection.restaurant.deliveryTime }} min</span>
                </div>
              </div>

              <div class="mt-5 grid gap-3">
                @for (item of collection.items; track item.id) {
                  <div class="rounded-[22px] bg-stone-50 px-4 py-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="font-semibold text-stone-950">{{ item.name }}</p>
                        <p class="mt-1 text-sm text-stone-600">{{ item.description }}</p>
                      </div>
                      <p class="font-semibold text-stone-950">R$ {{ item.price | number: '1.2-2' }}</p>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">total estimado</p>
                  <p class="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                    R$ {{ collection.total | number: '1.2-2' }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <app-button variant="secondary" size="sm" (click)="goToRestaurant(collection.restaurant.id)">
                    Ver restaurante
                  </app-button>
                  <app-button size="sm" (click)="loadCollection(collection.id)">Montar pedido</app-button>
                </div>
              </div>
            </app-card>
          }
        </div>
      </main>
    </div>
  `,
})
export class CollectionsComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly restaurantService = inject(RestaurantService);
  private readonly profileService = inject(ProfileService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly collections = computed<AppCollection[]>(() => {
    const allItems = this.restaurantService.getAllMenuItems();
    const favoriteItems = this.profileService.favoriteMenuItems();
    const collections: AppCollection[] = [];

    const addCollection = (
      id: string,
      title: string,
      description: string,
      accent: string,
      items: MenuItem[],
    ) => {
      if (items.length === 0) {
        return;
      }

      const restaurant = this.restaurantService.getRestaurantById(items[0].restaurantId);
      if (!restaurant) {
        return;
      }

      collections.push({
        id,
        title,
        description,
        accent,
        restaurant,
        items,
        total: items.reduce((sum, item) => sum + item.price, 0),
      });
    };

    addCollection(
      'pizza-night',
      'Noite de pizza',
      'Duas pizzas bem avaliadas para compartilhar ou resolver o jantar sem pensar muito.',
      'from-orange-500 via-red-500 to-rose-500',
      allItems.filter((item) => item.restaurantId === '1').slice(0, 2),
    );
    addCollection(
      'pedido-rapido',
      'Pedido rapido',
      'Hamburgueres certeiros para quando a fome pede velocidade e impacto.',
      'from-amber-400 via-orange-500 to-stone-900',
      allItems.filter((item) => item.restaurantId === '2').slice(0, 2),
    );
    addCollection(
      'fresh-japanese',
      'Fresh japones',
      'Combinacao leve e fresca para um pedido mais equilibrado durante a semana.',
      'from-emerald-400 via-teal-500 to-cyan-500',
      allItems.filter((item) => item.restaurantId === '3').slice(0, 2),
    );

    if (favoriteItems.length >= 2) {
      addCollection(
        'mix-favoritos',
        'Mix dos favoritos',
        'Uma selecao personalizada com os pratos que voce ja mostrou gostar.',
        'from-stone-900 via-stone-700 to-orange-500',
        favoriteItems.slice(0, 3),
      );
    }

    return collections;
  });

  goBack() {
    this.location.back();
  }

  goToRestaurant(restaurantId: string) {
    this.restaurantService.selectRestaurant(restaurantId);
    this.router.navigate(['/restaurant', restaurantId]);
  }

  loadCollection(collectionId: string) {
    const collection = this.collections().find((item) => item.id === collectionId);
    if (!collection) {
      return;
    }

    this.cartService.loadMenuItemsBundle(collection.items);
    this.toastService.show(`${collection.title} carregada no carrinho.`, 'success', 3200, {
      title: 'Colecao montada',
      category: 'order',
      actionLabel: 'Abrir carrinho',
      link: '/cart',
    });
    this.router.navigate(['/cart']);
  }
}
