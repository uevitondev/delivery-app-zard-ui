import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usar a computed signal diretamente
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirecionar para login se não autenticado
  authService.login();
  return false;
};
