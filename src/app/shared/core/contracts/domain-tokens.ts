import { InjectionToken, Provider } from '@angular/core';
import { AddressService } from '../services/address.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { ProfileService } from '../services/profile.service';
import { PromotionService } from '../services/promotion.service';
import { RestaurantService } from '../services/restaurant.service';
import {
  AddressBookPort,
  CartPort,
  NotificationPort,
  OrderPort,
  ProfileStorePort,
  PromotionCatalogPort,
  RestaurantCatalogPort,
} from './app.contracts';

export const RESTAURANT_CATALOG = new InjectionToken<RestaurantCatalogPort>('RESTAURANT_CATALOG');
export const PROMOTION_CATALOG = new InjectionToken<PromotionCatalogPort>('PROMOTION_CATALOG');
export const PROFILE_STORE = new InjectionToken<ProfileStorePort>('PROFILE_STORE');
export const ADDRESS_BOOK = new InjectionToken<AddressBookPort>('ADDRESS_BOOK');
export const CART_PORT = new InjectionToken<CartPort>('CART_PORT');
export const ORDER_PORT = new InjectionToken<OrderPort>('ORDER_PORT');
export const NOTIFICATION_PORT = new InjectionToken<NotificationPort>('NOTIFICATION_PORT');

export function provideDomainAdapters(): Provider[] {
  return [
    {
      provide: RESTAURANT_CATALOG,
      useExisting: RestaurantService,
    },
    {
      provide: PROMOTION_CATALOG,
      useExisting: PromotionService,
    },
    {
      provide: PROFILE_STORE,
      useExisting: ProfileService,
    },
    {
      provide: ADDRESS_BOOK,
      useExisting: AddressService,
    },
    {
      provide: CART_PORT,
      useExisting: CartService,
    },
    {
      provide: ORDER_PORT,
      useExisting: OrderService,
    },
    {
      provide: NOTIFICATION_PORT,
      useExisting: NotificationService,
    },
  ];
}
