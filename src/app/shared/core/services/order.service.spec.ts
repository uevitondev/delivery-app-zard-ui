import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderService } from './order.service';
import { OrderStatus, PaymentMethodType } from '@/shared/models';

describe('OrderService', () => {
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

  it('should create and persist orders locally', async () => {
    const service = TestBed.inject(OrderService);

    const created = await service.createOrder({
      restaurantId: '1',
      userId: 'user-1',
      items: [],
      status: OrderStatus.PENDING,
      subtotal: 10,
      deliveryFee: 5,
      tax: 1,
      total: 16,
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
    });
    await Promise.resolve();

    expect(created.id).toBeTruthy();
    expect(service.orders().length).toBe(1);
    expect(localStorage.getItem('deliveryapp.orders')).not.toBeNull();
    expect(localStorage.getItem('deliveryapp.orders')).toContain(created.id);
  });

  it('should hydrate date fields from localStorage', async () => {
    localStorage.setItem(
      'deliveryapp.orders',
      JSON.stringify([
        {
          id: 'order-1',
          restaurantId: '1',
          userId: 'user-1',
          items: [],
          status: OrderStatus.DELIVERED,
          subtotal: 10,
          deliveryFee: 5,
          tax: 1,
          total: 16,
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
          rating: {
            score: 5,
            ratedAt: '2026-03-28T01:00:00.000Z',
          },
        },
      ]),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    const service = TestBed.inject(OrderService);
    const [order] = await service.getOrders();

    expect(order.createdAt).toBeInstanceOf(Date);
    expect(order.rating?.ratedAt).toBeInstanceOf(Date);
  });
});
