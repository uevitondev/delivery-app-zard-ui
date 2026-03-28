import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CheckoutComponent } from './checkout.component';
import { provideDomainAdapters } from '@/shared/core/contracts/domain-tokens';
import { CartService } from '@/shared/core/services/cart.service';
import { OrderService } from '@/shared/core/services/order.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';

describe('CheckoutComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [provideRouter([]), provideHttpClient(), ...provideDomainAdapters()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should apply coupon and create an order from checkout', async () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    const component = fixture.componentInstance;
    const cartService = TestBed.inject(CartService);
    const orderService = TestBed.inject(OrderService);
    const restaurantService = TestBed.inject(RestaurantService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    cartService.addItem(restaurantService.getMenuItems('1')[1], 2);
    fixture.detectChanges();

    component.couponCode = 'SAVE10';
    component.applyCoupon();
    expect(component.appliedCoupon()?.code).toBe('SAVE10');

    await component.confirmOrder();

    expect(orderService.orders().length).toBe(1);
    expect(orderService.orders()[0].couponCode).toBe('SAVE10');
    expect(cartService.isEmpty()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/orders', expect.any(String)]);
  });
});
