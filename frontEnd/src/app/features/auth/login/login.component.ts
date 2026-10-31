import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandingService } from '../../../core/services/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Splash Screen Inicial Institucional MozoGo -->
    @if (isSplashing()) {
      <div class="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 transition-opacity duration-500" [ngClass]="{'opacity-0 pointer-events-none': !isSplashing()}">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-slate-900 to-[#064e3b]/40"></div>
        <div class="relative flex flex-col items-center text-center px-4 animate-fade-in">
          <!-- pulsing institutional logo -->
          <div class="h-28 w-28 rounded-3xl overflow-hidden shadow-2xl mb-6 animate-pulse border border-emerald-500/20 flex items-center justify-center bg-slate-800/80 p-3">
            <img src="/icon-512.png" alt="MozoGo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-white text-4xl font-black tracking-tight mb-1">MozoGo</h1>
          <p class="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Plataforma Gastronómica Inteligente</p>
          <p class="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mt-3">Cargando Sistema...</p>
          <div class="w-32 bg-white/10 h-1.5 rounded-full mt-5 overflow-hidden border border-white/5">
            <div class="bg-[#10b981] h-full w-1/2 rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    }

    <!-- Pantalla de Login Principal Institucional MozoGo -->
    <div class="min-h-dvh bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Toast Error -->
      @if (errorMessage()) {
        <div class="fixed top-8 left-0 right-0 z-50 flex justify-center w-full px-4 animate-[slide-down_0.5s_ease-out,shake_0.4s_ease-in-out_0.5s]">
          <div class="bg-red-50 text-red-800 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.06)] border border-red-200 flex items-center gap-3.5 max-w-sm w-full">
            <span class="p-1.5 bg-red-100 rounded-full flex items-center justify-center shrink-0 text-red-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </span>
            <p class="text-xs font-bold leading-tight">{{ errorMessage() }}</p>
          </div>
        </div>
      }

      @if (isLoading()) {
        <div class="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
          <div class="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-xs w-full mx-4 border border-slate-100">
            <div class="h-16 w-16 mb-4 relative flex items-center justify-center p-2">
              <span class="animate-spin absolute h-full w-full border-4 border-[#10b981] border-t-transparent rounded-full"></span>
              <div class="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex bg-white p-1.5">
                <img src="/icon-512.png" alt="MozoGo" class="w-full h-full object-contain" />
              </div>
            </div>
            <h3 class="text-lg font-black text-slate-900">Conectando...</h3>
            <p class="text-slate-500 text-sm mt-2 font-medium">Validando tus credenciales en MozoGo</p>
          </div>
        </div>
      }

      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-[#10b981]/10 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-[#0f172a]/5 blur-3xl pointer-events-none"></div>
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div class="flex justify-center mb-5">
          <div class="h-20 w-20 rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex bg-[#0f172a] p-2.5">
            <img src="/icon-512.png" alt="MozoGo" class="w-full h-full object-contain" />
          </div>
        </div>
        <h2 class="text-center text-3xl font-black text-[#0f172a] tracking-tight mb-1 flex flex-col">
          <span>MozoGo</span>
        </h2>
        <p class="text-center text-xs font-extrabold text-[#059669] uppercase tracking-widest">
          Plataforma Gastronómica Inteligente
        </p>
        <p class="mt-2 text-center text-xs text-slate-500 font-semibold">
          Acceso privado · Ingresa con tu cuenta <span class="text-[#0f172a] font-bold">usuario&#64;local</span>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10" style="animation-delay: 0.1s;">
        <div class="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(15,23,42,0.06)] sm:rounded-3xl sm:px-10 border border-slate-200/80 relative">
          
          <form class="space-y-6" (submit)="onLogin($event)">
            <div>
              <label for="username" class="block text-sm font-bold text-slate-700">Nombre de Usuario</label>
              <div class="mt-2 relative">
                <input id="username" [(ngModel)]="username" name="username" type="text" required
                  maxlength="60" minlength="3" [pattern]="usernamePattern"
                  #usernameCtrl="ngModel"
                  class="appearance-none block w-full px-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] text-lg transition-colors bg-slate-50 focus:bg-white"
                  [ngClass]="{'border-red-500': usernameCtrl.invalid && usernameCtrl.touched}"
                  placeholder="Ej: juan&#64;pub o admin&#64;pizzeria">
                @if (usernameCtrl.invalid && usernameCtrl.touched) {
                  <p class="text-red-600 text-xs font-semibold mt-1.5">
                    @if(usernameCtrl.errors?.['required']) { El nombre de usuario es requerido. }
                    @if(usernameCtrl.errors?.['minlength']) { Mínimo 3 caracteres. }
                    @if(usernameCtrl.errors?.['pattern']) { Formato válido: usuario&#64;local (ej: juan&#64;pub) o usuario administrador. }
                  </p>
                }
              </div>
            </div>

            <div class="mt-6">
              <label for="password" class="block text-sm font-bold text-slate-700">Contraseña Segura</label>
              <div class="mt-2 relative">
                <input id="password" [(ngModel)]="password" name="password" type="password" required 
                  maxlength="50" minlength="8"
                  #passCtrl="ngModel"
                  class="appearance-none block w-full px-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] text-lg transition-colors bg-slate-50 focus:bg-white"
                  [ngClass]="{'border-red-500': passCtrl.invalid && passCtrl.touched}"
                  placeholder="••••••••">
                @if (passCtrl.invalid && passCtrl.touched) {
                  <p class="text-red-600 text-xs font-semibold mt-1.5">Contraseña requerida (mín 8 caracteres).</p>
                }
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="isLoading()"
                class="w-full flex justify-center py-4 px-4 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.25)] text-lg font-black text-white bg-[#059669] hover:bg-[#047857] hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98] disabled:opacity-75 disabled:active:scale-100 disabled:hover:shadow-none items-center gap-3 tracking-wide outline-none">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>
                Iniciar Sesión de Trabajo
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
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  branding = inject(BrandingService);
  
  username = '';
  password = '';
  usernamePattern = '^[a-zA-Z0-9._-]+(@[a-zA-Z0-9_-]+)?$';
  
  isLoading = signal(false);
  errorMessage = signal('');
  isSplashing = signal(true);

  constructor() {
    this.branding.resetBranding();
    setTimeout(() => this.isSplashing.set(false), 1200);
  }

  ngOnInit() {
    this.branding.resetBranding();
  }

  onLogin(event: Event) {
    event.preventDefault();
    const cleanUsername = this.username.trim().toLowerCase();
    this.username = cleanUsername;

    if (cleanUsername && this.password) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      this.authService.login(cleanUsername, this.password).subscribe({
        next: () => {
          this.isLoading.set(false);
          const user = this.authService.currentUser();
          if (user?.role === 'MozoPortal') {
            this.router.navigate(['/mozo-select']);
          } else {
            this.router.navigate(['/admin']);
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          this.errorMessage.set('Usuario o contraseña incorrectos. Asegúrate de usar el formato usuario@local.');
        }
      });
    }
  }
}
