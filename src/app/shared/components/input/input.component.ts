import { Directive, booleanAttribute, input } from '@angular/core';
import { mergeClasses, type ClassValue } from '@/shared/utils/merge-classes';

const inputBaseClasses =
  'w-full rounded-[22px] border border-stone-200 bg-white/88 px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:bg-stone-100 disabled:text-stone-400 dark:border-white/10 dark:bg-white/6 dark:text-stone-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:placeholder:text-stone-500 dark:focus:border-orange-400 dark:focus:ring-orange-500/20 dark:disabled:bg-white/4 dark:disabled:text-stone-500';

export function getInputClasses(className?: ClassValue) {
  return mergeClasses(inputBaseClasses, className);
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

  protected resolvedDisabled() {
    return this.disabled() ? true : null;
  }

  protected resolvedRequired() {
    return this.required() ? true : null;
  }

  protected classes() {
    return getInputClasses(this.class());
  }
}
