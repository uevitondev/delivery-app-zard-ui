import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="onBackdropClick()"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          @if (title()) {
            <div class="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
              <button (click)="close()" class="text-gray-500 hover:text-gray-700 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          }

          <!-- Content -->
          <div class="px-6 py-4">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter()) {
            <div class="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <app-button variant="secondary" (click)="close()">
                {{ cancelLabel() }}
              </app-button>
              <app-button variant="primary" (click)="onConfirm()">
                {{ confirmLabel() }}
              </app-button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string | undefined>();
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  showFooter = input<boolean>(true);
  closeOnBackdrop = input<boolean>(true);

  confirm = output<void>();
  dismiss = output<void>();

  onConfirm() {
    this.confirm.emit();
    this.close();
  }

  close() {
    this.dismiss.emit();
  }

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}
