import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@/shared/core/services/toast.service';
import {
  CART_PORT,
  NOTIFICATION_PORT,
  PROFILE_STORE,
  RESTAURANT_CATALOG,
} from '@/shared/core/contracts/domain-tokens';
import {
  CartPort,
  NotificationPort,
  ProfileStorePort,
  RestaurantCatalogPort,
} from '@/shared/core/contracts/app.contracts';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingComponent,
  MenuItemCardComponent,
  RestaurantCardComponent,
} from '@/shared/components';
import { MenuItem } from '@/shared/models';
import { HomeFacade } from './home.facade';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RestaurantCardComponent,
    MenuItemCardComponent,
    LoadingComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#ff8a55_0%,#ff5a36_100%)] text-xl font-bold text-white shadow-[0_14px_28px_rgba(255,107,53,0.28)]">
              Z
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
                Delivery Native Web
              </p>
              <h1 class="truncate text-xl font-semibold tracking-tight text-stone-950 dark:text-stone-100 sm:text-2xl">
                Descubra restaurantes perto de voce
              </h1>
            </div>
          </div>

          <div class="hidden items-center gap-3 md:flex">
            <button
              (click)="goToNotifications()"
              class="relative inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 hover:text-stone-950 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:hover:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              <span>Alertas</span>
              @if (notificationService.unreadCount() > 0) {
                <z-badge zType="warning" zSize="sm">
                  {{ notificationService.unreadCount() }}
                </z-badge>
              }
            </button>

            <button
              (click)="goToCart()"
              class="relative inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 hover:text-stone-950 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:hover:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              <span>Carrinho</span>
              @if (cartService.itemCount() > 0) {
                <z-badge zType="destructive" zSize="sm">{{ cartService.itemCount() }}</z-badge>
              }
            </button>

            <button
              (click)="goToProfile()"
              class="inline-flex h-12 items-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 hover:text-stone-950 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:hover:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              Perfil
            </button>
          </div>
        </div>
      </header>

      <main class="app-page py-6 sm:py-8">
        @if (!profileService.hasCompletedOnboarding()) {
          <section class="mb-4">
            <z-card>
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">falta um passo</p>
                  <h2 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">
                    Personalize sua experiencia de descoberta
                  </h2>
                  <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    Finalize seu onboarding rapido no perfil para salvar sua cozinha favorita.
                  </p>
                </div>
                <button z-button zSize="lg" (click)="goToProfile()">Completar onboarding</button>
              </div>
            </z-card>
          </section>
        }

        <section class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_0.9fr]">
          <div class="app-surface overflow-hidden p-5 sm:p-7">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p class="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:bg-orange-500/12 dark:text-orange-300">
                  entrega rapida, experiencia premium
                </p>
                <h2 class="section-title max-w-xl">
                  Seu app de delivery com visual de produto nativo no desktop e no mobile.
                </h2>
                <p class="section-copy mt-3 max-w-2xl">
                  Explore menus curados, acompanhe pedidos, favorite restaurantes e use cupons
                  sem depender de backend por enquanto.
                </p>
                @if (profileService.preferredCuisine(); as cuisine) {
                  <p class="mt-4 inline-flex rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white/10 dark:text-stone-100">
                    recomendacao baseada em {{ cuisine }}
                  </p>
                }

                <div class="mt-6 flex flex-wrap gap-3">
                  <button z-button zSize="lg" (click)="scrollToRestaurants()">Explorar restaurantes</button>
                  <button z-button zType="secondary" zSize="lg" (click)="goToOrders()">
                    Ver meus pedidos
                  </button>
                  <button z-button zType="ghost" zSize="lg" (click)="goToFavoriteItems()">
                    Pratos favoritos
                  </button>
                  <button z-button zType="ghost" zSize="lg" (click)="goToCollections()">
                    Colecoes
                  </button>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <z-card>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Aberto agora</p>
                  <p class="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-100">{{ restaurants().length }}</p>
                  <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">restaurantes ativos na vitrine</p>
                </z-card>
                <z-card>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Favoritos</p>
                  <p class="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-100">{{ profileService.favoriteRestaurantIds().length }}</p>
                  <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">lugares salvos para pedir rapido</p>
                </z-card>
              </div>
            </div>
          </div>

          <z-card>
            <div class="mb-4 flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Busca inteligente</p>
                <h3 class="mt-1 text-lg font-semibold tracking-tight text-stone-950 dark:text-stone-100">Encontre seu proximo pedido</h3>
              </div>
              <z-badge zType="info" zSize="md">ao vivo</z-badge>
            </div>

            <label class="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
              Restaurante, cozinha ou prato
            </label>
            <input
              type="text"
              placeholder="Buscar restaurante..."
              [(ngModel)]="searchValue"
              (input)="onSearchChange($event)"
              (keyup.enter)="commitSearch(searchValue)"
              class="w-full rounded-[24px] border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-900 outline-none ring-0 transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100 dark:border-white/10 dark:bg-white/6 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-400 dark:focus:ring-orange-500/20"
            />

            @if (searchSuggestions().length > 0) {
              <div class="mt-4">
                <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Sugestoes</p>
                <div class="flex flex-wrap gap-2">
                  @for (suggestion of searchSuggestions(); track suggestion) {
                    <button z-button zSize="sm" zType="secondary" (click)="applySuggestion(suggestion)">
                      {{ suggestion }}
                    </button>
                  }
                </div>
              </div>
            } @else if (profileService.recentSearches().length > 0) {
              <div class="mt-4">
                <div class="mb-2 flex items-center justify-between gap-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Buscas recentes</p>
                  <button
                    type="button"
                    class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 transition hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200"
                    (click)="clearRecentSearches()"
                  >
                    limpar
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  @for (search of profileService.recentSearches(); track search) {
                    <button z-button zSize="sm" zType="secondary" (click)="applySuggestion(search)">
                      {{ search }}
                    </button>
                  }
                </div>
              </div>
            }

            <div class="native-scroll mt-4 flex gap-2 pb-1">
              <button z-button zType="ghost" zSize="sm" (click)="clearFilters()">Tudo</button>
              <button z-button
                zSize="sm"
                [zType]="showOnlyFavorites() ? 'default' : 'secondary'"
                (click)="toggleFavoritesFilter()"
              >
                Favoritos
              </button>
              @for (category of categories(); track category) {
                <button z-button
                  (click)="filterByCategory(category)"
                  [zType]="selectedCategory() === category ? 'default' : 'secondary'"
                  zSize="sm"
                >
                  {{ category }}
                </button>
              }
            </div>
          </z-card>
        </section>

        <section class="mb-8 grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">carteira promocional</p>
              <h2 class="section-title">Ofertas em destaque</h2>
            </div>
            <button z-button zType="ghost" zSize="sm" (click)="goToOffers()">Ver todas</button>
          </div>
          @for (coupon of featuredCoupons(); track coupon.code) {
            <z-card>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                    Cupom {{ coupon.code }}
                  </p>
                  <h3 class="mt-2 text-xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">{{ coupon.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{{ coupon.description }}</p>
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

        @if (personalizedOffers().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">ofertas inteligentes</p>
                <h2 class="section-title">Promocoes para o seu momento</h2>
              </div>
              <p class="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">baseado nos seus favoritos e buscas</p>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              @for (offer of personalizedOffers(); track offer.code) {
                <z-card>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                    {{ offer.label }}
                  </p>
                  <h3 class="mt-2 text-xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">{{ offer.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{{ offer.description }}</p>
                  <div class="mt-4">
                    <button z-button
                      zSize="sm"
                      [zType]="profileService.isCouponSaved(offer.code) ? 'secondary' : 'default'"
                      (click)="toggleSavedCoupon(offer.code)"
                    >
                      {{ profileService.isCouponSaved(offer.code) ? 'Salvo na carteira' : 'Salvar oferta' }}
                    </button>
                  </div>
                </z-card>
              }
            </div>
          </section>
        }

        @if (continueExploringRestaurants().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">continue explorando</p>
                <h2 class="section-title">Retome de onde voce parou</h2>
              </div>
              <p class="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">baseado nas suas ultimas buscas</p>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              @for (restaurant of continueExploringRestaurants(); track restaurant.id) {
                <app-restaurant-card
                  [restaurant]="restaurant"
                  [isFavorite]="profileService.isFavoriteRestaurant(restaurant.id)"
                  (selectRestaurant)="selectRestaurant($event)"
                  (toggleFavorite)="toggleFavorite(restaurant.id)"
                />
              }
            </div>
          </section>
        }

        @if (recommendedRestaurants().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">para voce</p>
                <h2 class="section-title">Selecao personalizada</h2>
              </div>
              <p class="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">
                baseada em {{ profileService.preferredCuisine() || 'suas preferencias' }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              @for (restaurant of recommendedRestaurants(); track restaurant.id) {
                <app-restaurant-card
                  [restaurant]="restaurant"
                  [isFavorite]="profileService.isFavoriteRestaurant(restaurant.id)"
                  (selectRestaurant)="selectRestaurant($event)"
                  (toggleFavorite)="toggleFavorite(restaurant.id)"
                />
              }
            </div>
          </section>
        }

        @if (thematicCollections().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">colecoes tematicas</p>
                <h2 class="section-title">Pedidos prontos para o momento</h2>
              </div>
              <button z-button zType="ghost" zSize="sm" (click)="goToCollections()">Ver todas</button>
            </div>

            <div class="grid gap-4 xl:grid-cols-3">
              @for (collection of thematicCollections(); track collection.id) {
                <z-card>
                  <div class="rounded-[24px] bg-gradient-to-br p-5 text-white" [ngClass]="collection.accent">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">colecao</p>
                    <h3 class="mt-2 text-2xl font-semibold tracking-tight">{{ collection.title }}</h3>
                    <p class="mt-2 text-sm leading-6 text-white/80">{{ collection.description }}</p>
                    <p class="mt-4 text-sm font-semibold">{{ collection.restaurant.name }}</p>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-2">
                    @for (item of collection.items; track item.id) {
                      <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-white/8 dark:text-stone-300">
                        {{ item.name }}
                      </span>
                    }
                  </div>

                  <div class="mt-5 flex items-center justify-between gap-4">
                    <p class="text-lg font-semibold text-stone-950 dark:text-stone-100">R$ {{ collection.total | number: '1.2-2' }}</p>
                    <button z-button zSize="sm" (click)="loadCollection(collection.id)">
                      Montar pedido
                    </button>
                  </div>
                </z-card>
              }
            </div>
          </section>
        }

        @if (recommendedMenuItems().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">pratos em alta</p>
                <h2 class="section-title">Recomendados para voce</h2>
              </div>
              <button z-button zType="ghost" zSize="sm" (click)="goToFavoriteItems()">Ver todos os pratos salvos</button>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              @for (item of recommendedMenuItems(); track item.id) {
                <app-menu-item-card
                  [item]="item"
                  [isFavorite]="profileService.isFavoriteMenuItem(item.id)"
                  (addToCart)="addRecommendedItem(item)"
                  (toggleFavorite)="toggleFavoriteItem(item.id, item.name)"
                />
              }
            </div>
          </section>
        }

        @if (favoriteBundles().length > 0) {
          <section class="mb-8">
            <div class="mb-5 flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">pedido em um clique</p>
                <h2 class="section-title">Combos dos seus favoritos</h2>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              @for (bundle of favoriteBundles(); track bundle.restaurant.id) {
                <z-card>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
                    {{ bundle.restaurant.category }}
                  </p>
                  <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">
                    Combo {{ bundle.restaurant.name }}
                  </h3>
                  <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    {{ bundle.items.length }} itens salvos para repetir rapido.
                  </p>
                  <div class="mt-4 flex flex-wrap gap-2">
                    @for (item of bundle.items; track item.id) {
                      <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-white/8 dark:text-stone-300">
                        {{ item.name }}
                      </span>
                    }
                  </div>
                  <div class="mt-5 flex items-center justify-between gap-4">
                    <p class="text-lg font-semibold text-stone-950 dark:text-stone-100">R$ {{ bundle.total | number: '1.2-2' }}</p>
                    <button z-button zSize="sm" (click)="loadFavoriteBundle(bundle.restaurant.id)">
                      Montar combo
                    </button>
                  </div>
                </z-card>
              }
            </div>
          </section>
        }

        <section id="restaurants-section" class="pb-8">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">lista curada</p>
              <h2 class="section-title">Restaurantes em destaque</h2>
            </div>
            <p class="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">{{ filteredRestaurants().length }} opcoes encontradas</p>
          </div>

          @if (loading()) {
            <app-loading variant="cards" [count]="6" />
          } @else if (filteredRestaurants().length === 0) {
            <z-card>
              <div class="py-10 text-center">
                <p class="text-lg font-semibold text-stone-900 dark:text-stone-100">Nenhum restaurante encontrado</p>
                <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">Ajuste a busca ou escolha outra categoria.</p>
              </div>
            </z-card>
          } @else {
            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              @for (restaurant of filteredRestaurants(); track restaurant.id) {
                <app-restaurant-card
                  [restaurant]="restaurant"
                  [isFavorite]="profileService.isFavoriteRestaurant(restaurant.id)"
                  (selectRestaurant)="selectRestaurant($event)"
                  (toggleFavorite)="toggleFavorite(restaurant.id)"
                />
              }
            </div>
          }
        </section>
      </main>

      <nav class="mobile-bottom-nav">
        <div class="mobile-bottom-nav-inner">
          <button class="flex flex-col items-center gap-1 text-xs font-semibold text-orange-600 touch-target">
            <span class="h-2 w-2 rounded-full bg-orange-500"></span>
            Inicio
          </button>
          <button (click)="goToOrders()" class="text-xs font-semibold text-stone-500 dark:text-stone-400 touch-target">Pedidos</button>
          <button (click)="goToNotifications()" class="relative text-xs font-semibold text-stone-500 dark:text-stone-400 touch-target">
            Alertas
            @if (notificationService.unreadCount() > 0) {
              <span class="absolute -right-3 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                {{ notificationService.unreadCount() }}
              </span>
            }
          </button>
          <button (click)="goToCart()" class="relative text-xs font-semibold text-stone-500 dark:text-stone-400 touch-target">
            Carrinho
            @if (cartService.itemCount() > 0) {
              <span class="absolute -right-3 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {{ cartService.itemCount() }}
              </span>
            }
          </button>
          <button (click)="goToProfile()" class="text-xs font-semibold text-stone-500 dark:text-stone-400 touch-target">Perfil</button>
        </div>
      </nav>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly restaurantCatalog = inject(RESTAURANT_CATALOG) as RestaurantCatalogPort;
  private readonly router = inject(Router);
  readonly cartService = inject(CART_PORT) as CartPort;
  readonly notificationService = inject(NOTIFICATION_PORT) as NotificationPort;
  readonly profileService = inject(PROFILE_STORE) as ProfileStorePort;
  readonly facade = inject(HomeFacade);
  private readonly toastService = inject(ToastService);
  searchValue = '';

  restaurants = this.facade.restaurants;
  loading = this.facade.loading;
  categories = this.facade.categories;
  featuredCoupons = this.facade.featuredCoupons;
  recommendedMenuItems = this.facade.recommendedMenuItems;
  recommendedRestaurants = this.facade.recommendedRestaurants;
  searchSuggestions = this.facade.searchSuggestions;
  favoriteBundles = this.facade.favoriteBundles;
  personalizedOffers = this.facade.personalizedOffers;
  continueExploringRestaurants = this.facade.continueExploringRestaurants;
  thematicCollections = this.facade.thematicCollections;
  selectedCategory = this.facade.selectedCategory;
  filteredRestaurants = this.facade.filteredRestaurants;

  ngOnInit() {
    void this.facade.loadRestaurants();
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.facade.setSearch(input.value);
  }

  commitSearch(term: string) {
    this.facade.commitSearch(term);
  }

  filterByCategory(category: string) {
    this.facade.filterByCategory(category);
  }

  selectRestaurant(id: string) {
    this.restaurantCatalog.selectRestaurant(id);
    const restaurant = this.restaurantCatalog.getRestaurantById(id);
    if (restaurant) {
      this.profileService.addRecentSearch(restaurant.name);
    }
    this.router.navigate(['/restaurant', id]);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goToFavoriteItems() {
    this.router.navigate(['/favorite-items']);
  }

  goToCollections() {
    this.router.navigate(['/collections']);
  }

  goToOffers() {
    this.router.navigate(['/offers']);
  }

  clearFilters() {
    this.facade.clearFilters();
    this.searchValue = '';
  }

  applySuggestion(suggestion: string) {
    this.searchValue = suggestion;
    this.facade.applySuggestion(suggestion);
  }

  clearRecentSearches() {
    this.facade.clearRecentSearches();
  }

  addRecommendedItem(item: MenuItem) {
    this.cartService.addItem(item, 1);
    this.toastService.show(`${item.name} adicionado ao carrinho.`, 'success', 3200, {
      title: 'Carrinho atualizado',
      category: 'system',
      actionLabel: 'Abrir carrinho',
      link: '/cart',
    });
  }

  scrollToRestaurants() {
    document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleFavorite(restaurantId: string) {
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

  toggleFavoritesFilter() {
    this.facade.toggleFavoritesFilter();
  }

  showOnlyFavorites() {
    return this.facade.showOnlyFavorites();
  }

  toggleFavoriteItem(itemId: string, itemName: string) {
    this.profileService.toggleFavoriteMenuItem(itemId);
    this.toastService.show(
      this.profileService.isFavoriteMenuItem(itemId)
        ? `${itemName} salvo nos favoritos.`
        : `${itemName} removido dos favoritos.`,
      'success',
      3200,
      {
        title: 'Favoritos atualizados',
        category: 'profile',
        actionLabel: 'Ver pratos salvos',
        link: '/favorite-items',
      },
    );
  }

  loadFavoriteBundle(restaurantId: string) {
    const bundle = this.favoriteBundles().find((item) => item.restaurant.id === restaurantId);
    if (!bundle) {
      return;
    }

    this.cartService.loadMenuItemsBundle(bundle.items);
    this.toastService.show('Combo favorito carregado no carrinho.', 'success', 3200, {
      title: 'Combo montado',
      category: 'order',
      actionLabel: 'Abrir carrinho',
      link: '/cart',
    });
  }

  loadCollection(collectionId: string) {
    const collection = this.thematicCollections().find((item) => item.id === collectionId);
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
