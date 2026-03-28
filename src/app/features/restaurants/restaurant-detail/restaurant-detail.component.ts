import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingComponent,
  MenuItemCardComponent,
  TextareaComponent,
} from '@/shared/components';
import { CartService } from '@/shared/core/services/cart.service';
import { ProfileService } from '@/shared/core/services/profile.service';
import { PromotionService } from '@/shared/core/services/promotion.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { ToastService } from '@/shared/core/services/toast.service';
import { MenuItem } from '@/shared/models';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    MenuItemCardComponent,
    LoadingComponent,
    FormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    TextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <button
            (click)="goBack()"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
          >
            ←
          </button>

          <button
            (click)="goToCart()"
            class="relative inline-flex h-12 items-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
          >
            Carrinho
            @if (cartService.itemCount() > 0) {
              <span class="ml-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {{ cartService.itemCount() }}
              </span>
            }
          </button>
        </div>
      </header>

      @if (!restaurant()) {
        <app-loading />
      } @else {
        <main class="app-page py-6">
          <section class="app-surface overflow-hidden">
            <div class="relative h-72 overflow-hidden sm:h-[22rem]">
              <div class="absolute inset-0 z-10 bg-gradient-to-t from-stone-950/70 via-stone-900/10 to-transparent"></div>
              <img
                [src]="restaurant()!.image"
                [alt]="restaurant()!.name"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="px-5 py-6 sm:px-8">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div class="mb-3 flex flex-wrap gap-2">
                    <z-badge [zType]="restaurant()!.isOpen ? 'success' : 'danger'" zSize="md">
                      {{ restaurant()!.isOpen ? 'Aberto agora' : 'Fechado' }}
                    </z-badge>
                    <z-badge zType="info" zSize="md">{{ restaurant()!.category }}</z-badge>
                    <button z-button zType="secondary" zSize="sm" (click)="toggleFavorite()">
                      {{ isFavorite() ? 'Favorito' : 'Salvar' }}
                    </button>
                  </div>

                  <h1 class="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                    {{ restaurant()!.name }}
                  </h1>
                  <p class="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
                    {{ restaurant()!.description }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">avaliacao</p>
                    <p class="mt-2 text-2xl font-semibold text-stone-950">{{ restaurant()!.rating }}</p>
                  </div>
                  <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">entrega</p>
                    <p class="mt-2 text-2xl font-semibold text-stone-950">{{ restaurant()!.deliveryTime }} min</p>
                  </div>
                  <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">taxa</p>
                    <p class="mt-2 text-2xl font-semibold text-stone-950">R$ {{ restaurant()!.deliveryFee | number: '1.2-2' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-6 grid gap-4 lg:grid-cols-2">
            @for (coupon of restaurantCoupons(); track coupon.code) {
              <z-card>
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                      Cupom {{ coupon.code }}
                    </p>
                    <h3 class="mt-2 text-xl font-semibold tracking-tight text-stone-950">{{ coupon.title }}</h3>
                    <p class="mt-2 text-sm leading-6 text-stone-600">{{ coupon.description }}</p>
                  </div>
                  <button z-button
                    zSize="sm"
                    [zType]="profileService.isCouponSaved(coupon.code) ? 'secondary' : 'default'"
                    (click)="toggleSavedCoupon(coupon.code)"
                  >
                    {{ profileService.isCouponSaved(coupon.code) ? 'Salvo' : 'Salvar' }}
                  </button>
                </div>
              </z-card>
            }
          </section>

          <section class="mt-6">
            @if (menuItems().length === 0) {
              <z-card>
                <div class="py-10 text-center">
                  <p class="text-lg font-semibold text-stone-900">Menu vazio no momento</p>
                </div>
              </z-card>
            } @else {
              <div class="space-y-8">
                @for (category of categories(); track category) {
                  <div>
                    <div class="mb-4 flex items-center justify-between">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">categoria</p>
                        <h2 class="text-2xl font-semibold tracking-tight text-stone-950">{{ category }}</h2>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      @for (item of itemsByCategory(category); track item.id) {
                        <app-menu-item-card
                          [item]="item"
                          [isFavorite]="profileService.isFavoriteMenuItem(item.id)"
                          (addToCart)="addToCart(item)"
                          (toggleFavorite)="toggleFavoriteItem(item)"
                        />
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        </main>

        @if (selectedItem() && showQuantityModal()) {
          <div class="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-sm" (click)="closeModal()">
            <div class="absolute inset-x-0 bottom-0 mx-auto max-w-2xl p-4 sm:bottom-4" (click)="$event.stopPropagation()">
              <z-card>
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">personalizar item</p>
                    <h3 class="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                      {{ selectedItem()!.name }}
                    </h3>
                    <p class="mt-2 text-sm leading-6 text-stone-600">{{ selectedItem()!.description }}</p>
                  </div>
                  <p class="text-xl font-semibold text-orange-600">
                    R$ {{ selectedItem()!.price | number: '1.2-2' }}
                  </p>
                </div>

                <div class="mt-6 flex items-center justify-between rounded-[24px] bg-stone-50 px-4 py-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">quantidade</p>
                    <p class="mt-1 text-lg font-semibold text-stone-950">{{ quantity() }}</p>
                  </div>
                  <div class="inline-flex items-center rounded-full border border-stone-200 bg-white px-2 py-2">
                    <button
                      (click)="decreaseQuantity()"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                      −
                    </button>
                    <span class="min-w-8 text-center text-sm font-semibold text-stone-900">
                      {{ quantity() }}
                    </span>
                    <button
                      (click)="increaseQuantity()"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="mt-5">
                  <z-textarea
                    label="Observacoes"
                    placeholder="Ex.: sem cebola, molho a parte, caprichar no queijo..."
                    [ngModel]="notes()"
                    (ngModelChange)="notes.set($event)"
                    [rows]="4"
                  />
                </div>

                <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button z-button zType="secondary" zSize="lg" [zFull]="true" (click)="closeModal()">
                    Cancelar
                  </button>
                  <button z-button zSize="lg" [zFull]="true" (click)="confirmAddToCart()">
                    Adicionar ao carrinho
                  </button>
                </div>
              </z-card>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class RestaurantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly restaurantService = inject(RestaurantService);
  readonly cartService = inject(CartService);
  readonly profileService = inject(ProfileService);
  readonly promotionService = inject(PromotionService);
  private readonly toastService = inject(ToastService);

  private readonly quantitySignal = signal(1);
  private readonly notesSignal = signal('');
  private readonly selectedItemSignal = signal<MenuItem | null>(null);
  private readonly showQuantityModalSignal = signal(false);

  restaurant = this.restaurantService.selectedRestaurant;
  menuItems = this.restaurantService.selectedRestaurantMenu;
  quantity = this.quantitySignal;
  notes = this.notesSignal;
  selectedItem = this.selectedItemSignal;
  showQuantityModal = this.showQuantityModalSignal;
  coupons = this.promotionService.getAvailableCoupons();

  categories = computed(() => {
    const categories = new Set(this.menuItems().map((item) => item.category));
    return Array.from(categories);
  });

  itemsByCategory = (category: string) =>
    this.menuItems().filter((item) => item.category === category);

  isFavorite = computed(() => {
    const restaurantId = this.restaurant()?.id;
    return restaurantId ? this.profileService.isFavoriteRestaurant(restaurantId) : false;
  });

  restaurantCoupons = computed(() =>
    this.coupons.filter((coupon) => !coupon.restaurantId || coupon.restaurantId === this.restaurant()?.id),
  );

  ngOnInit() {
    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (restaurantId) {
      this.restaurantService.selectRestaurant(restaurantId);
    }
  }

  addToCart(item: MenuItem) {
    this.selectedItemSignal.set(item);
    this.quantitySignal.set(1);
    this.notesSignal.set('');
    this.showQuantityModalSignal.set(true);
  }

  confirmAddToCart() {
    const item = this.selectedItemSignal();
    if (item) {
      this.cartService.addItem(item, this.quantitySignal(), this.notesSignal() || undefined);
      this.toastService.show(`${item.name} adicionado ao carrinho.`, 'success', 3200, {
        title: 'Carrinho atualizado',
        category: 'system',
        actionLabel: 'Abrir carrinho',
        link: '/cart',
      });
      this.closeModal();
    }
  }

  increaseQuantity() {
    this.quantitySignal.update((quantity) => quantity + 1);
  }

  decreaseQuantity() {
    this.quantitySignal.update((quantity) => (quantity > 1 ? quantity - 1 : 1));
  }

  closeModal() {
    this.showQuantityModalSignal.set(false);
    this.selectedItemSignal.set(null);
  }

  goBack() {
    this.location.back();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  toggleFavorite() {
    const restaurantId = this.restaurant()?.id;
    if (restaurantId) {
      this.profileService.toggleFavoriteRestaurant(restaurantId);
      this.toastService.show(
        this.profileService.isFavoriteRestaurant(restaurantId)
          ? 'Restaurante salvo nos favoritos.'
          : 'Restaurante removido dos favoritos.',
        'success',
        3200,
        {
          title: 'Favoritos atualizados',
          category: 'profile',
          actionLabel: 'Ver favoritos',
          link: '/favorites',
        },
      );
    }
  }

  toggleFavoriteItem(item: MenuItem) {
    this.profileService.toggleFavoriteMenuItem(item.id);
    this.toastService.show(
      this.profileService.isFavoriteMenuItem(item.id)
        ? `${item.name} salvo nos favoritos.`
        : `${item.name} removido dos favoritos.`,
      'success',
      3200,
      {
        title: 'Favoritos atualizados',
        category: 'profile',
        actionLabel: 'Ver perfil',
        link: '/profile',
      },
    );
  }

  toggleSavedCoupon(couponCode: string) {
    if (this.profileService.isCouponSaved(couponCode)) {
      this.profileService.removeSavedCoupon(couponCode);
      this.toastService.show('Cupom removido da carteira.', 'info', 3200, {
        title: 'Carteira promocional',
        category: 'promotion',
        actionLabel: 'Ver perfil',
        link: '/profile',
      });
      return;
    }

    this.profileService.saveCoupon(couponCode);
    this.toastService.show('Cupom salvo na carteira.', 'success', 3200, {
      title: 'Carteira promocional',
      category: 'promotion',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }
}
