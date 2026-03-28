import { computed, inject, Injectable, signal } from '@angular/core';
import {
  ADDRESS_BOOK,
  ORDER_PORT,
  PROFILE_STORE,
  PROMOTION_CATALOG,
  CART_PORT,
} from '@/shared/core/contracts/domain-tokens';
import {
  AddressBookPort,
  CartPort,
  OrderPort,
  ProfileStorePort,
  PromotionCatalogPort,
} from '@/shared/core/contracts/app.contracts';
import { AppliedCoupon, OrderStatus, PaymentMethodType } from '@/shared/models';

@Injectable({
  providedIn: 'root',
})
export class CheckoutFacade {
  readonly cartPort = inject(CART_PORT) as CartPort;
  readonly orderPort = inject(ORDER_PORT) as OrderPort;
  readonly addressBook = inject(ADDRESS_BOOK) as AddressBookPort;
  readonly profileStore = inject(PROFILE_STORE) as ProfileStorePort;
  readonly promotionCatalog = inject(PROMOTION_CATALOG) as PromotionCatalogPort;

  readonly showNewAddressForm = signal(false);
  readonly showNewPaymentForm = signal(false);
  readonly selectedAddressId = signal<string | null>(null);
  readonly selectedPaymentMethodId = signal<string | null>(null);
  readonly notes = signal('');
  readonly appliedCoupon = signal<AppliedCoupon | null>(null);
  readonly couponError = signal<string | null>(null);
  couponCode = '';

  newAddress = {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: '',
  };

  newPayment = {
    type: PaymentMethodType.CREDIT_CARD,
    label: '',
    lastDigits: '',
  };

  readonly checkoutTotal = computed(() =>
    Math.max(this.cartPort.total() - (this.appliedCoupon()?.discount ?? 0), 0),
  );

  constructor() {
    const defaultAddress = this.addressBook.defaultAddress();
    if (defaultAddress) this.selectedAddressId.set(defaultAddress.id);
    const defaultPaymentMethod = this.profileStore.getDefaultPaymentMethod();
    if (defaultPaymentMethod) this.selectedPaymentMethodId.set(defaultPaymentMethod.id);
  }

  selectAddress(addressId: string) {
    this.selectedAddressId.set(addressId);
    this.addressBook.selectAddress(addressId);
  }

  toggleNewAddressForm() {
    this.showNewAddressForm.update((value) => !value);
    if (this.showNewAddressForm()) this.resetNewAddressForm();
  }

  toggleNewPaymentForm() {
    this.showNewPaymentForm.update((value) => !value);
    if (this.showNewPaymentForm()) this.resetNewPaymentForm();
  }

  resetNewAddressForm() {
    this.newAddress = {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: '',
    };
  }

  resetNewPaymentForm() {
    this.newPayment = {
      type: PaymentMethodType.CREDIT_CARD,
      label: '',
      lastDigits: '',
    };
  }

  isNewAddressValid() {
    return (
      this.newAddress.street.trim().length > 0 &&
      this.newAddress.number.trim().length > 0 &&
      this.newAddress.neighborhood.trim().length > 0 &&
      this.newAddress.city.trim().length > 0 &&
      this.newAddress.zipCode.trim().length > 0
    );
  }

  isNewPaymentValid() {
    return this.newPayment.label.trim().length > 0;
  }

  addAndSelectAddress() {
    if (!this.isNewAddressValid()) return null;
    const newAddress = this.addressBook.addAddress({
      street: this.newAddress.street,
      number: this.newAddress.number,
      complement: this.newAddress.complement || undefined,
      neighborhood: this.newAddress.neighborhood,
      city: this.newAddress.city,
      state: this.newAddress.state,
      zipCode: this.newAddress.zipCode,
      isDefault: false,
    });
    this.selectedAddressId.set(newAddress.id);
    this.addressBook.selectAddress(newAddress.id);
    this.showNewAddressForm.set(false);
    this.resetNewAddressForm();
    return newAddress;
  }

  addPaymentMethod() {
    if (!this.isNewPaymentValid()) return null;
    const paymentMethod = this.profileStore.addPaymentMethod({
      type: this.newPayment.type,
      label: this.newPayment.label,
      lastDigits: this.newPayment.lastDigits || undefined,
      isDefault: this.profileStore.paymentMethods().length === 0,
    });
    this.selectedPaymentMethodId.set(paymentMethod.id);
    this.showNewPaymentForm.set(false);
    this.resetNewPaymentForm();
    return paymentMethod;
  }

  applyCoupon() {
    const result = this.promotionCatalog.applyCoupon(this.couponCode, this.cartPort.cart());
    this.appliedCoupon.set(result.appliedCoupon);
    this.couponError.set(result.error);
    return result;
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.couponError.set(null);
    this.couponCode = '';
  }

  isFormValid() {
    return this.selectedAddressId() !== null && this.selectedPaymentMethodId() !== null;
  }

  async confirmOrder() {
    if (!this.isFormValid()) return null;
    const selectedAddress = this.addressBook.selectedAddress();
    const selectedPaymentMethod = this.profileStore.getPaymentMethodById(this.selectedPaymentMethodId() || '');
    if (!selectedAddress || !selectedPaymentMethod) return null;

    const orderItems = this.cartPort.items().map((cartItem) => ({
      menuItem: cartItem.menuItem,
      quantity: cartItem.quantity,
      notes: cartItem.notes,
      price: cartItem.menuItem.price,
    }));

    const createdOrder = await this.orderPort.createOrder({
      restaurantId: this.cartPort.cart()?.restaurantId || '',
      restaurant: this.cartPort.cart()?.restaurant,
      userId: 'user-123',
      items: orderItems,
      status: OrderStatus.PENDING,
      subtotal: this.cartPort.subtotal(),
      deliveryFee: this.cartPort.deliveryFee(),
      tax: this.cartPort.tax(),
      discount: this.appliedCoupon()?.discount,
      total: this.checkoutTotal(),
      deliveryAddress: selectedAddress,
      paymentMethod: selectedPaymentMethod,
      couponCode: this.appliedCoupon()?.code,
      notes: this.notes() || undefined,
    });

    this.cartPort.clearCart();
    return createdOrder;
  }
}
