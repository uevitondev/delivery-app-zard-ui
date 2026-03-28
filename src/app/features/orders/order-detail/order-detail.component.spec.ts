import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { OrderDetailComponent } from './order-detail.component';
import { CartService } from '@/shared/core/services/cart.service';
import { OrderStatus, PaymentMethodType } from '@/shared/models';

describe('OrderDetailComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(
      'deliveryapp.orders',
      JSON.stringify([
        {
          id: 'order-123',
          restaurantId: '1',
          restaurant: {
            id: '1',
            name: 'Pizzaria Delícia',
            description: 'Autêntica pizza italiana',
            image: '',
            rating: 4.8,
            reviewCount: 10,
            deliveryTime: 30,
            deliveryFee: 5,
            category: 'Italiana',
            isOpen: true,
            address: 'Rua A',
            phone: '123',
          },
          userId: 'user-1',
          items: [
            {
              menuItem: { id: '1-2' },
              quantity: 1,
              price: 42.9,
            },
          ],
          status: OrderStatus.DELIVERED,
          subtotal: 42.9,
          deliveryFee: 5,
          tax: 4.29,
          total: 52.19,
          deliveryAddress: {
            id: 'addr-1',
            street: 'Rua A',
            number: '1',
            neighborhood: 'Centro',
            city: 'Sao Paulo',
            state: 'SP',
            zipCode: '01000-000',
            isDefault: true,
          },
          paymentMethod: {
            id: 'pay-1',
            type: PaymentMethodType.PIX,
            isDefault: true,
          },
          createdAt: '2026-03-28T00:00:00.000Z',
        },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'order-123',
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should submit a rating and reorder items', async () => {
    const fixture = TestBed.createComponent(OrderDetailComponent);
    const component = fixture.componentInstance;
    const cartService = TestBed.inject(CartService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await fixture.whenStable();
    fixture.detectChanges();

    component.ratingScore.set(4);
    component.ratingComment.set('Muito bom');
    await component.submitRating();
    fixture.detectChanges();

    expect(component.order()?.rating?.score).toBe(4);

    component.reorder();

    expect(cartService.items().length).toBe(1);
    expect(cartService.items()[0].menuItem.id).toBe('1-2');
    expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
  });
});
