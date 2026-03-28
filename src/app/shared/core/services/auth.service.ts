import { Injectable, computed, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../../environments/environment';

const RETURN_URL_STORAGE_KEY = 'deliveryapp.returnUrl';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly oauthService = inject(OAuthService, { optional: true });
  private readonly initializationPromise: Promise<void>;

  // Signals para state
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly loadingSignal = signal<boolean>(true);

  // Exposição pública como computed (read-only)
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly user = computed(() => this.userSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly isMockMode = computed(() => environment.auth.useMock);

  // Derived computed signal
  readonly username = computed(() => this.user()?.preferred_username ?? '');

  constructor() {
    this.initializationPromise = this.initializeAuth();
  }

  private async initializeAuth() {
    if (this.isMockMode()) {
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(environment.auth.mockUser);
      this.loadingSignal.set(false);
      return;
    }

    if (!this.oauthService) {
      console.error('OAuthService não foi fornecido para o modo de autenticação real.');
      this.loadingSignal.set(false);
      return;
    }

    // Configurar OIDC (Modo Real)
    this.oauthService.configure({
      issuer: environment.auth.issuer,
      clientId: environment.auth.clientId,
      redirectUri:environment.auth.redirectUri,
      postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
      responseType: environment.auth.responseType,
      scope: environment.auth.scope,
      showDebugInformation: environment.auth.showDebugInformation,
      strictDiscoveryDocumentValidation: environment.auth.strictDiscoveryDocumentValidation,
      sessionChecksEnabled: environment.auth.sessionChecksEnabled,
      silentRefreshRedirectUri: environment.auth.silentRefreshRedirectUri, 
    });

    try {
      // Carregar discovery document
      await this.oauthService.loadDiscoveryDocument();
      await this.tryLogin();
    } catch (error) {
      console.error('Erro ao inicializar OAuth:', error);
    } finally {
      this.loadingSignal.set(false);
    }

    // Monitorar eventos de autenticação
    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received') {
        this.updateAuthState();
      }

      if (event.type === 'token_expires') {
        this.oauthService?.silentRefresh();
      }

      if (event.type === 'logout') {
        this.updateAuthState();
      }
    });
  }

  private async tryLogin() {
    if (!this.oauthService) {
      return;
    }

    if (this.oauthService.hasValidAccessToken()) {
      this.updateAuthState();
    } else {
      const hasOAuthResponse =
        window.location.search.includes('code=') ||
        window.location.search.includes('state=') ||
        window.location.hash.length > 0;

      if (hasOAuthResponse) {
        try {
          await this.oauthService.tryLogin();
          this.updateAuthState();
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          this.updateAuthState();
        }
      }
    }
  }

  private updateAuthState() {
    if (!this.oauthService) {
      this.isAuthenticatedSignal.set(false);
      this.userSignal.set(null);
      return;
    }

    const isAuthenticated = this.oauthService.hasValidAccessToken();
    this.isAuthenticatedSignal.set(isAuthenticated);

    if (isAuthenticated) {
      const claims = this.oauthService.getIdentityClaims() as AuthUser;
      this.userSignal.set(claims);
    } else {
      this.userSignal.set(null);
    }
  }

  async whenReady() {
    await this.initializationPromise;
  }

  login(returnUrl?: string) {
    if (returnUrl) {
      this.setReturnUrl(returnUrl);
    }

    if (this.isMockMode()) {
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(environment.auth.mockUser);
      return;
    }

    if (!this.oauthService) {
      console.error('OAuthService indisponível para iniciar login.');
      return;
    }

    this.oauthService.initCodeFlow();
  }

  logout() {
    if (this.isMockMode()) {
      this.isAuthenticatedSignal.set(false);
      this.userSignal.set(null);
      return;
    }

    if (!this.oauthService) {
      return;
    }

    this.oauthService.logOut();
    this.isAuthenticatedSignal.set(false);
    this.userSignal.set(null);
  }

  getAccessToken(): string | null {
    if (this.isMockMode()) {
      return 'mock-token';
    }

    return this.oauthService?.getAccessToken() || null;
  }

  setReturnUrl(url: string) {
    sessionStorage.setItem(RETURN_URL_STORAGE_KEY, url);
  }

  consumeReturnUrl() {
    const url = sessionStorage.getItem(RETURN_URL_STORAGE_KEY);
    sessionStorage.removeItem(RETURN_URL_STORAGE_KEY);
    return url;
  }
}
