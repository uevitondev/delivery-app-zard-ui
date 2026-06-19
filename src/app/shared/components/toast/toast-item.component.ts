import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from './toast.service';

@Component({
  selector: 'z-toast-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="getClasses()"
      class="flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto"
      role="alert"
      [attr.aria-live]="toast().type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Icon -->
      <div class="flex-shrink-0 mt-0.5">
        @switch (toast().type) {
          @case ('success') {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          @case ('error') {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-8l2 2m0 0l2 2m-2-2l-2-2m2 2l2 2M9 12a9 9 0 1118 0 9 9 0 01-18 0z"
              ></path>
            </svg>
          }
          @case ('info') {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          @case ('warning') {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
        }
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        @if (toast().title) {
          <p class="font-semibold text-sm">{{ toast().title }}</p>
        }
        <p class="text-sm opacity-95">{{ toast().message }}</p>
      </div>

      <!-- Close button -->
      <button
        type="button"
        (click)="dismiss.emit()"
        class="flex-shrink-0 ml-2 inline-flex text-current opacity-70 hover:opacity-100 transition"
        aria-label="Close notification"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
})
export class ToastItemComponent {
  toast = input.required<Toast>();
  dismiss = output<void>();

  getClasses(): Record<string, boolean> {
    const typeMap: Record<string, Record<string, boolean>> = {
      success: {
        'bg-emerald-500/90 text-white': true,
        'dark:bg-emerald-600/90': true,
      },
      error: {
        'bg-red-500/90 text-white': true,
        'dark:bg-red-600/90': true,
      },
      info: {
        'bg-blue-500/90 text-white': true,
        'dark:bg-blue-600/90': true,
      },
      warning: {
        'bg-amber-500/90 text-white': true,
        'dark:bg-amber-600/90': true,
      },
    };

    return typeMap[this.toast().type] || typeMap['info'];
  }
}
