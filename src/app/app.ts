import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent, ConnectivityBannerComponent, DevBadgeComponent, ToasterComponent } from '@/shared/components';
import { ZardDarkModeService } from '@/shared/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevBadgeComponent, ToasterComponent, ButtonComponent, ConnectivityBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly darkMode = inject<ZardDarkModeService>(ZardDarkModeService);

  protected readonly themeLabel = computed(() => {
    const mode = this.darkMode.mode();
    switch (mode) {
      case 'system':
        return 'Modo sistema (prefere tema do sistema). Clique para tema claro';
      case 'light':
        return 'Modo claro ativo. Clique para tema escuro';
      case 'dark':
        return 'Modo escuro ativo. Clique para tema sistema';
    }
  });
}