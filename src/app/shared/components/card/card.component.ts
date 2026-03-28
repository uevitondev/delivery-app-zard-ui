import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div
      class="overflow-hidden rounded-[28px] border border-white/65 bg-[rgba(255,255,255,0.82)] shadow-[0_14px_34px_rgba(118,60,24,0.1)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(118,60,24,0.14)]"
    >
      @if (header()) {
        <div class="border-b border-stone-100/80 px-5 py-4 text-sm font-semibold text-stone-700 sm:px-6">
          {{ header() }}
        </div>
      }

      <div class="px-5 py-5 sm:px-6 sm:py-6">
        <ng-content />
      </div>

      @if (footer()) {
        <div class="border-t border-stone-100/80 bg-stone-50/70 px-5 py-4 text-sm text-stone-600 sm:px-6">
          {{ footer() }}
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  header = input<string | undefined>();
  footer = input<string | undefined>();
}
