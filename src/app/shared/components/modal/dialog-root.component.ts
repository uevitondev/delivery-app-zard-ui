import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  inject,
  InjectionToken,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export const DIALOG_CONTEXT = new InjectionToken('DialogContext');

export class DialogContext {
  isOpen = signal(false);
  closeOnBackdrop = signal(true);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}

@Component({
  selector: 'z-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DIALOG_CONTEXT,
      useFactory: () => new DialogContext(),
    },
  ],
  template: `
    @if (context.isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-200"
        (click)="context.onBackdropClick()"
        [@.disabled]="true"
      >
        <div
          class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/65 bg-[rgba(255,255,255,0.92)] shadow-xl dark:border-white/10 dark:bg-[rgba(20,20,23,0.94)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  open = input<boolean>(false);
  closeOnBackdrop = input<boolean>(true);

  dismissed = output<void>();
  context: DialogContext = inject(DIALOG_CONTEXT) as DialogContext;

  constructor() {
    // Sincronizar input com context
    this.open() ? this.context.open() : this.context.close();
    this.context.closeOnBackdrop.set(this.closeOnBackdrop());
  }
}
