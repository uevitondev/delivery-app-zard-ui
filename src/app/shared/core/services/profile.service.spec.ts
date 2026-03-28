import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
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

  it('should persist favorite menu items, coupons and recent searches', () => {
    const service = TestBed.inject(ProfileService);

    service.toggleFavoriteMenuItem('2-1');
    service.saveCoupon('FRETEGRATIS');
    service.addRecentSearch('Burger');

    expect(service.isFavoriteMenuItem('2-1')).toBe(true);
    expect(service.isCouponSaved('FRETEGRATIS')).toBe(true);
    expect(service.recentSearches()[0]).toBe('Burger');
    expect(localStorage.getItem('deliveryapp.profile')).toContain('FRETEGRATIS');
  });

  it('should hydrate onboarding and recent searches from localStorage', () => {
    localStorage.setItem(
      'deliveryapp.profile',
      JSON.stringify({
        id: 'user-1',
        email: 'demo@deliveryapp.com',
        name: 'Demo User',
        phone: '(11) 90000-0000',
        hasCompletedOnboarding: true,
        preferredCuisine: 'Japonesa',
        favoriteRestaurants: ['1'],
        favoriteMenuItems: ['3-1'],
        savedCouponCodes: ['SAVE10'],
        recentSearches: ['Temaki'],
        paymentMethods: [],
        addresses: [],
        createdAt: '2026-03-28T00:00:00.000Z',
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    const service = TestBed.inject(ProfileService);

    expect(service.hasCompletedOnboarding()).toBe(true);
    expect(service.preferredCuisine()).toBe('Japonesa');
    expect(service.recentSearches()).toEqual(['Temaki']);
    expect(service.isFavoriteMenuItem('3-1')).toBe(true);
  });
});
