import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { provideDomainAdapters } from '@/shared/core/contracts/domain-tokens';
import { OrderService } from '@/shared/core/services/order.service';

describe('Shopping flow', () => {
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

  it('should move from home recommendation to cart, checkout and orders list', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const homeFixture = TestBed.createComponent(HomeComponent);
    const home = homeFixture.componentInstance;
    await homeFixture.whenStable();
    homeFixture.detectChanges();

    const recommendedItem = home.recommendedMenuItems()[0];
    expect(recommendedItem).toBeTruthy();
    home.addRecommendedItem(recommendedItem);

    const cartFixture = TestBed.createComponent(CartComponent);
    await cartFixture.whenStable();
    cartFixture.detectChanges();
    const cartCompiled = cartFixture.nativeElement as HTMLElement;
    expect(cartCompiled.textContent).toContain(recommendedItem.name);

    const checkoutFixture = TestBed.createComponent(CheckoutComponent);
    const checkout = checkoutFixture.componentInstance;
    await checkoutFixture.whenStable();
    checkoutFixture.detectChanges();

    checkout.couponCode = 'SAVE10';
    checkout.applyCoupon();
    await checkout.confirmOrder();

    const ordersFixture = TestBed.createComponent(OrdersComponent);
    const ordersComponent = ordersFixture.componentInstance;
    await ordersComponent.ngOnInit();
    ordersFixture.detectChanges();

    const orderService = TestBed.inject(OrderService);
    expect(orderService.orders().length).toBe(1);
    const ordersCompiled = ordersFixture.nativeElement as HTMLElement;
    expect(ordersCompiled.textContent).toContain('Meus pedidos');
    expect(navigateSpy).toHaveBeenCalled();
  });
});
