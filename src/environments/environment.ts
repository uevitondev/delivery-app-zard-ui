export const environment = {
  production: false,
  keycloak: {
    issuer: 'http://localhost:8080/realms/deliveryapp',
    clientId: 'deliveryapp-client',
    clientSecret: 'your-client-secret', // Use variáveis de ambiente em produção
  },
};
