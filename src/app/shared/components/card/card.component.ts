import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div
      class="overflow-hidden rounded-[28px] border border-white/65 bg-[rgba(255,255,255,0.82)] shadow-[0_14px_34px_rgba(118,60,24,0.1)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(118,60,24,0.14)] dark:border-white/10 dark:bg-[rgba(20,20,23,0.82)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.34)] dark:hover:shadow-[0_24px_54px_rgba(0,0,0,0.42)]"
    >
      @if (zTitle()) {
        <div class="border-b border-stone-100/80 px-5 py-4 text-sm font-semibold text-stone-700 dark:border-white/8 dark:text-stone-200 sm:px-6">
          {{ zTitle() }}
        </div>
      }

      <div class="px-5 py-5 text-stone-900 dark:text-stone-100 sm:px-6 sm:py-6">
        <ng-content />
      </div>

      @if (zFooter()) {
        <div class="border-t border-stone-100/80 bg-stone-50/70 px-5 py-4 text-sm text-stone-600 dark:border-white/8 dark:bg-white/4 dark:text-stone-300 sm:px-6">
          {{ zFooter() }}
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  zTitle = input<string | undefined>();
  zFooter = input<string | undefined>();
}
