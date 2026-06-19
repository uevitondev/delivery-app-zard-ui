import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectContext } from './select-root.component';

@Component({
  selector: 'z-select-value',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span>{{ displayLabel() }}</span>
  `,
})
export class SelectValueComponent {
  context = inject(SelectContext);

  displayLabel = computed(() => {
    const selectedValue = this.context.selectedValue();
    if (selectedValue === null) {
      return this.context.placeholder();
    }

    const option = this.context.options().find((opt) => opt.value === selectedValue);
    return option?.label || this.context.placeholder();
  });
}
