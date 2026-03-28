import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-badge',
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
  zType = input<'default' | 'success' | 'warning' | 'danger' | 'destructive' | 'info'>('default');
  zSize = input<'sm' | 'md' | 'lg'>('md');

  badgeClasses() {
    const baseClasses =
      'inline-flex items-center rounded-full border font-semibold tracking-tight backdrop-blur-sm';

    const variantClasses = {
      default: 'border-stone-200 bg-white/80 text-stone-700 dark:border-white/10 dark:bg-white/8 dark:text-stone-200',
      success: 'border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/12 dark:text-emerald-300',
      warning: 'border-amber-200 bg-amber-50/95 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/12 dark:text-amber-300',
      danger: 'border-red-200 bg-red-50/95 text-red-700 dark:border-red-400/20 dark:bg-red-500/12 dark:text-red-300',
      destructive: 'border-red-200 bg-red-50/95 text-red-700 dark:border-red-400/20 dark:bg-red-500/12 dark:text-red-300',
      info: 'border-orange-200 bg-orange-50/95 text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/12 dark:text-orange-300',
    };

    const sizeClasses = {
      sm: 'px-2.5 py-1 text-[11px]',
      md: 'px-3 py-1.5 text-xs',
      lg: 'px-4 py-2 text-sm',
    };

    return `${baseClasses} ${variantClasses[this.zType()]} ${sizeClasses[this.zSize()]}`;
  }
}
