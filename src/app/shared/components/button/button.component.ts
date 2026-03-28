import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { mergeClasses, type ClassValue } from '@/shared/utils/merge-classes';

export type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'link';
export type ButtonSize = 'default' | 'sm' | 'md' | 'lg' | 'icon';

const buttonBaseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55';

const buttonVariantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[linear-gradient(135deg,#ff7a3d_0%,#ff5a36_100%)] text-white shadow-[0_14px_30px_rgba(255,107,53,0.26)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,107,53,0.34)] dark:shadow-[0_14px_36px_rgba(255,115,60,0.24)]',
  secondary:
    'border border-stone-200 bg-white/88 text-stone-800 shadow-[0_8px_22px_rgba(120,70,34,0.08)] hover:-translate-y-0.5 hover:bg-stone-50 dark:border-white/12 dark:bg-white/8 dark:text-stone-100 dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)] dark:hover:bg-white/12',
  destructive:
    'bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] text-white shadow-[0_14px_28px_rgba(220,38,38,0.22)] hover:-translate-y-0.5 dark:shadow-[0_14px_32px_rgba(220,38,38,0.26)]',
  ghost:
    'bg-transparent text-stone-700 hover:bg-white/70 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-white/10 dark:hover:text-white',
  outline:
    'border border-stone-200 bg-transparent text-stone-800 hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/12 dark:text-stone-100 dark:hover:bg-white/10',
  link: 'bg-transparent px-0 text-orange-600 underline-offset-4 hover:underline shadow-none dark:text-orange-300',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 text-sm',
  default: 'min-h-12 px-5 text-sm sm:text-[15px]',
  md: 'min-h-12 px-5 text-sm sm:text-[15px]',
  lg: 'min-h-14 px-6 text-base',
  icon: 'h-11 w-11 rounded-full px-0',
};

export function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: ClassValue,
) {
  return mergeClasses(
    buttonBaseClasses,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

@Component({
  selector: 'button[z-button], a[z-button]',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.type]': 'resolvedType()',
    '[attr.disabled]': 'resolvedDisabled()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
  template: ` <ng-content /> `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly zType = input<ButtonVariant>('default');
  readonly zSize = input<ButtonSize>('default');
  readonly zFull = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('', { alias: 'class' });

  protected readonly hostClasses = computed(() =>
    getButtonClasses(this.zType(), this.zSize(), this.zFull(), this.class()),
  );

  protected resolvedType() {
    return this.type();
  }

  protected resolvedDisabled() {
    return this.disabled() ? true : null;
  }
}
