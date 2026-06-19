# Roadmap de Refatoração - Componentes com Divergência do ZardUI

**Data:** 2026-06-19  
**Objetivo:** Alinhar `select`, `dialog` e `toast` com padrões oficiais do ZardUI

---

## 🎯 Prioridades de Refatoração

| Componente | Impacto | Complexidade | Esforço | Prioridade |
|-----------|--------|-------------|--------|-----------|
| **z-select** | Alto | Alto | 4h | 1️⃣ CRÍTICA |
| **z-dialog** | Alto | Médio | 3h | 2️⃣ ALTA |
| **z-toast** | Médio | Médio | 2.5h | 3️⃣ MÉDIA |

---

## 1️⃣ Z-SELECT - Refatoração Crítica

### 📍 Localização
`src/app/shared/components/select/select.component.ts`

### ❌ Implementação Atual
```typescript
// Versão nativa (HTML select)
<z-select [options]="items" [(ngModel)]="selected" />
// Problema: não é composável, API diferente do ZardUI
```

### ✅ Implementação ZardUI (Alvo)
```typescript
// Sistema composto - mais flexível
<z-select>
  <z-select-trigger>
    <z-select-value placeholder="Selecione uma opção" />
  </z-select-trigger>
  <z-select-content>
    @for (item of items(); track item.value) {
      <z-select-item [value]="item.value">
        {{ item.label }}
      </z-select-item>
    }
  </z-select-content>
</z-select>
```

### 🔧 Passos de Refatoração

**Fase 1: Criar componentes base**
1. Criar `z-select-root.component.ts` (gerencia estado e popover)
2. Criar `z-select-trigger.component.ts` (botão que abre dropdown)
3. Criar `z-select-content.component.ts` (container do dropdown)
4. Criar `z-select-item.component.ts` (items individuais)
5. Criar `z-select-value.component.ts` (display do valor selecionado)

**Fase 2: Implementar ControlValueAccessor**
- Novo arquivo: `select.control.ts`
- Suportar `[(ngModel)]` e `formControl`

**Fase 3: Testes**
- Unit tests para cada componente
- Testes de acessibilidade (keyboard, ARIA)
- Testes de integração com formulários

### ⏱️ Tempo Estimado: **4h**

---

## 2️⃣ Z-DIALOG - Refatoração Alta

### 📍 Localização
`src/app/shared/components/modal/modal.component.ts`

### ❌ Implementação Atual
```typescript
// Dialog com propriedades hardcoded
<z-dialog 
  [(isOpen)]="open" 
  [title]="'Confirmar'" 
  [confirmLabel]="'OK'"
  [cancelLabel]="'Cancelar'"
  (onConfirm)="handleConfirm()"
>
  Conteúdo aqui
</z-dialog>
```

**Limitações:**
- Footer fixo com 2 botões
- Não reutilizável para casos customizados
- Estrutura rígida

### ✅ Implementação ZardUI (Alvo)
```typescript
// Sistema baseado em slots
<z-dialog [(open)]="open">
  <z-dialog-content>
    <z-dialog-header>
      <z-dialog-title>Confirmar Ação</z-dialog-title>
    </z-dialog-header>
    
    <z-dialog-body>
      Conteúdo customizável aqui
    </z-dialog-body>
    
    <z-dialog-footer>
      <button z-button zType="secondary" (click)="cancel()">
        Cancelar
      </button>
      <button z-button (click)="confirm()">
        OK
      </button>
    </z-dialog-footer>
  </z-dialog-content>
</z-dialog>
```

**Vantagens:**
- Composição flexível
- Slots para customização
- Alinhado com web components

### 🔧 Passos de Refatoração

**Fase 1: Criar arquitetura de slots**
1. Criar `z-dialog.component.ts` (root, gerencia modal state)
2. Criar `z-dialog-content.component.ts` (wrapper de conteúdo)
3. Criar `z-dialog-header.component.ts` (slot para header)
4. Criar `z-dialog-title.component.ts` (title component)
5. Criar `z-dialog-body.component.ts` (slot para conteúdo)
6. Criar `z-dialog-footer.component.ts` (slot para ações)

**Fase 2: Atualizar integração com backdrop**
- Manter animações (fade-in, slide-in)
- Implementar close on backdrop click
- Suportar close button automático

**Fase 3: Migração no app**
- Atualizar chamadas em componentes que usam modal
- Testes E2E

### ⏱️ Tempo Estimado: **3h**

---

## 3️⃣ Z-TOAST - Refatoração Média

### 📍 Localização
`src/app/shared/components/toast/toast.component.ts`

### ❌ Implementação Atual
```typescript
// Renderização direta do componente
<z-toast 
  type="success" 
  message="Salvo com sucesso!"
  [position]="'top-right'"
/>
```

**Limitações:**
- Sem fila de múltiplos toasts
- Sem sistema de serviço
- Posicionamento hardcoded

### ✅ Implementação ZardUI (Alvo)
```typescript
// Sistema baseado em serviço
export class MyComponent {
  constructor(private toastService: ToastService) {}
  
  handleSuccess() {
    this.toastService.show({
      type: 'success',
      title: 'Sucesso',
      message: 'Operação concluída!',
      duration: 3000
    });
  }
}

// Template - apenas container necessário
<z-toaster position="top-right" />
```

**Vantagens:**
- Fila automática de múltiplos toasts
- Gerenciamento via serviço
- Menos boilerplate no template

### 🔧 Passos de Refatoração

**Fase 1: Criar serviço**
1. Criar `toast.service.ts`
   - Método `show(config)` - adiciona toast à fila
   - Método `dismiss(id)` - remove toast específico
   - Gerenciar stack de toasts

**Fase 2: Criar componentes**
1. Criar `z-toaster.component.ts` (container root)
2. Criar `z-toast.component.ts` (item individual)
3. Usar Input/Output para dados
4. Integrar animações existentes

**Fase 3: Usar no app**
- Injetar `ToastService` onde necessário
- Remover renderização direta
- Adicionar `<z-toaster />` no root component

### ⏱️ Tempo Estimado: **2.5h**

---

## 📋 Checklist de Implementação

### Z-Select Refactor
- [ ] Criar componentes compostos (root, trigger, content, item, value)
- [ ] Implementar ControlValueAccessor
- [ ] Testes unitários
- [ ] Testes de acessibilidade (ARIA, keyboard)
- [ ] Atualizar `index.ts` para exportar novos componentes
- [ ] Atualizar exemplos de uso no README
- [ ] Testar em componentes do app

### Z-Dialog Refactor
- [ ] Criar componentes de slot (root, content, header, body, footer, title)
- [ ] Implementar gerenciamento de estado
- [ ] Testes de animação
- [ ] Testar close behavior
- [ ] Atualizar componentes que usam modal
- [ ] Testes E2E

### Z-Toast Refactor
- [ ] Criar `ToastService`
- [ ] Criar `z-toaster.component.ts`
- [ ] Atualizar `z-toast.component.ts`
- [ ] Adicionar `<z-toaster />` em `app.component.ts`
- [ ] Migrar chamadas de toast no app
- [ ] Testes de fila e timing

---

## 🔄 Estratégia de Migração (Low Risk)

### Opção 1: Refatoração Gradual (Recomendada)
```
Semana 1: z-select refactor
Semana 2: z-dialog refactor  
Semana 3: z-toast refactor
Semana 4: Testes E2E e correções
```

### Opção 2: Feature Flags
- Manter ambas versões (antiga + nova) durante transição
- Usar feature flag para switchar
- Remover versão antiga após validação

---

## 📚 Referências

**ZardUI Official Documentation:**
- Select: https://zardui.com/docs/components/select
- Dialog: https://zardui.com/docs/components/dialog
- Toast: https://zardui.com/docs/components/toast

**Angular Best Practices:**
- Standalone Components: https://angular.dev/guide/standalone-components
- ControlValueAccessor: https://angular.dev/api/forms/ControlValueAccessor
- Dependency Injection: https://angular.dev/guide/dependency-injection

---

## 💡 Notas Importantes

1. **Compatibilidade Backward:** Após refatoração, APIs irão mudar
   - Planejar período de transição
   - Documentar migration guide

2. **Acessibilidade:** Garantir ARIA e keyboard navigation
   - Select: Suportar arrow keys, search by typing
   - Dialog: ESC para fechar, focus management
   - Toast: Anunciáveis via screen readers

3. **Testes:** Aumentar cobertura para novos componentes
   - Unitários: Lógica de estado
   - Integração: Composição de componentes
   - E2E: Fluxos completos do app

---

**Próximo Passo:** Iniciar com z-select (maior impacto)  
**Revisão em:** 1 semana
