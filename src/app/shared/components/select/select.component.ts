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
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          {{ label() }}
        </label>
      }

      <select
        [disabled]="disabled()"
        [attr.required]="required()"
        [value]="value"
        (change)="onSelectionChange($event)"
        (blur)="onBlur()"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500"
      >
        @if (placeholder()) {
          <option value="">{{ placeholder() }}</option>
        }

        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>

      @if (error()) {
        <p class="text-red-600 text-sm mt-1">{{ error() }}</p>
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
