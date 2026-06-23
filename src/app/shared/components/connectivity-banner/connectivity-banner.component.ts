import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connectivity-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connectivity-banner.component.html',
  styleUrl: './connectivity-banner.component.css',
})
export class ConnectivityBannerComponent {
  // Estado de conectividade
  readonly isOnline = signal<boolean>(navigator.onLine);
  readonly showBanner = signal<boolean>(false);
  readonly pendingRequests = signal<number>(0);

  constructor() {
    // Detectar mudanças no status de conexão
    effect(() => {
      const online = this.isOnline();
      this.showBanner.set(!online);

      // Se voltou online, esconder banner após 2s
      if (online) {
        setTimeout(() => {
          this.showBanner.set(false);
        }, 2000);
      }
    });

    // Listeners de eventos de conectividade
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline.set(true);
  };

  private handleOffline = () => {
    this.isOnline.set(false);
  };

  retryConnection() {
    // Tentar recarregar a página ou reenviar requisições pendentes
    window.location.reload();
  }
}