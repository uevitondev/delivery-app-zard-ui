import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@/shared/core/services/auth.service';
import { CardComponent, ButtonComponent } from '@/shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <z-card>
          <div class="text-center">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#ff8a55_0%,#ff5a36_100%)] text-2xl font-bold text-white shadow-[0_18px_34px_rgba(255,107,53,0.24)]">
              Z
            </div>
            <p class="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">bem-vindo de volta</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Entre para continuar</h1>
            <p class="mt-3 text-sm leading-6 text-stone-600">
              Uma interface moderna de delivery, pronta para web desktop e mobile.
            </p>

            <button z-button class="mt-8" zType="default" zSize="lg" [zFull]="true" (click)="login()">
              Login com Keycloak
            </button>

            <div class="mt-5">
              <p class="text-sm text-stone-500">Voce sera redirecionado para o provedor de identidade.</p>
            </div>
          </div>
        </z-card>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
    if (redirectTo) {
      this.authService.setReturnUrl(redirectTo);
    }

    effect(() => {
      if (this.authService.isAuthenticated()) {
        const returnUrl = this.authService.consumeReturnUrl() ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  login() {
    this.authService.login(this.route.snapshot.queryParamMap.get('redirectTo') ?? undefined);
  }
}
