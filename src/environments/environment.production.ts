export const environment = {
  production: true,
  auth: {
    useMock: false,
    issuer: 'http://localhost:8080/realms/deliveryapp',
    clientId: 'deliveryapp-client',
    scope: 'openid profile email',
    strictDiscoveryDocumentValidation: false,
    sessionChecksEnabled: true,
    showDebugInformation: false,
    mockUser: {
      sub: '550e8400-e29b-41d4-a716-446655440000',
      email: 'demo@deliveryapp.com',
      name: 'Demo User',
      preferred_username: 'demo_user',
    },
  },
};
