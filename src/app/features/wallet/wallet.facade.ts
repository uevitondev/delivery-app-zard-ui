import { computed, inject, Injectable } from '@angular/core';
import {
  PROFILE_STORE,
  PROMOTION_CATALOG,
  RESTAURANT_CATALOG,
} from '@/shared/core/contracts/domain-tokens';
import {
  ProfileStorePort,
  PromotionCatalogPort,
  RestaurantCatalogPort,
} from '@/shared/core/contracts/app.contracts';

@Injectable({
  providedIn: 'root',
})
export class WalletFacade {
  readonly profileStore = inject(PROFILE_STORE) as ProfileStorePort;
  readonly promotionCatalog = inject(PROMOTION_CATALOG) as PromotionCatalogPort;
  readonly restaurantCatalog = inject(RESTAURANT_CATALOG) as RestaurantCatalogPort;

  readonly savedCoupons = computed(() =>
    this.profileStore.getSavedCoupons(this.promotionCatalog.getAvailableCoupons()).map((coupon) => ({
      ...coupon,
      restaurantName: coupon.restaurantId
        ? this.restaurantCatalog.getRestaurantById(coupon.restaurantId)?.name ?? null
        : null,
    })),
  );

  removeCoupon(couponCode: string) {
    this.profileStore.removeSavedCoupon(couponCode);
  }
}
