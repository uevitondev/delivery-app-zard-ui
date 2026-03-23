import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthRedirectComponent } from './features/auth/redirect/auth-redirect.component';
import { authGuard } from './shared/core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  // Rotas públicas
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'auth-redirect',
    component: AuthRedirectComponent,
  },

  // Rotas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: HomeComponent,
  },
  {
    path: 'home',
    canActivate: [authGuard],
    component: HomeComponent,
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

  // Redirecionar para home por padrão
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
