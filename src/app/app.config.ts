import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { provideZard } from '@/shared/core/provider/providezard';
import { httpAuthInterceptor } from './shared/core/interceptors/http-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZard(),
    provideHttpClient(withInterceptors([httpAuthInterceptor])),
    provideOAuthClient(),
  ],
};
