import { Injectable, inject, effect, computed, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

// 🔧 MODO DE DESENVOLVIMENTO: Altere para false para usar autenticação real via Keycloak
const USE_MOCK_AUTH = true;

const MOCK_USER: AuthUser = {
  sub: '550e8400-e29b-41d4-a716-446655440000',
  email: 'demo@deliveryapp.com',
  name: 'Demo User',
  preferred_username: 'demo_user',
};

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
  private readonly oauthService = inject(OAuthService);

  // Signals para state
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly loadingSignal = signal<boolean>(true);

  // Exposição pública como computed (read-only)
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly user = computed(() => this.userSignal());
  readonly loading = computed(() => this.loadingSignal());

  // Derived computed signal
  readonly username = computed(() => this.user()?.preferred_username ?? '');

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // 🔧 Modo Mock - Autenticação para desenvolvimento
    if (USE_MOCK_AUTH) {
      console.log('🔧 MODO DE DESENVOLVIMENTO: Usando autenticação mock');
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(MOCK_USER);
      this.loadingSignal.set(false);
      return;
    }

    // Configurar OIDC (Modo Real)
    this.oauthService.configure({
      clientId: 'deliveryapp-client',
      redirectUri: window.location.origin,
      silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,
      scope: 'openid profile email',
      issuer: 'http://localhost:8080/realms/deliveryapp', // URL do Keycloak
      strictDiscoveryDocumentValidation: false,
      sessionChecksEnabled: true,
      showDebugInformation: true,
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
        this.oauthService.silentRefresh();
      }

      if (event.type === 'logout') {
        this.updateAuthState();
      }
    });
  }

  private async tryLogin() {
    if (this.oauthService.hasValidAccessToken()) {
      this.updateAuthState();
    } else {
      const hasHashFragment = window.location.hash.length > 0;
      if (hasHashFragment) {
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
    const isAuthenticated = this.oauthService.hasValidAccessToken();
    this.isAuthenticatedSignal.set(isAuthenticated);

    if (isAuthenticated) {
      const claims = this.oauthService.getIdentityClaims() as AuthUser;
      this.userSignal.set(claims);
    } else {
      this.userSignal.set(null);
    }
  }

  login() {
    if (USE_MOCK_AUTH) {
      // No modo mock, login é instantâneo
      this.isAuthenticatedSignal.set(true);
      this.userSignal.set(MOCK_USER);
      return;
    }
    this.oauthService.initCodeFlow();
  }

  logout() {
    if (USE_MOCK_AUTH) {
      // No modo mock, apenas limpa os dados locais
      this.isAuthenticatedSignal.set(false);
      this.userSignal.set(null);
      return;
    }
    this.oauthService.logOut();
    this.isAuthenticatedSignal.set(false);
    this.userSignal.set(null);
  }

  getAccessToken(): string | null {
    if (USE_MOCK_AUTH) {
      // Retorna um token fake para desenvolvimento
      return 'mock-token-' + Date.now();
    }
    return this.oauthService.getAccessToken();
  }
}
