import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'spinner') {
      <div class="flex items-center justify-center py-10">
        <div
          class="h-12 w-12 animate-spin rounded-full border-[5px] border-orange-100 border-t-orange-500 shadow-[0_8px_26px_rgba(255,120,70,0.25)] dark:border-white/10 dark:border-t-orange-400 dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
        ></div>
      </div>
    } @else if (variant() === 'cards') {
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (_ of placeholders(); track $index) {
          <div class="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(118,60,24,0.08)] dark:border-white/8 dark:bg-white/6 dark:shadow-[0_18px_38px_rgba(0,0,0,0.3)]">
            <div class="h-44 animate-pulse rounded-[22px] bg-stone-200 dark:bg-white/10"></div>
            <div class="mt-5 h-4 w-24 animate-pulse rounded-full bg-stone-200 dark:bg-white/10"></div>
            <div class="mt-3 h-6 w-2/3 animate-pulse rounded-full bg-stone-200 dark:bg-white/10"></div>
            <div class="mt-3 h-4 w-full animate-pulse rounded-full bg-stone-100 dark:bg-white/6"></div>
            <div class="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-stone-100 dark:bg-white/6"></div>
            <div class="mt-5 h-12 animate-pulse rounded-full bg-stone-200 dark:bg-white/10"></div>
          </div>
        }
      </div>
    } @else {
      <div class="space-y-4">
        @for (_ of placeholders(); track $index) {
          <div class="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_34px_rgba(118,60,24,0.08)] dark:border-white/8 dark:bg-white/6 dark:shadow-[0_18px_38px_rgba(0,0,0,0.3)]">
            <div class="h-5 w-40 animate-pulse rounded-full bg-stone-200 dark:bg-white/10"></div>
            <div class="mt-4 h-4 w-full animate-pulse rounded-full bg-stone-100 dark:bg-white/6"></div>
            <div class="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-stone-100 dark:bg-white/6"></div>
          </div>
        }
      </div>
    }
  `,
})
export class LoadingComponent {
  readonly variant = input<'spinner' | 'cards' | 'list'>('spinner');
  readonly count = input(3);

  placeholders() {
    return Array.from({ length: this.count() });
  }
}
