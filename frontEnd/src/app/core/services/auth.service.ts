import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignalrService } from './signalr.service';
import { TenantContextService } from './tenant-context.service';
import { BrandingService } from './branding.service';

export interface User {
  id: string;
  username: string;
  nombreCompleto?: string;
  role: 'Admin' | 'Mozo' | 'SuperAdmin' | 'Cocina' | 'Caja' | 'MozoPortal';
  token: string;
  restauranteId?: string;
  restauranteNombre?: string;
  restauranteLogo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorFondo?: string;
  features?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private signalrService = inject(SignalrService);
  private tenantContext = inject(TenantContextService);
  private brandingService = inject(BrandingService);
  private _currentUser = signal<User | null>(null);
  private _token: string | null = null;

  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._currentUser() && !!this._token && !this.isTokenExpired(this._token));
  public isAdmin = computed(() => this._currentUser()?.role === 'Admin' || this._currentUser()?.role === 'SuperAdmin');
  public isSuperAdmin = computed(() => this._currentUser()?.role === 'SuperAdmin');
  public isMozo = computed(() => this._currentUser()?.role === 'Mozo');
  public isCocina = computed(() => this._currentUser()?.role === 'Cocina');
  public isCaja = computed(() => this._currentUser()?.role === 'Caja');
  public isMozoPortal = computed(() => this._currentUser()?.role === 'MozoPortal');

  public hasFeature(key: string): boolean {
    const user = this._currentUser();
    if (!user) return false;
    if (user.role === 'SuperAdmin') return true;
    if (!user.features || user.features.length === 0) {
      if (user.role === 'Admin') {
        return ['Metricas', 'MesasTareas', 'Cocina', 'Ventas', 'MetricasMenu', 'ConfigPersonal'].includes(key);
      }
      if (user.role === 'Mozo') {
        return ['MesasTareas'].includes(key);
      }
      if (user.role === 'Cocina') {
        return ['Cocina'].includes(key);
      }
      if (user.role === 'Caja') {
        return ['MesasTareas', 'Cocina', 'Ventas', 'ConfigPersonal'].includes(key);
      }
      return false;
    }
    return user.features.includes(key);
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  public isTokenExpired(token: string): boolean {
    const decoded = this.parseJwt(token);
    if (!decoded || typeof decoded.exp !== 'number') {
      return true;
    }
    return decoded.exp * 1000 <= Date.now();
  }

  public clearSession(): void {
    this._token = null;
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.tenantContext.setTenantId(null);
    this.brandingService.resetBranding();
  }

  constructor() {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      if (this.isTokenExpired(savedToken)) {
        this.clearSession();
        return;
      }

      try {
        const user = JSON.parse(savedUser) as User;
        this._token = savedToken;

        if (user.role === 'SuperAdmin') {
          user.restauranteId = undefined;
          user.restauranteNombre = undefined;
        } else if (!user.restauranteId) {
          const decoded = this.parseJwt(savedToken);
          if (decoded && decoded.TenantId) {
            user.restauranteId = decoded.TenantId;
            localStorage.setItem('auth_user', JSON.stringify(user));
          }
        }

        this._currentUser.set(user);

        if (user.role !== 'SuperAdmin' && user.restauranteId) {
          if (user.colorPrimario) {
            this.brandingService.setRestaurantBranding({
              id: user.restauranteId,
              nombre: user.restauranteNombre,
              logoUrl: user.restauranteLogo,
              primary: user.colorPrimario,
              secondary: user.colorSecundario,
              background: user.colorFondo
            });
          }
          this.tenantContext.setTenantId(user.restauranteId);
        }

        setTimeout(() => this.signalrService.joinGroup(user.role, user.id, user.restauranteId), 1000);
      } catch {
        this.clearSession();
      }
    } else {
      // Si no hay sesión autenticada, limpiar cualquier active_tenant_id huérfano para evitar peticiones sin token
      if (this.tenantContext.currentTenantId) {
        this.tenantContext.setTenantId(null);
      }
    }
  }

  login(username: string, password: string) {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/login`, { username, password }).pipe(
      tap(user => {
        if (user.role === 'SuperAdmin') {
          user.restauranteId = undefined;
          user.restauranteNombre = undefined;
        }

        // CRÍTICO: Persistir token y usuario en memoria y localStorage ANTES de emitir cambios en tenantContext,
        // ya que los suscriptores reactivos (ej. AdminDataService) disparan peticiones HTTP sincrónicamente al cambiar el tenantId.
        this._token = user.token;
        this._currentUser.set(user);
        localStorage.setItem('auth_token', user.token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        if (user.role === 'SuperAdmin') {
          this.brandingService.resetBranding();
          this.tenantContext.setTenantId(null);
        } else if (user.restauranteId) {
          this.brandingService.setRestaurantBranding({
            id: user.restauranteId,
            nombre: user.restauranteNombre || 'MozoGo',
            logoUrl: user.restauranteLogo || '/logo.png',
            primary: user.colorPrimario || '#0f172a',
            secondary: user.colorSecundario || '#10b981',
            background: user.colorFondo || '#f8fafc'
          });
          this.tenantContext.setTenantId(user.restauranteId);
        }

        this.signalrService.joinGroup(user.role, user.id, user.restauranteId);
      })
    );
  }

  logout(): boolean {
    const portalToken = localStorage.getItem('portal_token');
    const portalUserStr = localStorage.getItem('portal_user');

    this._token = null;
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.tenantContext.setTenantId(null);

    if (portalToken && portalUserStr && !this.isTokenExpired(portalToken)) {
      try {
        const user = JSON.parse(portalUserStr) as User;
        localStorage.setItem('auth_token', portalToken);
        localStorage.setItem('auth_user', portalUserStr);
        this._token = portalToken;
        this._currentUser.set(user);
        if (user.restauranteId) {
          this.tenantContext.setTenantId(user.restauranteId);
        }
        return true; // Portal session restored
      } catch {
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_user');
      }
    }

    this.brandingService.resetBranding();
    return false; // Full logout
  }

  getToken(): string | null {
    return this._token;
  }

  getRole(): string | null {
    return this._currentUser()?.role || null;
  }
}
