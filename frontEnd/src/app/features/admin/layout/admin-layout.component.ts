import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector.component';
import { AdminDataService } from '../config/admin-data.service';
import { LanguageService } from '../../../core/services/language.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { RestauranteService } from '../../../core/services/restaurante.service';
import { BrandingService } from '../../../core/services/branding.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TenantSelectorComponent],
  template: `
    @if (!isBrandingLoaded()) {
      <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 opacity-50"></div>
        <div class="relative flex flex-col items-center">
          <div class="h-20 w-20 flex items-center justify-center mb-6 relative p-2">
            <span class="animate-spin absolute h-16 w-16 border-4 border-gray-300 border-t-gray-600 rounded-full"></span>
            <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-200 flex">
              <img [src]="brandingService.logo()" class="w-full h-full object-cover" />
            </div>
          </div>
          <h2 class="text-xl font-black text-gray-800 tracking-tight mb-2">{{ brandingService.appName() }}</h2>
          <p class="text-gray-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Cargando Sistema...</p>
        </div>
      </div>
    } @else {
      <div class="min-h-screen bg-surface flex">

      <!-- Desktop Sidebar -->
      <aside [ngClass]="sidebarCollapsed() ? 'w-20' : 'w-72'" class="bg-primary text-white flex-col hidden md:flex shadow-2xl z-10 transition-all duration-300">
        <div class="p-4 border-b border-white/10 mt-4 flex items-center justify-between">
          <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-md border border-white/10 flex">
              <img [src]="brandingService.logo()" class="w-full h-full object-cover" />
            </div>
            @if (!sidebarCollapsed()) {
              <span class="truncate">{{ brandingService.appName() }}</span>
            }
          </h2>
          <button (click)="sidebarCollapsed.set(!sidebarCollapsed())" class="hidden md:flex p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white shrink-0">
            @if (sidebarCollapsed()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            }
          </button>
        </div>
        @if (!sidebarCollapsed()) {
          <div class="px-6 py-2 border-b border-white/5 select-none">
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">{{ lang.translations().sidebar.roleLabel }} • {{ auth.currentUser()?.role }}</p>
          </div>
        }
        <nav class="flex-1 p-4 space-y-2">
          @if (auth.isAdmin() || auth.isSuperAdmin()) {
            <a routerLink="/admin/inicio" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.metrics : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M4 18h16M4 6l6 6 4-2 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.metrics }}</span>
              }
            </a>
          }
          
          @if (auth.currentUser()?.role !== 'Cocina') {
            <a routerLink="/admin/dashboard" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.tables : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.tables }}</span>
              }
            </a>
          }

          @if (auth.currentUser()?.role === 'Cocina' || auth.isAdmin() || auth.isSuperAdmin() || auth.isCaja()) {
            <a routerLink="/admin/cocina" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.kitchen : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.kitchen }}</span>
              }
            </a>
          }

          @if (auth.isAdmin() || auth.isSuperAdmin() || auth.isCaja()) {
            <a routerLink="/admin/ventas" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.sales : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m-3-6h15a2.25 2.25 0 0 1 2.25 2.25v13.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 3.75 4.5z" /></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.sales }}</span>
              }
            </a>
          }

          @if (auth.isAdmin() || auth.isSuperAdmin()) {
            <a routerLink="/admin/metricas-menu" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? 'Platos Vendidos' : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" /></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">Platos Vendidos</span>
              }
            </a>
          }

          @if (auth.isAdmin() || auth.isCaja()) {
            <a routerLink="/admin/configuracion" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.personal : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75M9 21h6m-3-10a4 4 0 11-8 0 4 4 0 018 0zM3 21v-2a4 4 0 014-4h4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.personal }}</span>
              }
            </a>
          }
          
          @if (auth.isSuperAdmin()) {
            <a routerLink="/admin/sistema" routerLinkActive="bg-white/20 border-white/20" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="flex items-center py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.system : ''">
              <span class="p-1.5 bg-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="truncate">{{ lang.translations().sidebar.system }}</span>
              }
            </a>
          }
        </nav>
        <div class="p-4">
          <button (click)="logout()" [ngClass]="sidebarCollapsed() ? 'justify-center px-0' : 'gap-3 px-4'" class="w-full flex items-center py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-all border border-transparent" [title]="sidebarCollapsed() ? lang.translations().sidebar.logout : ''">
            <span class="flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            @if (!sidebarCollapsed()) {
              <span class="truncate">{{ lang.translations().sidebar.logout }}</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="h-20 bg-white shadow-sm z-30 flex items-center px-6 md:px-8 justify-between">
          
          <!-- Mobile Hamburger Toggle -->
          <div class="flex items-center gap-3 md:hidden">
            <button (click)="mobileMenuOpen.set(true)" class="p-2 bg-surface rounded-xl hover:bg-gray-100 transition-colors active:scale-95">
              <svg class="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2 max-w-[200px] truncate">
              <div class="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 flex">
                <img [src]="brandingService.logo()" class="w-full h-full object-cover" />
              </div>
              <span class="truncate">{{ brandingService.appName() }}</span>
            </h2>
          </div>
          
          <!-- Desktop Title -->
          <div class="hidden md:block">
            <h2 class="text-xl font-bold text-gray-800">{{ lang.translations().common.appName }} <span class="text-accent">({{ auth.currentUser()?.role }})</span></h2>
          </div>
          
          <!-- User Profile and Tenant Selector -->
          <div class="flex items-center gap-4">
            <!-- Language Selector -->
            <button (click)="lang.toggleLanguage()" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-primary hover:bg-gray-100 text-xs font-black transition-all active:scale-95 outline-none select-none">
              <span>🌐</span> {{ lang.currentLang() | uppercase }}
            </button>

            <!-- Notification Settings Menu -->
            <div id="notif-settings-menu-container" class="relative">
              <button (click)="showNotificationSettings.set(!showNotificationSettings())" 
                      class="relative flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-200 text-primary hover:bg-gray-100 transition-all active:scale-95 outline-none select-none"
                      [title]="lang.translations().notifications?.title || 'Notificaciones'">
                @if (signalrService.notificationSettings().muteAll) {
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75v-0.573a5.25 5.25 0 0 0-5.467-5.249c-2.825 0-5.18 2.213-5.28 5.03L6.5 11.25H4.5v1.5h15v-1.5h-2.25zM12 21a2.25 2.25 0 0 0 2.25-2.25H9.75A2.25 2.25 0 0 0 12 21zm-8.25-18l16.5 16.5"></path>
                  </svg>
                  <span class="absolute -top-1 -right-1 flex h-3 w-3">
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-black text-white items-center justify-center">×</span>
                  </span>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"></path>
                  </svg>
                  @if (!signalrService.notificationSettings().tasks || !signalrService.notificationSettings().orderStatus || !signalrService.notificationSettings().reassignments) {
                    <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  } @else {
                    <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                  }
                }
              </button>

              <!-- Dropdown Panel -->
              @if (showNotificationSettings()) {
                <div class="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-5 select-none animate-fade-in">
                  <h3 class="text-sm font-black text-gray-800 mb-4 flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <span class="flex items-center gap-1.5 text-primary">
                      🔔 {{ lang.translations().notifications?.title || 'Notificaciones' }}
                    </span>
                    <button (click)="showNotificationSettings.set(false)" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </h3>

                  <div class="space-y-4">
                    <!-- Silenciar Todo -->
                    <div class="flex items-center justify-between">
                      <div class="flex flex-col pr-3">
                        <span class="text-sm font-bold text-gray-700">{{ lang.translations().notifications?.muteAll || 'Silenciar Todo' }}</span>
                      </div>
                      <button type="button"
                              (click)="toggleSetting('muteAll')"
                              class="relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors duration-250 focus:outline-none shadow-inner"
                              [class]="signalrService.notificationSettings().muteAll ? 'bg-red-500' : 'bg-gray-200'">
                        <span class="inline-block w-5 h-5 bg-white rounded-full transition-transform duration-250 transform shadow-sm"
                              [class]="signalrService.notificationSettings().muteAll ? 'translate-x-[22px]' : 'translate-x-0.5'"></span>
                      </button>
                    </div>

                    <div class="border-t border-gray-100 my-2"></div>

                    <!-- Tareas -->
                    <div class="flex items-center justify-between" [ngClass]="{'opacity-40 pointer-events-none': signalrService.notificationSettings().muteAll}">
                      <div class="flex flex-col pr-3">
                        <span class="text-xs font-bold text-gray-800">{{ lang.translations().notifications?.tasks || 'Tareas (Llamados, Cuentas, Pedidos)' }}</span>
                      </div>
                      <button type="button"
                              (click)="toggleSetting('tasks')"
                              [disabled]="signalrService.notificationSettings().muteAll"
                              class="relative inline-flex items-center cursor-pointer w-9 h-5 rounded-full transition-colors duration-250 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                              [class]="signalrService.notificationSettings().tasks ? 'bg-accent' : 'bg-gray-200'">
                        <span class="inline-block w-4 h-4 bg-white rounded-full transition-transform duration-250 transform shadow-sm"
                              [class]="signalrService.notificationSettings().tasks ? 'translate-x-[18px]' : 'translate-x-0.5'"></span>
                      </button>
                    </div>

                    <!-- Estados -->
                    <div class="flex items-center justify-between" [ngClass]="{'opacity-40 pointer-events-none': signalrService.notificationSettings().muteAll}">
                      <div class="flex flex-col pr-3">
                        <span class="text-xs font-bold text-gray-800">{{ lang.translations().notifications?.orderStatus || 'Estados de Pedido' }}</span>
                      </div>
                      <button type="button"
                              (click)="toggleSetting('orderStatus')"
                              [disabled]="signalrService.notificationSettings().muteAll"
                              class="relative inline-flex items-center cursor-pointer w-9 h-5 rounded-full transition-colors duration-250 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                              [class]="signalrService.notificationSettings().orderStatus ? 'bg-accent' : 'bg-gray-200'">
                        <span class="inline-block w-4 h-4 bg-white rounded-full transition-transform duration-250 transform shadow-sm"
                              [class]="signalrService.notificationSettings().orderStatus ? 'translate-x-[18px]' : 'translate-x-0.5'"></span>
                      </button>
                    </div>

                    <!-- Reasignaciones -->
                    <div class="flex items-center justify-between" [ngClass]="{'opacity-40 pointer-events-none': signalrService.notificationSettings().muteAll}">
                      <div class="flex flex-col pr-3">
                        <span class="text-xs font-bold text-gray-800">{{ lang.translations().notifications?.reassignments || 'Reasignación de Tareas' }}</span>
                      </div>
                      <button type="button"
                              (click)="toggleSetting('reassignments')"
                              [disabled]="signalrService.notificationSettings().muteAll"
                              class="relative inline-flex items-center cursor-pointer w-9 h-5 rounded-full transition-colors duration-250 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                              [class]="signalrService.notificationSettings().reassignments ? 'bg-accent' : 'bg-gray-200'">
                        <span class="inline-block w-4 h-4 bg-white rounded-full transition-transform duration-250 transform shadow-sm"
                              [class]="signalrService.notificationSettings().reassignments ? 'translate-x-[18px]' : 'translate-x-0.5'"></span>
                      </button>
                    </div>

                    <!-- Footer Warning -->
                    @if (!signalrService.notificationSettings().muteAll) {
                      <div class="text-[10px] text-accent font-semibold uppercase tracking-wider text-center mt-2.5">
                        🔊 {{ lang.translations().notifications?.soundWarning || 'Sonido y vibración habilitados' }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <app-tenant-selector></app-tenant-selector>
            <div class="hidden sm:flex flex-col items-end">
               <span class="font-bold text-sm">{{ auth.currentUser()?.username }}</span>
               <span class="text-xs text-green-500 font-semibold">{{ lang.translations().common.online }}</span>
            </div>
            <div class="h-10 w-10 flex items-center justify-center bg-surface border border-gray-200 rounded-full font-bold text-primary">
              {{ auth.currentUser()?.username?.charAt(0) | uppercase}}
            </div>
          </div>
        </header>

        <div class="p-4 md:p-8 flex-1 overflow-auto bg-[#fafafa] relative">
          @if (dataService.isLoading()) {
            <div class="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
              <div class="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-xs">
                <div class="relative h-16 w-16 mb-4 flex items-center justify-center p-2">
                  <span class="animate-spin absolute h-full w-full border-4 border-accent border-t-transparent rounded-full"></span>
                  <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-inner border border-gray-100 flex">
                    <img [src]="brandingService.logo()" class="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 class="text-lg font-black text-gray-800">Cargando datos...</h3>
                <p class="text-gray-400 text-xs mt-1 font-semibold uppercase tracking-wider animate-pulse">Sincronizando con MozoGo</p>
              </div>
            </div>
          }
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
                  <div class="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-md border border-white/10 flex">
                    <img [src]="brandingService.logo()" class="w-full h-full object-cover" />
                  </div>
                  <span class="truncate">{{ brandingService.appName() }}</span>
                </h2>
                <p class="text-slate-400 text-xs mt-1 font-medium">{{ auth.currentUser()?.role }}</p>
              </div>
              <button (click)="mobileMenuOpen.set(false)" class="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <nav class="flex-1 p-6 space-y-4">
              @if (auth.isAdmin() || auth.isSuperAdmin()) {
                <a routerLink="/admin/inicio" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M4 18h16M4 6l6 6 4-2 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  Métricas y Datos
                </a>
              }
              @if (auth.currentUser()?.role !== 'Cocina') {
                <a routerLink="/admin/dashboard" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/></svg>
                  </span>
                  Mesas y Tareas
                </a>
              }

              @if (auth.currentUser()?.role === 'Cocina' || auth.isAdmin() || auth.isSuperAdmin()) {
                <a routerLink="/admin/cocina" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                  </span>
                  Cocina
                </a>
              }

              @if (auth.isAdmin() || auth.isSuperAdmin()) {
                <a routerLink="/admin/ventas" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m-3-6h15a2.25 2.25 0 0 1 2.25 2.25v13.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 3.75 4.5z" /></svg>
                  </span>
                  Ventas
                </a>
              }

              @if (auth.isAdmin() || auth.isCaja()) {
                <a routerLink="/admin/configuracion" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75M9 21h6m-3-10a4 4 0 11-8 0 4 4 0 018 0zM3 21v-2a4 4 0 014-4h4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  Config. Personal
                </a>
              }
              
              @if (auth.isSuperAdmin()) {
                <a routerLink="/admin/sistema" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-white/20 border-white/20" class="flex items-center gap-4 py-4 px-5 rounded-2xl bg-white/5 text-white shadow-sm font-bold active:bg-white/10 transition-all border border-transparent text-lg">
                  <span class="p-2 bg-accent/20 text-accent rounded-xl text-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  Sistema
                </a>
              }
            </nav>
            
            <div class="p-6 pb-10">
              <button (click)="logout()" class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 text-white font-bold active:bg-red-600 transition-all shadow-lg shadow-red-500/30 text-lg">
                <span class="flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                Cerrar Sesión
              </button>
            </div>
          </aside>
        }
      </main>
      </div>
    }
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
  http = inject(HttpClient);
  dataService = inject(AdminDataService);
  lang = inject(LanguageService);
  public signalrService = inject(SignalrService);
  private pushNotification = inject(PushNotificationService);
  private restauranteService = inject(RestauranteService);
  public brandingService = inject(BrandingService);
  
  mobileMenuOpen = signal(false);
  sidebarCollapsed = signal(false);
  globalAppName = signal<string>('');
  globalLogoBase64 = signal<string>('');
  showNotificationSettings = signal(false);
  isBrandingLoaded = signal(false);

  constructor() {
    this.http.get<any[]>(`${environment.apiUrl}/api/settings/public`).subscribe(data => {
      const appName = data.find(s => s.key === 'GlobalAppName')?.value;
      const appLogo = data.find(s => s.key === 'GlobalLogoBase64')?.value;
      if (appName) {
        this.globalAppName.set(appName);
        this.brandingService.appName.set(appName);
      }
      if (appLogo) {
        this.globalLogoBase64.set(appLogo);
        if (!this.auth.currentUser()?.restauranteId) {
          this.brandingService.logo.set(appLogo);
        }
      }
    });

    const user = this.auth.currentUser();
    if (user && user.restauranteId) {
      this.restauranteService.getById(user.restauranteId).subscribe({
        next: (res) => {
          if (res) {
            this.brandingService.applyBranding({
              primary: res.colorPrimario,
              secondary: res.colorSecundario,
              background: res.colorFondo
            });
            if (res.logoUrl) {
              this.brandingService.logo.set(res.logoUrl);
            }
            if (res.nombre) {
              this.brandingService.appName.set(res.nombre);
            }
          }
          setTimeout(() => this.isBrandingLoaded.set(true), 150); // Pequeño delay para aplicar estilos CSS
        },
        error: (err) => {
          console.warn('Error cargando branding global:', err);
          this.isBrandingLoaded.set(true);
        }
      });
    } else {
      this.isBrandingLoaded.set(true);
    }

    // Solicitar y registrar notificaciones push al iniciar sesión
    this.pushNotification.subscribeToNotifications().catch(e => {
      console.warn('Web Push subscription failed or was ignored:', e);
    });
  }

  toggleSetting(key: 'muteAll' | 'tasks' | 'orderStatus' | 'reassignments') {
    const current = this.signalrService.notificationSettings();
    this.signalrService.updateNotificationSettings({
      [key]: !current[key]
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const container = document.getElementById('notif-settings-menu-container');
    if (container && !container.contains(target)) {
      this.showNotificationSettings.set(false);
    }
  }

  logout() {
    this.pushNotification.unsubscribeFromNotifications().finally(() => {
      const restored = this.auth.logout();
      if (restored) {
        this.router.navigate(['/mozo-select']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
