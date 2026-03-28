import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-quantity-picker',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <label class="mb-3 block text-sm font-semibold text-stone-900 dark:text-stone-100">Quantidade</label>

      <div class="flex items-center gap-4 mb-4">
        <button z-button
          zType="secondary"
          zSize="md"
          [disabled]="quantity() <= 1"
          (click)="decreaseQuantity()"
        >
          −
        </button>

        <div class="flex-1 text-center">
          <span class="text-2xl font-bold text-stone-900 dark:text-stone-100">{{ quantity() }}</span>
        </div>

        <button z-button zType="secondary" zSize="md" (click)="increaseQuantity()"> + </button>
      </div>

      <!-- Total price -->
      <div class="mb-4 rounded-[22px] bg-stone-50 p-3 text-center dark:bg-white/6">
        <p class="mb-1 text-sm text-stone-600 dark:text-stone-300">Total</p>
        <p class="text-2xl font-bold text-stone-900 dark:text-stone-100">
          R$ {{ basePrice() * quantity() | number: '1.2-2' }}
        </p>
      </div>
    </div>
  `,
})
export class QuantityPickerComponent {
  basePrice = input.required<number>();
  initialQuantity = input<number>(1);

  quantity = signal<number>(1);
  quantityChanged = output<number>();

  increaseQuantity() {
    const newQuantity = this.quantity() + 1;
    this.quantity.set(newQuantity);
    this.quantityChanged.emit(newQuantity);
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      const newQuantity = this.quantity() - 1;
      this.quantity.set(newQuantity);
      this.quantityChanged.emit(newQuantity);
    }
  }
}
