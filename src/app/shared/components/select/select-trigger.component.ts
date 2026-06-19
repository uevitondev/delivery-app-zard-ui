import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectContext } from './select-root.component';

@Component({
  selector: 'z-select-trigger',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="w-full rounded-[22px] border border-stone-200 bg-white/88 px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:bg-stone-100 disabled:text-stone-400 dark:border-white/10 dark:bg-white/6 dark:text-stone-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus:border-orange-400 dark:focus:ring-orange-500/20 dark:disabled:bg-white/4 dark:disabled:text-stone-500 flex items-center justify-between"
      [disabled]="context.disabled()"
      (click)="context.toggleOpen()"
      [attr.aria-expanded]="context.isOpen()"
      [attr.aria-haspopup]="'listbox'"
    >
      <ng-content />

      <svg
        class="h-5 w-5 transition-transform"
        [class.rotate-180]="context.isOpen()"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  `,
  host: {
    class: 'block',
  },
})
export class SelectTriggerComponent {
  context = inject(SelectContext);
}
