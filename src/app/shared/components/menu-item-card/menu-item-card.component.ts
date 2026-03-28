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
    <z-card class="flex h-full flex-col">
      <div class="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-[24px] sm:-mx-6 sm:-mt-6">
        <img [src]="item().image" [alt]="item().name" class="h-44 w-full object-cover" />

        <button
          type="button"
          (click)="toggleFavorite.emit()"
          class="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/92 text-base shadow-lg transition hover:scale-[1.03] dark:border-white/10 dark:bg-black/55"
          [attr.aria-label]="isFavorite() ? 'Remover dos favoritos' : 'Salvar nos favoritos'"
        >
          <span [class.text-orange-500]="isFavorite()" [class.text-stone-400]="!isFavorite()">♥</span>
        </button>

        @if (!item().available) {
          <div class="absolute inset-0 flex items-center justify-center bg-stone-950/45">
            <z-badge zType="destructive" zSize="md">Indisponível</z-badge>
          </div>
        }

        @if (item().rating) {
          <div
            class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-stone-900 shadow-lg dark:bg-black/60 dark:text-stone-100"
          >
            <span class="text-amber-500">★</span>
            {{ item().rating }}
          </div>
        }
      </div>

      <div class="flex-1 flex flex-col">
        <div class="mb-1 flex items-start justify-between gap-3">
          <h4 class="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">{{ item().name }}</h4>
          <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-500/12 dark:text-orange-300">
            {{ item().category }}
          </span>
        </div>

        <p class="mb-4 line-clamp-2 flex-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
          {{ item().description }}
        </p>

        <div class="mb-5 flex items-end justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">Preco</p>
            <p class="text-xl font-semibold text-stone-950 dark:text-stone-100">R$ {{ item().price | number: '1.2-2' }}</p>
          </div>
          @if (item().prepareTime) {
            <p class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-white/8 dark:text-stone-300">
              {{ item().prepareTime }} min
            </p>
          }
        </div>

        <button z-button
          zType="default"
          zSize="md"
          [zFull]="true"
          [disabled]="!item().available"
          (click)="addToCart.emit()"
        >
          Adicionar
        </button>
      </div>
    </z-card>
  `,
})
export class MenuItemCardComponent {
  item = input.required<MenuItem>();
  isFavorite = input(false);
  addToCart = output<void>();
  toggleFavorite = output<void>();
}
