import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingComponent,
  RestaurantCardComponent,
} from '@/shared/components';
import { ProfileService } from '@/shared/core/services/profile.service';
import { ToastService } from '@/shared/core/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, RestaurantCardComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar-inner">
          <div class="flex items-center gap-3">
            <button
              (click)="goBack()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg text-stone-700 shadow-[0_10px_24px_rgba(118,60,24,0.08)] transition hover:-translate-y-0.5"
            >
              ←
            </button>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">colecao</p>
              <h1 class="text-2xl font-semibold tracking-tight text-stone-950">Favoritos</h1>
            </div>
          </div>
          <app-badge variant="info" size="md">{{ profileService.favoriteRestaurants().length }} salvos</app-badge>
        </div>
      </header>

      <main class="app-page py-6">
        @if (loading()) {
          <app-loading variant="cards" [count]="3" />
        } @else if (profileService.favoriteRestaurants().length === 0) {
          <app-card>
            <div class="py-14 text-center">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">nenhum favorito</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Monte sua lista de queridinhos</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
                Salve restaurantes para reencontrar seus pedidos favoritos em segundos.
              </p>
              <div class="mt-6 flex justify-center">
                <app-button size="lg" (click)="goHome()">Explorar restaurantes</app-button>
              </div>
            </div>
          </app-card>
        } @else {
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            @for (restaurant of profileService.favoriteRestaurants(); track restaurant.id) {
              <app-restaurant-card
                [restaurant]="restaurant"
                [isFavorite]="true"
                (selectRestaurant)="goToRestaurant($event)"
                (toggleFavorite)="removeFavorite(restaurant.id)"
              />
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class FavoritesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);
  readonly loading = signal(true);

  ngOnInit() {
    queueMicrotask(() => this.loading.set(false));
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToRestaurant(restaurantId: string) {
    this.router.navigate(['/restaurant', restaurantId]);
  }

  removeFavorite(restaurantId: string) {
    this.profileService.toggleFavoriteRestaurant(restaurantId);
    this.toastService.show('Restaurante removido dos favoritos.', 'info', 3200, {
      title: 'Favoritos atualizados',
      category: 'profile',
      actionLabel: 'Voltar para a home',
      link: '/home',
    });
  }
}
