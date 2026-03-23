import { Component, input, output, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
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

      <textarea
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.required]="required()"
        [rows]="rows()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500 resize-none"
      ></textarea>

      @if (error()) {
        <p class="text-red-600 text-sm mt-1">{{ error() }}</p>
      }
    </div>
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  placeholder = input<string>('');
  label = input<string | undefined>();
  error = input<string | undefined>();
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  rows = input<number>(4);

  value: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar se necessário
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
