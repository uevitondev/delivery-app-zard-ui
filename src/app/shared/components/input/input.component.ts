import { Component, input, output, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
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

      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.required]="required()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="w-full rounded-[22px] border border-stone-200 bg-white/88 px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:bg-stone-100 disabled:text-stone-400"
      />

      @if (error()) {
        <p class="mt-2 text-sm text-red-600">{{ error() }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  type = input<string>('text');
  placeholder = input<string>('');
  label = input<string | undefined>();
  error = input<string | undefined>();
  disabled = input<boolean>(false);
  required = input<boolean>(false);

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
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
