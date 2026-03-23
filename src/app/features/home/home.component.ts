import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { CartService } from '@/shared/core/services/cart.service';
import {
  RestaurantCardComponent,
  LoadingComponent,
  ButtonComponent,
  BadgeComponent,
} from '@/shared/components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RestaurantCardComponent,
    LoadingComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-6xl mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">DeliveryApp</h1>
              <p class="text-sm text-gray-600">Encontre seus restaurantes favoritos</p>
            </div>

            <!-- Ícone do perfil/carrinho -->
            <div class="flex gap-4">
              <button
                (click)="goToCart()"
                class="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span class="text-2xl">🛒</span>
                @if (cartService.itemCount() > 0) {
                  <app-badge variant="danger" size="sm" class="absolute top-0 right-0">
                    {{ cartService.itemCount() }}
                  </app-badge>
                }
              </button>

              <button
                (click)="goToProfile()"
                class="p-2 text-gray-600 hover:text-blue-600 transition-colors text-2xl"
              >
                👤
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search/Filter -->
      <div class="bg-white border-b sticky top-16 z-30">
        <div class="max-w-6xl mx-auto px-4 py-4">
          <input
            type="text"
            placeholder="Buscar restaurante..."
            [(ngModel)]="searchValue"
            (input)="onSearchChange($event)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          />

          <!-- Filter buttons -->
          <div class="mt-3 flex gap-2 overflow-x-auto pb-2">
            @for (category of categories(); track category) {
              <app-button
                (click)="filterByCategory(category)"
                [variant]="selectedCategory() === category ? 'primary' : 'secondary'"
                size="sm"
              >
                {{ category }}
              </app-button>
            }
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-6xl mx-auto px-4 py-8">
        @if (loading()) {
          <app-loading />
        } @else if (filteredRestaurants().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-600 text-lg">Nenhum restaurante encontrado</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (restaurant of filteredRestaurants(); track restaurant.id) {
              <app-restaurant-card
                [restaurant]="restaurant"
                (selectRestaurant)="selectRestaurant($event)"
              />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  // Local state
  private readonly searchSignal = signal<string>('');
  private readonly selectedCategorySignal = signal<string | null>(null);
  searchValue: string = '';

  // Computed values
  restaurants = this.restaurantService.restaurants;
  loading = signal(false);
  categories = computed(() => {
    const categories = new Set(this.restaurants().map((r) => r.category));
    return Array.from(categories);
  });

  selectedCategory = this.selectedCategorySignal;

  filteredRestaurants = computed(() => {
    const search = this.searchSignal().toLowerCase();
    const category = this.selectedCategorySignal();

    return this.restaurants().filter((restaurant) => {
      const matchesSearch =
        search === '' ||
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.description.toLowerCase().includes(search);

      const matchesCategory = category === null || restaurant.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  cartItemCount = signal(0);

  ngOnInit() {
    this.loadRestaurants();
  }

  private async loadRestaurants() {
    this.loading.set(true);
    try {
      await this.restaurantService.getRestaurants();
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSignal.set(input.value);
  }

  filterByCategory(category: string) {
    this.selectedCategorySignal.set(this.selectedCategorySignal() === category ? null : category);
  }

  selectRestaurant(id: string) {
    this.restaurantService.selectRestaurant(id);
    this.router.navigate(['/restaurant', id]);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
