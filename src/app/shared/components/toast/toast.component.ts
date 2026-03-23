import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="getClasses()"
      class="fixed px-6 py-4 rounded-lg shadow-lg text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
      role="alert"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        @switch (type()) {
          @case ('success') {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          @case ('error') {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-8l2 2m0 0l2 2m-2-2l-2-2m2 2l2 2M9 12a9 9 0 1118 0 9 9 0 01-18 0z"
              ></path>
            </svg>
          }
          @case ('info') {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          @case ('warning') {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <!-- Message -->
      <span class="text-sm font-medium">{{ message() }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        top: 1.5rem;
        right: 1.5rem;
        z-index: 9999;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          transform: translateY(-1rem);
        }
        to {
          transform: translateY(0);
        }
      }

      .animate-in {
        animation:
          fadeIn 0.3s ease-out,
          slideIn 0.3s ease-out;
      }
    `,
  ],
})
export class ToastComponent {
  message = input<string>('');
  type = input<'success' | 'error' | 'info' | 'warning'>('info');

  getClasses(): Record<string, boolean> {
    const baseClasses = {
      'bg-green-500': this.type() === 'success',
      'bg-red-500': this.type() === 'error',
      'bg-blue-500': this.type() === 'info',
      'bg-yellow-500': this.type() === 'warning',
    };

    return baseClasses;
  }
}
