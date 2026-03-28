import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'z-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
        (click)="onBackdropClick()"
      >
        <div
          class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/65 bg-[rgba(255,255,255,0.92)] shadow-xl dark:border-white/10 dark:bg-[rgba(20,20,23,0.94)]"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          @if (title()) {
            <div class="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-white/8">
              <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{{ title() }}</h2>
              <button (click)="close()" class="text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-100">
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
          <div class="px-6 py-4 text-stone-700 dark:text-stone-200">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter()) {
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-white/8">
              <button z-button zType="secondary" (click)="close()">
                {{ cancelLabel() }}
              </button>
              <button z-button zType="default" (click)="onConfirm()">
                {{ confirmLabel() }}
              </button>
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
