import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignoramos el endpoint /verify porque usa 401 para lógica de PIN en el frontend.
      const isVerifyEndpoint = req.url.includes('/verify');
      
      if (error.status === 401 && !isVerifyEndpoint) {
        console.warn('Unauthorized request - JWT might be expired');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
