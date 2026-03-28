import { Signal } from '@angular/core';
import {
  Address,
  AppliedCoupon,
  Cart,
  Coupon,
  MenuItem,
  Order,
  OrderRating,
  PaymentMethod,
  Restaurant,
  UserProfile,
} from '@/shared/models';
import { AppNotification } from '../services/notification.service';

export interface RestaurantCatalogPort {
  readonly restaurants: Signal<Restaurant[]>;
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Restaurant | undefined;
  selectRestaurant(id: string): void;
  getMenuItems(restaurantId: string): MenuItem[];
  getAllMenuItems(): MenuItem[];
}

export interface PromotionCatalogPort {
  getAvailableCoupons(): Coupon[];
  applyCoupon(code: string, cart: Cart | null): { appliedCoupon: AppliedCoupon | null; error: string | null };
}

export interface ProfileStorePort {
  readonly profile: Signal<UserProfile>;
  readonly paymentMethods: Signal<PaymentMethod[]>;
  readonly favoriteRestaurantIds: Signal<string[]>;
  readonly favoriteMenuItemIds: Signal<string[]>;
  readonly savedCouponCodes: Signal<string[]>;
  readonly recentSearches: Signal<string[]>;
  readonly hasCompletedOnboarding: Signal<boolean>;
  readonly preferredCuisine: Signal<string | null>;
  readonly favoriteRestaurants: Signal<Restaurant[]>;
  readonly favoriteMenuItems: Signal<MenuItem[]>;
  isFavoriteRestaurant(restaurantId: string): boolean;
  toggleFavoriteRestaurant(restaurantId: string): void;
  isFavoriteMenuItem(menuItemId: string): boolean;
  toggleFavoriteMenuItem(menuItemId: string): void;
  isCouponSaved(couponCode: string): boolean;
  saveCoupon(couponCode: string): void;
  removeSavedCoupon(couponCode: string): void;
  getSavedCoupons(coupons: Coupon[]): Coupon[];
  completeOnboarding(preferredCuisine?: string): void;
  addRecentSearch(term: string): void;
  clearRecentSearches(): void;
  addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): PaymentMethod;
  removePaymentMethod(paymentMethodId: string): void;
  setDefaultPaymentMethod(paymentMethodId: string): void;
  getPaymentMethodById(paymentMethodId: string): PaymentMethod | null;
  getDefaultPaymentMethod(): PaymentMethod | null;
}

export interface AddressBookPort {
  readonly addresses: Signal<Address[]>;
  readonly selectedAddressId: Signal<string | null>;
  readonly selectedAddress: Signal<Address | null>;
  readonly defaultAddress: Signal<Address | null>;
  selectAddress(addressId: string): void;
  addAddress(address: Omit<Address, 'id'>): Address;
}

export interface CartPort {
  readonly cart: Signal<Cart | null>;
  readonly items: Signal<Cart['items']>;
  readonly itemCount: Signal<number>;
  readonly subtotal: Signal<number>;
  readonly deliveryFee: Signal<number>;
  readonly tax: Signal<number>;
  readonly total: Signal<number>;
  readonly isEmpty: Signal<boolean>;
  addItem(menuItem: MenuItem, quantity?: number, notes?: string): void;
  removeItem(menuItemId: string): void;
  updateQuantity(menuItemId: string, quantity: number): void;
  loadMenuItemsBundle(menuItems: MenuItem[]): void;
  loadOrder(order: Order): void;
  clearCart(): void;
}

export interface OrderPort {
  readonly orders: Signal<Order[]>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Order | undefined;
  createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order>;
  rateOrder(orderId: string, rating: OrderRating): Promise<void>;
}

export interface NotificationPort {
  readonly notifications: Signal<AppNotification[]>;
  readonly unreadCount: Signal<number>;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  clearAll(): void;
}
