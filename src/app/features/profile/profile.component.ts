import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '@/shared/core/services/auth.service';
import { CardComponent, ButtonComponent } from '@/shared/components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white shadow-sm">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <button (click)="goBack()" class="text-2xl hover:text-blue-600 transition-colors mr-4">
            ←
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Perfil</h1>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-8">
        <!-- User Info Card -->
        <app-card class="mb-4">
          <div class="flex items-center gap-4 mb-6">
            <div class="text-5xl">👤</div>
            <div>
              <p class="text-2xl font-bold text-gray-900">
                {{ authService.user()?.name }}
              </p>
              <p class="text-gray-600">{{ authService.user()?.email }}</p>
            </div>
          </div>

          <app-button variant="danger" size="lg" [fullWidth]="true" (click)="logout()">
            Fazer logout
          </app-button>
        </app-card>

        <!-- Coming Soon -->
        <app-card>
          <h2 class="text-lg font-bold mb-4 text-gray-900">Seções - Em desenvolvimento</h2>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-center gap-2">
              <span>📍</span>
              <span>Endereços</span>
            </li>
            <li class="flex items-center gap-2">
              <span>💳</span>
              <span>Métodos de Pagamento</span>
            </li>
            <li class="flex items-center gap-2">
              <span>⭐</span>
              <span>Restaurantes Favoritos</span>
            </li>
            <li class="flex items-center gap-2">
              <span>⚙️</span>
              <span>Configurações</span>
            </li>
          </ul>
        </app-card>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly authService = inject(AuthService);

  goBack() {
    this.location.back();
  }

  logout() {
    if (confirm('Deseja fazer logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
