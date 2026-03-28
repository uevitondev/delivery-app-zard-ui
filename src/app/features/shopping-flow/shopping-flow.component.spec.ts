import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HomeComponent } from '../home/home.component';
import { CartComponent } from '../cart/cart.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { OrdersComponent } from '../orders/orders.component';
import { provideDomainAdapters } from '@/shared/core/contracts/domain-tokens';
import { CartService } from '@/shared/core/services/cart.service';
import { OrderService } from '@/shared/core/services/order.service';

describe('Shopping Flow', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent, CartComponent, CheckoutComponent, OrdersComponent],
      providers: [provideRouter([]), provideHttpClient(), ...provideDomainAdapters()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should complete the flow from home to cart, checkout and orders list', async () => {
    const homeFixture = TestBed.createComponent(HomeComponent);
    const homeComponent = homeFixture.componentInstance;
    const cartService = TestBed.inject(CartService);
    const orderService = TestBed.inject(OrderService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await homeFixture.whenStable();
    homeFixture.detectChanges();

    const recommendedItem = homeComponent.recommendedMenuItems()[0];
    expect(recommendedItem).toBeTruthy();
    homeComponent.addRecommendedItem(recommendedItem);

    expect(cartService.itemCount()).toBe(1);
    expect(cartService.items()[0].menuItem.id).toBe(recommendedItem.id);

    const cartFixture = TestBed.createComponent(CartComponent);
    await cartFixture.whenStable();
    cartFixture.detectChanges();
    expect(cartService.isEmpty()).toBe(false);

    const checkoutFixture = TestBed.createComponent(CheckoutComponent);
    const checkoutComponent = checkoutFixture.componentInstance;
    checkoutFixture.detectChanges();

    checkoutComponent.couponCode = 'SAVE10';
    checkoutComponent.applyCoupon();
    await checkoutComponent.confirmOrder();

    expect(orderService.orders().length).toBe(1);
    expect(orderService.orders()[0].couponCode).toBe('SAVE10');
    expect(cartService.isEmpty()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/orders', expect.any(String)]);

    const ordersFixture = TestBed.createComponent(OrdersComponent);
    const ordersComponent = ordersFixture.componentInstance;
    await ordersComponent.ngOnInit();
    ordersFixture.detectChanges();

    expect(ordersComponent.orders().length).toBe(1);
    expect(ordersComponent.orders()[0].items.length).toBeGreaterThan(0);
  });
});
