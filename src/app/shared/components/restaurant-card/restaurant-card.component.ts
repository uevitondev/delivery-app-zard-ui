import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Restaurant } from '@/shared/models';
import { CardComponent, BadgeComponent, ButtonComponent } from '../index';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card class="cursor-pointer hover:shadow-lg transition-shadow">
      <!-- Imagem -->
      <div class="relative h-48 overflow-hidden bg-gray-200 -mx-4 -mt-4 mb-4">
        <img
          [src]="restaurant().image"
          [alt]="restaurant().name"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        <!-- Status Badge -->
        <div class="absolute top-3 right-3">
          <app-badge [variant]="restaurant().isOpen ? 'success' : 'danger'" size="md">
            {{ restaurant().isOpen ? 'Aberto' : 'Fechado' }}
          </app-badge>
        </div>

        <!-- Rating Badge -->
        <div
          class="absolute top-3 left-3 bg-yellow-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold"
        >
          {{ restaurant().rating }}
        </div>
      </div>

      <!-- Conteúdo -->
      <div>
        <!-- Nome e Categoria -->
        <h3 class="font-bold text-lg text-gray-900">{{ restaurant().name }}</h3>
        <p class="text-sm text-gray-600 mb-2">{{ restaurant().category }}</p>

        <!-- Descrição -->
        <p class="text-sm text-gray-600 mb-4 line-clamp-2">
          {{ restaurant().description }}
        </p>

        <!-- Footer com entrega e avaliação -->
        <div class="flex justify-between items-center text-sm text-gray-700 mb-4">
          <div class="flex gap-4">
            <div class="flex items-center gap-1">
              <span>📦</span>
              <span>{{ restaurant().deliveryTime }}min</span>
            </div>
            <div class="flex items-center gap-1">
              <span>💰</span>
              <span>R$ {{ restaurant().deliveryFee | number: '1.2-2' }}</span>
            </div>
          </div>
          <div class="text-xs text-gray-500">{{ restaurant().reviewCount }} avaliações</div>
        </div>

        <!-- Action Button -->
        <app-button
          variant="primary"
          [fullWidth]="true"
          (click)="selectRestaurant.emit(restaurant().id)"
        >
          Ver cardápio
        </app-button>
      </div>
    </app-card>
  `,
})
export class RestaurantCardComponent {
  restaurant = input.required<Restaurant>();
  selectRestaurant = output<string>();
}
