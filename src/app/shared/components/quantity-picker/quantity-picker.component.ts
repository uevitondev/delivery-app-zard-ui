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
      <label class="block text-sm font-semibold text-gray-900 mb-3">Quantidade</label>

      <div class="flex items-center gap-4 mb-4">
        <app-button
          variant="secondary"
          size="md"
          [disabled]="quantity() <= 1"
          (click)="decreaseQuantity()"
        >
          −
        </app-button>

        <div class="text-center flex-1">
          <span class="text-2xl font-bold text-gray-900">{{ quantity() }}</span>
        </div>

        <app-button variant="secondary" size="md" (click)="increaseQuantity()"> + </app-button>
      </div>

      <!-- Total price -->
      <div class="bg-gray-50 rounded-lg p-3 text-center mb-4">
        <p class="text-sm text-gray-600 mb-1">Total</p>
        <p class="text-2xl font-bold text-gray-900">
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
