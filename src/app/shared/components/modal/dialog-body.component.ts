import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-dialog-body',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-4 text-stone-700 dark:text-stone-200">
      <ng-content />
    </div>
  `,
})
export class DialogBodyComponent {}
