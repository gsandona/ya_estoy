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

  router.navigate(['/admin/dashboard']);
  return false;
};

export const featureGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedFeature = route.data['feature'] as string;
  const user = authService.currentUser();

  if (user && authService.hasFeature(expectedFeature)) {
    return true;
  }

  if (user) {
    if (authService.hasFeature('MesasTareas')) {
      router.navigate(['/admin/dashboard']);
    } else if (authService.hasFeature('Cocina')) {
      router.navigate(['/admin/cocina']);
    } else {
      router.navigate(['/admin/inicio']);
    }
  } else {
    router.navigate(['/login']);
  }
  return false;
};
