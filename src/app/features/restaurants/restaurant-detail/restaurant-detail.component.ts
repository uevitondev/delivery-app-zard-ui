import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { CartService } from '@/shared/core/services/cart.service';
import { MenuItem } from '@/shared/models';
import { MenuItemCardComponent, LoadingComponent } from '@/shared/components';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, MenuItemCardComponent, LoadingComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header com voltar -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button (click)="goBack()" class="text-2xl hover:text-blue-600 transition-colors">
            ← Voltar
          </button>

          <button
            (click)="goToCart()"
            class="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span class="text-2xl">🛒</span>
            @if (cartService.itemCount() > 0) {
              <span
                class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ cartService.itemCount() }}
              </span>
            }
          </button>
        </div>
      </div>

      @if (!restaurant()) {
        <app-loading />
      } @else {
        <!-- Restaurant Hero -->
        <div class="bg-white">
          <div class="max-w-6xl mx-auto">
            <!-- Imagem do restaurante -->
            <div class="h-64 overflow-hidden">
              <img
                [src]="restaurant()!.image"
                [alt]="restaurant()!.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Info do restaurante -->
            <div class="px-4 py-6 border-b">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ restaurant()!.name }}
              </h1>
              <p class="text-gray-600 mb-4">{{ restaurant()!.description }}</p>

              <div class="flex gap-6 text-sm text-gray-700">
                <div>
                  ⭐ {{ restaurant()!.rating }} ({{ restaurant()!.reviewCount }} avaliações)
                </div>
                <div>📦 {{ restaurant()!.deliveryTime }}min de entrega</div>
                <div>💰 R$ {{ restaurant()!.deliveryFee | number: '1.2-2' }} taxa</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="max-w-6xl mx-auto px-4 py-8">
          @if (menuItems().length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-600">Menu vazio no momento</p>
            </div>
          } @else {
            <div class="space-y-6">
              @for (category of categories(); track category) {
                <div>
                  <h2 class="text-xl font-bold text-gray-900 mb-4">
                    {{ category }}
                  </h2>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (item of itemsByCategory(category); track item.id) {
                      <app-menu-item-card [item]="item" (addToCart)="addToCart(item)" />
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Modal de quantidade -->
        @if (selectedItem() && showQuantityModal()) {
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50"
            (click)="closeModal()"
          >
            <div
              class="bg-white w-full rounded-t-lg p-6 animate-slide-up"
              (click)="$event.stopPropagation()"
            >
              <h3 class="text-lg font-bold mb-2">{{ selectedItem()!.name }}</h3>
              <p class="text-gray-600 mb-4">{{ selectedItem()!.description }}</p>

              <div class="mb-4">
                <p class="font-bold text-lg">R$ {{ selectedItem()!.price | number: '1.2-2' }}</p>
              </div>

              <!-- Quantidade -->
              <div class="mb-6">
                <label class="block text-sm font-semibold mb-2">Quantidade</label>
                <div class="flex items-center gap-4">
                  <button (click)="decreaseQuantity()" class="bg-gray-200 px-3 py-2 rounded-lg">
                    −
                  </button>
                  <span class="text-lg font-bold w-8 text-center">
                    {{ quantity() }}
                  </span>
                  <button (click)="increaseQuantity()" class="bg-gray-200 px-3 py-2 rounded-lg">
                    +
                  </button>
                </div>
              </div>

              <!-- Notas -->
              <div class="mb-6">
                <label class="block text-sm font-semibold mb-2">Notas (opcional)</label>
                <textarea
                  [ngModel]="notes()"
                  (ngModelChange)="notes.set($event)"
                  placeholder="Ex: Sem cebola, sem molho..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  rows="3"
                ></textarea>
              </div>

              <!-- Botões de ação -->
              <div class="flex gap-4">
                <button
                  (click)="closeModal()"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmAddToCart()"
                  class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }
    `,
  ],
})
export class RestaurantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly restaurantService = inject(RestaurantService);
  readonly cartService = inject(CartService);

  // Local state
  private readonly quantitySignal = signal(1);
  private readonly notesSignal = signal<string>('');
  private readonly selectedItemSignal = signal<MenuItem | null>(null);
  private readonly showQuantityModalSignal = signal<boolean>(false);

  // Computed
  restaurant = this.restaurantService.selectedRestaurant;
  menuItems = this.restaurantService.selectedRestaurantMenu;
  quantity = this.quantitySignal;
  notes = this.notesSignal;
  selectedItem = this.selectedItemSignal;
  showQuantityModal = this.showQuantityModalSignal;

  categories = computed(() => {
    const categories = new Set(this.menuItems().map((item) => item.category));
    return Array.from(categories);
  });

  itemsByCategory = (category: string) =>
    this.menuItems().filter((item) => item.category === category);

  ngOnInit() {
    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (restaurantId) {
      this.restaurantService.selectRestaurant(restaurantId);
    }
  }

  addToCart(item: MenuItem) {
    this.selectedItemSignal.set(item);
    this.quantitySignal.set(1);
    this.notesSignal.set('');
    this.showQuantityModalSignal.set(true);
  }

  confirmAddToCart() {
    const item = this.selectedItemSignal();
    if (item) {
      this.cartService.addItem(item, this.quantitySignal(), this.notesSignal() || undefined);
      this.closeModal();
    }
  }

  increaseQuantity() {
    this.quantitySignal.update((q) => q + 1);
  }

  decreaseQuantity() {
    this.quantitySignal.update((q) => (q > 1 ? q - 1 : 1));
  }

  closeModal() {
    this.showQuantityModalSignal.set(false);
    this.selectedItemSignal.set(null);
  }

  goBack() {
    this.location.back();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
