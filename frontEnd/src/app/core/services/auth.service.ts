import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Mozo';
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _currentUser = signal<User | null>(null);
  private _token: string | null = null;
  
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._currentUser());
  public isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  public isMozo = computed(() => this._currentUser()?.role === 'Mozo');

  constructor() {
    // Al quitar sessionStorage, la sesión entera se volatiliza ante cualquier "Refresh"
    // Cumpliendo tu nuevo requisito de máxima seguridad.
  }

  login(email: string, password: string) {
    return this.http.post<User>('https://yaestoy.onrender.com/api/auth/login', { email, password }).pipe(
      tap(user => {
        this._token = user.token;
        this._currentUser.set(user);
      })
    );
  }

  logout() {
    this._token = null;
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return this._token;
  }
}
