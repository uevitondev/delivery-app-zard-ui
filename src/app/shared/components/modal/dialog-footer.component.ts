import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-dialog-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-white/8">
      <ng-content />
    </div>
  `,
})
export class DialogFooterComponent {}
