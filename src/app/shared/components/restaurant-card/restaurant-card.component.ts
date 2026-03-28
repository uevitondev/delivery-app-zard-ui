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
    <z-card class="group cursor-pointer">
      <div class="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-[24px] sm:-mx-6 sm:-mt-6">
        <div class="absolute inset-0 z-10 bg-gradient-to-t from-stone-950/55 via-stone-900/5 to-transparent"></div>
        <img
          [src]="restaurant().image"
          [alt]="restaurant().name"
          class="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          (click)="toggleFavorite.emit(); $event.stopPropagation()"
          class="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-lg text-stone-700 shadow-lg transition hover:scale-105 dark:bg-black/55 dark:text-stone-100"
          [attr.aria-label]="isFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        >
          {{ isFavorite() ? '♥' : '♡' }}
        </button>

        <div class="absolute left-4 top-4 z-20">
          <z-badge [zType]="restaurant().isOpen ? 'success' : 'danger'" zSize="md">
            {{ restaurant().isOpen ? 'Aberto' : 'Fechado' }}
          </z-badge>
        </div>

        <div
          class="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-stone-900 shadow-lg dark:bg-black/60 dark:text-stone-100"
        >
          <span class="text-amber-500">★</span>
          <span>{{ restaurant().rating }}</span>
          <span class="text-stone-400 dark:text-stone-500">·</span>
          <span>{{ restaurant().reviewCount }} aval.</span>
        </div>
      </div>

      <div>
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
              {{ restaurant().category }}
            </p>
            <h3 class="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{{ restaurant().name }}</h3>
          </div>
          <div class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/12 dark:text-orange-300">
            {{ restaurant().deliveryTime }} min
          </div>
        </div>

        <p class="mb-5 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
          {{ restaurant().description }}
        </p>

        <div class="mb-5 grid grid-cols-2 gap-3 text-sm text-stone-600 dark:text-stone-300">
          <div class="rounded-2xl bg-stone-50 px-3 py-3 dark:bg-white/6">
            <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Entrega</p>
            <p class="font-semibold text-stone-900 dark:text-stone-100">R$ {{ restaurant().deliveryFee | number: '1.2-2' }}</p>
          </div>
          <div class="rounded-2xl bg-stone-50 px-3 py-3 dark:bg-white/6">
            <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Endereco</p>
            <p class="truncate font-semibold text-stone-900 dark:text-stone-100">{{ restaurant().address }}</p>
          </div>
        </div>

        <button z-button
          zType="default"
          [zFull]="true"
          (click)="selectRestaurant.emit(restaurant().id)"
        >
          Ver cardápio
        </button>
      </div>
    </z-card>
  `,
})
export class RestaurantCardComponent {
  restaurant = input.required<Restaurant>();
  isFavorite = input<boolean>(false);
  selectRestaurant = output<string>();
  toggleFavorite = output<void>();
}
