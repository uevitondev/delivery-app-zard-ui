import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClasses()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  variant = input<'default' | 'success' | 'warning' | 'danger' | 'info'>('default');
  size = input<'sm' | 'md' | 'lg'>('md');

  badgeClasses() {
    const baseClasses = 'inline-flex items-center rounded-full font-semibold';

    const variantClasses = {
      default: 'bg-gray-200 text-gray-900',
      success: 'bg-green-200 text-green-900',
      warning: 'bg-yellow-200 text-yellow-900',
      danger: 'bg-red-200 text-red-900',
      info: 'bg-blue-200 text-blue-900',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]}`;
  }
}
