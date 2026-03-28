import { CommonModule, DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent, LoadingComponent } from '@/shared/components';
import { NotificationsFacade } from './notifications.facade';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent, ButtonComponent, BadgeComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/8 dark:text-stone-100 dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">central</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Notificacoes</h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <z-badge zType="info" zSize="md">{{ notificationService.unreadCount() }} novas</z-badge>
          </div>
        </div>
      </header>

      <main class="app-page py-6">
        @if (loading()) {
          <app-loading variant="list" [count]="4" />
        } @else if (notificationService.notifications().length === 0) {
          <z-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">silencio por aqui</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-100">Nenhuma notificacao ainda</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
                Quando houver novidades sobre pedidos, favoritos e acoes importantes, elas aparecem aqui.
              </p>
            </div>
          </z-card>
        } @else {
          <div class="mb-4 flex flex-wrap gap-2">
            @for (category of categories; track category.value) {
              <button z-button
                zSize="sm"
                [zType]="selectedCategory() === category.value ? 'default' : 'secondary'"
                (click)="selectCategory(category.value)"
              >
                {{ category.label }}
              </button>
            }
          </div>

          <div class="mb-4 flex flex-wrap gap-3">
            <button z-button zType="secondary" zSize="sm" (click)="notificationService.markAllAsRead()">
              Marcar tudo como lido
            </button>
            <button z-button zType="ghost" zSize="sm" (click)="notificationService.clearAll()">
              Limpar historico
            </button>
          </div>

          @if (filteredNotifications().length === 0) {
            <z-card>
              <div class="py-10 text-center">
                <p class="text-lg font-semibold text-stone-900 dark:text-stone-100">Nenhum item nessa categoria</p>
                <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">Tente outro filtro para ver mais atividades.</p>
              </div>
            </z-card>
          } @else {
            <div class="space-y-4">
              @for (notification of filteredNotifications(); track notification.id) {
              <z-card>
                <button
                  type="button"
                  class="w-full text-left"
                  (click)="openNotification(notification.id, notification.link)"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="mb-2 flex items-center gap-2">
                        <p class="font-semibold text-stone-950 dark:text-stone-100">{{ notification.title }}</p>
                        @if (!notification.read) {
                          <span class="inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                        }
                      </div>
                      <p class="text-sm leading-6 text-stone-600 dark:text-stone-300">{{ notification.message }}</p>
                      @if (notification.actionLabel) {
                        <p class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                          {{ notification.actionLabel }}
                        </p>
                      }
                    </div>

                    <div class="text-right">
                      <z-badge [zType]="notification.type === 'warning' ? 'warning' : notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'" zSize="sm">
                        {{ notification.type }}
                      </z-badge>
                      <p class="mt-2 text-xs text-stone-400 dark:text-stone-500">
                        {{ notification.createdAt | date: 'dd/MM HH:mm' }}
                      </p>
                    </div>
                  </div>
                </button>
              </z-card>
              }
            </div>
          }
        }
      </main>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly facade = inject(NotificationsFacade);
  readonly notificationService = this.facade.notificationPort;
  readonly loading = this.facade.loading;
  readonly selectedCategory = this.facade.selectedCategory;
  readonly categories = this.facade.categories;
  readonly filteredNotifications = this.facade.filteredNotifications;

  ngOnInit() {
    this.facade.initialize();
  }

  goBack() {
    this.location.back();
  }

  selectCategory(category: 'all' | 'order' | 'promotion' | 'profile' | 'system') {
    this.facade.selectCategory(category);
  }

  openNotification(notificationId: string, link?: string) {
    this.notificationService.markAsRead(notificationId);
    if (link) {
      this.router.navigateByUrl(link);
    }
  }
}
