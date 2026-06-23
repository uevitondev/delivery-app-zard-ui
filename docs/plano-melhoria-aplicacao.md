# 📋 Plano de Elevação do Nível da Aplicação

## 🎯 Visão Geral

Transformar o **deliveryapp-zardui** em um produto **Premium** com nível de produção comparável a iFood e Uber Eats, mantendo a arquitetura limpa existente e adicionando camadas de resiliência, performance e experiência do usuário.

---

## 📊 Análise da Base Atual

### ✅ Pontos Fortes Identificados
- **Angular 21** com Signals nativos (reatividade de alta performance)
- **Clean Architecture** com Ports & Adapters (InjectionTokens de domínio)
- **Vitest** como motor de testes (rápido e moderno)
- **Tailwind CSS v4** com PostCSS
- **View Transitions API** já configurada em `app.config.ts`
- **Persistência em localStorage** já implementada em `storage.ts` (zStorageSignal)
- **Lazy Loading** de rotas para code splitting
- **TypeScript** estrito com modelos bem definidos

### 🔍 Oportunidades de Melhoria

---

## 🚀 Fase 1: Persistência Inteligente & Resiliência de Rede

### 1.1. Refatorar Serviços para Usar zStorageSignal
**Objetivo:** Eliminar código boilerplate de persistência manual

**Ações:**
- [ ] Refatorar `CartService` para usar `zStorageSignal` ao invés de `loadFromStorage/saveToStorage`
- [ ] Refatorar `ProfileService` para persistir favoritos, buscas recentes e métodos de pagamento
- [ ] Refatorar `AddressService` para persistir endereços salvos
- [ ] Adicionar `reviver` functions para desserialização segura de objetos complexos

**Benefício:** Redução de ~40% de código de infraestrutura de persistência

### 1.2. Implementar Interceptor HTTP Resiliente
**Objetivo:** Tratar falhas de rede de forma transparente

**Ações:**
- [ ] Criar `http-retry.interceptor.ts` com estratégia de retry exponencial
  - Retry em erros 5xx (max 3 tentativas)
  - Retry em erros de rede (max 2 tentativas)
  - Backoff exponencial: 1s, 2s, 4s
- [ ] Criar `http-timeout.interceptor.ts` com timeout de 15s por requisição
- [ ] Criar `http-offline.interceptor.ts` que detecta modo offline e enfileira requisições
- [ ] Integrar com `ToastService` para notificar usuário sobre falhas temporárias

**Benefício:** Aplicação funciona mesmo em conexões instáveis (3G/4G com perda de sinal)

### 1.3. Componente Global de Conectividade
**Objetivo:** Feedback visual claro sobre status de conexão

**Ações:**
- [ ] Criar `ConnectivityBannerComponent` em `shared/components/connectivity-banner/`
- [ ] Implementar detecção de online/offline via `navigator.onLine` + eventos `online/offline`
- [ ] Adicionar animação de entrada/saída suave (slide-down)
- [ ] Integrar com serviço de fila de requisições pendentes
- [ ] Estilizar com Tailwind v4 (design nativo, discreto)

**Benefício:** Usuário sempre sabe o status da conexão e o que esperar

---

## ⚡ Fase 2: Experiência Visual Premium & Transições

### 2.1. Otimizar View Transitions API
**Objetivo:** Transições de página ultra fluidas

**Ações:**
- [ ] Customizar animações por tipo de transição em `app.config.ts`:
  - `restaurant-list → restaurant-detail`: slide-in da direita
  - `cart → checkout`: fade + scale
  - `profile → edit-profile`: slide-in da esquerda
- [ ] Adicionar `view-transition-name` CSS em elementos compartilhados (cards de restaurantes)
- [ ] Implementar transição de shared element para imagens de restaurantes
- [ ] Testar em Chrome, Safari e Firefox (fallback graceful degradation)

**Benefício:** Sensação de app nativo, não web

### 2.2. Desenvolver Sistema de Skeleton Loading
**Objetivo:** Eliminar spinners genéricos, melhorar percepção de performance

**Ações:**
- [ ] Criar componentes skeleton em `shared/components/skeleton/`:
  - `RestaurantCardSkeleton` (imagem + 3 linhas de texto)
  - `MenuItemSkeleton` (imagem + título + preço)
  - `OrderCardSkeleton` (ícone + 3 linhas)
  - `ProfileSkeleton` (avatar + 4 linhas)
- [ ] Integrar com `RestaurantService.loading` signal
- [ ] Adicionar animação shimmer com Tailwind v4 (`animate-pulse`)
- [ ] Garantir que skeleton tenha mesma dimensão do conteúdo real (prevenir layout shift)

**Benefício:** FCP (First Contentful Paint) percebido muito mais rápido

### 2.3. Micro-interações Táteis
**Objetivo:** Feedback visual em cada interação do usuário

**Ações:**
- [ ] Adicionar `active:scale-95` em todos os botões clicáveis
- [ ] Implementar gesture de swipe para excluir itens do carrinho:
  - Criar diretiva `swipeToDelete` em `shared/directives/`
  - Usar `@angular/cdk/drag-drop` ou implementar com `touchstart/touchend`
- [ ] Adicionar animação de "check" ao adicionar item ao carrinho
- [ ] Implementar haptic feedback via `navigator.vibrate` (se disponível)
- [ ] Adicionar transição suave em badges de quantidade (scale bounce)

**Benefício:** App com sensação tátil e responsiva

---

## 📱 Fase 3: PWA & Suporte Mobile Nativo

### 3.1. Configuração Base de PWA
**Objetivo:** App instalável e funcional offline

**Ações:**
- [ ] Instalar `@angular/pwa` via CLI
- [ ] Configurar `manifest.webmanifest`:
  - Nome: "Delivery Zardui"
  - Ícones em múltiplas resoluções (192x192, 512x512)
  - Tema: cor primária do app
  - Display mode: `standalone`
  - Shortcuts para "Pedidos" e "Favoritos"
- [ ] Configurar `ngsw-config.json` com estratégias de cache:
  - `navigationUrls`: rotas do app
  - `assetGroups`: assets estáticos (cache-first)
  - `dataGroups`: API calls (network-first com fallback)

**Benefício:** App instalável na home screen, funciona offline

### 3.2. Service Worker Customizado
**Objetivo:** Cache inteligente de dados

**Ações:**
- [ ] Criar estratégia `stale-while-revalidate` para:
  - Lista de restaurantes (cache por 5min)
  - Menus de restaurantes (cache por 10min)
  - Imagens de pratos (cache-first, 7 dias)
- [ ] Implementar `Background Sync` para:
  - Adicionar itens ao carrinho offline
  - Favoritar restaurantes/pratos offline
  - Sincronizar quando conexão voltar
- [ ] Adicionar `Push Notifications` para:
  - Status de pedido (preparando, saiu para entrega)
  - Promoções personalizadas
  - Novos restaurantes na região

**Benefício:** App 100% funcional offline, notificações nativas

### 3.3. Otimizações Mobile
**Objetivo:** Performance e UX mobile de primeira linha

**Ações:**
- [ ] Implementar `apple-mobile-web-app-capable` meta tags
- [ ] Adicionar `theme-color` dinâmico baseado em rota
- [ ] Otimizar fontes com `font-display: swap`
- [ ] Implementar `viewport-fit=cover` para iPhones com notch
- [ ] Adicionar splash screen customizada

**Benefício:** App indistinguível de app nativo no mobile

---

## 🧪 Fase 4: Suite de Testes & Qualidade

### 4.1. Testes de Integração de Fluxo de Compra
**Objetivo:** Garantir que cenários complexos funcionam

**Ações:**
- [ ] Criar `features/shopping-flow/shopping-flow.spec.ts`:
  - Cenário 1: Adicionar item, aplicar cupom válido, finalizar pedido
  - Cenário 2: Adicionar item, aplicar cupom expirado, validar erro
  - Cenário 3: Alterar quantidades, verificar cálculo de subtotal/tax/total
  - Cenário 4: Limpar carrinho, validar estado vazio
  - Cenário 5: Adicionar itens de restaurantes diferentes, validar troca de restaurante
- [ ] Usar `TestBed` com mocks estritos das portas de domínio
- [ ] Validar reatividade de signals em cada passo

**Benefício:** 90%+ de cobertura de fluxos críticos

### 4.2. Mocks Declarativos para Portas de Domínio
**Objetivo:** Testes unitários rápidos e isolados

**Ações:**
- [ ] Criar `testing/mocks/domain-ports.mock.ts`:
  - `MockRestaurantCatalogPort`
  - `MockCartPort`
  - `MockOrderPort`
  - `MockProfileStorePort`
- [ ] Implementar helpers para facilitar setup de testes:
  - `createMockCart(items)` 
  - `createMockRestaurant(id)`
  - `createMockOrder(id)`
- [ ] Documentar padrão de mocking em `testing/README.md`

**Benefício:** Testes executam em <50ms cada, sem dependências externas

### 4.3. Testes E2E com Playwright
**Objetivo:** Validar fluxos completos em ambiente real

**Ações:**
- [ ] Instalar `@playwright/test`
- [ ] Criar cenários E2E:
  - Login → Navegar restaurantes → Adicionar item → Carrinho → Checkout → Pedido
  - Favoritar restaurante → Validar persistência
  - Modo offline → Adicionar item → Voltar online → Sincronizar
- [ ] Configurar CI/CD para rodar testes em cada PR

**Benefício:** Confiança para deploy contínuo

---

## 🎨 Fase 5: Performance & Observabilidade

### 5.1. Métricas de Performance
**Objetivo:** Monitorar e otimizar métricas Core Web Vitals

**Ações:**
- [ ] Implementar tracking de:
  - FCP (First Contentful Paint) < 1.2s
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- [ ] Usar `web-vitals` library para coleta
- [ ] Enviar métricas para analytics (Google Analytics ou custom)
- [ ] Adicionar dashboard de performance em `/admin/performance` (opcional)

**Benefício:** Dados concretos para decisões de otimização

### 5.2. Otimizações de Bundle
**Objetivo:** Reduzir tamanho inicial da aplicação

**Ações:**
- [ ] Analisar bundle com `source-map-explorer`
- [ ] Implementar `import()` dinâmicos para componentes pesados (ex: mapas)
- [ ] Remover dependências não utilizadas
- [ ] Habilitar `compression` no servidor (gzip/brotli)
- [ ] Configurar `preload` para rotas críticas

**Benefício:** TTI (Time to Interactive) < 3s em 3G

### 5.3. Error Boundary & Monitoramento
**Objetivo:** Detectar e tratar erros em produção

**Ações:**
- [ ] Criar `ErrorBoundaryComponent` para capturar erros de componentes
- [ ] Implementar logging de erros via `ErrorHandler` customizado
- [ ] Integrar com Sentry ou similar para alertas
- [ ] Adicionar tela de fallback amigável para erros não recuperáveis

**Benefício:** Menos crashes, detecção proativa de bugs

---

## 📅 Cronograma Sugerido

| Fase | Duração | Prioridade | Entregas |
|------|---------|------------|----------|
| **Fase 1** | 1 semana | 🔴 Alta | zStorageSignal refatorado, Interceptor HTTP, ConnectivityBanner |
| **Fase 2** | 1 semana | 🔴 Alta | Skeletons, micro-interações, View Transitions customizadas |
| **Fase 3** | 2 semanas | 🟡 Média | PWA configurado, Service Worker, Push Notifications |
| **Fase 4** | 2 semanas | 🟡 Média | Testes de integração, mocks declarativos, Playwright |
| **Fase 5** | 1 semana | 🟢 Baixa | Métricas, bundle optimization, error boundary |

**Total estimado:** 7 semanas

---

## 🎯 Critérios de Sucesso (KPIs)

### Performance
- ✅ FCP < 1.2s
- ✅ LCP < 2.5s
- ✅ Bundle inicial < 200KB (gzipped)
- ✅ Lighthouse Score > 90

### Funcionalidade
- ✅ App funciona 100% offline (navegação + carrinho)
- ✅ Sincronização automática ao voltar online
- ✅ Push notifications funcionando
- ✅ App instalável (PWA)

### Qualidade
- ✅ Cobertura de testes > 80%
- ✅ Zero erros não tratados em produção
- ✅ Tempo de recuperação de falha < 2s

### UX
- ✅ Transições de rota suaves (60fps)
- ✅ Zero layout shifts (CLS = 0)
- ✅ Feedback visual em 100% das interações

---

## 📝 Próximos Passos Imediatos

1. **Revisar este documento** com a equipe
2. **Priorizar fases** conforme necessidade do negócio
3. **Criar branches** por fase no Git
4. **Iniciar Fase 1** (maior impacto técnico)
5. **Definir responsáveis** por cada módulo

---

## 🔗 Recursos Úteis

- [Angular PWA Guide](https://angular.dev/guide/pwa)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Web Vitals](https://web.dev/vitals/)