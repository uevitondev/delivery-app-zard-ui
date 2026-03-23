import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/shared/core/services/auth.service';

@Component({
  selector: 'app-dev-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (authService.user()) {
      <div
        class="fixed bottom-4 left-4 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg z-50"
      >
        <div>🔧 MODO DEV: Mock Auth Ativo</div>
        <div class="text-xs mt-1">Usuário: {{ authService.user()?.preferred_username }}</div>
      </div>
    }
  `,
})
export class DevBadgeComponent {
  readonly authService = inject(AuthService);
}
