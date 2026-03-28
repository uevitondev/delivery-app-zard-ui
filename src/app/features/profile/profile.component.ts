import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputComponent,
  SelectComponent,
} from '@/shared/components';
import { AddressService } from '@/shared/core/services/address.service';
import { AuthService } from '@/shared/core/services/auth.service';
import { ProfileService } from '@/shared/core/services/profile.service';
import { PromotionService } from '@/shared/core/services/promotion.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';
import { ToastService } from '@/shared/core/services/toast.service';
import { PaymentMethodType } from '@/shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    InputComponent,
    SelectComponent,
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
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">conta</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        <div class="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div class="space-y-6">
            <app-card>
              <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div class="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#ff8a55_0%,#ff5a36_100%)] text-3xl font-semibold text-white shadow-[0_18px_34px_rgba(255,107,53,0.24)]">
                  {{ getInitials() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">usuario ativo</p>
                  <h2 class="mt-1 text-3xl font-semibold tracking-tight text-stone-950">
                    {{ authService.user()?.name }}
                  </h2>
                  <p class="mt-2 text-sm text-stone-600">{{ authService.user()?.email }}</p>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <app-badge variant="success" size="md">Conta autenticada</app-badge>
                    @if (authService.isMockMode()) {
                      <app-badge variant="warning" size="md">Modo mock</app-badge>
                    }
                  </div>
                </div>
              </div>

              <div class="mt-8 grid gap-3 sm:grid-cols-3">
                <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">enderecos</p>
                  <p class="mt-2 text-2xl font-semibold text-stone-950">{{ addressService.addresses().length }}</p>
                </div>
                <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">pagamentos</p>
                  <p class="mt-2 text-2xl font-semibold text-stone-950">{{ profileService.paymentMethods().length }}</p>
                </div>
                <div class="rounded-[24px] bg-stone-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">favoritos</p>
                  <p class="mt-2 text-2xl font-semibold text-stone-950">{{ profileService.favoriteRestaurantIds().length }}</p>
                </div>
              </div>
            </app-card>

            @if (!profileService.hasCompletedOnboarding()) {
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">onboarding rapido</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Personalize sua vitrine</h3>
                <p class="mt-2 text-sm leading-6 text-stone-600">
                  Escolha uma cozinha favorita para deixar o app mais alinhado com o seu estilo de pedido.
                </p>

                <div class="mt-5 flex flex-wrap gap-2">
                  @for (cuisine of cuisineOptions; track cuisine) {
                    <app-button
                      size="sm"
                      [variant]="selectedCuisine() === cuisine ? 'primary' : 'secondary'"
                      (click)="selectedCuisine.set(cuisine)"
                    >
                      {{ cuisine }}
                    </app-button>
                  }
                </div>

                <div class="mt-5">
                  <app-button [fullWidth]="true" (click)="completeOnboarding()">Salvar preferencia</app-button>
                </div>
              </app-card>
            } @else {
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">preferencia principal</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                  {{ profileService.preferredCuisine() || 'Sem preferencia definida' }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-stone-600">
                  Essa preferencia pode orientar a descoberta de restaurantes nas proximas etapas do app.
                </p>
              </app-card>
            }

            <app-card header="Restaurantes favoritos">
              @if (profileService.favoriteRestaurants().length === 0) {
                <p class="text-sm text-stone-600">Voce ainda nao favoritou restaurantes.</p>
              } @else {
                <div class="space-y-3">
                  @for (restaurant of profileService.favoriteRestaurants(); track restaurant.id) {
                    <button
                      type="button"
                      (click)="goToRestaurant(restaurant.id)"
                      class="flex w-full items-center justify-between rounded-[22px] bg-stone-50 px-4 py-4 text-left transition hover:bg-stone-100"
                    >
                      <div>
                        <p class="font-semibold text-stone-900">{{ restaurant.name }}</p>
                        <p class="mt-1 text-sm text-stone-600">{{ restaurant.category }} · {{ restaurant.deliveryTime }} min</p>
                      </div>
                      <span class="text-lg text-orange-500">♥</span>
                    </button>
                  }
                </div>
              }
            </app-card>

            <app-card header="Pratos favoritos">
              @if (profileService.favoriteMenuItems().length === 0) {
                <p class="text-sm text-stone-600">Salve pratos para repetir seus pedidos mais rapido.</p>
              } @else {
                <div class="space-y-3">
                  @for (item of profileService.favoriteMenuItems(); track item.id) {
                    <div class="rounded-[22px] bg-stone-50 px-4 py-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="font-semibold text-stone-900">{{ item.name }}</p>
                          <p class="mt-1 text-sm text-stone-600">
                            {{ getRestaurantName(item.restaurantId) }} · {{ item.category }}
                          </p>
                        </div>
                        <p class="font-semibold text-stone-950">R$ {{ item.price | number: '1.2-2' }}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </app-card>
          </div>

          <div class="space-y-6">
            <app-card header="Carteira de cupons">
              @if (savedCoupons().length === 0) {
                <p class="text-sm text-stone-600">Salve cupons na home ou no restaurante para acessar aqui.</p>
              } @else {
                <div class="space-y-3">
                  @for (coupon of savedCoupons(); track coupon.code) {
                    <div class="rounded-[22px] bg-stone-50 px-4 py-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="font-semibold text-stone-900">{{ coupon.code }}</p>
                          <p class="mt-1 text-sm text-stone-600">{{ coupon.title }}</p>
                          <p class="mt-1 text-xs uppercase tracking-[0.18em] text-orange-500">
                            {{ getCouponMeta(coupon) }}
                          </p>
                        </div>
                        <app-button variant="ghost" size="sm" (click)="removeSavedCoupon(coupon.code)">
                          Remover
                        </app-button>
                      </div>
                    </div>
                  }
                </div>
              }
            </app-card>

            <app-card header="Metodos de pagamento">
              <div class="space-y-3">
                @for (paymentMethod of profileService.paymentMethods(); track paymentMethod.id) {
                  <div class="rounded-[22px] bg-stone-50 px-4 py-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="font-semibold text-stone-900">
                          {{ paymentMethod.label || formatPaymentMethod(paymentMethod.type) }}
                        </p>
                        <p class="mt-1 text-sm text-stone-500">
                          {{ formatPaymentMethod(paymentMethod.type) }}
                          @if (paymentMethod.lastDigits) {
                            <span> · final {{ paymentMethod.lastDigits }}</span>
                          }
                        </p>
                      </div>
                      @if (paymentMethod.isDefault) {
                        <app-badge variant="info" size="sm">Principal</app-badge>
                      }
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                      @if (!paymentMethod.isDefault) {
                        <app-button variant="secondary" size="sm" (click)="setDefaultPayment(paymentMethod.id)">
                          Tornar principal
                        </app-button>
                      }
                      <app-button variant="ghost" size="sm" (click)="removePayment(paymentMethod.id)">
                        Remover
                      </app-button>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-5">
                <app-button variant="ghost" [fullWidth]="true" (click)="togglePaymentForm()">
                  {{ showPaymentForm() ? 'Fechar novo metodo' : 'Adicionar metodo' }}
                </app-button>
              </div>

              @if (showPaymentForm()) {
                <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5">
                  <app-select
                    label="Tipo"
                    placeholder="Selecione"
                    [options]="paymentTypeOptions"
                    [(ngModel)]="newPayment.type"
                    name="newPaymentType"
                  />
                  <app-input
                    label="Nome exibido"
                    placeholder="Ex.: Mastercard final 7788"
                    [(ngModel)]="newPayment.label"
                    name="newPaymentLabel"
                  />
                  <app-input
                    label="Ultimos 4 digitos"
                    placeholder="7788"
                    [(ngModel)]="newPayment.lastDigits"
                    name="newPaymentDigits"
                  />
                  <app-button [fullWidth]="true" [disabled]="!isNewPaymentValid()" (click)="addPaymentMethod()">
                    Salvar metodo
                  </app-button>
                </div>
              }
            </app-card>

            <app-card>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">sessao</p>
              <h3 class="mt-2 text-xl font-semibold tracking-tight text-stone-950">Encerrar acesso</h3>
              <p class="mt-2 text-sm leading-6 text-stone-600">
                Saia da sua conta quando quiser. O app continuara responsivo e seguro.
              </p>

              <div class="mt-5">
                <app-button variant="danger" size="lg" [fullWidth]="true" (click)="logout()">
                  Fazer logout
                </app-button>
                <app-button class="mt-3" variant="secondary" size="lg" [fullWidth]="true" (click)="goToFavorites()">
                  Ver favoritos
                </app-button>
                <app-button class="mt-3" variant="ghost" size="lg" [fullWidth]="true" (click)="goToFavoriteItems()">
                  Ver pratos salvos
                </app-button>
                <app-button class="mt-3" variant="ghost" size="lg" [fullWidth]="true" (click)="goToWallet()">
                  Abrir carteira de cupons
                </app-button>
              </div>
            </app-card>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class ProfileComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly authService = inject(AuthService);
  readonly profileService = inject(ProfileService);
  readonly addressService = inject(AddressService);
  private readonly promotionService = inject(PromotionService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly toastService = inject(ToastService);

  showPaymentForm = signal(false);
  selectedCuisine = signal('Italiana');
  newPayment = {
    type: PaymentMethodType.CREDIT_CARD,
    label: '',
    lastDigits: '',
  };
  readonly cuisineOptions = ['Italiana', 'Japonesa', 'Fastfood', 'Saudavel', 'Brasileira'];
  readonly savedCoupons = computed(() =>
    this.profileService.getSavedCoupons(this.promotionService.getAvailableCoupons()),
  );

  paymentTypeOptions = [
    { label: 'Cartao de credito', value: PaymentMethodType.CREDIT_CARD },
    { label: 'Cartao de debito', value: PaymentMethodType.DEBIT_CARD },
    { label: 'PIX', value: PaymentMethodType.PIX },
    { label: 'Dinheiro', value: PaymentMethodType.CASH },
  ];

  goBack() {
    this.location.back();
  }

  logout() {
    if (confirm('Deseja fazer logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getInitials() {
    const name = this.authService.user()?.name || 'Usuario';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  goToRestaurant(restaurantId: string) {
    this.router.navigate(['/restaurant', restaurantId]);
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToFavoriteItems() {
    this.router.navigate(['/favorite-items']);
  }

  goToWallet() {
    this.router.navigate(['/wallet']);
  }

  completeOnboarding() {
    this.profileService.completeOnboarding(this.selectedCuisine());
    this.toastService.show('Preferencias salvas com sucesso.', 'success', 3200, {
      title: 'Perfil personalizado',
      category: 'profile',
      actionLabel: 'Explorar home',
      link: '/home',
    });
  }

  togglePaymentForm() {
    this.showPaymentForm.update((value) => !value);
    if (!this.showPaymentForm()) {
      this.resetPaymentForm();
    }
  }

  isNewPaymentValid() {
    return this.newPayment.label.trim().length > 0;
  }

  addPaymentMethod() {
    if (!this.isNewPaymentValid()) return;

    this.profileService.addPaymentMethod({
      type: this.newPayment.type,
      label: this.newPayment.label,
      lastDigits: this.newPayment.lastDigits || undefined,
      isDefault: this.profileService.paymentMethods().length === 0,
    });

    this.showPaymentForm.set(false);
    this.resetPaymentForm();
    this.toastService.show('Metodo de pagamento adicionado.', 'success', 3200, {
      title: 'Carteira atualizada',
      category: 'profile',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }

  setDefaultPayment(paymentMethodId: string) {
    this.profileService.setDefaultPaymentMethod(paymentMethodId);
    this.toastService.show('Metodo principal atualizado.', 'success', 3200, {
      title: 'Carteira atualizada',
      category: 'profile',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }

  removePayment(paymentMethodId: string) {
    this.profileService.removePaymentMethod(paymentMethodId);
    this.toastService.show('Metodo removido.', 'info', 3200, {
      title: 'Carteira atualizada',
      category: 'profile',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }

  resetPaymentForm() {
    this.newPayment = {
      type: PaymentMethodType.CREDIT_CARD,
      label: '',
      lastDigits: '',
    };
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

  getRestaurantName(restaurantId: string) {
    return this.restaurantService.getRestaurantById(restaurantId)?.name || 'Restaurante parceiro';
  }

  getCouponMeta(coupon: { minSubtotal?: number; restaurantId?: string; value: number; type: string }) {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% off`;
    }

    if (coupon.type === 'fixed') {
      return `R$ ${coupon.value.toFixed(2)} off`;
    }

    return 'Frete gratis';
  }

  removeSavedCoupon(couponCode: string) {
    this.profileService.removeSavedCoupon(couponCode);
    this.toastService.show('Cupom removido da carteira.', 'info', 3200, {
      title: 'Carteira promocional',
      category: 'promotion',
      actionLabel: 'Ver perfil',
      link: '/profile',
    });
  }
}
