import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { BrandingService } from '../../../core/services/branding.service';

interface MozoProfile {
  id: string;
  nombreCompleto: string;
  username: string;
  role: string;
}

@Component({
  selector: 'app-mozo-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-surface flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
      <!-- Background aesthetics -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      
      <!-- Top Brand -->
      <div class="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
        <div class="flex justify-center mb-4">
          <div class="h-16 w-16 rounded-2xl overflow-hidden shadow-md border border-gray-150 flex bg-white p-2.5">
            <img [src]="branding.logo()" class="w-full h-full object-contain" />
          </div>
        </div>
        <h2 class="text-3xl font-serif font-black text-primary">{{ branding.appName() }}</h2>
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Portal de Selección de Mozos</p>
      </div>

      <!-- Main container -->
      <div class="my-auto sm:mx-auto sm:w-full sm:max-w-2xl animate-fade-in relative z-10" style="animation-delay: 0.1s;">
        <!-- Waiter list or pin input view -->
        @if (!selectedMozo()) {
          <div class="bg-white/80 backdrop-blur-md py-8 px-6 shadow-xl rounded-3xl border border-gray-100/90 space-y-6">
            <h3 class="text-xl font-bold text-gray-800">¿Quién eres hoy?</h3>
            <p class="text-sm text-gray-400 font-semibold uppercase tracking-wide">Selecciona tu perfil para ingresar a tu jornada</p>
            
            @if (loadingMozos()) {
              <div class="py-12 flex flex-col items-center justify-center">
                <span class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></span>
                <p class="text-xs font-semibold text-gray-500">Obteniendo personal...</p>
              </div>
            } @else if (mozos().length === 0) {
              <div class="py-12 text-center text-slate-500 italic text-sm">
                No hay mozos registrados en este restaurante.
              </div>
            } @else {
              <!-- Waiter Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                @for (mz of mozos(); track mz.id) {
                  <button 
                    (click)="selectMozo(mz)"
                    class="bg-white hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all p-5 rounded-2xl border-2 border-gray-100 flex flex-col items-center gap-3.5 group shadow-sm hover:shadow-md"
                  >
                    <!-- Waiter Avatar / Initials -->
                    <div class="h-14 w-14 rounded-full bg-accent/15 text-accent text-lg font-black flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {{ getInitials(mz.nombreCompleto || mz.username) }}
                    </div>
                    <div>
                      <h4 class="font-black text-gray-800 text-sm leading-tight">{{ mz.nombreCompleto || mz.username }}</h4>
                      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{{ mz.username }}</p>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        } @else {
          <!-- PIN/Password Input Panel -->
          <div class="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-gray-150 max-w-md mx-auto space-y-6 animate-scale-up">
            <button 
              (click)="cancelSelection()"
              class="absolute top-4 left-4 text-gray-400 hover:text-gray-800 font-black text-lg p-2 transition active:scale-90"
            >
              ← Volver
            </button>

            <div class="flex flex-col items-center">
              <div class="h-16 w-16 rounded-full bg-accent/20 text-accent text-lg font-black flex items-center justify-center mb-3">
                {{ getInitials(selectedMozo()!.nombreCompleto || selectedMozo()!.username) }}
              </div>
              <h3 class="text-xl font-black text-gray-800">{{ selectedMozo()!.nombreCompleto || selectedMozo()!.username }}</h3>
              <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Ingresa tu contraseña</p>
            </div>

            <!-- PIN or Password Input -->
            <form (submit)="confirmLogin($event)" class="space-y-6">
              <div class="relative">
                <input 
                  type="password" 
                  [(ngModel)]="passwordInput" 
                  name="password"
                  required
                  placeholder="Contraseña"
                  class="w-full text-center text-xl font-bold tracking-widest px-4 py-3.5 rounded-xl border-2 border-[#E2DACF] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-gray-50/50 focus:bg-white"
                />
              </div>

              @if (loginError()) {
                <p class="text-red-700 text-xs font-bold animate-fade-in">{{ loginError() }}</p>
              }

              <button 
                type="submit" 
                [disabled]="loggingIn()"
                class="w-full bg-primary hover:bg-primary/95 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                @if (loggingIn()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                } @else {
                  🔑 Confirmar e Iniciar Turno
                }
              </button>
            </form>
          </div>
        }
      </div>

      <!-- Logout bottom button -->
      <div class="relative z-10">
        <button 
          (click)="logoutPortal()"
          class="text-xs font-bold text-gray-400 hover:text-red-600 transition active:scale-95 flex items-center gap-1.5 mx-auto"
        >
          🚪 Cerrar Portal del Restaurante
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
  `]
})
export class MozoSelectComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  branding = inject(BrandingService);

  mozos = signal<MozoProfile[]>([]);
  loadingMozos = signal(false);

  selectedMozo = signal<MozoProfile | null>(null);
  passwordInput = '';
  loggingIn = signal(false);
  loginError = signal<string | null>(null);

  ngOnInit() {
    this.loadMozos();
  }

  loadMozos() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.loadingMozos.set(true);
    this.http.get<MozoProfile[]>(`${environment.apiUrl}/api/users/mozos`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.mozos.set(data);
        this.loadingMozos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar mozos del restaurante:', err);
        this.loadingMozos.set(false);
      }
    });
  }

  selectMozo(mz: MozoProfile) {
    this.selectedMozo.set(mz);
    this.passwordInput = '';
    this.loginError.set(null);
  }

  cancelSelection() {
    this.selectedMozo.set(null);
    this.passwordInput = '';
    this.loginError.set(null);
  }

  confirmLogin(event: Event) {
    event.preventDefault();
    if (!this.selectedMozo() || !this.passwordInput) return;

    this.loggingIn.set(true);
    this.loginError.set(null);

    const targetUsername = this.selectedMozo()!.username;
    this.authService.login(targetUsername, this.passwordInput).subscribe({
      next: () => {
        this.loggingIn.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Error al iniciar sesión de mozo:', err);
        this.loggingIn.set(false);
        this.loginError.set('La contraseña ingresada es incorrecta.');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  logoutPortal() {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
