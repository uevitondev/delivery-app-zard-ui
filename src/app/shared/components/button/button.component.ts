import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
  },
  template: `
    <button
      [attr.type]="type()"
      [attr.disabled]="disabled() ? true : null"
      [class]="buttonClasses()"
      (click)="click.emit()"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  click = output<void>();

  buttonClasses() {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55';

    const variantClasses = {
      primary:
        'bg-[linear-gradient(135deg,#ff7a3d_0%,#ff5a36_100%)] text-white shadow-[0_14px_30px_rgba(255,107,53,0.26)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,107,53,0.34)]',
      secondary:
        'border border-stone-200 bg-white/88 text-stone-800 shadow-[0_8px_22px_rgba(120,70,34,0.08)] hover:-translate-y-0.5 hover:bg-stone-50',
      danger:
        'bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] text-white shadow-[0_14px_28px_rgba(220,38,38,0.22)] hover:-translate-y-0.5',
      ghost:
        'bg-transparent text-stone-700 hover:bg-white/70 hover:text-stone-950',
    };

    const sizeClasses = {
      sm: 'min-h-10 px-4 text-sm',
      md: 'min-h-12 px-5 text-sm sm:text-[15px]',
      lg: 'min-h-14 px-6 text-base',
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${widthClass}`;
  }
}
