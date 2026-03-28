import { TestBed } from '@angular/core/testing';
import { AddressService } from './address.service';

describe('AddressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should keep a valid selected address after deleting the current one', () => {
    const service = TestBed.inject(AddressService);

    service.selectAddress('2');
    service.deleteAddress('2');

    expect(service.selectedAddress()?.id).toBe('1');
  });

  it('should hydrate addresses from localStorage and guarantee one default', () => {
    localStorage.setItem(
      'deliveryapp.addresses',
      JSON.stringify([
        {
          id: '99',
          street: 'Rua Nova',
          number: '10',
          neighborhood: 'Centro',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01000-000',
          isDefault: false,
        },
      ]),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const service = TestBed.inject(AddressService);

    expect(service.addresses()[0].isDefault).toBe(true);
    expect(service.selectedAddress()?.id).toBe('99');
  });
});
