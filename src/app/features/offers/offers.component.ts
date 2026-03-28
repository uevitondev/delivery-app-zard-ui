import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent } from '@/shared/components';
import { ProfileService } from '@/shared/core/services/profile.service';
import { PromotionService } from '@/shared/core/services/promotion.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { ToastService } from '@/shared/core/services/toast.service';

@Component({
  selector: 'app-offers',
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
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">vantagens</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Ofertas</h1>
            </div>
          </div>
          <z-badge zType="info" zSize="md">{{ offers().length }} ativas</z-badge>
        </div>
      </header>

      <main class="app-page py-6">
        <div class="mb-6 max-w-3xl">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">promocoes do app</p>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">
            Cupons e ofertas pensados para o seu perfil
          </h2>
          <p class="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Salve os cupons na carteira e use depois no checkout. As recomendacoes usam favoritos,
            buscas recentes e sua cozinha preferida.
          </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          @for (offer of offers(); track offer.code) {
            <z-card>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                    {{ offer.label }}
                  </p>
                  <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">{{ offer.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{{ offer.description }}</p>
                  @if (offer.restaurantName) {
                    <p class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
                      valido para {{ offer.restaurantName }}
                    </p>
                  }
                </div>
                <z-badge
                  [zType]="profileService.isCouponSaved(offer.code) ? 'success' : 'warning'"
                  zSize="sm"
                >
                  {{ profileService.isCouponSaved(offer.code) ? 'salvo' : 'novo' }}
                </z-badge>
              </div>

              <div class="mt-5 flex flex-wrap gap-3">
                <button z-button
                  zSize="sm"
                  [zType]="profileService.isCouponSaved(offer.code) ? 'secondary' : 'default'"
                  (click)="toggleOffer(offer.code)"
                >
                  {{ profileService.isCouponSaved(offer.code) ? 'Remover da carteira' : 'Salvar na carteira' }}
                </button>
                @if (offer.restaurantId) {
                  <button z-button zType="ghost" zSize="sm" (click)="openRestaurant(offer.restaurantId)">
                    Ver restaurante
                  </button>
                }
              </div>
            </z-card>
          }
        </div>
      </main>
    </div>
  `,
})
export class OffersComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly profileService = inject(ProfileService);
  private readonly promotionService = inject(PromotionService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly toastService = inject(ToastService);

  readonly offers = computed(() => {
    const preferredCuisine = this.profileService.preferredCuisine();
    const recentSearches = this.profileService.recentSearches().map((item) => item.toLowerCase());

    return this.promotionService.getAvailableCoupons().map((coupon) => {
      const restaurant = coupon.restaurantId
        ? this.restaurantService.getRestaurantById(coupon.restaurantId)
        : null;
      const matchesCuisine = preferredCuisine
        ? restaurant?.category === preferredCuisine || recentSearches.includes(preferredCuisine.toLowerCase())
        : false;

      return {
        ...coupon,
        restaurantName: restaurant?.name ?? null,
        label: matchesCuisine ? 'match perfeito' : restaurant ? `oferta da casa` : 'cupom livre',
        description: matchesCuisine
          ? `${coupon.description} Combinando com sua preferencia por ${preferredCuisine}.`
          : coupon.description,
      };
    });
  });

  goBack() {
    this.location.back();
  }

  openRestaurant(restaurantId: string) {
    this.restaurantService.selectRestaurant(restaurantId);
    this.router.navigate(['/restaurant', restaurantId]);
  }

  toggleOffer(couponCode: string) {
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
      actionLabel: 'Ir para checkout',
      link: '/checkout',
    });
  }
}
