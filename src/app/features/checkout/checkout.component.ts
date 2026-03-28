import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
} from '@/shared/components';
import { ToastService } from '@/shared/core/services/toast.service';
import { PaymentMethodType } from '@/shared/models';
import { CheckoutFacade } from './checkout.facade';

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
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">pagamento seguro</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section class="space-y-5">
            <app-card header="Endereco de entrega">
              <div class="space-y-3">
                @for (address of addressService.addresses(); track address.id) {
                  <button
                    type="button"
                    class="w-full rounded-[24px] border px-4 py-4 text-left transition"
                    [class.border-orange-300]="selectedAddressId() === address.id"
                    [class.bg-orange-50]="selectedAddressId() === address.id"
                    [class.border-stone-200]="selectedAddressId() !== address.id"
                    [class.bg-white]="selectedAddressId() !== address.id"
                    (click)="selectAddress(address.id)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-base font-semibold text-stone-950">
                          {{ address.street }}, {{ address.number }}
                        </p>
                        <p class="mt-1 text-sm text-stone-600">
                          {{ address.neighborhood }}, {{ address.city }} - {{ address.state }}
                        </p>
                        <p class="mt-1 text-sm text-stone-500">CEP {{ address.zipCode }}</p>
                      </div>
                      @if (address.isDefault) {
                        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Padrao
                        </span>
                      }
                    </div>
                  </button>
                }
              </div>

              <div class="mt-5">
                <app-button variant="ghost" [fullWidth]="true" (click)="toggleNewAddressForm()">
                  {{ showNewAddressForm() ? 'Fechar novo endereco' : 'Adicionar novo endereco' }}
                </app-button>
              </div>

              @if (showNewAddressForm()) {
                <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <app-input
                      label="Rua"
                      placeholder="Nome da rua"
                      [(ngModel)]="newAddress.street"
                      name="newStreet"
                    />
                  </div>
                  <app-input
                    label="Numero"
                    placeholder="123"
                    [(ngModel)]="newAddress.number"
                    name="newNumber"
                  />
                  <app-input
                    label="Complemento"
                    placeholder="Apto, bloco, referencia"
                    [(ngModel)]="newAddress.complement"
                    name="newComplement"
                  />
                  <app-input
                    label="Bairro"
                    placeholder="Bairro"
                    [(ngModel)]="newAddress.neighborhood"
                    name="newNeighborhood"
                  />
                  <app-input
                    label="Cidade"
                    placeholder="Cidade"
                    [(ngModel)]="newAddress.city"
                    name="newCity"
                  />
                  <app-input
                    label="CEP"
                    placeholder="12345-678"
                    [(ngModel)]="newAddress.zipCode"
                    name="newZipCode"
                  />
                  <app-select
                    label="Estado"
                    placeholder="Selecione"
                    [options]="stateOptions"
                    [(ngModel)]="newAddress.state"
                    name="newState"
                  />

                  <div class="sm:col-span-2">
                    <app-button
                      [fullWidth]="true"
                      [disabled]="!isNewAddressValid()"
                      (click)="addAndSelectAddress()"
                    >
                      Salvar endereco
                    </app-button>
                  </div>
                </div>
              }
            </app-card>

            <app-card header="Pagamento">
              <div class="space-y-3">
                @for (paymentMethod of profileService.paymentMethods(); track paymentMethod.id) {
                  <button
                    type="button"
                    class="w-full rounded-[24px] border px-4 py-4 text-left transition"
                    [class.border-orange-300]="selectedPaymentMethodId() === paymentMethod.id"
                    [class.bg-orange-50]="selectedPaymentMethodId() === paymentMethod.id"
                    [class.border-stone-200]="selectedPaymentMethodId() !== paymentMethod.id"
                    [class.bg-white]="selectedPaymentMethodId() !== paymentMethod.id"
                    (click)="selectedPaymentMethodId.set(paymentMethod.id)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="font-semibold text-stone-950">{{ paymentMethod.label || formatPaymentMethod(paymentMethod.type) }}</p>
                        <p class="mt-1 text-sm text-stone-500">{{ formatPaymentMethod(paymentMethod.type) }}</p>
                      </div>
                      @if (paymentMethod.isDefault) {
                        <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                          Principal
                        </span>
                      }
                    </div>
                  </button>
                }
              </div>

              <div class="mt-5">
                <app-button variant="ghost" [fullWidth]="true" (click)="toggleNewPaymentForm()">
                  {{ showNewPaymentForm() ? 'Fechar novo metodo' : 'Adicionar metodo de pagamento' }}
                </app-button>
              </div>

              @if (showNewPaymentForm()) {
                <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5">
                  <app-select
                    label="Tipo"
                    placeholder="Selecione"
                    [options]="paymentTypeOptions"
                    [(ngModel)]="newPayment.type"
                    name="paymentType"
                  />
                  <app-input
                    label="Nome exibido"
                    placeholder="Ex.: Visa final 4242"
                    [(ngModel)]="newPayment.label"
                    name="paymentLabel"
                  />
                  <app-input
                    label="Ultimos 4 digitos"
                    placeholder="4242"
                    [(ngModel)]="newPayment.lastDigits"
                    name="paymentDigits"
                  />
                  <app-button
                    [fullWidth]="true"
                    [disabled]="!isNewPaymentValid()"
                    (click)="addPaymentMethod()"
                  >
                    Salvar metodo
                  </app-button>
                </div>
              }
            </app-card>

            <app-card header="Cupom">
              <app-input
                label="Codigo promocional"
                placeholder="Ex.: SAVE10"
                [(ngModel)]="couponCode"
                name="couponCode"
              />

              <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                <app-button variant="secondary" [fullWidth]="true" (click)="applyCoupon()">
                  Aplicar cupom
                </app-button>
                @if (appliedCoupon()) {
                  <app-button variant="ghost" [fullWidth]="true" (click)="removeCoupon()">
                    Remover
                  </app-button>
                }
              </div>

              @if (couponError()) {
                <p class="mt-3 text-sm font-semibold text-red-600">{{ couponError() }}</p>
              }

              @if (appliedCoupon()) {
                <div class="mt-4 rounded-[24px] bg-emerald-50 px-4 py-4">
                  <p class="font-semibold text-emerald-800">{{ appliedCoupon()!.title }}</p>
                  <p class="mt-1 text-sm text-emerald-700">
                    Desconto aplicado: R$ {{ appliedCoupon()!.discount | number: '1.2-2' }}
                  </p>
                </div>
              }
            </app-card>

            <app-card header="Observacoes para entrega">
              <app-textarea
                label="Instrucoes"
                placeholder="Ex.: tocar interfone, sem molho, deixar na portaria..."
                [(ngModel)]="notes"
                name="notes"
                [rows]="5"
              />
            </app-card>
          </section>

          <aside class="xl:sticky xl:top-24 xl:self-start">
            <app-card>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">resumo</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Confirmar pedido</h2>

              <div class="mt-5 space-y-4">
                @for (item of cartService.items(); track item.menuItem.id) {
                  <div class="flex items-center justify-between gap-3 rounded-[22px] bg-stone-50 px-4 py-3">
                    <div>
                      <p class="font-semibold text-stone-900">{{ item.menuItem.name }}</p>
                      <p class="text-sm text-stone-500">{{ item.quantity }}x item</p>
                    </div>
                    <p class="font-semibold text-stone-900">R$ {{ item.subtotal | number: '1.2-2' }}</p>
                  </div>
                }
              </div>

              <div class="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
                <div class="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span class="font-semibold text-stone-900">R$ {{ cartService.subtotal() | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Entrega</span>
                  <span class="font-semibold text-stone-900">R$ {{ cartService.deliveryFee() | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-stone-600">
                  <span>Impostos</span>
                  <span class="font-semibold text-stone-900">R$ {{ cartService.tax() | number: '1.2-2' }}</span>
                </div>
                @if (appliedCoupon()) {
                  <div class="flex justify-between text-emerald-700">
                    <span>Desconto</span>
                    <span class="font-semibold">- R$ {{ appliedCoupon()!.discount | number: '1.2-2' }}</span>
                  </div>
                }
              </div>

              <div class="mt-5 flex items-end justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">total</p>
                  <p class="text-3xl font-semibold tracking-tight text-stone-950">
                    R$ {{ checkoutTotal() | number: '1.2-2' }}
                  </p>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <app-button
                  size="lg"
                  [fullWidth]="true"
                  [disabled]="!isFormValid()"
                  (click)="confirmOrder()"
                >
                  Confirmar pedido
                </app-button>
                <app-button variant="secondary" size="lg" [fullWidth]="true" (click)="goBack()">
                  Voltar
                </app-button>
              </div>
            </app-card>
          </aside>
        </div>
      </main>
    </div>
  `,
})
export class CheckoutComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly facade = inject(CheckoutFacade);
  readonly cartService = this.facade.cartPort;
  readonly addressService = this.facade.addressBook;
  readonly profileService = this.facade.profileStore;
  private readonly toastService = inject(ToastService);
  readonly showNewAddressForm = this.facade.showNewAddressForm;
  readonly showNewPaymentForm = this.facade.showNewPaymentForm;
  readonly selectedAddressId = this.facade.selectedAddressId;
  readonly selectedPaymentMethodId = this.facade.selectedPaymentMethodId;
  readonly notes = this.facade.notes;
  readonly appliedCoupon = this.facade.appliedCoupon;
  readonly couponError = this.facade.couponError;
  get couponCode() {
    return this.facade.couponCode;
  }
  set couponCode(value: string) {
    this.facade.couponCode = value;
  }
  get newAddress() {
    return this.facade.newAddress;
  }
  get newPayment() {
    return this.facade.newPayment;
  }

  stateOptions = [
    { label: 'Sao Paulo', value: 'SP' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Parana', value: 'PR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'Rio Grande do Sul', value: 'RS' },
  ];

  paymentTypeOptions = [
    { label: 'Cartao de Credito', value: PaymentMethodType.CREDIT_CARD },
    { label: 'Cartao de Debito', value: PaymentMethodType.DEBIT_CARD },
    { label: 'PIX', value: PaymentMethodType.PIX },
    { label: 'Dinheiro', value: PaymentMethodType.CASH },
  ];

  checkoutTotal = this.facade.checkoutTotal;

  goBack() {
    this.location.back();
  }

  selectAddress(addressId: string) {
    this.facade.selectAddress(addressId);
  }

  toggleNewAddressForm() {
    this.facade.toggleNewAddressForm();
  }

  toggleNewPaymentForm() {
    this.facade.toggleNewPaymentForm();
  }

  isNewAddressValid() {
    return this.facade.isNewAddressValid();
  }

  isNewPaymentValid() {
    return this.facade.isNewPaymentValid();
  }

  addAndSelectAddress() {
    if (!this.facade.addAndSelectAddress()) return;
    this.toastService.show('Endereco salvo com sucesso.', 'success', 3200, {
      title: 'Endereco atualizado',
      category: 'profile',
      actionLabel: 'Continuar checkout',
      link: '/checkout',
    });
  }

  addPaymentMethod() {
    if (!this.facade.addPaymentMethod()) return;
    this.toastService.show('Metodo de pagamento salvo.', 'success', 3200, {
      title: 'Pagamento atualizado',
      category: 'profile',
      actionLabel: 'Continuar checkout',
      link: '/checkout',
    });
  }

  applyCoupon() {
    const result = this.facade.applyCoupon();
    if (result.appliedCoupon) {
      this.toastService.show('Cupom aplicado com sucesso.', 'success', 3200, {
        title: 'Promocao ativada',
        category: 'promotion',
        actionLabel: 'Ver checkout',
        link: '/checkout',
      });
    } else if (result.error) {
      this.toastService.show(result.error, 'warning', 3200, {
        title: 'Cupom invalido',
        category: 'promotion',
        actionLabel: 'Revisar pedido',
        link: '/checkout',
      });
    }
  }

  removeCoupon() {
    this.facade.removeCoupon();
    this.toastService.show('Cupom removido do pedido.', 'info', 3200, {
      title: 'Promocao removida',
      category: 'promotion',
      actionLabel: 'Ver checkout',
      link: '/checkout',
    });
  }

  isFormValid() {
    return this.facade.isFormValid();
  }

  async confirmOrder() {
    const createdOrder = await this.facade.confirmOrder();
    if (!createdOrder) return;
    this.toastService.show('Pedido criado com sucesso.', 'success', 3200, {
      title: 'Pedido enviado',
      category: 'order',
      actionLabel: 'Acompanhar pedido',
      link: `/orders/${createdOrder.id}`,
    });
    this.router.navigate(['/orders', createdOrder.id]);
  }

  formatPaymentMethod(type: PaymentMethodType) {
    const labels: Record<PaymentMethodType, string> = {
      [PaymentMethodType.CREDIT_CARD]: 'Cartao de credito',
      [PaymentMethodType.DEBIT_CARD]: 'Cartao de debito',
      [PaymentMethodType.PIX]: 'PIX',
      [PaymentMethodType.CASH]: 'Dinheiro',
      [PaymentMethodType.WALLET]: 'Carteira',
    };

    return labels[type];
  }
}
