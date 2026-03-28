import { Injectable } from '@angular/core';
import { AppliedCoupon, Cart, Coupon, CouponType } from '@/shared/models';
import { PromotionCatalogPort } from '../contracts/app.contracts';

@Injectable({
  providedIn: 'root',
})
export class PromotionService implements PromotionCatalogPort {
  private readonly coupons: Coupon[] = [
    {
      code: 'SAVE10',
      title: '10% OFF no pedido',
      description: 'Ganhe 10% de desconto em pedidos acima de R$ 40.',
      type: CouponType.PERCENTAGE,
      value: 10,
      minSubtotal: 40,
    },
    {
      code: 'FRETEGRATIS',
      title: 'Frete gratis',
      description: 'Zera a taxa de entrega em qualquer pedido.',
      type: CouponType.FREE_DELIVERY,
      value: 0,
    },
    {
      code: 'PIZZA15',
      title: 'R$ 15 OFF em pizzas',
      description: 'Desconto especial para pedidos da Pizzaria Delicia.',
      type: CouponType.FIXED,
      value: 15,
      minSubtotal: 50,
      restaurantId: '1',
    },
  ];

  getAvailableCoupons() {
    return this.coupons;
  }

  applyCoupon(code: string, cart: Cart | null): { appliedCoupon: AppliedCoupon | null; error: string | null } {
    if (!cart) {
      return {
        appliedCoupon: null,
        error: 'Seu carrinho esta vazio.',
      };
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = this.coupons.find((item) => item.code === normalizedCode);

    if (!coupon) {
      return {
        appliedCoupon: null,
        error: 'Cupom invalido.',
      };
    }

    if (coupon.minSubtotal && cart.subtotal < coupon.minSubtotal) {
      return {
        appliedCoupon: null,
        error: `Esse cupom exige subtotal minimo de R$ ${coupon.minSubtotal.toFixed(2)}.`,
      };
    }

    if (coupon.restaurantId && coupon.restaurantId !== cart.restaurantId) {
      return {
        appliedCoupon: null,
        error: 'Esse cupom nao e valido para o restaurante atual.',
      };
    }

    const discount = this.calculateDiscount(coupon, cart);

    return {
      appliedCoupon: {
        code: coupon.code,
        title: coupon.title,
        discount,
      },
      error: null,
    };
  }

  private calculateDiscount(coupon: Coupon, cart: Cart) {
    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        return Number((cart.subtotal * (coupon.value / 100)).toFixed(2));
      case CouponType.FIXED:
        return Math.min(coupon.value, cart.subtotal);
      case CouponType.FREE_DELIVERY:
        return cart.deliveryFee;
      default:
        return 0;
    }
  }
}
