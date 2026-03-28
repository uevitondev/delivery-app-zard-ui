import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  SelectComponent,
  TextareaComponent,
  ZardInputDirective,
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
    SelectComponent,
    TextareaComponent,
    ZardInputDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">pagamento seguro</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section class="space-y-5">
            <z-card zTitle="Endereco de entrega">
              <div class="space-y-3">
                @for (address of addressService.addresses(); track address.id) {
                  <button
                    type="button"
                    class="w-full rounded-[24px] border px-4 py-4 text-left transition"
                    [class.border-orange-300]="selectedAddressId() === address.id"
                    [class.bg-orange-50]="selectedAddressId() === address.id"
                    [class.border-stone-200]="selectedAddressId() !== address.id"
                    [class.bg-white]="selectedAddressId() !== address.id"
                    [class.dark:border-white/10]="selectedAddressId() !== address.id"
                    [class.dark:bg-white/6]="selectedAddressId() !== address.id"
                    [class.dark:bg-orange-500/12]="selectedAddressId() === address.id"
                    (click)="selectAddress(address.id)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-base font-semibold text-stone-950 dark:text-stone-100">
                          {{ address.street }}, {{ address.number }}
                        </p>
                        <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">
                          {{ address.neighborhood }}, {{ address.city }} - {{ address.state }}
                        </p>
                        <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">CEP {{ address.zipCode }}</p>
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
                <button z-button zType="ghost" [zFull]="true" (click)="toggleNewAddressForm()">
                  {{ showNewAddressForm() ? 'Fechar novo endereco' : 'Adicionar novo endereco' }}
                </button>
              </div>

              @if (showNewAddressForm()) {
                <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5 dark:border-white/8 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Rua</label>
                    <input
                      z-input
                      placeholder="Nome da rua"
                      [(ngModel)]="newAddress.street"
                      name="newStreet"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Numero</label>
                    <input z-input placeholder="123" [(ngModel)]="newAddress.number" name="newNumber" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Complemento</label>
                    <input
                      z-input
                      placeholder="Apto, bloco, referencia"
                      [(ngModel)]="newAddress.complement"
                      name="newComplement"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Bairro</label>
                    <input z-input placeholder="Bairro" [(ngModel)]="newAddress.neighborhood" name="newNeighborhood" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Cidade</label>
                    <input z-input placeholder="Cidade" [(ngModel)]="newAddress.city" name="newCity" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">CEP</label>
                    <input z-input placeholder="12345-678" [(ngModel)]="newAddress.zipCode" name="newZipCode" />
                  </div>
                  <z-select
                    label="Estado"
                    placeholder="Selecione"
                    [options]="stateOptions"
                    [(ngModel)]="newAddress.state"
                    name="newState"
                  />

                  <div class="sm:col-span-2">
                    <button z-button
                      [zFull]="true"
                      [disabled]="!isNewAddressValid()"
                      (click)="addAndSelectAddress()"
                    >
                      Salvar endereco
                    </button>
                  </div>
                </div>
              }
            </z-card>

            <z-card zTitle="Pagamento">
              <div class="space-y-3">
                @for (paymentMethod of profileService.paymentMethods(); track paymentMethod.id) {
                  <button
                    type="button"
                    class="w-full rounded-[24px] border px-4 py-4 text-left transition"
                    [class.border-orange-300]="selectedPaymentMethodId() === paymentMethod.id"
                    [class.bg-orange-50]="selectedPaymentMethodId() === paymentMethod.id"
                    [class.border-stone-200]="selectedPaymentMethodId() !== paymentMethod.id"
                    [class.bg-white]="selectedPaymentMethodId() !== paymentMethod.id"
                    [class.dark:border-white/10]="selectedPaymentMethodId() !== paymentMethod.id"
                    [class.dark:bg-white/6]="selectedPaymentMethodId() !== paymentMethod.id"
                    [class.dark:bg-orange-500/12]="selectedPaymentMethodId() === paymentMethod.id"
                    (click)="selectedPaymentMethodId.set(paymentMethod.id)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="font-semibold text-stone-950 dark:text-stone-100">{{ paymentMethod.label || formatPaymentMethod(paymentMethod.type) }}</p>
                        <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">{{ formatPaymentMethod(paymentMethod.type) }}</p>
                      </div>
                      @if (paymentMethod.isDefault) {
                        <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-white/8 dark:text-stone-300">
                          Principal
                        </span>
                      }
                    </div>
                  </button>
                }
              </div>

              <div class="mt-5">
                <button z-button zType="ghost" [zFull]="true" (click)="toggleNewPaymentForm()">
                  {{ showNewPaymentForm() ? 'Fechar novo metodo' : 'Adicionar metodo de pagamento' }}
                </button>
              </div>

              @if (showNewPaymentForm()) {
                <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5 dark:border-white/8">
                  <z-select
                    label="Tipo"
                    placeholder="Selecione"
                    [options]="paymentTypeOptions"
                    [(ngModel)]="newPayment.type"
                    name="paymentType"
                  />
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">Nome exibido</label>
                    <input
                      z-input
                      placeholder="Ex.: Visa final 4242"
                      [(ngModel)]="newPayment.label"
                      name="paymentLabel"
                    />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">
                      Ultimos 4 digitos
                    </label>
                    <input
                      z-input
                      placeholder="4242"
                      [(ngModel)]="newPayment.lastDigits"
                      name="paymentDigits"
                    />
                  </div>
                  <button z-button
                    [zFull]="true"
                    [disabled]="!isNewPaymentValid()"
                    (click)="addPaymentMethod()"
                  >
                    Salvar metodo
                  </button>
                </div>
              }
            </z-card>

            <z-card zTitle="Cupom">
              <div>
                <label class="mb-2 block text-sm font-semibold tracking-tight text-stone-800 dark:text-stone-200">
                  Codigo promocional
                </label>
                <input z-input placeholder="Ex.: SAVE10" [(ngModel)]="couponCode" name="couponCode" />
              </div>

              <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                <button z-button zType="secondary" [zFull]="true" (click)="applyCoupon()">
                  Aplicar cupom
                </button>
                @if (appliedCoupon()) {
                  <button z-button zType="ghost" [zFull]="true" (click)="removeCoupon()">
                    Remover
                  </button>
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
            </z-card>

            <z-card zTitle="Observacoes para entrega">
              <z-textarea
                label="Instrucoes"
                placeholder="Ex.: tocar interfone, sem molho, deixar na portaria..."
                [(ngModel)]="notes"
                name="notes"
                [rows]="5"
              />
            </z-card>
          </section>

          <aside class="xl:sticky xl:top-24 xl:self-start">
            <z-card>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">resumo</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Confirmar pedido</h2>

              <div class="mt-5 space-y-4">
                @for (item of cartService.items(); track item.menuItem.id) {
                  <div class="flex items-center justify-between gap-3 rounded-[22px] bg-stone-50 px-4 py-3 dark:bg-white/6">
                    <div>
                      <p class="font-semibold text-stone-900 dark:text-stone-100">{{ item.menuItem.name }}</p>
                      <p class="text-sm text-stone-500 dark:text-stone-400">{{ item.quantity }}x item</p>
                    </div>
                    <p class="font-semibold text-stone-900 dark:text-stone-100">R$ {{ item.subtotal | number: '1.2-2' }}</p>
                  </div>
                }
              </div>

              <div class="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm dark:border-white/8">
                <div class="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>Subtotal</span>
                  <span class="font-semibold text-stone-900 dark:text-stone-100">R$ {{ cartService.subtotal() | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>Entrega</span>
                  <span class="font-semibold text-stone-900 dark:text-stone-100">R$ {{ cartService.deliveryFee() | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>Impostos</span>
                  <span class="font-semibold text-stone-900 dark:text-stone-100">R$ {{ cartService.tax() | number: '1.2-2' }}</span>
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
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">total</p>
                  <p class="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">
                    R$ {{ checkoutTotal() | number: '1.2-2' }}
                  </p>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <button z-button
                  zSize="lg"
                  [zFull]="true"
                  [disabled]="!isFormValid()"
                  (click)="confirmOrder()"
                >
                  Confirmar pedido
                </button>
                <button z-button zType="secondary" zSize="lg" [zFull]="true" (click)="goBack()">
                  Voltar
                </button>
              </div>
            </z-card>
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
