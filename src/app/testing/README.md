# Testing Guide

## Setup de Testes com Vitest + Angular 21

Este projeto utiliza **Vitest** como motor de testes, oferecendo performance superior ao Karma/Jasmine tradicional.

## Estrutura de Testes

```
src/app/testing/
├── mocks/
│   └── domain-ports.mock.ts    # Mocks declarativos para todas as portas de domínio
├── setup.ts                     # Configuração global de testes
└── README.md                    # Este arquivo
```

## Mocks Disponíveis

### Factory Functions

Cada porta de domínio possui uma factory function para criar mocks facilmente:

```typescript
import {
  createMockCartPort,
  createMockRestaurantCatalogPort,
  createMockProfileStorePort,
  createMockAddressBookPort,
  createMockOrderPort,
  createMockNotificationPort,
  createMockPromotionCatalogPort,
} from '@/testing/mocks/domain-ports.mock';
```

### Helpers para Dados de Teste

```typescript
import {
  createMockCartItem,
  createMockCart,
  createMockRestaurant,
  createMockMenuItem,
  createMockOrder,
} from '@/testing/mocks/domain-ports.mock';
```

## Exemplo de Uso

### Teste Unitário Simples

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CartService } from '@/shared/core/services/cart.service';
import { createMockMenuItem, createMockRestaurant } from '@/testing/mocks/domain-ports.mock';

describe('CartService', () => {
  it('deve adicionar item ao carrinho', () => {
    const cartService = new CartService(/* dependencies */);
    const menuItem = createMockMenuItem('1', '1');
    
    cartService.addItem(menuItem, 2);
    
    expect(cartService.items().length).toBe(1);
    expect(cartService.itemCount()).toBe(2);
  });
});
```

### Teste com Mocks de Dependências

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CartService } from '@/shared/core/services/cart.service';
import { RestaurantService } from '@/shared/core/services/restaurant.service';

describe('CartService com mocks', () => {
  it('deve calcular total corretamente', () => {
    const restaurantService = new RestaurantService();
    const cartService = new CartService(restaurantService);
    
    const menuItem = createMockMenuItem('1', '1');
    const restaurant = createMockRestaurant('1', 'Test');
    
    vi.spyOn(restaurantService, 'getRestaurantById').mockReturnValue(restaurant);
    vi.spyOn(restaurantService, 'getMenuItem').mockReturnValue(menuItem);
    
    cartService.addItem(menuItem, 2);
    
    expect(cartService.subtotal()).toBeCloseTo(59.80, 2);
    expect(cartService.total()).toBeGreaterThan(0);
  });
});
```

## Executando Testes

```bash
# Executar todos os testes
npx vitest run

# Executar em modo watch
npx vitest

# Executar arquivo específico
npx vitest run src/app/features/shopping-flow/shopping-flow.spec.ts

# Com coverage
npx vitest run --coverage
```

## Configuração do Vitest

O arquivo `vitest.config.ts` na raiz do projeto configura:

- **Aliases**: `@`, `@app`, `@shared`, `@testing`
- **Environment**: jsdom (simula browser)
- **Globals**: Habilita `describe`, `it`, `expect` sem importação

## Notas sobre Angular 21 + Signals

- Serviços com Signals são mais fáceis de testar - não requerem TestBed
- Use `computed()` para valores derivados (testados automaticamente)
- Signals são reativos - modifique o valor e leia o computed

## Próximos Passos

1. Adicionar testes para `ProfileService`
2. Adicionar testes para `AddressService`
3. Criar testes de integração para fluxo completo de checkout
4. Configurar E2E tests com Playwright