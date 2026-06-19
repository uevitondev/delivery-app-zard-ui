import { ChangeDetectionStrategy, Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectContext } from './select-root.component';

@Component({
  selector: 'z-select-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="context.isOpen() ? 'block' : 'hidden'">
      <div
        class="absolute top-full left-0 right-0 z-50 mt-2 rounded-[16px] border border-stone-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-stone-950/95"
        role="listbox"
      >
        <div class="max-h-48 overflow-y-auto py-2">
          <ng-content />
        </div>
      </div>

      <!-- Backdrop para fechar ao clicar fora -->
      @if (context.isOpen()) {
        <div class="fixed inset-0 z-40" (click)="context.close()"></div>
      }
    </div>
  `,
  host: {
    class: 'absolute w-full',
    '[style.pointer-events]': 'context.isOpen() ? "auto" : "none"',
  },
})
export class SelectContentComponent {
  context = inject(SelectContext);

  @HostListener('keydown.escape')
  onEscape() {
    this.context.close();
  }
}
