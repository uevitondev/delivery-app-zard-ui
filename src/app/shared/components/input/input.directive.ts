import { Directive, booleanAttribute, input, signal } from '@angular/core';
import { mergeClasses, type ClassValue } from '@/shared/utils/merge-classes';

const inputBaseClasses =
  'flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const inputSizeClasses: Record<string, string> = {
  default: 'h-9',
  sm: 'h-8',
  lg: 'h-10',
};

export function getInputClasses(size?: string, className?: ClassValue) {
  return mergeClasses(
    inputBaseClasses,
    size ? inputSizeClasses[size] || inputSizeClasses['default'] : inputSizeClasses['default'],
    className,
  );
}

@Directive({
  selector: 'input[z-input], textarea[z-input]',
  standalone: true,
  host: {
    '[attr.disabled]': 'resolvedDisabled()',
    '[attr.required]': 'resolvedRequired()',
    '[class]': 'classes()',
  },
})
export class ZardInputDirective {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly class = input<ClassValue>('', { alias: 'class' });
  readonly size = signal('default');

  protected resolvedDisabled() {
    return this.disabled() ? true : null;
  }

  protected resolvedRequired() {
    return this.required() ? true : null;
  }

  protected classes() {
    return getInputClasses(this.size(), this.class());
  }

  disable(disabled: boolean) {
    // Will be handled by host binding
  }

  setDataSlot(slot: string) {
    // metadata method
  }

  getType(): 'default' | 'textarea' {
    return 'default';
  }
}