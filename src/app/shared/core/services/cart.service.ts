import { Injectable, computed, inject, signal } from '@angular/core';
import { Cart, CartItem, MenuItem, Order, Restaurant } from '@/shared/models';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { loadFromStorage, saveToStorage } from '@/shared/utils';
import { CartPort } from '../contracts/app.contracts';

const CART_STORAGE_KEY = 'deliveryapp.cart';

@Injectable({
  providedIn: 'root',
})
export class CartService implements CartPort {
  private readonly restaurantService = inject(RestaurantService);

  // State
  private readonly cartSignal = signal<Cart | null>(this.hydrateCart());

  // Public computed values
  readonly cart = computed(() => this.cartSignal());
  readonly items = computed(() => this.cartSignal()?.items ?? []);
  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this.cartSignal()?.subtotal ?? 0);
  readonly deliveryFee = computed(() => this.cartSignal()?.deliveryFee ?? 0);
  readonly tax = computed(() => this.cartSignal()?.tax ?? 0);
  readonly total = computed(() => this.cartSignal()?.total ?? 0);
  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    this.persistCart();
  }

  addItem(menuItem: MenuItem, quantity: number = 1, notes?: string) {
    const currentCart = this.cartSignal();

    // Se o carrinho está vazio ou é de outro restaurante, criar novo
    if (!currentCart || currentCart.restaurantId !== menuItem.restaurantId) {
      this.startNewCart(menuItem.restaurantId);
    }

    const cart = this.cartSignal()!;
    const existingItem = cart.items.find((item) => item.menuItem.id === menuItem.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.menuItem.price * existingItem.quantity;
    } else {
      cart.items.push({
        menuItem,
        quantity,
        notes,
        subtotal: menuItem.price * quantity,
      });
    }

    this.updateCart();
  }

  removeItem(menuItemId: string) {
    const cart = this.cartSignal();
    if (!cart) return;

    cart.items = cart.items.filter((item) => item.menuItem.id !== menuItemId);

    if (cart.items.length === 0) {
      this.cartSignal.set(null);
    } else {
      this.updateCart();
    }
  }

  updateQuantity(menuItemId: string, quantity: number) {
    const cart = this.cartSignal();
    if (!cart) return;

    const item = cart.items.find((item) => item.menuItem.id === menuItemId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(menuItemId);
    } else {
      item.quantity = quantity;
      item.subtotal = item.menuItem.price * quantity;
      this.updateCart();
    }
  }

  updateNotes(menuItemId: string, notes?: string) {
    const cart = this.cartSignal();
    if (!cart) return;

    const item = cart.items.find((item) => item.menuItem.id === menuItemId);
    if (item) {
      item.notes = notes;
      this.cartSignal.set({ ...cart });
    }
  }

  clearCart() {
    this.cartSignal.set(null);
    this.persistCart();
  }

  loadOrder(order: Order) {
    const restaurant = this.restaurantService.getRestaurantById(order.restaurantId) as
      | Restaurant
      | undefined;

    if (!restaurant) {
      return;
    }

    const items = order.items
      .map((orderItem) => {
        const menuItem = this.restaurantService.getMenuItem(order.restaurantId, orderItem.menuItem.id);
        if (!menuItem) {
          return null;
        }

        return {
          menuItem,
          quantity: orderItem.quantity,
          notes: orderItem.notes,
          subtotal: menuItem.price * orderItem.quantity,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null);

    if (items.length === 0) {
      return;
    }

    this.cartSignal.set({
      restaurantId: order.restaurantId,
      restaurant,
      items,
      subtotal: 0,
      deliveryFee: restaurant.deliveryFee,
      tax: 0,
      total: 0,
    });
    this.updateCart();
  }

  loadMenuItemsBundle(menuItems: MenuItem[]) {
    if (menuItems.length === 0) {
      return;
    }

    const restaurantId = menuItems[0].restaurantId;
    const restaurant = this.restaurantService.getRestaurantById(restaurantId) as Restaurant | undefined;
    if (!restaurant) {
      return;
    }

    const normalizedItems = menuItems
      .map((menuItem) => this.restaurantService.getMenuItem(restaurantId, menuItem.id))
      .filter((item): item is MenuItem => item !== undefined);

    if (normalizedItems.length === 0) {
      return;
    }

    this.cartSignal.set({
      restaurantId,
      restaurant,
      items: normalizedItems.map((menuItem) => ({
        menuItem,
        quantity: 1,
        subtotal: menuItem.price,
      })),
      subtotal: 0,
      deliveryFee: restaurant.deliveryFee,
      tax: 0,
      total: 0,
    });
    this.updateCart();
  }

  private startNewCart(restaurantId: string) {
    const restaurant = this.restaurantService.getRestaurantById(restaurantId) as
      | Restaurant
      | undefined;
    if (!restaurant) return;

    this.cartSignal.set({
      restaurantId,
      restaurant,
      items: [],
      subtotal: 0,
      deliveryFee: restaurant.deliveryFee,
      tax: 0,
      total: 0,
    });
    this.persistCart();
  }

  private updateCart() {
    const cart = this.cartSignal();
    if (!cart) return;

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.1; // 10%
    const total = subtotal + cart.deliveryFee + tax;

    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    this.cartSignal.set({ ...cart });
    this.persistCart();
  }

  private hydrateCart(): Cart | null {
    return loadFromStorage<Cart | null>(CART_STORAGE_KEY, null, (storedCart) => {
      if (!storedCart) {
        return null;
      }

      const restaurant = this.restaurantService.getRestaurantById(storedCart.restaurantId);
      if (!restaurant) {
        return null;
      }

      const items = storedCart.items
        .map((item) => {
          const menuItem = this.restaurantService.getMenuItem(
            storedCart.restaurantId,
            item.menuItem.id,
          );

          if (!menuItem) {
            return null;
          }

          return {
            ...item,
            menuItem,
            subtotal: menuItem.price * item.quantity,
          };
        })
        .filter((item): item is CartItem => item !== null);

      if (items.length === 0) {
        return null;
      }

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.1;

      return {
        restaurantId: storedCart.restaurantId,
        restaurant,
        items,
        subtotal,
        deliveryFee: restaurant.deliveryFee,
        tax,
        total: subtotal + restaurant.deliveryFee + tax,
      };
    });
  }

  private persistCart() {
    saveToStorage(CART_STORAGE_KEY, this.cartSignal());
  }
}
