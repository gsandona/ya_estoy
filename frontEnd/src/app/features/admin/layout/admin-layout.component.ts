import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-surface flex">
      <!-- Desktop Sidebar -->
      <aside class="w-72 bg-primary text-white flex-col hidden md:flex shadow-2xl z-10 transition-all">
        <div class="p-6 border-b border-white/10 mt-4">
          <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span class="text-3xl">🍽️</span> 
            Sistema<span class="text-accent">QR</span>
          </h2>
          <p class="text-slate-400 text-sm mt-1 font-medium select-none">Gestión Staff • {{ auth.currentUser()?.role }}</p>
        </div>
        <nav class="flex-1 p-6 space-y-3">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-semibold hover:bg-white/10 transition-all border border-transparent">
            <span class="p-1.5 bg-accent/20 text-accent rounded-lg">📋</span>
            Task List
          </a>

          @if (auth.isAdmin()) {
            <a routerLink="/admin/configuracion" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-semibold hover:bg-white/10 transition-all border border-transparent">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg">⚙️</span>
              Configuración
            </a>
          }
        </nav>
        <div class="p-6">
          <button (click)="logout()" class="w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-all border border-transparent">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="h-20 bg-white shadow-sm z-0 flex items-center px-6 md:px-8 justify-between">
          
          <!-- Mobile Hamburger Toggle -->
          <div class="flex items-center gap-3 md:hidden">
            <button (click)="mobileMenuOpen.set(true)" class="p-2 bg-surface rounded-xl hover:bg-gray-100 transition-colors active:scale-95">
              <svg class="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
             <span class="text-accent">🍽️</span> Staff
            </h2>
          </div>
          
          <!-- Desktop Title -->
          <div class="hidden md:block">
            <h2 class="text-xl font-bold text-gray-800">Panel de Control <span class="text-accent">({{ auth.currentUser()?.role }})</span></h2>
          </div>
          
          <!-- User Profile -->
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-end">
               <span class="font-bold text-sm">{{ auth.currentUser()?.email }}</span>
               <span class="text-xs text-green-500 font-semibold">Online</span>
            </div>
            <div class="h-10 w-10 flex items-center justify-center bg-surface border border-gray-200 rounded-full font-bold text-primary">
              {{ auth.currentUser()?.email?.charAt(0) | uppercase}}
            </div>
          </div>
        </header>

        <div class="p-4 md:p-8 flex-1 overflow-auto bg-[#fafafa]">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>

        <!-- Mobile Drawer Overlay -->
        @if (mobileMenuOpen()) {
          <div class="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-fade-in" (click)="mobileMenuOpen.set(false)"></div>
          <aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-primary text-white flex flex-col z-50 md:hidden shadow-2xl animate-[slide-right_0.3s_ease-out]">
            <div class="p-6 border-b border-white/10 mt-4 flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span class="text-accent">🍽️</span> Sistema
                </h2>
                <p class="text-slate-400 text-xs mt-1 font-medium">{{ auth.currentUser()?.role }}</p>
              </div>
              <button (click)="mobileMenuOpen.set(false)" class="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <nav class="flex-1 p-6 space-y-4">
              <a routerLink="/admin/dashboard" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl">📋</span>
                Mesas / Tareas
              </a>

              @if (auth.isAdmin()) {
                <a routerLink="/admin/configuracion" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl">⚙️</span>
                  Configuración
                </a>
              }
            </nav>
            
            <div class="p-6 pb-10">
              <button (click)="logout()" class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 text-white font-bold active:bg-red-600 transition-all shadow-lg shadow-red-500/30 text-lg">
                <span>🚪</span> Cerrar Sesión
              </button>
            </div>
          </aside>
        }
      </main>
    </div>
  `,
  styles: [`
    @keyframes slide-right {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
  `]
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  mobileMenuOpen = signal(false);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
