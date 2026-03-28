import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
  },
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
    const baseClasses =
      'inline-flex items-center rounded-full border font-semibold tracking-tight backdrop-blur-sm';

    const variantClasses = {
      default: 'border-stone-200 bg-white/80 text-stone-700',
      success: 'border-emerald-200 bg-emerald-50/95 text-emerald-700',
      warning: 'border-amber-200 bg-amber-50/95 text-amber-700',
      danger: 'border-red-200 bg-red-50/95 text-red-700',
      info: 'border-orange-200 bg-orange-50/95 text-orange-700',
    };

    const sizeClasses = {
      sm: 'px-2.5 py-1 text-[11px]',
      md: 'px-3 py-1.5 text-xs',
      lg: 'px-4 py-2 text-sm',
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]}`;
  }
}
