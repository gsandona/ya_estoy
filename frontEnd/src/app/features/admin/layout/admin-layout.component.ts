import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-surface flex">
      <!-- Sidebar -->
      <aside class="w-72 bg-primary text-white flex-col hidden md:flex shadow-2xl z-10">
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
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <header class="h-20 bg-white shadow-sm z-0 flex items-center px-8 justify-between">
          <h2 class="text-2xl font-bold text-gray-800 md:hidden flex items-center gap-2">
           <span class="text-accent">🍽️</span> Staff Panel
          </h2>
          <div class="hidden md:block">
            <h2 class="text-xl font-bold text-gray-800">Panel de Control <span class="text-accent">({{ auth.currentUser()?.role }})</span></h2>
          </div>
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

        <div class="p-8 flex-1 overflow-auto bg-[#fafafa]">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
