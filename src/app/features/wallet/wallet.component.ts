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
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">carteira</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Cupons salvos</h1>
            </div>
          </div>
          <app-badge variant="info" size="md">{{ facade.savedCoupons().length }} ativos</app-badge>
        </div>
      </header>

      <main class="app-page py-6">
        @if (facade.savedCoupons().length === 0) {
          <app-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">carteira vazia</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Nenhum cupom salvo ainda</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
                Explore as ofertas e salve cupons para usar no checkout sem perder tempo.
              </p>
              <div class="mt-6 flex justify-center gap-3">
                <app-button size="lg" (click)="goToOffers()">Ver ofertas</app-button>
                <app-button variant="secondary" size="lg" (click)="goToProfile()">Voltar ao perfil</app-button>
              </div>
            </div>
          </app-card>
        } @else {
          <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            @for (coupon of facade.savedCoupons(); track coupon.code) {
              <app-card>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  {{ coupon.code }}
                </p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{{ coupon.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-stone-600">{{ coupon.description }}</p>
                @if (coupon.restaurantName) {
                  <p class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    valido para {{ coupon.restaurantName }}
                  </p>
                }
                <div class="mt-5 flex flex-wrap gap-3">
                  <app-button size="sm" (click)="goToCheckout()">Usar no checkout</app-button>
                  <app-button variant="ghost" size="sm" (click)="removeCoupon(coupon.code)">
                    Remover
                  </app-button>
                </div>
              </app-card>
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
