import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@/shared/core/services/auth.service';
import { CardComponent, ButtonComponent, ZardInputDirective } from '@/shared/components';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, ZardInputDirective],
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

            <div class="mt-6 grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1 text-sm dark:border-white/10 dark:bg-white/5">
              <button
                z-button
                type="button"
                [zType]="authService.isMockMode() ? 'default' : 'ghost'"
                zSize="sm"
                (click)="setAuthMode(true)"
              >
                Mock
              </button>
              <button
                z-button
                type="button"
                [zType]="authService.isMockMode() ? 'ghost' : 'default'"
                zSize="sm"
                (click)="setAuthMode(false)"
              >
                Keycloak
              </button>
            </div>

            @if (authService.isMockMode()) {
              <form class="mt-8 space-y-4 text-left" (ngSubmit)="login()">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200" for="username">
                    Usuario
                  </label>
                  <input
                    z-input
                    id="username"
                    name="username"
                    autocomplete="username"
                    [(ngModel)]="username"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200" for="password">
                    Senha
                  </label>
                  <input
                    z-input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    [(ngModel)]="password"
                  />
                </div>

                @if (errorMessage()) {
                  <p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
                    {{ errorMessage() }}
                  </p>
                }

                <button z-button zType="default" zSize="lg" [zFull]="true" type="submit">
                  Entrar em modo teste
                </button>
              </form>

              <div class="mt-5 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-left text-sm text-orange-800 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-200">
                <p class="font-semibold">Usuario mock</p>
                <p>{{ mockUsername }}</p>
                <p class="mt-1 font-semibold">Senha</p>
                <p>{{ mockPassword }}</p>
              </div>
            } @else {
              <button z-button class="mt-8" zType="default" zSize="lg" [zFull]="true" (click)="login()">
                Login com Keycloak
              </button>

              <div class="mt-5">
                <p class="text-sm text-stone-500">Voce sera redirecionado para o provedor de identidade.</p>
              </div>
            }
          </div>
        </z-card>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected username = environment.auth.mockUser.email;
  protected password = environment.auth.mockUser.password;
  protected readonly mockUsername = environment.auth.mockUser.email;
  protected readonly mockPassword = environment.auth.mockUser.password;
  protected readonly errorMessage = signal('');

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
    this.errorMessage.set('');
    const success = this.authService.login(this.route.snapshot.queryParamMap.get('redirectTo') ?? undefined, {
      username: this.username,
      password: this.password,
    });

    if (!success && this.authService.isMockMode()) {
      this.errorMessage.set('Usuario ou senha mock invalidos.');
    }
  }

  setAuthMode(useMock: boolean) {
    this.errorMessage.set('');
    this.authService.setMockMode(useMock);
  }
}
