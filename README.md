# Deliveryapp Zard UI

Aplicação Angular de delivery com fluxo de autenticação, listagem de restaurantes, carrinho e pedidos.

## Scripts

```bash
npm start
npm run build
npm test
```

## Autenticação

O projeto usa configuração centralizada em `src/environments/environment*.ts`.

- Em desenvolvimento, `auth.useMock` vem como `true`, então o app sobe já autenticado com um usuário fake.
- Em produção, `auth.useMock` é `false` e o app usa o fluxo OIDC com Keycloak.
- `clientSecret` não deve existir no frontend. Para SPA, configure um cliente público no provedor de identidade.

## Fluxos mockados

Enquanto a API não estiver conectada, alguns serviços seguem em memória:

- pedidos são persistidos apenas no estado da sessão atual da aplicação
- restaurantes e cardápios usam dados mockados
- carrinho e endereços também são mantidos localmente

## Estrutura

- `src/app/features`: telas e fluxos principais
- `src/app/shared/components`: componentes reutilizáveis
- `src/app/shared/core`: serviços, guardas, interceptors e providers
- `src/app/shared/models`: contratos de domínio

## Observações

- O callback de autenticação usa a rota `/auth-redirect`.
- O build de produção usa `src/environments/environment.production.ts` via file replacement.
- Os testes atuais cobrem o bootstrap básico da aplicação e podem ser expandidos conforme os fluxos forem sendo integrados à API.
