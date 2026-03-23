import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 focus:ring-blue-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-400 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 focus:ring-red-500',
      ghost:
        'bg-transparent text-gray-900 hover:bg-gray-100 disabled:text-gray-400 focus:ring-gray-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${widthClass}`;
  }
}
