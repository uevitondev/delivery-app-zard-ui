/**
 * Mocks Declarativos para Portas de Domínio
 * Facilita a criação de testes unitários e de integração
 */

import { signal } from '@angular/core';
import { Cart, CartItem, MenuItem, Order, Restaurant, UserProfile, Address, PaymentMethod, Coupon, PaymentMethodType, OrderStatus } from '@/shared/models';
import { AppNotification } from '@/shared/core/services/notification.service';
import {
  RestaurantCatalogPort,
  PromotionCatalogPort,
  ProfileStorePort,
  AddressBookPort,
  CartPort,
  OrderPort,
  NotificationPort,
} from '@/shared/core/contracts/app.contracts';

// ============================================================================
// Mock Restaurant Catalog Port
// ============================================================================

export function createMockRestaurantCatalogPort(overrides?: Partial<RestaurantCatalogPort>): RestaurantCatalogPort {
  const restaurantsSignal = signal<Restaurant[]>([]);
  
  return {
    restaurants: restaurantsSignal,
    getRestaurants: async () => restaurantsSignal(),
    getRestaurantById: (id: string) => restaurantsSignal().find(r => r.id === id),
    selectRestaurant: (id: string) => {},
    getMenuItems: (restaurantId: string) => [],
    getAllMenuItems: () => [],
    ...overrides,
  };
}

// ============================================================================
// Mock Promotion Catalog Port
// ============================================================================

export function createMockPromotionCatalogPort(overrides?: Partial<PromotionCatalogPort>): PromotionCatalogPort {
  const coupons: Coupon[] = [];
  
  return {
    getAvailableCoupons: () => coupons,
    applyCoupon: (code: string, cart: Cart | null) => ({
      appliedCoupon: null,
      error: 'Cupom inválido',
    }),
    ...overrides,
  };
}

// ============================================================================
// Mock Profile Store Port
// ============================================================================

export function createMockProfileStorePort(overrides?: Partial<ProfileStorePort>): ProfileStorePort {
  const profileSignal = signal<UserProfile>({
    id: 'mock-user',
    email: 'mock@example.com',
    name: 'Mock User',
    phone: '(11) 99999-9999',
    hasCompletedOnboarding: true,
    preferredCuisine: 'Brasileira',
    favoriteRestaurants: [],
    favoriteMenuItems: [],
    savedCouponCodes: [],
    recentSearches: [],
    paymentMethods: [],
    createdAt: new Date(),
    addresses: [],
  });

  return {
    profile: profileSignal,
    paymentMethods: signal([]),
    favoriteRestaurantIds: signal([]),
    favoriteMenuItemIds: signal([]),
    savedCouponCodes: signal([]),
    recentSearches: signal([]),
    hasCompletedOnboarding: signal(true),
    preferredCuisine: signal(null),
    favoriteRestaurants: signal([]),
    favoriteMenuItems: signal([]),
    isFavoriteRestaurant: () => false,
    toggleFavoriteRestaurant: () => {},
    isFavoriteMenuItem: () => false,
    toggleFavoriteMenuItem: () => {},
    isCouponSaved: () => false,
    saveCoupon: () => {},
    removeSavedCoupon: () => {},
    getSavedCoupons: () => [],
    completeOnboarding: () => {},
    addRecentSearch: () => {},
    clearRecentSearches: () => {},
    addPaymentMethod: () => ({ id: 'pm-mock', type: PaymentMethodType.PIX, label: 'Mock', isDefault: false }),
    removePaymentMethod: () => {},
    setDefaultPaymentMethod: () => {},
    getPaymentMethodById: () => null,
    getDefaultPaymentMethod: () => null,
    ...overrides,
  };
}

// ============================================================================
// Mock Address Book Port
// ============================================================================

export function createMockAddressBookPort(overrides?: Partial<AddressBookPort>): AddressBookPort {
  const addressesSignal = signal<Address[]>([]);
  const selectedAddressIdSignal = signal<string | null>(null);

  return {
    addresses: addressesSignal,
    selectedAddressId: selectedAddressIdSignal,
    selectedAddress: signal(null),
    defaultAddress: signal(null),
    selectAddress: (addressId: string) => {
      selectedAddressIdSignal.set(addressId);
    },
    addAddress: (address: Omit<Address, 'id'>) => ({
      ...address,
      id: 'addr-mock',
    }),
    ...overrides,
  };
}

// ============================================================================
// Mock Cart Port
// ============================================================================

export function createMockCartPort(overrides?: Partial<CartPort>): CartPort {
  const cartSignal = signal<Cart | null>(null);

  return {
    cart: cartSignal,
    items: signal([]),
    itemCount: signal(0),
    subtotal: signal(0),
    deliveryFee: signal(0),
    tax: signal(0),
    total: signal(0),
    isEmpty: signal(true),
    addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => {},
    removeItem: (menuItemId: string) => {},
    updateQuantity: (menuItemId: string, quantity: number) => {},
    loadMenuItemsBundle: (menuItems: MenuItem[]) => {},
    loadOrder: (order: Order) => {},
    clearCart: () => {},
    ...overrides,
  };
}

// ============================================================================
// Mock Order Port
// ============================================================================

export function createMockOrderPort(overrides?: Partial<OrderPort>): OrderPort {
  const ordersSignal = signal<Order[]>([]);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  return {
    orders: ordersSignal,
    loading: loadingSignal,
    error: errorSignal,
    getOrders: async () => ordersSignal(),
    getOrderById: (id: string) => ordersSignal().find(o => o.id === id),
    createOrder: async (order: Omit<Order, 'id' | 'createdAt'>) => ({
      ...order,
      id: 'order-mock',
      createdAt: new Date(),
    } as Order),
    rateOrder: async (orderId: string, rating: any) => {},
    ...overrides,
  };
}

// ============================================================================
// Mock Notification Port
// ============================================================================

export function createMockNotificationPort(overrides?: Partial<NotificationPort>): NotificationPort {
  const notificationsSignal = signal<AppNotification[]>([]);
  const unreadCountSignal = signal(0);

  return {
    notifications: notificationsSignal,
    unreadCount: unreadCountSignal,
    markAsRead: (id: string) => {},
    markAllAsRead: () => {},
    clearAll: () => {},
    ...overrides,
  };
}

// ============================================================================
// Helpers para criar dados de teste
// ============================================================================

export function createMockCartItem(menuItem: MenuItem, quantity: number = 1): CartItem {
  return {
    menuItem,
    quantity,
    notes: '',
    subtotal: menuItem.price * quantity,
  };
}

export function createMockCart(restaurantId: string, items: CartItem[] = []): Cart {
  return {
    restaurantId,
    restaurant: {} as Restaurant,
    items,
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
    deliveryFee: 5.99,
    tax: 0,
    total: 0,
  };
}

export function createMockRestaurant(id: string = '1', name: string = 'Restaurante Mock'): Restaurant {
  return {
    id,
    name,
    image: 'https://via.placeholder.com/400x300',
    category: 'Brasileira',
    rating: 4.5,
    reviewCount: 120,
    deliveryTime: 35,
    deliveryFee: 5.99,
    isOpen: true,
    address: 'Rua Mock, 123',
    description: 'Restaurante de teste',
    phone: '(11) 99999-9999',
  };
}

export function createMockMenuItem(id: string = '1', restaurantId: string = '1'): MenuItem {
  return {
    id: `${restaurantId}-${id}`,
    restaurantId,
    name: 'Item Mock',
    description: 'Descrição do item',
    price: 29.90,
    image: 'https://via.placeholder.com/200x200',
    category: 'Pratos Principais',
    available: true,
  };
}

export function createMockOrder(id: string = 'order-1'): Order {
  return {
    id,
    restaurantId: '1',
    restaurant: createMockRestaurant(),
    userId: 'mock-user',
    items: [],
    status: OrderStatus.PENDING,
    subtotal: 0,
    deliveryFee: 5.99,
    tax: 0,
    total: 0,
    deliveryAddress: {} as Address,
    paymentMethod: {} as PaymentMethod,
    createdAt: new Date(),
  };
}
