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
  
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._currentUser());
  public isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  public isMozo = computed(() => this._currentUser()?.role === 'Mozo');

  constructor() {
    // Restaurar sesión de la TAB actual (si cierra pestaña, se borra por seguridad extrema)
    const user = sessionStorage.getItem('user');
    if (user) {
      this._currentUser.set(JSON.parse(user));
    }
  }

  login(email: string, password: string) {
    return this.http.post<User>('https://yaestoy.onrender.com/api/auth/login', { email, password }).pipe(
      tap(user => {
        sessionStorage.setItem('token', user.token);
        sessionStorage.setItem('user', JSON.stringify(user));
        this._currentUser.set(user);
      })
    );
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
}
