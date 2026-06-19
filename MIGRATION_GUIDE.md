# Exemplos de Uso - Componentes Refatorados

Data: 2026-06-19  
Status: ✅ Refatoração Concluída

---

## 1. Z-SELECT (Novo - Composto)

### ❌ Antes (HTML Nativo)
```typescript
@Component({
  template: `
    <z-select
      [options]="items"
      [placeholder]="'Selecione...'"
      [(ngModel)]="selectedValue"
    />
  `
})
export class MyComponent {
  items: SelectOption[] = [
    { label: 'Opção 1', value: 1 },
    { label: 'Opção 2', value: 2 },
  ];
  selectedValue = 1;
}
```

### ✅ Depois (Composto - ZardUI)
```typescript
import { SelectRootComponent, SelectTriggerComponent, SelectValueComponent, SelectContentComponent, SelectItemComponent } from '@/shared/components';

@Component({
  selector: 'app-my-select',
  standalone: true,
  imports: [
    SelectRootComponent,
    SelectTriggerComponent,
    SelectValueComponent,
    SelectContentComponent,
    SelectItemComponent,
    CommonModule,
  ],
  template: `
    <z-select [options]="items" [(ngModel)]="selectedValue">
      <z-select-trigger>
        <z-select-value placeholder="Selecione..." />
      </z-select-trigger>
      <z-select-content>
        @for (item of items; track item.value) {
          <z-select-item [value]="item.value">
            {{ item.label }}
          </z-select-item>
        }
      </z-select-content>
    </z-select>
  `,
})
export class MySelectComponent {
  items = [
    { label: 'Opção 1', value: 1 },
    { label: 'Opção 2', value: 2 },
  ];
  selectedValue: string | number = '';
}
```

### Com FormControl
```typescript
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  template: `
    <z-select [formControl]="paymentMethod">
      <z-select-trigger>
        <z-select-value placeholder="Escolha método de pagamento" />
      </z-select-trigger>
      <z-select-content>
        @for (method of paymentMethods; track method.value) {
          <z-select-item [value]="method.value">
            {{ method.label }}
          </z-select-item>
        }
      </z-select-content>
    </z-select>
  `,
  imports: [SelectRootComponent, SelectTriggerComponent, SelectValueComponent, SelectContentComponent, SelectItemComponent, ReactiveFormsModule],
})
export class CheckoutComponent {
  paymentMethod = new FormControl('');
  paymentMethods = [
    { label: 'Cartão de Crédito', value: 'credit_card' },
    { label: 'Débito', value: 'debit' },
    { label: 'PIX', value: 'pix' },
  ];
}
```

---

## 2. Z-DIALOG (Novo - Slots)

### ❌ Antes (Propriedades)
```typescript
@Component({
  template: `
    <z-dialog
      [(isOpen)]="open"
      [title]="'Confirmar Ação'"
      confirmLabel="Confirmar"
      cancelLabel="Cancelar"
      (confirm)="handleConfirm()"
      (dismiss)="handleDismiss()"
    >
      Tem certeza que deseja continuar?
    </z-dialog>
  `,
})
export class ConfirmComponent {
  open = true;
  
  handleConfirm() {
    console.log('Confirmado');
  }
  
  handleDismiss() {
    console.log('Cancelado');
  }
}
```

### ✅ Depois (Slots - ZardUI)
```typescript
import {
  DialogComponent,
  DialogContentComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogBodyComponent,
  DialogFooterComponent,
  ButtonComponent,
} from '@/shared/components';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    DialogComponent,
    DialogContentComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    ButtonComponent,
    CommonModule,
  ],
  template: `
    <z-dialog [open]="open">
      <z-dialog-content>
        <z-dialog-header>
          <z-dialog-title>Confirmar Ação</z-dialog-title>
          <button
            type="button"
            (click)="handleDismiss()"
            class="text-stone-500 hover:text-stone-700"
            aria-label="Fechar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </z-dialog-header>

        <z-dialog-body>
          Tem certeza que deseja continuar?
        </z-dialog-body>

        <z-dialog-footer>
          <button z-button zType="secondary" (click)="handleDismiss()">
            Cancelar
          </button>
          <button z-button zType="default" (click)="handleConfirm()">
            Confirmar
          </button>
        </z-dialog-footer>
      </z-dialog-content>
    </z-dialog>
  `,
})
export class ConfirmDialogComponent {
  open = true;

  handleConfirm() {
    console.log('Confirmado');
  }

  handleDismiss() {
    console.log('Cancelado');
  }
}
```

### Customização Complexa
```typescript
// Qualquer estrutura é possível agora!
<z-dialog [open]="open">
  <z-dialog-content>
    <z-dialog-header>
      <z-dialog-title>Editar Perfil</z-dialog-title>
      <button (click)="close()">×</button>
    </z-dialog-header>

    <z-dialog-body class="space-y-4">
      <div>
        <label>Nome</label>
        <input z-input type="text" />
      </div>
      <div>
        <label>Email</label>
        <input z-input type="email" />
      </div>
    </z-dialog-body>

    <z-dialog-footer>
      <button z-button zType="ghost" (click)="close()">Sair</button>
      <button z-button zType="secondary" (click)="reset()">Limpar</button>
      <button z-button (click)="save()">Salvar</button>
    </z-dialog-footer>
  </z-dialog-content>
</z-dialog>
```

---

## 3. Z-TOAST (Novo - Service)

### ❌ Antes (Renderização Direta)
```typescript
@Component({
  template: `
    <z-toast
      *ngIf="showToast"
      [message]="'Salvo com sucesso!'"
      [type]="'success'"
    />
  `,
})
export class SaveComponent {
  showToast = false;

  handleSave() {
    // ...
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
```

### ✅ Depois (ToastService)
```typescript
import { ToastService } from '@/shared/components';
import { inject } from '@angular/core';

@Component({
  selector: 'app-save',
  template: `
    <button z-button (click)="handleSave()">
      Salvar
    </button>
  `,
})
export class SaveComponent {
  private toastService = inject(ToastService);

  handleSave() {
    // ... lógica de save ...
    this.toastService.success('Salvo com sucesso!');
  }
}
```

### Métodos Disponíveis
```typescript
export class MyComponent {
  private toast = inject(ToastService);

  examples() {
    // Sucesso (3 segundos por padrão)
    this.toast.success('Operação concluída!');

    // Erro (5 segundos)
    this.toast.error('Algo deu errado!');

    // Info (3 segundos)
    this.toast.info('Informação importante');

    // Warning (4 segundos)
    this.toast.warning('Cuidado com isso!');

    // Customizado
    this.toast.show({
      type: 'success',
      title: 'Sucesso!',
      message: 'Item adicionado ao carrinho',
      duration: 5000,
    });

    // Permanente (clique para fechar ou use dismiss)
    const toastId = this.toast.show({
      type: 'info',
      message: 'Notificação importante',
      duration: 0, // 0 = permanente
    });

    // Remover após 10 segundos
    setTimeout(() => this.toast.dismiss(toastId), 10000);
  }
}
```

### Posicionamento do Toaster
```typescript
// No app.html, customize a posição:
<z-toaster position="top-right" /> <!-- padrão -->
<z-toaster position="top-left" />
<z-toaster position="top-center" />
<z-toaster position="bottom-left" />
<z-toaster position="bottom-center" />
<z-toaster position="bottom-right" />
```

---

## 4. Checklist de Migração

### Para z-select
- [ ] Encontrar uso de `<z-select>`
- [ ] Atualizar template para estrutura composta
- [ ] Importar novos componentes
- [ ] Testar com FormControl/ngModel
- [ ] Verificar comportamento com keyboard (arrow keys)
- [ ] Testar acessibilidade (screen reader)

### Para z-dialog
- [ ] Encontrar uso de `<z-dialog>`
- [ ] Atualizar para estrutura de slots
- [ ] Remover propriedades hardcoded
- [ ] Adicionar close button customizado
- [ ] Testar animações
- [ ] Verificar comportamento ao pressionar ESC

### Para z-toast
- [ ] Encontrar renderização direta de `<z-toast>`
- [ ] Importar `ToastService`
- [ ] Substituir por `toastService.show()`
- [ ] Testar duração automática
- [ ] Verificar fila de múltiplos toasts
- [ ] Validar posicionamento

---

## 5. Referências Rápidas

### Imports Necessários

**Z-Select:**
```typescript
import {
  SelectRootComponent,
  SelectTriggerComponent,
  SelectValueComponent,
  SelectContentComponent,
  SelectItemComponent,
} from '@/shared/components';
```

**Z-Dialog:**
```typescript
import {
  DialogComponent,
  DialogContentComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogBodyComponent,
  DialogFooterComponent,
} from '@/shared/components';
```

**Z-Toast:**
```typescript
import { ToastService } from '@/shared/components';
```

---

## 6. Breaking Changes

| Componente | O que Mudou | Ação Necessária |
|-----------|-----------|------------------|
| z-select | API composta | Atualizar template |
| z-dialog | Sistema de slots | Refatorar componentes |
| z-toast | Service + componente | Usar ToastService.show() |

---

**Status:** ✅ Pronto para uso  
**Próximo Passo:** Testar em componentes reais do app
