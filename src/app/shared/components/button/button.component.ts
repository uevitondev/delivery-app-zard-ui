import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { mergeClasses, type ClassValue } from '@/shared/utils/merge-classes';

export type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'link';
export type ButtonSize =
  | 'default'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'icon'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-lg';
export type ButtonShape = 'default' | 'circle' | 'square';

const buttonBaseClasses =
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
  destructive:
    'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
  ghost:
    'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
  outline:
    'border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
  md: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
  icon: 'size-8',
  'icon-xs': "size-6 rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",
  'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)]',
  'icon-lg': 'size-9',
};

const buttonShapeClasses: Record<ButtonShape, string> = {
  default: 'rounded-md',
  circle: 'rounded-full',
  square: 'rounded-none',
};

export function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  loading: boolean,
  disabled: boolean,
  shape: ButtonShape,
  className?: ClassValue,
) {
  return mergeClasses(
    buttonBaseClasses,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    buttonShapeClasses[shape],
    fullWidth && 'w-full',
    loading && 'pointer-events-none opacity-50',
    disabled && 'pointer-events-none opacity-50',
    className,
  );
}

@Component({
  selector: 'button[z-button], a[z-button]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.type]': 'resolvedType()',
    '[attr.disabled]': 'resolvedDisabled()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
  },
  template: `
    @if (zLoading()) {
      <span class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span>
    }
    <ng-content />
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly zType = input<ButtonVariant>('default');
  readonly zSize = input<ButtonSize>('default');
  readonly zShape = input<ButtonShape>('default');
  readonly zFull = input(false, { transform: booleanAttribute });
  readonly zLoading = input(false, { transform: booleanAttribute });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('', { alias: 'class' });

  protected readonly isDisabled = computed(() => this.disabled() || this.zDisabled());

  protected readonly hostClasses = computed(() =>
    getButtonClasses(
      this.zType(),
      this.zSize(),
      this.zFull(),
      this.zLoading(),
      this.isDisabled(),
      this.zShape(),
      this.class(),
    ),
  );

  protected resolvedType() {
    return this.type();
  }

  protected resolvedDisabled() {
    return this.isDisabled() ? '' : null;
  }
}
