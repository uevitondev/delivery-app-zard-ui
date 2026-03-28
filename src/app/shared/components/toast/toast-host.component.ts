import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@/shared/core/services/toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-4 top-4 z-[1000] flex flex-col items-end gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast
          class="pointer-events-auto"
          [message]="toast.message"
          [type]="toast.type"
        />
      }
    </div>
  `,
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);
}
