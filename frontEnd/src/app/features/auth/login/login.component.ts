import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <!-- Falla de validación (Toast Flotante y Moderno) -->
      @if (errorMessage()) {
        <div class="fixed top-8 left-0 right-0 z-50 flex justify-center w-full px-4 animate-[slide-down_0.5s_ease-out,shake_0.4s_ease-in-out_0.5s]">
          <div class="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.4)] border border-red-400 flex items-center gap-4 max-w-sm w-full backdrop-blur-md">
            <div class="bg-white/20 p-2 rounded-full">⚠️</div>
            <p class="text-sm font-bold leading-tight">{{ errorMessage() }}</p>
          </div>
        </div>
      }

      <!-- Decoración de fondo -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div class="flex justify-center mb-8">
          <div class="h-32 w-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden p-2">
            <img *ngIf="globalLogoBase64()" [src]="globalLogoBase64()" class="w-full h-full object-contain" />
            <div *ngIf="!globalLogoBase64()" class="w-full h-full bg-gradient-to-br from-primary to-[#1a233b] rounded-2xl flex items-center justify-center">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V3m0 3a9 9 0 0 1 9 9v3H3v-3a9 9 0 0 1 9-9zM6 12v3M18 12v3"></path>
              </svg>
            </div>
          </div>
        </div>
        <h2 class="text-center text-4xl font-black text-gray-900 tracking-tight mb-2 flex flex-col">
          <span>mozoGo</span>
        </h2>
        <p class="mt-4 text-center text-sm text-gray-500 font-medium">
          Acceso privado · Usa tu <span class="text-accent">correo electrónico</span>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10" style="animation-delay: 0.1s;">
        <div class="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:rounded-3xl sm:px-10 border border-gray-100 relative">
          
          <form class="space-y-6" (submit)="onLogin($event)">
            <div>
              <label for="email" class="block text-sm font-bold text-gray-700">Correo Electrónico</label>
              <div class="mt-2 relative">
                <input id="email" [(ngModel)]="email" name="email" type="email" required email
                  maxlength="50"
                  #emailCtrl="ngModel"
                  class="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent text-lg transition-colors bg-gray-50 focus:bg-white"
                  [ngClass]="{'border-red-500': emailCtrl.invalid && emailCtrl.touched}"
                  placeholder="usuario@restaurante.com">
                @if (emailCtrl.invalid && emailCtrl.touched) {
                  <p class="text-red-500 text-xs mt-1 absolute -bottom-5">
                    @if(emailCtrl.errors?.['required']) { Correo es requerido. }
                    @if(emailCtrl.errors?.['email']) { Formato de correo inválido. }
                  </p>
                }
              </div>
            </div>

            <div class="mt-8">
              <label for="password" class="block text-sm font-bold text-gray-700">Contraseña Segura</label>
              <div class="mt-2 relative">
                <input id="password" [(ngModel)]="password" name="password" type="password" required 
                  maxlength="50" minlength="4"
                  #passCtrl="ngModel"
                  class="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent text-lg transition-colors bg-gray-50 focus:bg-white"
                  [ngClass]="{'border-red-500': passCtrl.invalid && passCtrl.touched}"
                  placeholder="••••••••">
                @if (passCtrl.invalid && passCtrl.touched) {
                  <p class="text-red-500 text-xs mt-1 absolute -bottom-5">Contraseña requerida (mín 4 caracteres).</p>
                }
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="isLoading()"
                class="w-full flex justify-center py-4 px-4 rounded-xl shadow-[0_4px_15px_rgb(16,185,129,0.3)] text-lg font-black text-white bg-accent hover:bg-[#0da473] hover:shadow-[0_8px_25px_rgb(16,185,129,0.4)] transition-all active:scale-[0.98] disabled:opacity-75 disabled:active:scale-100 disabled:hover:shadow-none items-center gap-3 tracking-wide">
                @if (isLoading()) {
                  <span class="animate-spin h-6 w-6 border-[3px] border-white border-t-transparent rounded-full"></span> Conectando al Servidor...
                } @else {
                  🔐 Iniciar Sesión de Trabajo
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-30px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px) rotate(-1deg); }
      75% { transform: translateX(6px) rotate(1deg); }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out forwards;
      opacity: 0;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);
  
  email = '';
  password = '';
  
  isLoading = signal(false);
  errorMessage = signal('');
  
  globalAppName = signal<string>('');
  globalLogoBase64 = signal<string>('');

  constructor() {
    this.http.get<any[]>(`${environment.apiUrl}/api/settings/public`).subscribe(data => {
      const appName = data.find(s => s.key === 'GlobalAppName')?.value;
      const appLogo = data.find(s => s.key === 'GlobalLogoBase64')?.value;
      if (appName) this.globalAppName.set(appName);
      if (appLogo) this.globalLogoBase64.set(appLogo);
    });
  }

  onLogin(event: Event) {
    event.preventDefault();
    if (this.email && this.password) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          this.errorMessage.set('Credenciales inválidas o servidor inactivo. Asegúrate de tener el Backend encendido.');
        }
      });
    }
  }
}
