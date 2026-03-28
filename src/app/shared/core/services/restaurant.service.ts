import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Restaurant, MenuItem } from '@/shared/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { RestaurantCatalogPort } from '../contracts/app.contracts';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService implements RestaurantCatalogPort {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/restaurants'; // Ajustar com sua URL real

  // Mock data para desenvolvimento
  private readonly mockRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Pizzaria Delícia',
      description: 'Autêntica pizza italiana',
      image: 'https://via.placeholder.com/300x200?text=Pizzaria+Delicia',
      rating: 4.8,
      reviewCount: 234,
      deliveryTime: 30,
      deliveryFee: 5.5,
      category: 'Italiana',
      isOpen: true,
      address: 'Rua A, 123',
      phone: '(11) 1234-5678',
    },
    {
      id: '2',
      name: 'Burger Place',
      description: 'Hambúrgueres artesanais premium',
      image: 'https://via.placeholder.com/300x200?text=Burger+Place',
      rating: 4.6,
      reviewCount: 189,
      deliveryTime: 25,
      deliveryFee: 4.0,
      category: 'Fastfood',
      isOpen: true,
      address: 'Av. B, 456',
      phone: '(11) 9876-5432',
    },
    {
      id: '3',
      name: 'Sushi Express',
      description: 'Sushi fresco preparado na hora',
      image: 'https://via.placeholder.com/300x200?text=Sushi+Express',
      rating: 4.9,
      reviewCount: 312,
      deliveryTime: 40,
      deliveryFee: 8.0,
      category: 'Japonesa',
      isOpen: true,
      address: 'Rua C, 789',
      phone: '(11) 1111-2222',
    },
  ];

  private readonly mockMenuItems: Record<string, MenuItem[]> = {
    '1': [
      {
        id: '1-1',
        restaurantId: '1',
        name: 'Pizza Margherita',
        description: 'Tomate, mozzarella e manjericão',
        price: 35.9,
        image: 'https://via.placeholder.com/200x200?text=Pizza+Margherita',
        category: 'Pizzas',
        available: true,
        rating: 4.7,
      },
      {
        id: '1-2',
        restaurantId: '1',
        name: 'Pizza Pepperoni',
        description: 'Tomate, mozzarella e pepperoni',
        price: 42.9,
        image: 'https://via.placeholder.com/200x200?text=Pizza+Pepperoni',
        category: 'Pizzas',
        available: true,
        rating: 4.8,
      },
    ],
    '2': [
      {
        id: '2-1',
        restaurantId: '2',
        name: 'Classic Burger',
        description: 'Pão, carne, queijo, alface e tomate',
        price: 28.9,
        image: 'https://via.placeholder.com/200x200?text=Classic+Burger',
        category: 'Burgers',
        available: true,
        rating: 4.6,
      },
      {
        id: '2-2',
        restaurantId: '2',
        name: 'Premium Burger',
        description: 'Dupla carne, bacon, cheddar e maionese especial',
        price: 45.9,
        image: 'https://via.placeholder.com/200x200?text=Premium+Burger',
        category: 'Burgers',
        available: true,
        rating: 4.9,
      },
    ],
    '3': [
      {
        id: '3-1',
        restaurantId: '3',
        name: 'Hot Roll Salmão',
        description: 'Salmão, avocado, maionese picante',
        price: 38.9,
        image: 'https://via.placeholder.com/200x200?text=Hot+Roll+Salmon',
        category: 'Hot Rolls',
        available: true,
        rating: 4.8,
      },
      {
        id: '3-2',
        restaurantId: '3',
        name: 'Temaki Atum',
        description: 'Atum, pepino, maionese e wasabi',
        price: 25.9,
        image: 'https://via.placeholder.com/200x200?text=Temaki+Tuna',
        category: 'Temaki',
        available: true,
        rating: 4.7,
      },
    ],
  };

  // Signals
  private readonly restaurantsSignal = signal<Restaurant[]>(this.mockRestaurants);
  private readonly selectedRestaurantSignal = signal<Restaurant | null>(null);
  private readonly loadingSignal = signal<boolean>(false);

  // Public computed
  readonly restaurants = computed(() => this.restaurantsSignal());
  readonly selectedRestaurant = computed(() => this.selectedRestaurantSignal());
  readonly selectedRestaurantMenu = computed(() => {
    const restaurantId = this.selectedRestaurantSignal()?.id;
    return restaurantId ? this.mockMenuItems[restaurantId] || [] : [];
  });

  getRestaurants() {
    this.loadingSignal.set(true);
    // Em produção, usar HTTP
    // return this.http.get<Restaurant[]>(this.apiUrl)
    //   .pipe(finalize(() => this.loadingSignal.set(false)));

    // Mock para desenvolvimento
    return Promise.resolve(this.mockRestaurants);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.mockRestaurants.find((r) => r.id === id);
  }

  selectRestaurant(id: string) {
    const restaurant = this.getRestaurantById(id);
    if (restaurant) {
      this.selectedRestaurantSignal.set(restaurant);
    }
  }

  getMenuItems(restaurantId: string): MenuItem[] {
    return this.mockMenuItems[restaurantId] || [];
  }

  getAllMenuItems(): MenuItem[] {
    return Object.values(this.mockMenuItems).flat();
  }

  getMenuItem(restaurantId: string, itemId: string): MenuItem | undefined {
    return this.getMenuItems(restaurantId).find((item) => item.id === itemId);
  }
}
