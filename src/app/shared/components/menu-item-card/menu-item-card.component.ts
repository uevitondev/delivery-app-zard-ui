import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '@/shared/models';
import { CardComponent, BadgeComponent, ButtonComponent } from '../index';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card class="flex flex-col h-full">
      <!-- Imagem -->
      <div class="relative h-40 overflow-hidden bg-gray-200 -mx-4 -mt-4 mb-4">
        <img [src]="item().image" [alt]="item().name" class="w-full h-full object-cover" />

        <!-- Indisponível overlay -->
        @if (!item().available) {
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <app-badge variant="danger" size="md">Indisponível</app-badge>
          </div>
        }

        <!-- Rating -->
        @if (item().rating) {
          <div
            class="absolute top-2 right-2 bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold"
          >
            {{ item().rating }}
          </div>
        }
      </div>

      <!-- Conteúdo -->
      <div class="flex-1 flex flex-col">
        <!-- Nome -->
        <h4 class="font-bold text-gray-900 mb-1">{{ item().name }}</h4>

        <!-- Descrição -->
        <p class="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {{ item().description }}
        </p>

        <!-- Preço e tempo -->
        <div class="mb-4">
          <p class="text-lg font-bold text-gray-900">R$ {{ item().price | number: '1.2-2' }}</p>
          @if (item().prepareTime) {
            <p class="text-xs text-gray-500">⏱️ {{ item().prepareTime }}min</p>
          }
        </div>

        <!-- Action Button -->
        <app-button
          variant="primary"
          size="md"
          [fullWidth]="true"
          [disabled]="!item().available"
          (click)="addToCart.emit()"
        >
          Adicionar
        </app-button>
      </div>
    </app-card>
  `,
})
export class MenuItemCardComponent {
  item = input.required<MenuItem>();
  addToCart = output<void>();
}
