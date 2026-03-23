import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '@/shared/core/services/cart.service';
import { OrderService } from '@/shared/core/services/order.service';
import { AddressService } from '@/shared/core/services/address.service';
import { Address, OrderStatus, PaymentMethod } from '@/shared/models';
import {
  CardComponent,
  ButtonComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
} from '@/shared/components';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button (click)="goBack()" class="text-2xl hover:text-blue-600 transition-colors mr-4">
            ←
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulário -->
          <div class="lg:col-span-2">
            <!-- Seleção de Endereço -->
            <app-card header="📍 Endereço de Entrega" class="mb-6">
              <!-- Listar endereços existentes -->
              <div class="space-y-3 mb-6">
                @for (address of addressService.addresses(); track address.id) {
                  <div
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all"
                    [ngClass]="{
                      'border-blue-600 bg-blue-50': selectedAddressId() === address.id,
                      'border-gray-300 hover:border-gray-400': selectedAddressId() !== address.id,
                    }"
                    (click)="selectAddress(address.id)"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-semibold text-gray-900">
                          {{ address.street }}, {{ address.number }}
                          @if (address.complement) {
                            <span class="text-gray-600">- {{ address.complement }}</span>
                          }
                        </p>
                        <p class="text-sm text-gray-600">
                          {{ address.neighborhood }}, {{ address.city }} - {{ address.state }}
                        </p>
                        <p class="text-sm text-gray-600">CEP: {{ address.zipCode }}</p>
                      </div>
                      @if (address.isDefault) {
                        <span class="text-xs bg-green-600 text-white px-2 py-1 rounded"
                          >Padrão</span
                        >
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Botão para adicionar novo endereço -->
              <app-button
                variant="ghost"
                size="md"
                [fullWidth]="true"
                (click)="toggleNewAddressForm()"
              >
                {{ showNewAddressForm() ? '✕ Cancelar' : '+ Novo Endereço' }}
              </app-button>

              <!-- Formulário de novo endereço -->
              @if (showNewAddressForm()) {
                <div class="mt-6 pt-6 border-t border-gray-300 space-y-4">
                  <h3 class="font-semibold text-gray-900">Cadastrar Novo Endereço</h3>

                  <app-input
                    label="Rua"
                    placeholder="Nome da rua"
                    [(ngModel)]="newAddress.street"
                    name="newStreet"
                  />

                  <div class="grid grid-cols-2 gap-4">
                    <app-input
                      label="Número"
                      placeholder="123"
                      [(ngModel)]="newAddress.number"
                      name="newNumber"
                    />
                    <app-input
                      label="Complemento"
                      placeholder="Apt 42..."
                      [(ngModel)]="newAddress.complement"
                      name="newComplement"
                    />
                  </div>

                  <app-input
                    label="Bairro"
                    placeholder="Bairro"
                    [(ngModel)]="newAddress.neighborhood"
                    name="newNeighborhood"
                  />

                  <div class="grid grid-cols-2 gap-4">
                    <app-input
                      label="Cidade"
                      placeholder="São Paulo"
                      [(ngModel)]="newAddress.city"
                      name="newCity"
                    />
                    <app-input
                      label="CEP"
                      placeholder="12345-678"
                      [(ngModel)]="newAddress.zipCode"
                      name="newZipCode"
                    />
                  </div>

                  <app-select
                    label="Estado"
                    placeholder="-- Selecione --"
                    [options]="stateOptions"
                    [(ngModel)]="newAddress.state"
                    name="newState"
                  />

                  <app-button
                    variant="primary"
                    size="md"
                    [fullWidth]="true"
                    [disabled]="!isNewAddressValid()"
                    (click)="addAndSelectAddress()"
                  >
                    Adicionar e Selecionar
                  </app-button>
                </div>
              }
            </app-card>

            <!-- Método de Pagamento -->
            <app-card header="💳 Método de Pagamento" class="mb-6">
              <app-select
                label="Selecione um método"
                placeholder="-- Selecione --"
                [options]="paymentOptions"
                [(ngModel)]="selectedPaymentMethod"
                name="paymentMethod"
              />
            </app-card>

            <!-- Observações -->
            <app-card header="📝 Observações" class="mb-6">
              <app-textarea
                label="Observações especiais"
                placeholder="Informações adicionais para o entregador..."
                [(ngModel)]="notes"
                name="notes"
                [rows]="4"
              />
            </app-card>
          </div>

          <!-- Resumo do Pedido -->
          <div class="lg:col-span-1">
            <app-card header="📦 Resumo do Pedido" class="sticky top-24">
              <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-semibold">
                    R$ {{ cartService.subtotal() | number: '1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Entrega</span>
                  <span class="font-semibold">
                    R$ {{ cartService.deliveryFee() | number: '1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Impostos (10%)</span>
                  <span class="font-semibold"> R$ {{ cartService.tax() | number: '1.2-2' }} </span>
                </div>
                <div class="border-t border-gray-200 pt-3 flex justify-between">
                  <span class="font-bold text-gray-900">Total</span>
                  <span class="font-bold text-lg text-blue-600">
                    R$ {{ cartService.total() | number: '1.2-2' }}
                  </span>
                </div>
              </div>

              <app-button
                variant="primary"
                size="lg"
                [fullWidth]="true"
                [disabled]="!isFormValid()"
                (click)="confirmOrder()"
              >
                Confirmar Pedido
              </app-button>

              <app-button
                variant="ghost"
                size="md"
                [fullWidth]="true"
                class="mt-3"
                (click)="goBack()"
              >
                Continuar Comprando
              </app-button>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  readonly addressService = inject(AddressService);

  // Signals
  showNewAddressForm = signal(false);
  selectedAddressId = signal<string | null>(null);
  selectedPaymentMethod = signal('');
  notes = signal('');

  // Novo endereço
  newAddress = {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: '',
  };

  // Opções para os selects
  stateOptions = [
    { label: 'São Paulo', value: 'SP' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'Rio Grande do Sul', value: 'RS' },
  ];

  paymentOptions = [
    { label: 'Cartão de Crédito', value: 'credit_card' },
    { label: 'Cartão de Débito', value: 'debit_card' },
    { label: 'PIX', value: 'pix' },
    { label: 'Dinheiro', value: 'cash' },
  ];

  constructor() {
    // Selecionar o endereço padrão ao iniciar
    const defaultAddr = this.addressService.defaultAddress();
    if (defaultAddr) {
      this.selectedAddressId.set(defaultAddr.id);
    }
  }

  goBack() {
    this.location.back();
  }

  selectAddress(addressId: string) {
    this.selectedAddressId.set(addressId);
    this.addressService.selectAddress(addressId);
  }

  toggleNewAddressForm() {
    this.showNewAddressForm.update((value) => !value);
    if (this.showNewAddressForm()) {
      this.resetNewAddressForm();
    }
  }

  resetNewAddressForm() {
    this.newAddress = {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: '',
    };
  }

  isNewAddressValid(): boolean {
    return (
      this.newAddress.street.trim().length > 0 &&
      this.newAddress.number.trim().length > 0 &&
      this.newAddress.neighborhood.trim().length > 0 &&
      this.newAddress.city.trim().length > 0 &&
      this.newAddress.zipCode.trim().length > 0
    );
  }

  addAndSelectAddress() {
    if (!this.isNewAddressValid()) return;

    const newAddr = this.addressService.addAddress({
      street: this.newAddress.street,
      number: this.newAddress.number,
      complement: this.newAddress.complement || undefined,
      neighborhood: this.newAddress.neighborhood,
      city: this.newAddress.city,
      state: this.newAddress.state,
      zipCode: this.newAddress.zipCode,
      isDefault: false,
    });

    this.selectedAddressId.set(newAddr.id);
    this.addressService.selectAddress(newAddr.id);
    this.showNewAddressForm.set(false);
    this.resetNewAddressForm();
  }

  isFormValid(): boolean {
    return this.selectedAddressId() !== null && this.selectedPaymentMethod().length > 0;
  }

  confirmOrder() {
    if (!this.isFormValid()) return;

    const selectedAddr = this.addressService.selectedAddress();
    if (!selectedAddr) return;

    // Mapear CartItems para OrderItems
    const orderItems = this.cartService.items().map((cartItem) => ({
      menuItem: cartItem.menuItem,
      quantity: cartItem.quantity,
      notes: cartItem.notes,
      price: cartItem.menuItem.price,
    }));

    // Criar pedido
    const order = {
      id: Date.now().toString(),
      restaurantId: this.cartService.cart()?.restaurantId || '',
      userId: 'user-123', // Obter do AuthService em produção
      items: orderItems,
      status: OrderStatus.PENDING,
      subtotal: this.cartService.subtotal(),
      deliveryFee: this.cartService.deliveryFee(),
      tax: this.cartService.tax(),
      total: this.cartService.total(),
      deliveryAddress: selectedAddr,
      createdAt: new Date(),
      paymentMethod: {
        id: Date.now().toString(),
        type: this.selectedPaymentMethod() as any,
        isDefault: true,
      } as PaymentMethod,
      notes: this.notes() || undefined,
    };

    // Salvar pedido
    this.orderService.createOrder(order);

    // Limpar carrinho
    this.cartService.clearCart();

    // Redirecionar
    this.router.navigate(['/orders', order.id]);
  }
}
