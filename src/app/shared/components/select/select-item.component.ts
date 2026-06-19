import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectContext } from './select-root.component';

@Component({
  selector: 'z-select-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="option"
      [attr.aria-selected]="isSelected()"
      [class.bg-orange-50]="isSelected()"
      [class.dark:bg-orange-500/20]="isSelected()"
      [class.text-orange-700]="isSelected()"
      [class.dark:text-orange-300]="isSelected()"
      (click)="selectItem()"
      class="w-full px-4 py-3 text-left text-sm transition hover:bg-stone-100 dark:hover:bg-white/8 flex items-center justify-between"
      [disabled]="context.disabled()"
    >
      <span>
        <ng-content />
      </span>
      @if (isSelected()) {
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      }
    </button>
  `,
  host: {
    class: 'block',
  },
})
export class SelectItemComponent {
  value = input.required<string | number>();
  context = inject(SelectContext);

  isSelected = computed(() => this.context.selectedValue() === this.value());

  selectItem() {
    this.context.selectOption(this.value());
  }
}
