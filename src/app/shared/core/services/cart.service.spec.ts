import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { RestaurantService } from './restaurant.service';

describe('CartService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should persist cart items and totals to localStorage', async () => {
    const cartService = TestBed.inject(CartService);
    const restaurantService = TestBed.inject(RestaurantService);
    const menuItem = restaurantService.getMenuItems('1')[0];

    cartService.addItem(menuItem, 2, 'Sem cebola');
    await Promise.resolve();

    expect(cartService.itemCount()).toBe(2);
    expect(cartService.subtotal()).toBe(menuItem.price * 2);
    expect(localStorage.getItem('deliveryapp.cart')).not.toBeNull();
    expect(localStorage.getItem('deliveryapp.cart')).toContain(menuItem.id);
  });

  it('should hydrate cart from localStorage on a new instance', () => {
    const restaurantService = TestBed.inject(RestaurantService);
    const menuItem = restaurantService.getMenuItems('1')[0];

    localStorage.setItem(
      'deliveryapp.cart',
      JSON.stringify({
        restaurantId: '1',
        items: [
          {
            menuItem: { id: menuItem.id },
            quantity: 1,
            subtotal: menuItem.price,
          },
        ],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    const cartService = TestBed.inject(CartService);

    expect(cartService.cart()?.restaurant?.id).toBe('1');
    expect(cartService.items()[0].menuItem.name).toBe(menuItem.name);
  });

  it('should load a favorite bundle into the cart', () => {
    const cartService = TestBed.inject(CartService);
    const restaurantService = TestBed.inject(RestaurantService);
    const bundleItems = restaurantService.getMenuItems('1');

    cartService.loadMenuItemsBundle(bundleItems);

    expect(cartService.cart()?.restaurantId).toBe('1');
    expect(cartService.items().length).toBe(bundleItems.length);
    expect(cartService.itemCount()).toBe(bundleItems.length);
    expect(cartService.subtotal()).toBeGreaterThan(0);
  });
});
