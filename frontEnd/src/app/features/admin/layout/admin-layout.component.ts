import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-surface flex">
      <!-- Sidebar -->
      <aside class="w-72 bg-primary text-white flex-col hidden md:flex shadow-2xl z-10">
        <div class="p-6 border-b border-white/10 mt-4">
          <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span class="text-3xl">🍽️</span> 
            Sistema<span class="text-accent">QR</span>
          </h2>
          <p class="text-slate-400 text-sm mt-1 font-medium">Gestión Staff</p>
        </div>
        <nav class="flex-1 p-6 space-y-3">
          <a routerLink="/admin/dashboard" class="flex items-center gap-3 py-3.5 px-5 rounded-2xl bg-white/10 text-white shadow-sm font-semibold hover:bg-white/20 transition-all border border-white/5">
            <span class="p-1.5 bg-accent/20 text-accent rounded-lg">📋</span>
            Task List
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <header class="h-20 bg-white shadow-sm z-0 flex items-center px-8 justify-between">
          <h2 class="text-2xl font-bold text-gray-800 md:hidden flex items-center gap-2">
           <span class="text-accent">🍽️</span> Staff Panel
          </h2>
          <div class="hidden md:block">
            <h2 class="text-xl font-bold text-gray-800">Panel de Control General</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 flex items-center justify-center bg-surface border border-gray-200 rounded-full font-bold text-primary">
              JS
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
export class AdminLayoutComponent {}
