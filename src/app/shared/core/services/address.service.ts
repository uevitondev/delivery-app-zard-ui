import { Injectable, inject, signal, computed } from '@angular/core';
import { Address } from '@/shared/models';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  // Signals
  private readonly addressesSignal = signal<Address[]>([
    {
      id: '1',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apt 42',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: true,
    },
    {
      id: '2',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01311-100',
      isDefault: false,
    },
  ]);

  private readonly selectedAddressIdSignal = signal<string | null>(null);

  // Computed
  readonly addresses = computed(() => this.addressesSignal());
  readonly selectedAddressId = computed(() => this.selectedAddressIdSignal());

  readonly selectedAddress = computed(() => {
    const selectedId = this.selectedAddressIdSignal();
    if (!selectedId) {
      // Retornar endereço padrão se nenhum foi selecionado
      return this.addressesSignal().find((addr) => addr.isDefault) || null;
    }
    return this.addressesSignal().find((addr) => addr.id === selectedId) || null;
  });

  readonly defaultAddress = computed(
    () => this.addressesSignal().find((addr) => addr.isDefault) || null,
  );

  // Métodos
  selectAddress(addressId: string): void {
    const address = this.addressesSignal().find((addr) => addr.id === addressId);
    if (address) {
      this.selectedAddressIdSignal.set(addressId);
    }
  }

  addAddress(address: Omit<Address, 'id'>): Address {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };

    this.addressesSignal.update((addresses) => [...addresses, newAddress]);
    return newAddress;
  }

  updateAddress(id: string, updates: Partial<Omit<Address, 'id'>>): void {
    this.addressesSignal.update((addresses) =>
      addresses.map((addr) => (addr.id === id ? { ...addr, ...updates } : addr)),
    );
  }

  deleteAddress(id: string): void {
    this.addressesSignal.update((addresses) => addresses.filter((addr) => addr.id !== id));
  }

  setDefaultAddress(id: string): void {
    this.addressesSignal.update((addresses) =>
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  }
}
