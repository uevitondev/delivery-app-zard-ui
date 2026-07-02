import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  signal,
  computed,
  output,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

export class SelectContext {
  isOpen = signal(false);
  selectedValue = signal<string | number | null>(null);
  options = signal<SelectOption[]>([]);
  placeholder = signal<string>('');
  disabled = signal(false);

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  close() {
    this.isOpen.set(false);
  }

  selectOption(value: string | number) {
    this.selectedValue.set(value);
    this.close();
  }
}

@Component({
  selector: 'z-select',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectRootComponent),
      multi: true,
    },
    {
      provide: SelectContext,
      useFactory: () => new SelectContext(),
    },
  ],
  template: `
    <div class="relative w-full" [class.opacity-50]="disabled()">
      <ng-content />
    </div>
  `,
  host: {
    class: 'block',
  },
})
export class SelectRootComponent implements ControlValueAccessor, OnInit {
  options = input<SelectOption[]>([]);
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  zValue = input<string | number | null>(null);
  zLabel = input<string>('');

  valueChanged = output<string | number>();
  zSelectionChange = output<string | number>();

  private onChange = (value: string | number) => {};
  private onTouched = () => {};

  constructor(public context: SelectContext) {
    effect(() => {
      this.context.options.set(this.options());
      this.context.placeholder.set(this.zLabel() || this.placeholder());
      this.context.disabled.set(this.disabled());
      this.context.selectedValue.set(this.zValue() ?? null);
    });
  }

  ngOnInit() {
    this.context.options.set(this.options());
    this.context.placeholder.set(this.placeholder());
    this.context.disabled.set(this.disabled());
  }

  writeValue(value: string | number | null): void {
    this.context.selectedValue.set(value || null);
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.context.disabled.set(isDisabled);
  }

  selectValue(value: string | number) {
    this.context.selectOption(value);
    this.onChange(value);
    this.valueChanged.emit(value);
    this.zSelectionChange.emit(value);
    this.onTouched();
  }
}
