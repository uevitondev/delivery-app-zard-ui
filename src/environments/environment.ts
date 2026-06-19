export const environment = {
  production: false,
  auth: {
    useMock: true,
    issuer: 'http://localhost:8080/realms/delivery-platform',
    clientId: 'frontend-app',
    scope: 'web-origins openid email profile',
    redirectUri: `${window.location.origin}/auth-redirect`,
    postLogoutRedirectUri: `${window.location.origin}/`,
    responseType: 'code',
    strictDiscoveryDocumentValidation: false,
    silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,
    sessionChecksEnabled: true,
    showDebugInformation: true,
    mockUser: {
      sub: '550e8400-e29b-41d4-a716-446655440000',
      email: 'demo@deliveryapp.com',
      name: 'Demo User',
      preferred_username: 'demo_user',
      password: 'demo123',
    },
  },
};
