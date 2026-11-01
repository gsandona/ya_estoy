import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // No adjuntar JWT ni X-Tenant-ID de sesiones previas al endpoint de autenticación
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = localStorage.getItem('auth_token');
  const tenantContext = inject(TenantContextService);
  const tenantId = tenantContext.currentTenantId;

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId) {
    headers = headers.set('X-Tenant-ID', tenantId);
  }

  const clonedReq = req.clone({ headers });
  return next(clonedReq);
};
