import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/shared/core/services/auth.service';
import { CardComponent, ButtonComponent } from '@/shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div class="w-full max-w-md">
        <app-card>
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2 text-gray-900">DeliveryApp</h1>
            <p class="text-gray-600 mb-8">Faça login para continuar</p>

            <app-button variant="primary" size="lg" [fullWidth]="true" (click)="login()">
              Login com Keycloak
            </app-button>

            <div class="mt-6">
              <p class="text-sm text-gray-500">Você será redirecionado para o Keycloak</p>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Usar effect ao invés de subscribe
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  login() {
    this.authService.login();
  }
}
