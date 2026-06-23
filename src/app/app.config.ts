import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { provideZard } from '@/shared/core/provider/providezard';
import { httpAuthInterceptor } from './shared/core/interceptors/http-auth.interceptor';
import { httpRetryInterceptor } from './shared/core/interceptors/http-retry.interceptor';
import { provideDomainAdapters } from '@/shared/core/contracts/domain-tokens';
import { ToastService } from '@/shared/components/toast/toast.service';
import { ErrorBoundaryComponent } from '@/shared/components/error-boundary/error-boundary.component';
import { initWebVitals } from '@/shared/utils/web-vitals';
import { PushNotificationsService } from '@/shared/core/services/push-notifications.service';
import { BackgroundSyncService } from '@/shared/core/services/background-sync.service';

// Error Handler customizado
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    console.error('Global Error:', error);

    // Em produção, enviar para serviço de monitoramento (Sentry, etc)
    if (typeof window !== 'undefined') {
      // TODO: Enviar para backend
      // this.logErrorToBackend(error);
    }

    // Não quebrar a aplicação
    throw error;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideZard(),
    ...provideDomainAdapters(),
    provideHttpClient(withInterceptors([httpAuthInterceptor, httpRetryInterceptor])),
    provideOAuthClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ToastService,
    PushNotificationsService,
    BackgroundSyncService,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};

// Inicializar Web Vitals quando a app carregar
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initWebVitals();
  });
}