import { Component, input, output, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800">
          {{ label() }}
        </label>
      }

      <select
        [disabled]="disabled()"
        [attr.required]="required()"
        [value]="value"
        (change)="onSelectionChange($event)"
        (blur)="onBlur()"
        class="w-full rounded-[22px] border border-stone-200 bg-white/88 px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:bg-stone-100 disabled:text-stone-400"
      >
        @if (placeholder()) {
          <option value="">{{ placeholder() }}</option>
        }

        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>

      @if (error()) {
        <p class="mt-2 text-sm text-red-600">{{ error() }}</p>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  options = input<SelectOption[]>([]);
  placeholder = input<string>('');
  label = input<string | undefined>();
  error = input<string | undefined>();
  disabled = input<boolean>(false);
  required = input<boolean>(false);

  value: string | number = '';
  private onChange = (value: string | number) => {};
  private onTouched = () => {};

  writeValue(value: string | number): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar se necessário
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;

    // Tentar converter para número se for possível
    const numericValue = Number(selectedValue);
    const finalValue = isNaN(numericValue) ? selectedValue : numericValue;

    this.value = finalValue;
    this.onChange(finalValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
