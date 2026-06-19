import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-dialog-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
      <ng-content />
    </h2>
  `,
})
export class DialogTitleComponent {}
