import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<'Admin' | 'Mozo' | 'SuperAdmin' | 'Cocina' | 'Caja' | 'MozoPortal'>;
  const user = authService.currentUser();

  if (user && expectedRoles.includes(user.role as any)) {
    return true;
  }

  // Redirigir si no tiene permisos
  router.navigate(['/admin/dashboard']);
  return false;
};
