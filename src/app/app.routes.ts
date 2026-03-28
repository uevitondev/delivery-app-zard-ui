import { Routes } from '@angular/router';
import { authGuard } from './shared/core/guards/auth.guard';

export const routes: Routes = [
  // Rotas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth-redirect',
    loadComponent: () =>
      import('./features/auth/redirect/auth-redirect.component').then(
        (m) => m.AuthRedirectComponent,
      ),
  },

  // Rotas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'restaurant/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/restaurants/restaurant-detail/restaurant-detail.component').then(
        (m) => m.RestaurantDetailComponent,
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'favorite-items',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/favorite-items/favorite-items.component').then(
        (m) => m.FavoriteItemsComponent,
      ),
  },
  {
    path: 'collections',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/collections/collections.component').then((m) => m.CollectionsComponent),
  },
  {
    path: 'offers',
    canActivate: [authGuard],
    loadComponent: () => import('./features/offers/offers.component').then((m) => m.OffersComponent),
  },
  {
    path: 'wallet',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wallet/wallet.component').then((m) => m.WalletComponent),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },

  // Redirecionar para home por padrão
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
