import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignoramos /verify (usa 401 para PIN de mesa) y /api/auth/login (credenciales inválidas en formulario)
      const isPublicAuthFlow = req.url.includes('/verify') || req.url.includes('/api/auth/login');
      const hadAuthHeader = req.headers.has('Authorization');

      if (error.status === 401 && !isPublicAuthFlow && hadAuthHeader) {
        console.warn('Unauthorized request - JWT expired or invalid');
        authService.clearSession();

        const currentUrl = router.url;
        if (currentUrl.includes('/admin') || currentUrl.includes('/sistema') || currentUrl.includes('/mozo-select')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
