import { Injectable, computed, signal } from '@angular/core';
import { Address } from '@/shared/models';
import { loadFromStorage, saveToStorage } from '@/shared/utils';
import { AddressBookPort } from '../contracts/app.contracts';

const DEFAULT_ADDRESSES: Address[] = [
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
];

const ADDRESSES_STORAGE_KEY = 'deliveryapp.addresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'deliveryapp.selectedAddressId';

@Injectable({
  providedIn: 'root',
})
export class AddressService implements AddressBookPort {
  // Signals
  private readonly addressesSignal = signal<Address[]>(
    loadFromStorage<Address[]>(ADDRESSES_STORAGE_KEY, DEFAULT_ADDRESSES, (addresses) =>
      this.normalizeAddresses(addresses),
    ),
  );

  private readonly selectedAddressIdSignal = signal<string | null>(
    loadFromStorage<string | null>(SELECTED_ADDRESS_STORAGE_KEY, null),
  );

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

  constructor() {
    this.ensureSelectedAddressIsValid();
    this.persistAddresses();
    this.persistSelectedAddress();
  }

  // Métodos
  selectAddress(addressId: string): void {
    const address = this.addressesSignal().find((addr) => addr.id === addressId);
    if (address) {
      this.selectedAddressIdSignal.set(addressId);
      this.persistSelectedAddress();
    }
  }

  addAddress(address: Omit<Address, 'id'>): Address {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };

    this.addressesSignal.update((addresses) => [...addresses, newAddress]);
    this.persistAddresses();
    return newAddress;
  }

  updateAddress(id: string, updates: Partial<Omit<Address, 'id'>>): void {
    this.addressesSignal.update((addresses) =>
      addresses.map((addr) => (addr.id === id ? { ...addr, ...updates } : addr)),
    );
    this.persistAddresses();
  }

  deleteAddress(id: string): void {
    this.addressesSignal.update((addresses) => addresses.filter((addr) => addr.id !== id));
    this.ensureSelectedAddressIsValid();
    this.persistAddresses();
    this.persistSelectedAddress();
  }

  setDefaultAddress(id: string): void {
    this.addressesSignal.update((addresses) =>
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    this.ensureSelectedAddressIsValid();
    this.persistAddresses();
    this.persistSelectedAddress();
  }

  private ensureSelectedAddressIsValid() {
    const selectedId = this.selectedAddressIdSignal();
    if (selectedId && this.addressesSignal().some((address) => address.id === selectedId)) {
      return;
    }

    this.selectedAddressIdSignal.set(this.defaultAddress()?.id ?? this.addressesSignal()[0]?.id ?? null);
  }

  private normalizeAddresses(addresses: Address[]) {
    if (addresses.length === 0) {
      return DEFAULT_ADDRESSES;
    }

    const hasDefault = addresses.some((address) => address.isDefault);
    return addresses.map((address, index) => ({
      ...address,
      isDefault: hasDefault ? address.isDefault : index === 0,
    }));
  }

  private persistAddresses() {
    saveToStorage(ADDRESSES_STORAGE_KEY, this.addressesSignal());
  }

  private persistSelectedAddress() {
    saveToStorage(SELECTED_ADDRESS_STORAGE_KEY, this.selectedAddressIdSignal());
  }
}
