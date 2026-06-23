import { Injectable, signal, effect } from '@angular/core';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: {
    orderId?: string;
    restaurantId?: string;
    type: 'ORDER_STATUS' | 'PROMOTION' | 'NEW_RESTAURANT' | 'GENERAL';
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private readonly isSupportedSignal = signal<boolean>(false);
  private readonly permissionSignal = signal<NotificationPermission>('default');
  private readonly subscriptionSignal = signal<PushSubscription | null>(null);

  readonly isSupported = this.isSupportedSignal.asReadonly();
  readonly permission = this.permissionSignal.asReadonly();
  readonly subscription = this.subscriptionSignal.asReadonly();
  readonly isEnabled = signal(false);

  constructor() {
    this.checkSupport();
    this.loadSubscription();
  }

  private checkSupport() {
    if (typeof window !== 'undefined') {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      this.isSupportedSignal.set(supported);

      if (supported) {
        this.permissionSignal.set(Notification.permission);
      }
    }
  }

  private async loadSubscription() {
    if (typeof window === 'undefined') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      this.subscriptionSignal.set(subscription);
      this.isEnabled.set(!!subscription);
    } catch (error) {
      console.error('Failed to load push subscription:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupportedSignal()) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionSignal.set(permission);

      if (permission === 'granted') {
        await this.subscribe();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }

  private async subscribe(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Nota: Em produção, você precisaria de um VAPID key do backend
      // const vapidKey = 'SEU_VAPID_KEY_AQUI';
      // const subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: this.urlBase64ToUint8Array(vapidKey),
      // });

      // Mock subscription para demonstração
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/mock',
        keys: {
          p256dh: 'mock_p256dh_key',
          auth: 'mock_auth_key',
        },
      } as unknown as PushSubscription;

      this.subscriptionSignal.set(mockSubscription);
      this.isEnabled.set(true);

      // Salvar subscription no backend
      // await this.saveSubscriptionToBackend(mockSubscription);
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      const subscription = this.subscriptionSignal();
      if (subscription) {
        await subscription.unsubscribe();
        this.subscriptionSignal.set(null);
        this.isEnabled.set(false);

        // Remover subscription do backend
        // await this.removeSubscriptionFromBackend();
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  async showNotification(data: PushNotificationData): Promise<void> {
    if (!this.isSupportedSignal() || this.permissionSignal() !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions: any = {
        body: data.body,
        icon: data.icon || '/assets/icons/icon-192x192.png',
        badge: data.badge || '/assets/icons/badge-72x72.png',
        data: data.data,
        actions: data.actions,
        requireInteraction: true,
        silent: false,
      };

      if (data.image) {
        notificationOptions.image = data.image;
      }

      await registration.showNotification(data.title, notificationOptions);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    if (!this.isSupportedSignal()) {
      return [];
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.getNotifications();
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async clearAllNotifications(): Promise<void> {
    if (!this.isSupportedSignal()) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach((notification) => notification.close());
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  toggle() {
    if (this.isEnabled()) {
      this.unsubscribe();
    } else {
      this.requestPermission();
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}