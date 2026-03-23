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
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <app-loading />
        <h1 class="text-2xl font-bold mb-4 mt-8">Processando autenticação...</h1>
        <p class="text-gray-600">Você será redirecionado em um momento.</p>
      </div>
    </div>
  `,
})
export class AuthRedirectComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Redirecionar após autenticação ser processada
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      const isLoading = this.authService.loading();

      // Aguardar até que o loading termine
      if (!isLoading) {
        setTimeout(() => {
          if (isAuthenticated) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/login']);
          }
        }, 1000);
      }
    });
  }
}
