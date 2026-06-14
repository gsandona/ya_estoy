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
    <!-- Splash Screen Inicial -->
    @if (isSplashing()) {
      <div class="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 transition-opacity duration-500" [ngClass]="{'opacity-0 pointer-events-none': !isSplashing()}">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]"></div>
        <div class="relative flex flex-col items-center text-center px-4 animate-fade-in">
          <!-- Pulsing Logo Container -->
          <div class="h-28 w-28 rounded-3xl overflow-hidden shadow-xl mb-6 animate-pulse border border-white/10 flex">
            <img src="logo.png" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-white text-4xl font-black tracking-tight mb-2">MozoGo</h1>
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-2">Cargando Sistema...</p>
          <div class="w-32 bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden border border-white/5">
            <div class="bg-accent h-full w-1/2 rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    }

    <!-- Pantalla de Login Principal -->
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

      <!-- Fullscreen Loading Overlay (cuando conecta al servidor) -->
      @if (isLoading()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
          <div class="bg-white/95 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-xs w-full mx-4 border border-white/20">
            <div class="h-16 w-16 mb-4 relative flex items-center justify-center p-2">
              <span class="animate-spin absolute h-full w-full border-4 border-accent border-t-transparent rounded-full"></span>
              <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex">
                <img src="logo.png" class="w-full h-full object-cover" />
              </div>
            </div>
            <h3 class="text-lg font-black text-gray-800">Conectando...</h3>
            <p class="text-gray-500 text-sm mt-2 font-medium">Validando tus credenciales en MozoGo</p>
          </div>
        </div>
      }

      <!-- Decoración de fondo -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div class="flex justify-center mb-8">
          <div class="h-32 w-32 rounded-[2rem] overflow-hidden shadow-xl border border-white/10 flex">
            <img src="logo.png" class="w-full h-full object-cover" />
          </div>
        </div>
        <h2 class="text-center text-4xl font-black text-gray-900 tracking-tight mb-2 flex flex-col">
          <span>MozoGo</span>
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
                🔐 Iniciar Sesión de Trabajo
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
    @keyframes loading-bar {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
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
  isSplashing = signal(true);
  
  globalAppName = signal<string>('');
  globalLogoBase64 = signal<string>('');

  constructor() {
    // Splash screen timer
    setTimeout(() => this.isSplashing.set(false), 1800);

    this.http.get<any[]>(`${environment.apiUrl}/api/settings/public`).subscribe({
      next: data => {
        const appName = data.find(s => s.key === 'GlobalAppName')?.value;
        const appLogo = data.find(s => s.key === 'GlobalLogoBase64')?.value;
        if (appName) this.globalAppName.set(appName);
        if (appLogo) this.globalLogoBase64.set(appLogo);
      },
      error: () => {}
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
          this.router.navigate(['/admin']);
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
