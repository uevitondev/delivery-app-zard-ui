import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastItemComponent } from './toast-item.component';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

@Component({
  selector: 'z-toaster',
  standalone: true,
  imports: [CommonModule, ToastItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="getPositionClasses()"
      class="fixed z-[9999] flex flex-col gap-2 p-4 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toastService.toasts$(); track toast.id) {
        <z-toast-item
          [toast]="toast"
          (dismiss)="toastService.dismiss(toast.id)"
        />
      }
    </div>
  `,
})
export class ToasterComponent {
  position = input<ToastPosition>('top-right');
  toastService = inject(ToastService);

  getPositionClasses(): string {
    const positionMap: Record<ToastPosition, string> = {
      'top-left': 'top-4 left-4 flex-col',
      'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col',
      'top-right': 'top-4 right-4 flex-col',
      'bottom-left': 'bottom-4 left-4 flex-col-reverse',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse',
      'bottom-right': 'bottom-4 right-4 flex-col-reverse',
    };

    return positionMap[this.position()];
  }
}
