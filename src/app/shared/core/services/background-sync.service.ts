import { Injectable, signal, effect } from '@angular/core';
import { CartPort } from '@/shared/core/contracts/app.contracts';
import { CartService } from './cart.service';

export interface PendingAction {
  id: string;
  type: 'ADD_TO_CART' | 'UPDATE_QUANTITY' | 'REMOVE_ITEM' | 'ADD_FAVORITE' | 'PLACE_ORDER';
  payload: any;
  timestamp: Date;
  retryCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class BackgroundSyncService {
  private readonly pendingActionsSignal = signal<PendingAction[]>([]);
  private readonly isOnlineSignal = signal<boolean>(navigator.onLine);
  private readonly isSyncingSignal = signal<boolean>(false);

  readonly pendingActions = this.pendingActionsSignal.asReadonly();
  readonly isOnline = this.isOnlineSignal.asReadonly();
  readonly isSyncing = this.isSyncingSignal.asReadonly();
  readonly pendingCount = signal(0);

  constructor(private cartService: CartService) {
    // Carregar ações pendentes do localStorage
    this.loadPendingActions();

    // Monitorar conectividade
    effect(() => {
      const online = this.isOnlineSignal();
      if (online) {
        this.syncPendingActions();
      }
    });

    // Listeners de eventos
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnlineSignal.set(true));
      window.addEventListener('offline', () => this.isOnlineSignal.set(false));
    }
  }

  addPendingAction(type: PendingAction['type'], payload: any) {
    const action: PendingAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.pendingActionsSignal.update((actions) => [...actions, action]);
    this.persist();

    // Se estiver online, tentar sincronizar imediatamente
    if (this.isOnlineSignal()) {
      this.syncPendingActions();
    }
  }

  async syncPendingActions(): Promise<void> {
    if (this.isSyncingSignal() || !this.isOnlineSignal()) {
      return;
    }

    const actions = this.pendingActionsSignal();
    if (actions.length === 0) return;

    this.isSyncingSignal.set(true);

    try {
      for (const action of actions) {
        try {
          await this.executeAction(action);
          this.removePendingAction(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Incrementar contador de retry
          this.pendingActionsSignal.update((actions) =>
            actions.map((a) =>
              a.id === action.id ? { ...a, retryCount: a.retryCount + 1 } : a
            )
          );
          
          this.persist();

          // Se falhou 3 vezes, remover
          if (action.retryCount >= 3) {
            this.removePendingAction(action.id);
          }
        }
      }
    } finally {
      this.isSyncingSignal.set(false);
    }
  }

  private async executeAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'ADD_TO_CART':
        // await this.cartService.addItem(action.payload.menuItem, action.payload.quantity);
        break;
      case 'UPDATE_QUANTITY':
        // await this.cartService.updateQuantity(action.payload.menuItemId, action.payload.quantity);
        break;
      case 'REMOVE_ITEM':
        // await this.cartService.removeItem(action.payload.menuItemId);
        break;
      case 'ADD_FAVORITE':
        // await this.profileService.toggleFavoriteRestaurant(action.payload.restaurantId);
        break;
      case 'PLACE_ORDER':
        // await this.orderService.createOrder(action.payload.order);
        break;
    }
  }

  private removePendingAction(id: string) {
    this.pendingActionsSignal.update((actions) => actions.filter((a) => a.id !== id));
    this.persist();
  }

  private loadPendingActions() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('deliveryapp.pendingActions');
      if (stored) {
        const actions = JSON.parse(stored);
        this.pendingActionsSignal.set(actions);
        this.updatePendingCount();
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        'deliveryapp.pendingActions',
        JSON.stringify(this.pendingActionsSignal())
      );
      this.updatePendingCount();
    } catch (error) {
      console.error('Failed to persist pending actions:', error);
    }
  }

  private updatePendingCount() {
    this.pendingCount.set(this.pendingActionsSignal().length);
  }

  clearAll() {
    this.pendingActionsSignal.set([]);
    this.persist();
  }
}