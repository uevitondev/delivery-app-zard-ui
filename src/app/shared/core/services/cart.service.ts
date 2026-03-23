import { Injectable, inject, signal, computed } from '@angular/core';
import { Cart, CartItem, MenuItem, Restaurant } from '@/shared/models';
import { RestaurantService } from '@/shared/core/services/restaurant.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly restaurantService = inject(RestaurantService);

  // State
  private readonly cartSignal = signal<Cart | null>(null);

  // Public computed values
  readonly cart = computed(() => this.cartSignal());
  readonly items = computed(() => this.cartSignal()?.items ?? []);
  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this.cartSignal()?.subtotal ?? 0);
  readonly deliveryFee = computed(() => this.cartSignal()?.deliveryFee ?? 0);
  readonly tax = computed(() => this.cartSignal()?.tax ?? 0);
  readonly total = computed(() => this.cartSignal()?.total ?? 0);
  readonly isEmpty = computed(() => this.items().length === 0);

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
    }
  }

  clearCart() {
    this.cartSignal.set(null);
  }

  private startNewCart(restaurantId: string) {
    const restaurant = this.restaurantService.getRestaurantById(restaurantId) as
      | Restaurant
      | undefined;
    if (!restaurant) return;

    this.cartSignal.set({
      restaurantId,
      restaurants: restaurant,
      items: [],
      subtotal: 0,
      deliveryFee: restaurant.deliveryFee,
      tax: 0,
      total: 0,
    });
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
  }
}
