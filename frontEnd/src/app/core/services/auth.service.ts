import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { SignalrService } from './signalr.service';

export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Mozo';
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private signalrService = inject(SignalrService);
  private _currentUser = signal<User | null>(null);
  private _token: string | null = null;
  
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._currentUser());
  public isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  public isMozo = computed(() => this._currentUser()?.role === 'Mozo');

  constructor() {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      this._token = savedToken;
      const user = JSON.parse(savedUser) as User;
      this._currentUser.set(user);
      // Wait for signalR connection or just call it, signalr.service buffers/handles it
      setTimeout(() => this.signalrService.joinGroup(user.role, user.id), 1000);
    }
  }

  login(email: string, password: string) {
    return this.http.post<User>('https://localhost:7132/api/auth/login', { email, password }).pipe(
      tap(user => {
        this._token = user.token;
        this._currentUser.set(user);
        localStorage.setItem('auth_token', user.token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        this.signalrService.joinGroup(user.role, user.id);
      })
    );
  }

  logout() {
    this._token = null;
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return this._token;
  }
}
