import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent } from '@/shared/components';
import { ToastService } from '@/shared/core/services/toast.service';
import { WalletFacade } from './wallet.facade';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
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
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">carteira</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Cupons salvos</h1>
            </div>
          </div>
          <z-badge zType="info" zSize="md">{{ facade.savedCoupons().length }} ativos</z-badge>
        </div>
      </header>

      <main class="app-page py-6">
        @if (facade.savedCoupons().length === 0) {
          <z-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">carteira vazia</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Nenhum cupom salvo ainda</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
                Explore as ofertas e salve cupons para usar no checkout sem perder tempo.
              </p>
              <div class="mt-6 flex justify-center gap-3">
                <button z-button zSize="lg" (click)="goToOffers()">Ver ofertas</button>
                <button z-button zType="secondary" zSize="lg" (click)="goToProfile()">Voltar ao perfil</button>
              </div>
            </div>
          </z-card>
        } @else {
          <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            @for (coupon of facade.savedCoupons(); track coupon.code) {
              <z-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  {{ coupon.code }}
                </p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">{{ coupon.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{{ coupon.description }}</p>
                @if (coupon.restaurantName) {
                  <p class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
                    valido para {{ coupon.restaurantName }}
                  </p>
                }
                <div class="mt-5 flex flex-wrap gap-3">
                  <button z-button zSize="sm" (click)="goToCheckout()">Usar no checkout</button>
                  <button z-button zType="ghost" zSize="sm" (click)="removeCoupon(coupon.code)">
                    Remover
                  </button>
                </div>
              </z-card>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class WalletComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly facade = inject(WalletFacade);

  goBack() {
    this.location.back();
  }

  goToOffers() {
    this.router.navigate(['/offers']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  removeCoupon(couponCode: string) {
    this.facade.removeCoupon(couponCode);
    this.toastService.show('Cupom removido da carteira.', 'info', 3200, {
      title: 'Carteira promocional',
      category: 'promotion',
      actionLabel: 'Ver ofertas',
      link: '/offers',
    });
  }
}
