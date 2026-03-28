import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/shared/core/services/auth.service';
import { LoadingComponent } from '@/shared/components';

@Component({
  selector: 'app-auth-redirect',
  standalone: true,
  imports: [LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell flex items-center justify-center px-4 py-8">
      <div class="app-surface max-w-md px-8 py-10 text-center">
        <app-loading />
        <h1 class="mt-6 text-2xl font-semibold tracking-tight text-stone-950">Processando autenticacao...</h1>
        <p class="mt-3 text-sm leading-6 text-stone-600">Estamos concluindo seu acesso e redirecionando para o app.</p>
      </div>
    </div>
  `,
})
export class AuthRedirectComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      const isLoading = this.authService.loading();

      if (!isLoading) {
        const returnUrl = this.authService.consumeReturnUrl() ?? '/dashboard';

        if (isAuthenticated) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
