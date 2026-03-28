import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent, DevBadgeComponent, ToastHostComponent } from '@/shared/components';
import { ZardDarkModeService } from '@/shared/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevBadgeComponent, ToastHostComponent, ButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly darkMode = inject(ZardDarkModeService);
  protected readonly title = signal('deliveryapp-zardui');
  protected readonly themeLabel = computed(() =>
    this.darkMode.resolvedTheme() === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro',
  );
}
