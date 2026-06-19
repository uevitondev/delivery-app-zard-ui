import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-dialog-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-white/8">
      <ng-content />
    </div>
  `,
})
export class DialogHeaderComponent {}
