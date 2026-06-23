import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { RestaurantService } from './restaurant.service';
import { zStorageSignal } from '@/shared/utils';
import { Coupon, MenuItem, PaymentMethod, PaymentMethodType, UserProfile } from '@/shared/models';
import { ProfileStorePort } from '../contracts/app.contracts';

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements ProfileStorePort {
  private readonly authService = inject(AuthService);
  private readonly restaurantService = inject(RestaurantService);

  // State com persistência automática via zStorageSignal
  private readonly profileSignal = zStorageSignal<UserProfile>('deliveryapp.profile', this.getFallbackProfile(), (storedProfile) =>
    this.reviveProfile(storedProfile),
  );

  readonly profile = computed(() => this.profileSignal());
  readonly paymentMethods = computed(() => this.profileSignal().paymentMethods);
  readonly favoriteRestaurantIds = computed(() => this.profileSignal().favoriteRestaurants);
  readonly favoriteMenuItemIds = computed(() => this.profileSignal().favoriteMenuItems);
  readonly savedCouponCodes = computed(() => this.profileSignal().savedCouponCodes);
  readonly recentSearches = computed(() => this.profileSignal().recentSearches);
  readonly hasCompletedOnboarding = computed(() => this.profileSignal().hasCompletedOnboarding);
  readonly preferredCuisine = computed(() => this.profileSignal().preferredCuisine ?? null);
  readonly favoriteRestaurants = computed(() =>
    this.favoriteRestaurantIds()
      .map((id) => this.restaurantService.getRestaurantById(id))
      .filter((restaurant): restaurant is NonNullable<typeof restaurant> => !!restaurant),
  );
  readonly favoriteMenuItems = computed(() =>
    this.favoriteMenuItemIds()
      .map((id) => this.restaurantService.getAllMenuItems().find((item) => item.id === id))
      .filter((item): item is MenuItem => !!item),
  );

  isFavoriteRestaurant(restaurantId: string) {
    return this.favoriteRestaurantIds().includes(restaurantId);
  }

  toggleFavoriteRestaurant(restaurantId: string) {
    const profile = this.profileSignal();
    const isFavorite = profile.favoriteRestaurants.includes(restaurantId);

    const favoriteRestaurants = isFavorite
      ? profile.favoriteRestaurants.filter((id) => id !== restaurantId)
      : [restaurantId, ...profile.favoriteRestaurants];

    this.updateProfile({
      favoriteRestaurants,
    });
  }

  isFavoriteMenuItem(menuItemId: string) {
    return this.favoriteMenuItemIds().includes(menuItemId);
  }

  toggleFavoriteMenuItem(menuItemId: string) {
    const profile = this.profileSignal();
    const isFavorite = profile.favoriteMenuItems.includes(menuItemId);

    const favoriteMenuItems = isFavorite
      ? profile.favoriteMenuItems.filter((id) => id !== menuItemId)
      : [menuItemId, ...profile.favoriteMenuItems];

    this.updateProfile({
      favoriteMenuItems,
    });
  }

  isCouponSaved(couponCode: string) {
    return this.savedCouponCodes().includes(couponCode);
  }

  saveCoupon(couponCode: string) {
    if (this.isCouponSaved(couponCode)) {
      return;
    }

    this.updateProfile({
      savedCouponCodes: [couponCode, ...this.savedCouponCodes()],
    });
  }

  removeSavedCoupon(couponCode: string) {
    this.updateProfile({
      savedCouponCodes: this.savedCouponCodes().filter((code) => code !== couponCode),
    });
  }

  getSavedCoupons(coupons: Coupon[]) {
    return this.savedCouponCodes()
      .map((code) => coupons.find((coupon) => coupon.code === code))
      .filter((coupon): coupon is Coupon => !!coupon);
  }

  completeOnboarding(preferredCuisine?: string) {
    this.updateProfile({
      hasCompletedOnboarding: true,
      preferredCuisine: preferredCuisine || undefined,
    });
  }

  addRecentSearch(term: string) {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) {
      return;
    }

    this.updateProfile({
      recentSearches: [normalizedTerm, ...this.recentSearches().filter((item) => item !== normalizedTerm)].slice(
        0,
        6,
      ),
    });
  }

  clearRecentSearches() {
    this.updateProfile({
      recentSearches: [],
    });
  }

  addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>) {
    const profile = this.profileSignal();
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString(),
    };

    const paymentMethods = paymentMethod.isDefault
      ? profile.paymentMethods.map((item) => ({ ...item, isDefault: false }))
      : [...profile.paymentMethods];

    this.updateProfile({
      paymentMethods: [newPaymentMethod, ...paymentMethods],
    });

    return newPaymentMethod;
  }

  removePaymentMethod(paymentMethodId: string) {
    const paymentMethods = this.paymentMethods().filter((method) => method.id !== paymentMethodId);
    const normalizedMethods = this.ensureDefaultPaymentMethod(paymentMethods);
    this.updateProfile({
      paymentMethods: normalizedMethods,
    });
  }

  setDefaultPaymentMethod(paymentMethodId: string) {
    const paymentMethods = this.paymentMethods().map((method) => ({
      ...method,
      isDefault: method.id === paymentMethodId,
    }));

    this.updateProfile({
      paymentMethods,
    });
  }

  getPaymentMethodById(paymentMethodId: string) {
    return this.paymentMethods().find((method) => method.id === paymentMethodId) ?? null;
  }

  getDefaultPaymentMethod() {
    return this.paymentMethods().find((method) => method.isDefault) ?? this.paymentMethods()[0] ?? null;
  }

  private reviveProfile(storedProfile: UserProfile | null): UserProfile {
    const fallbackProfile = this.getFallbackProfile();

    if (!storedProfile) {
      return fallbackProfile;
    }

    return {
      ...fallbackProfile,
      ...storedProfile,
      createdAt: new Date(storedProfile.createdAt),
      hasCompletedOnboarding: storedProfile.hasCompletedOnboarding ?? fallbackProfile.hasCompletedOnboarding,
      preferredCuisine: storedProfile.preferredCuisine ?? fallbackProfile.preferredCuisine,
      paymentMethods: this.ensureDefaultPaymentMethod(storedProfile.paymentMethods ?? fallbackProfile.paymentMethods),
      favoriteRestaurants: storedProfile.favoriteRestaurants ?? fallbackProfile.favoriteRestaurants,
      favoriteMenuItems: storedProfile.favoriteMenuItems ?? fallbackProfile.favoriteMenuItems,
      savedCouponCodes: storedProfile.savedCouponCodes ?? fallbackProfile.savedCouponCodes,
      recentSearches: storedProfile.recentSearches ?? fallbackProfile.recentSearches,
    };
  }

  private getFallbackProfile(): UserProfile {
    const authUser = this.authService.user();
    return {
      id: authUser?.sub ?? 'mock-user',
      email: authUser?.email ?? 'demo@deliveryapp.com',
      name: authUser?.name ?? 'Demo User',
      phone: '(11) 98888-7777',
      hasCompletedOnboarding: false,
      preferredCuisine: 'Italiana',
      favoriteRestaurants: ['1', '3'],
      favoriteMenuItems: ['1-2'],
      savedCouponCodes: ['SAVE10'],
      recentSearches: ['Pizza', 'Sushi'],
      paymentMethods: [
        {
          id: 'pm-1',
          type: PaymentMethodType.PIX,
          label: 'PIX principal',
          isDefault: true,
        },
        {
          id: 'pm-2',
          type: PaymentMethodType.CREDIT_CARD,
          label: 'Visa final 4242',
          lastDigits: '4242',
          isDefault: false,
        },
      ],
      createdAt: new Date(),
      addresses: [],
    };
  }

  private ensureDefaultPaymentMethod(paymentMethods: PaymentMethod[]) {
    if (paymentMethods.length === 0) {
      return [];
    }

    const hasDefault = paymentMethods.some((method) => method.isDefault);
    return paymentMethods.map((method, index) => ({
      ...method,
      isDefault: hasDefault ? method.isDefault : index === 0,
    }));
  }

  private updateProfile(updates: Partial<UserProfile>) {
    const nextProfile = {
      ...this.profileSignal(),
      ...updates,
    };

    this.profileSignal.set(nextProfile);
  }
}