import { Component, Input, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SignalrService } from '../../../core/services/signalr.service';
import { CartService } from '../../../core/services/cart.service';
import { MenuComponent } from '../components/menu/menu.component';
import { SplitCheckWizardComponent } from './split-check-wizard/split-check-wizard.component';
import { environment } from '../../../../environments/environment';
import { BrandingService } from '../../../core/services/branding.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule, SplitCheckWizardComponent],
  template: `
    @if (requirePin()) {
      <div class="min-h-screen bg-gradient-to-br from-sand via-white to-sand/40 flex flex-col items-center justify-center p-6 px-4 animate-fade-in text-center relative overflow-hidden bg-grid">
        <!-- Radial light accent -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-lg h-[240px] bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-sm w-full border border-white/80 relative z-10 animate-scale-up">
          <div class="h-20 w-20 bg-accent/10 text-accent rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner animate-pulse">
            <svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-serif font-black text-primary mb-2">Mesa Protegida</h2>
          <p class="text-primary/60 text-sm mb-8">Por favor, ingrese el PIN de acceso proporcionado por su Mozo para ver el menú y ordenar.</p>
          
          <input type="tel" #pinInputRef (focus)="pinInputRef.scrollIntoView({behavior: 'smooth', block: 'center'})" 
                 [(ngModel)]="pinInput" name="pin"
                 placeholder="••••" maxlength="4" pattern="[0-9]*"
                 class="w-full text-center text-4xl font-black tracking-[0.75em] pl-[0.75em] py-5 rounded-2xl border-2 border-gray-255 focus:border-accent focus:ring-8 focus:ring-accent/10 outline-none transition-all mb-4 bg-gray-50/50 shadow-inner">
          
          @if(pinError()) {
            <div class="bg-red-50 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl mb-4 border border-red-100 flex items-center justify-center gap-2 animate-[shake_0.5s_ease-out]">
              <span class="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
              {{ pinError() }}
            </div>
          }

          <button (click)="submitPin()" [disabled]="validatingPin()" 
                  class="w-full bg-accent hover:bg-accent/90 text-white font-black py-4.5 rounded-2xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm uppercase tracking-wider">
            @if(validatingPin()) {
               <span class="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></span>
            } @else {
               Desbloquear Menú
            }
          </button>
        </div>
      </div>
    } @else if (isValidSession() === undefined) {
      <div class="min-h-screen bg-gradient-to-br from-sand via-white to-sand/40 flex flex-col items-center justify-center p-6 animate-fade-in text-center relative overflow-hidden bg-grid">
        <!-- Radial light accent -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-lg h-[240px] bg-gradient-to-b from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative flex flex-col items-center z-10">
          <div class="h-24 w-24 flex items-center justify-center mb-8 relative p-2">
            <span class="animate-spin absolute h-20 w-20 border-4 border-accent border-t-transparent rounded-full"></span>
            <div class="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white flex bg-white p-2">
              <img [src]="brandingService.logo()" class="w-full h-full object-contain" />
            </div>
          </div>
          <h2 class="text-3xl font-serif font-black text-primary tracking-tight mb-2">{{ brandingService.appName() }}</h2>
          <div class="flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full">
            <span class="w-2 h-2 bg-accent rounded-full animate-ping"></span>
            <p class="text-accent text-xs font-black uppercase tracking-widest">Validando Código QR</p>
          </div>
        </div>
      </div>
    } @else if (isValidSession() === false) {
      <div class="min-h-screen bg-red-50/50 flex flex-col items-center justify-center p-6 px-10 text-center animate-fade-in relative overflow-hidden bg-grid">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-lg h-[240px] bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div class="h-28 w-28 bg-white text-red-500 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-red-100 animate-[shake_0.5s_ease-out] relative z-10">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-serif font-black text-gray-900 mb-4 tracking-tight relative z-10">Acceso Denegado</h1>
        <p class="text-lg text-gray-600 font-medium mb-8 max-w-xs mx-auto relative z-10">
          El código QR ha expirado o la mesa está inactiva. Por favor, solicita asistencia a tu Mozo.
        </p>
        <button (click)="verifyMesa()" class="bg-white text-gray-800 font-black py-4 px-8 rounded-2xl shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center gap-2.5 active:scale-95 relative z-10 text-sm">
          <svg class="w-4 h-4 text-gray-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
          </svg>
          Reintentar Conexión
        </button>
      </div>
    } @else {
      <div class="min-h-screen bg-[#f8f9fa] flex justify-center items-stretch w-full">
        <div class="w-full max-w-md min-h-screen bg-gradient-to-b from-sand via-white to-sand/40 flex flex-col animate-fade-in relative overflow-hidden bg-grid shadow-[0_0_80px_rgba(0,0,0,0.03)] border-x border-gray-100/50">
          <!-- Radial light accent background -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-lg h-[260px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <!-- Sticky Header Bar (Native Style) -->
          <header class="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100/60 z-30 py-4 px-6">
            <div class="flex justify-between items-center w-full">
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-black uppercase text-accent tracking-[0.2em] leading-none">Mesa Virtual</span>
                <span class="text-xl font-serif font-black text-primary mt-1.5 leading-none">Mesa {{ numeroMesa() || '...' }}</span>
              </div>
              <div class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 text-green-700 font-bold text-[10px]">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Conectado
              </div>
            </div>
          </header>

          <!-- CONTENIDO CENTRAL -->
          <div class="flex-1 px-6 py-6 flex flex-col items-center pb-28 relative z-10 w-full overflow-y-auto">
             @if (activeBottomTab() === 'inicio') {
               <div class="w-full max-w-md animate-fade-in flex flex-col gap-6">
                 
                 <!-- Monto Consumido (Premium Fintech Card) -->
                 @if (montoConsumo() !== null && montoConsumo() !== undefined && montoConsumo()! > 0) {
                   <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-[2.25rem] p-6 w-full flex justify-between items-center shadow-xl border border-slate-700/50 relative overflow-hidden">
                     <!-- Decorative pattern -->
                     <div class="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                     
                     <div class="flex flex-col text-left">
                       <span class="text-[9px] uppercase font-black text-slate-400 tracking-[0.25em] leading-none">Total Consumido</span>
                       <h2 class="text-3xl font-black leading-none mt-2.5 font-serif text-white">\${{ formatCurrency(montoConsumo()) }}</h2>
                     </div>
                     <button (click)="abrirDividirCuenta()" class="text-xs font-black bg-white/10 hover:bg-white/20 border border-white/25 text-white px-5 py-3.5 rounded-2xl transition-all active:scale-95 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                       <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                       </svg>
                       Dividir Cuenta
                     </button>
                   </div>
                 }

                 <!-- Seguidor de Pedido Activo / Cocina Status (Premium Tracker) -->
                 @if (activePedidoTaskId()) {
                   <div class="bg-white border border-gray-100 rounded-[2.25rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.02)] animate-fade-in flex flex-col gap-5">
                     <div class="flex justify-between items-center pb-3 border-b border-gray-50">
                       <div class="flex flex-col text-left">
                         <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Seguimiento</span>
                         <span class="font-black text-sm text-gray-800 mt-1.5">Estado de tu Orden</span>
                       </div>
                       
                       @if (activePedidoEstado() === 'Recibido') {
                         <button 
                           (click)="cancelarPedido()"
                           [disabled]="loadingCancelarPedido()"
                           class="text-xs text-red-500 font-bold active:scale-95 transition-all bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-xl border border-red-100/50">
                           @if (loadingCancelarPedido()) {
                             <span class="animate-spin h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full inline-block"></span>
                           } @else {
                             Cancelar
                           }
                         </button>
                       }
                     </div>

                     <!-- Progress Bar tracker with SVG icons -->
                     <div class="grid grid-cols-4 items-center gap-1 py-1 relative">
                       <!-- Line background -->
                       <div class="absolute left-[12%] right-[12%] top-[35%] h-[3px] bg-gray-100 -z-10 rounded-full"></div>
                       <div class="absolute left-[12%] top-[35%] h-[3px] bg-accent transition-all duration-700 -z-10 rounded-full"
                            [style.width]="activePedidoEstado() === 'Recibido' ? '0%' : (activePedidoEstado() === 'Aprobado' ? '33%' : (activePedidoEstado() === 'EnPreparacion' ? '66%' : '100%'))"></div>
                       
                       <!-- Step 1: Recibido -->
                       <div class="flex flex-col items-center text-center">
                         <span class="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                               [ngClass]="activePedidoEstado() === 'Recibido' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black' : 'bg-gray-50 text-gray-400 border border-gray-100'">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                         </span>
                         <span class="text-[9px] font-black text-gray-500 mt-2">Recibido</span>
                       </div>

                       <!-- Step 2: Aprobado -->
                       <div class="flex flex-col items-center text-center">
                         <span class="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                               [ngClass]="activePedidoEstado() === 'Aprobado' ? 'bg-primary text-white shadow-md shadow-primary/20 font-black' : (activePedidoEstado() === 'EnPreparacion' || activePedidoEstado() === 'Listo' ? 'bg-accent text-white font-black' : 'bg-gray-50 text-gray-400 border border-gray-100')">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                         </span>
                         <span class="text-[9px] font-black text-gray-500 mt-2">Aprobado</span>
                       </div>

                       <!-- Step 3: EnPreparacion -->
                       <div class="flex flex-col items-center text-center">
                         <span class="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                               [ngClass]="activePedidoEstado() === 'EnPreparacion' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black animate-pulse' : (activePedidoEstado() === 'Listo' ? 'bg-accent text-white font-black' : 'bg-gray-50 text-gray-400 border border-gray-100')">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88M9.88 16.122A3 3 0 1014.12 11.88M9.88 16.122L14.12 11.88"></path></svg>
                         </span>
                         <span class="text-[9px] font-black text-gray-500 mt-2">Cocina</span>
                       </div>

                       <!-- Step 4: Listo -->
                       <div class="flex flex-col items-center text-center">
                         <span class="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                               [ngClass]="activePedidoEstado() === 'Listo' ? 'bg-green-600 text-white shadow-md shadow-green-500/20 font-black animate-[bounce_1s_infinite]' : 'bg-gray-50 text-gray-400 border border-gray-100'">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                         </span>
                         <span class="text-[9px] font-black text-gray-500 mt-2">¡Listo!</span>
                       </div>
                     </div>

                     <!-- Order Details -->
                     <div class="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-left">
                       <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Detalle del Pedido</p>
                       <p class="text-xs font-bold text-gray-600 mt-2 leading-relaxed">{{ activePedidoDetails() || 'Sin detalles' }}</p>
                     </div>
                   </div>
                 }

                 <!-- MÓDULO DE ACCIONES PREMIUM (Grid de Botones Balanceado y Centrado) -->
                 <div class="flex flex-col gap-4 w-full">
                   
                   <!-- 1. CARTA HERO (VER MENÚ) -->
                   <button (click)="activeBottomTab.set('menu')" 
                           class="w-full bg-slate-900 text-white rounded-[2.25rem] p-6 text-left shadow-lg active:scale-[0.98] transition-all flex items-center justify-between border border-slate-800 relative overflow-hidden group shrink-0">
                     <div class="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>
                     
                     <div class="flex items-center gap-5">
                       <div class="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                         <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                         </svg>
                       </div>
                       <div class="flex flex-col text-left">
                         <span class="text-[9px] font-black uppercase text-accent tracking-[0.25em] leading-none">Menú Digital</span>
                         <span class="font-serif font-black text-xl mt-1.5 leading-none">Explorar la Carta</span>
                         <span class="text-[10px] text-white/50 font-semibold mt-1.5">Elegí lo que querés comer y beber</span>
                       </div>
                     </div>
                     <div class="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 shrink-0 group-hover:translate-x-1 transition-transform">
                       <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
                     </div>
                   </button>

                   <!-- 2. SECUNDARIOS EN GRID (Llamar Mozo y Pedir Cuenta) -->
                   <div class="grid grid-cols-2 gap-4 w-full">
                     
                     <!-- Llamar Mozo -->
                     @if (yaLlamo()) {
                       <div class="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-[2.25rem] p-5 flex flex-col items-center justify-between text-center shadow-sm relative aspect-square w-full">
                         <div class="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 animate-bounce mt-2 shrink-0">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                           </svg>
                         </div>
                         <div class="flex flex-col items-center mb-1">
                           <span class="text-[8px] font-black uppercase text-emerald-600 tracking-[0.2em] leading-none">Asistencia</span>
                           <span class="font-black text-gray-800 text-xs mt-1 leading-none">Mozo en camino</span>
                         </div>
                         <button (click)="cancelarLlamado()" [disabled]="loadingCancelarLlamar()" class="absolute top-3 right-3 h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:scale-90">
                            @if (loadingCancelarLlamar()) {
                              <span class="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full block"></span>
                            } @else {
                              <svg class="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            }
                         </button>
                       </div>
                     } @else {
                       <button (click)="abrirModalLlamar()" [disabled]="loadingLlamar()" 
                               class="bg-white border border-gray-150 rounded-[2.25rem] p-5 flex flex-col items-center justify-center gap-3 text-center shadow-sm active:scale-[0.97] transition-all group aspect-square w-full">
                          <div class="h-12 w-12 bg-accent/5 text-accent rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                          </div>
                          <div class="flex flex-col items-center">
                            <span class="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none">Asistencia</span>
                            <span class="font-black text-gray-800 text-xs mt-1 leading-none">Llamar Mozo</span>
                          </div>
                        </button>
                     }

                     <!-- Pedir Cuenta -->
                     @if (yaPidioCuenta()) {
                       <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-[2.25rem] p-5 flex flex-col items-center justify-between text-center shadow-sm relative aspect-square w-full">
                         <div class="h-12 w-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 animate-pulse mt-2 shrink-0">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                           </svg>
                         </div>
                         <div class="flex flex-col items-center mb-1">
                           <span class="text-[8px] font-black uppercase text-amber-600 tracking-[0.2em] leading-none">Pago</span>
                           <span class="font-black text-gray-800 text-xs mt-1 leading-none">Ticket en Caja</span>
                         </div>
                         <button (click)="cancelarCuenta()" [disabled]="loadingCancelarCuenta()" class="absolute top-3 right-3 h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:scale-90">
                            @if (loadingCancelarCuenta()) {
                              <span class="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full block"></span>
                            } @else {
                              <svg class="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            }
                         </button>
                       </div>
                     } @else {
                       <button (click)="abrirModalCuenta()" [disabled]="loadingCuenta()" 
                               class="bg-white border border-gray-150 rounded-[2.25rem] p-5 flex flex-col items-center justify-center gap-3 text-center shadow-sm active:scale-[0.97] transition-all group aspect-square w-full">
                         <div class="h-12 w-12 bg-indigo-50/10 text-indigo-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2 2 4-4m-6 2h.01M12 16h.01M15 16h.01M13 8h7m-7 4h3m-9-4h3m-3 4h3m-3 4h3m-3 4h3m-6 4h12a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                           </svg>
                         </div>
                         <div class="flex flex-col items-center">
                           <span class="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none">Cierre</span>
                           <span class="font-black text-gray-800 text-xs mt-1 leading-none">Pedir Cuenta</span>
                         </div>
                       </button>
                     }

                   </div>

                    <!-- 3. SECCIÓN DE VALORACIÓN / OPINIÓN -->
                    @if (!ratingSubmitted()) {
                      <div class="bg-white rounded-[2.25rem] border border-gray-150 p-6 shadow-sm mt-4 text-left w-full animate-fade-in">
                        <h3 class="font-serif font-black text-lg text-gray-800 mb-1 flex items-center gap-1.5">
                          ⭐ Danos tu opinión
                        </h3>
                        <p class="text-xs text-gray-500 font-medium mb-4">Ayudanos a mejorar tu experiencia</p>

                        <div class="space-y-3.5">
                          <!-- Rating Row: General -->
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-700">General</span>
                            <div class="flex gap-1">
                              @for (star of [1, 2, 3, 4, 5]; track star) {
                                <button (click)="ratingGeneral.set(star)" type="button" class="text-lg transition-transform active:scale-125 focus:outline-none">
                                  {{ ratingGeneral() >= star ? '⭐' : '☆' }}
                                </button>
                              }
                            </div>
                          </div>

                          <!-- Rating Row: Comida -->
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-700">Platos y Bebidas</span>
                            <div class="flex gap-1">
                              @for (star of [1, 2, 3, 4, 5]; track star) {
                                <button (click)="ratingComida.set(star)" type="button" class="text-lg transition-transform active:scale-125 focus:outline-none">
                                  {{ ratingComida() >= star ? '⭐' : '☆' }}
                                </button>
                              }
                            </div>
                          </div>

                          <!-- Rating Row: Mozo -->
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-700">Atención del Mozo</span>
                            <div class="flex gap-1">
                              @for (star of [1, 2, 3, 4, 5]; track star) {
                                <button (click)="ratingMozo.set(star)" type="button" class="text-lg transition-transform active:scale-125 focus:outline-none">
                                  {{ ratingMozo() >= star ? '⭐' : '☆' }}
                                </button>
                              }
                            </div>
                          </div>

                          <!-- Rating Row: Servicio -->
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-700">Servicio y Ambiente</span>
                            <div class="flex gap-1">
                              @for (star of [1, 2, 3, 4, 5]; track star) {
                                <button (click)="ratingServicio.set(star)" type="button" class="text-lg transition-transform active:scale-125 focus:outline-none">
                                  {{ ratingServicio() >= star ? '⭐' : '☆' }}
                                </button>
                              }
                            </div>
                          </div>

                          <!-- Comentario -->
                          <div class="pt-2">
                            <textarea [ngModel]="ratingComment()" (ngModelChange)="ratingComment.set($event)" 
                                      placeholder="Dejanos un comentario (opcional)..." 
                                      rows="2" 
                                      class="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-accent/20 resize-none font-medium text-gray-700"></textarea>
                          </div>

                          <button (click)="enviarValoracion()" [disabled]="submittingRating()"
                                  class="w-full mt-2 bg-primary text-white py-3 rounded-2xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
                            @if (submittingRating()) {
                              <span class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full block"></span>
                            }
                            Enviar Calificación
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="bg-emerald-50/20 border border-emerald-100 rounded-[2.25rem] p-6 shadow-sm mt-4 text-center w-full animate-fade-in">
                        <div class="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-lg select-none">💖</div>
                        <h3 class="font-serif font-black text-base text-gray-800 mb-1">¡Muchas gracias!</h3>
                        <p class="text-xs text-gray-500 font-medium">Tu valoración ha sido registrada con éxito y nos ayuda muchísimo a seguir mejorando.</p>
                      </div>
                    }
                 </div>
               </div>
             }

             @if (activeBottomTab() === 'menu') {
               <div class="w-full max-w-md animate-fade-in flex flex-col pb-8">
                  <button (click)="activeBottomTab.set('inicio')" class="mb-5 flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors font-black px-2 self-start active:scale-95 text-xs uppercase tracking-wider">
                     <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                     Volver a la Mesa
                  </button>
                  <app-menu [restauranteId]="restauranteId()"></app-menu>
               </div>
             }
             
              @if (activeBottomTab() === 'juegos') {
                <div class="w-full max-w-md animate-fade-in flex flex-col pb-24 px-4 text-primary">
                  <button (click)="activeBottomTab.set('inicio')" class="mb-5 flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors font-black px-2 self-start active:scale-95 text-xs uppercase tracking-wider">
                     <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                     Volver a la Mesa
                  </button>

                  <div class="bg-white rounded-[2.25rem] border border-gray-150 p-6 shadow-sm mb-6 text-center">
                    <span class="text-4xl block mb-2 select-none">🎮</span>
                    <h2 class="font-serif font-black text-xl text-gray-800">Zona de Entretenimiento</h2>
                    <p class="text-xs text-gray-400 font-semibold mt-1">¡Jugá mientras esperas tu comida!</p>
                  </div>

                  <!-- Game Selectors -->
                  <div class="flex gap-2 mb-6 select-none">
                    <button (click)="selectedGame.set('dados')" 
                            class="flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all active:scale-95"
                            [ngClass]="selectedGame() === 'dados' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-slate-100'">
                      🎲 Dados
                    </button>
                    <button (click)="selectedGame.set('trivia')" 
                            class="flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all active:scale-95"
                            [ngClass]="selectedGame() === 'trivia' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-slate-100'">
                      🧠 Trivia
                    </button>
                  </div>

                  <!-- GAME 1: Guerra de Dados -->
                  @if (selectedGame() === 'dados') {
                    <div class="bg-white rounded-[2.25rem] border border-gray-150 p-6 shadow-sm animate-scale-up text-center">
                      <h3 class="font-black text-sm text-gray-800 uppercase tracking-widest mb-4">🎲 Guerra de Dados</h3>
                      
                      <div class="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-6 select-none">
                        <div>
                          <span class="text-[10px] font-bold text-gray-400 block">TÚ</span>
                          <span class="text-xl font-black text-indigo-650 block">{{ dicePlayerWins() }}</span>
                        </div>
                        <div class="flex items-center justify-center text-xs font-black text-gray-300">VS</div>
                        <div>
                          <span class="text-[10px] font-bold text-gray-400 block">BOT</span>
                          <span class="text-xl font-black text-gray-800 block">{{ diceBotWins() }}</span>
                        </div>
                      </div>

                      <div class="flex justify-around items-center py-6 mb-6">
                        <div class="flex flex-col items-center gap-2">
                          <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tu dado</span>
                          <div class="text-6xl font-bold transition-all duration-300" [class.animate-bounce]="rollingDice()">
                            {{ getDiceEmoji(playerDiceValue()) }}
                          </div>
                        </div>
                        <div class="flex flex-col items-center gap-2">
                          <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bot dado</span>
                          <div class="text-6xl font-bold transition-all duration-300" [class.animate-bounce]="rollingDice()">
                            {{ getDiceEmoji(botDiceValue()) }}
                          </div>
                        </div>
                      </div>

                      <div class="text-sm font-bold text-gray-800 h-6 mb-6">
                        @if (rollingDice()) {
                          <span class="text-slate-400 animate-pulse">¡Lanzando dados...! 🎲</span>
                        } @else if (diceWinnerMessage()) {
                          <span [ngClass]="{
                            'text-emerald-600': diceWinnerMessage().includes('Ganaste'),
                            'text-red-500': diceWinnerMessage().includes('Perdiste'),
                            'text-slate-500': diceWinnerMessage().includes('Empate')
                          }">
                            {{ diceWinnerMessage() }}
                          </span>
                        } @else {
                          <span class="text-gray-400">¿Listo para desafiar al bot?</span>
                        }
                      </div>

                      <div class="flex gap-2">
                        <button (click)="rollDice()" [disabled]="rollingDice()" 
                                class="flex-1 bg-accent text-white py-3.5 rounded-2xl text-xs font-black shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                          🎲 Tirar Dado
                        </button>
                        <button (click)="resetDiceGame()" class="bg-gray-100 hover:bg-gray-250 text-gray-600 border border-gray-250 px-4 rounded-2xl text-xs font-bold transition-all active:scale-95">
                          Reiniciar
                        </button>
                      </div>
                    </div>
                  }

                  <!-- GAME 2: Trivia Express -->
                  @if (selectedGame() === 'trivia') {
                    <div class="bg-white rounded-[2.25rem] border border-gray-150 p-6 shadow-sm animate-scale-up text-left">
                      <div class="flex justify-between items-center mb-4">
                        <h3 class="font-black text-sm text-gray-800 uppercase tracking-widest">🧠 Trivia Express</h3>
                        <span class="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                          Score: {{ triviaCorrectCount() }}
                        </span>
                      </div>

                      <div class="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-5">
                        <span class="text-[9px] font-black text-indigo-650 uppercase tracking-wider block mb-1 select-none font-bold">Pregunta al azar</span>
                        <p class="font-bold text-sm text-gray-800 leading-relaxed">{{ currentQuestion().question }}</p>
                      </div>

                      <div class="space-y-2.5">
                        @for (opt of currentQuestion().options; let idx = $index; track opt) {
                          <button (click)="answerQuestion(idx)" 
                                  [disabled]="answeredTrivia()"
                                  class="w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex justify-between items-center active:scale-[0.99]"
                                  [ngClass]="getTriviaOptionClass(idx)">
                            <span>{{ opt }}</span>
                            @if (answeredTrivia()) {
                              <span>
                                @if (idx === currentQuestion().correctAnswer) {
                                  🟢
                                } @else if (selectedAnswerIndex() === idx) {
                                  🔴
                                }
                              </span>
                            }
                          </button>
                        }
                      </div>

                      @if (answeredTrivia()) {
                        <div class="mt-5 text-center animate-fade-in">
                          <button (click)="nextTriviaQuestion()" 
                                  class="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-slate-800 active:scale-95 transition-all select-none">
                            Siguiente Pregunta ➔
                          </button>
                        </div>
                      }
                    </div>
                  }

                </div>
              }
          </div>

          <!-- Floating Bottom Navigation Bar (Las 3 Barras Centradas) -->
          <div class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 z-30 pb-safe">
             <div class="flex justify-around items-center h-20 w-full px-4 select-none">
                <button (click)="activeBottomTab.set('inicio')" 
                        class="flex flex-col items-center justify-center w-full h-full text-[10px] font-black uppercase tracking-wider transition-colors relative" 
                        [ngClass]="activeBottomTab() === 'inicio' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'">
                  @if (activeBottomTab() === 'inicio') {
                    <span class="absolute top-0 w-8 h-1 bg-accent rounded-full left-1/2 -translate-x-1/2"></span>
                  }
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  Inicio
                </button>
                
                <button (click)="activeBottomTab.set('menu')" 
                        class="flex flex-col items-center justify-center w-full h-full text-[10px] font-black uppercase tracking-wider transition-colors relative" 
                        [ngClass]="activeBottomTab() === 'menu' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'">
                  @if (activeBottomTab() === 'menu') {
                    <span class="absolute top-0 w-8 h-1 bg-accent rounded-full left-1/2 -translate-x-1/2"></span>
                  }
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  Menú
                </button>

                <button (click)="activeBottomTab.set('juegos')" 
                        class="flex flex-col items-center justify-center w-full h-full text-[10px] font-black uppercase tracking-wider transition-colors relative" 
                        [ngClass]="activeBottomTab() === 'juegos' ? 'text-accent' : 'text-gray-400 hover:text-gray-600'">
                  @if (activeBottomTab() === 'juegos') {
                    <span class="absolute top-0 w-8 h-1 bg-accent rounded-full left-1/2 -translate-x-1/2"></span>
                  }
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Juegos
                </button>
                
                <button (click)="abrirDividirCuenta()" 
                        class="flex flex-col items-center justify-center w-full h-full text-[10px] font-black uppercase tracking-wider transition-colors relative" 
                        [ngClass]="showSplitModal() ? 'text-accent' : 'text-gray-400 hover:text-gray-600'">
                  @if (showSplitModal()) {
                    <span class="absolute top-0 w-8 h-1 bg-accent rounded-full left-1/2 -translate-x-1/2"></span>
                  }
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  Cuenta
                </button>
             </div>
          </div>

        <!-- Floating Cart Panel (Premium styling) -->
        @if (cart.totalItems() > 0 && !showCartModal()) {
          <div class="fixed bottom-24 left-0 right-0 px-4 flex justify-center z-40 animate-fade-in pointer-events-none">
            <button 
              (click)="showCartModal.set(true)"
              class="w-full max-w-sm bg-accent text-white rounded-[2rem] shadow-[0_15px_40px_rgba(var(--color-accent-rgb,0,0,0),0.25)] p-5 flex justify-between items-center active:scale-[0.98] transition-all border border-accent/20 pointer-events-auto group">
              <div class="flex items-center gap-3">
                 <div class="bg-white text-accent rounded-xl h-9 w-9 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                   {{ cart.totalItems() }}
                 </div>
                 <div class="flex flex-col text-left">
                   <span class="text-[9px] uppercase font-black tracking-wider text-white/70">Canasto Activo</span>
                   <span class="font-bold text-sm">Ver mi Pedido</span>
                 </div>
              </div>
              <span class="font-black text-lg font-serif">\${{ cart.totalPrice() }}</span>
            </button>
          </div>
        }

        <!-- Cart Modal (Premium Rounded Dialog) -->
        @if (showCartModal()) {
          <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative border border-gray-100 animate-scale-up">
                <button (click)="showCartModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 class="text-2xl font-serif font-black text-gray-800 mb-6">Tu Pedido</h2>
                
                <div class="max-h-64 overflow-y-auto space-y-4 mb-6 pr-2">
                   @for (item of cart.items(); track item.id) {
                     <div class="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <div class="flex items-center gap-3">
                           <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              <button (click)="cart.decreaseQuantity(item.id)" class="px-3 py-1.5 font-black text-gray-500 hover:text-red-500 transition-colors">-</button>
                              <span class="font-black text-xs w-4 text-center text-gray-800">{{ item.quantity }}</span>
                              <button (click)="cart.addToCart(item)" class="px-3 py-1.5 font-black text-gray-500 hover:text-accent transition-colors">+</button>
                           </div>
                           <div class="text-left">
                             <p class="font-black text-xs text-gray-800 leading-tight">{{ item.nombre }}</p>
                             <p class="text-[10px] text-gray-400 font-bold mt-0.5">\${{ item.precio }} c/u</p>
                           </div>
                        </div>
                        <span class="font-black text-sm text-gray-800 font-serif">\${{ item.precio * item.quantity }}</span>
                     </div>
                   } @empty {
                     <p class="text-center text-gray-400 py-8 font-medium">El canasto está vacío</p>
                   }
                </div>
                
                @if (cart.totalItems() > 0) {
                  <div class="border-t border-gray-100 pt-5 mb-6">
                    <div class="flex justify-between items-center">
                       <span class="font-bold text-sm text-gray-400 uppercase tracking-widest">Total a pagar</span>
                       <span class="font-black text-2xl text-accent font-serif">\${{ cart.totalPrice() }}</span>
                    </div>
                  </div>
                  <button 
                    (click)="enviarPedido()"
                    [disabled]="loadingPedido()"
                    class="w-full bg-accent text-white py-4.5 rounded-2xl font-black text-sm hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg shadow-accent/25 flex justify-center items-center gap-2 uppercase tracking-wider">
                    @if (loadingPedido()) {
                      <span class="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></span>
                    } @else {
                      Enviar Pedido a Cocina
                    }
                  </button>
                }
             </div>
          </div>
        }

        <!-- Split check modal and other dialogs -->
        @if (showSplitModal()) {
          <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative max-h-[85vh] flex flex-col border border-gray-100 animate-scale-up">
                <button (click)="showSplitModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 class="text-2xl font-serif font-black text-gray-800 mb-1 flex items-center gap-2">
                   Dividir Cuenta
                </h2>
                <p class="text-xs text-gray-400 font-semibold mb-5">Calculá el consumo fraccionado entre comensales.</p>
                
                <!-- Scrollable Content Container -->
                <div class="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
                  
                  <!-- Formulario Agregar Comensal -->
                  <div class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-left">
                    <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Agregar Comensal</h3>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" [(ngModel)]="nuevoComensalNombre" placeholder="Nombre" 
                             class="bg-white px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-accent focus:outline-none transition-all font-bold">
                      <input type="text" [(ngModel)]="nuevoComensalApellido" placeholder="Apellido" 
                             class="bg-white px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-accent focus:outline-none transition-all font-bold">
                    </div>
                    <button (click)="agregarComensal()" 
                            [disabled]="!nuevoComensalNombre.trim() || !nuevoComensalApellido.trim()"
                            class="w-full bg-accent hover:bg-accent/90 text-white font-black text-xs py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-wider">
                      + Agregar
                    </button>
                  </div>

                  <!-- Lista de Comensales Agregados -->
                  @if (comensales().length > 0) {
                    <div class="text-left">
                      <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comensales ({{ comensales().length }})</h3>
                      <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                        @for (c of comensales(); track c.id) {
                          <span class="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm animate-fade-in">
                            {{ c.nombre }} {{ c.apellido }}
                            <button (click)="removerComensal(c.id)" class="text-red-500 hover:text-red-700 ml-1 font-black transition-colors text-sm">×</button>
                          </span>
                        }
                      </div>
                    </div>
                  }

                  @if (comensales().length > 0) {
                    <!-- Selector de Modo de División -->
                    <div class="text-left">
                      <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modo de División</h3>
                      <div class="flex bg-gray-100 p-1 rounded-2xl">
                        <button 
                          (click)="changeSplitMode('equitativa')" 
                          [ngClass]="{'bg-white shadow-sm font-black text-accent': splitMode() === 'equitativa', 'text-gray-500 font-bold': splitMode() !== 'equitativa'}"
                          class="flex-1 py-2.5 text-xs rounded-xl transition-all">
                          Equitativa
                        </button>
                        <button 
                          (click)="changeSplitMode('items')" 
                          [ngClass]="{'bg-white shadow-sm font-black text-accent': splitMode() === 'items', 'text-gray-500 font-bold': splitMode() !== 'items'}"
                          class="flex-1 py-2.5 text-xs rounded-xl transition-all">
                          Por Consumos
                        </button>
                      </div>
                    </div>

                    <!-- Asignación de Items (si es Por Consumos) -->
                    @if (splitMode() === 'items') {
                      <div class="text-left">
                        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Asignar Consumos</h3>
                        <p class="text-[10px] text-gray-400 font-medium mb-3 italic">Los consumos que dejes sin asignar se dividirán en partes iguales entre todos.</p>
                        
                        <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
                          @for (unit of itemUnits(); track unit.unitId) {
                            <div class="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                              <div class="text-left">
                                <p class="text-xs font-black text-gray-800 leading-tight">{{ unit.nombre }}</p>
                                <p class="text-[10px] text-gray-400 font-bold mt-0.5">\${{ formatCurrency(unit.precio) }}</p>
                              </div>
                              <select 
                                [ngModel]="itemAssignments()[unit.unitId] || ''"
                                (ngModelChange)="assignItem(unit.unitId, $event)"
                                class="bg-white border border-gray-200 rounded-xl text-xs py-1.5 px-2 focus:border-accent outline-none font-bold text-gray-700 max-w-[150px] shadow-sm">
                                <option value="">Compartido / Todos</option>
                                @for (c of comensales(); track c.id) {
                                  <option [value]="c.id">{{ c.nombre }} {{ c.apellido }}</option>
                                }
                              </select>
                            </div>
                          } @empty {
                            <p class="text-center text-xs text-gray-400 py-4 font-medium">No hay consumos entregados en esta mesa todavía.</p>
                          }
                        </div>
                      </div>
                    }

                    <!-- Resumen de Totales a Pagar -->
                    <div class="border-t border-gray-150 pt-5 text-left">
                      <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resumen de Cuenta</h3>
                      <div class="space-y-2">
                        @for (c of comensalesTotals(); track c.id) {
                          <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-100 p-4.5 rounded-2xl flex justify-between items-center shadow-sm">
                            <div class="text-left max-w-[70%]">
                              <p class="text-xs font-black text-gray-800">{{ c.nombre }} {{ c.apellido }}</p>
                              @if (splitMode() === 'items') {
                                <p class="text-[9px] text-gray-400 font-bold mt-0.5 truncate" [title]="c.details">
                                  {{ c.details }}
                                </p>
                              }
                            </div>
                            <span class="font-black text-sm text-accent font-serif">\${{ formatCurrency(c.total) }}</span>
                          </div>
                        }
                      </div>

                      <!-- Botón de compartir WhatsApp -->
                      <button 
                        (click)="compartirWhatsApp()"
                        class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-green-500/10 active:scale-[0.98] uppercase tracking-wider">
                        <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.451 5.432 0 9.851-4.42 9.855-9.852.002-2.63-1.023-5.101-2.887-6.966a9.78 9.78 0 0 0-6.96-2.873c-5.433 0-9.853 4.42-9.858 9.853-.001 1.75.457 3.456 1.328 4.965l-1.017 3.714 3.822-1.002z"/>
                        </svg>
                        Compartir Cuenta por WhatsApp
                      </button>
                    </div>

                  } @else {
                    <div class="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                      <p class="text-sm font-black text-gray-700">Comenzá por agregar comensales</p>
                      <p class="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto font-semibold leading-relaxed">Agrega las personas presentes en la mesa para ver el desglose o fraccionamiento.</p>
                    </div>
                  }
                </div>
             </div>
          </div>
        }

        <!-- Success Toast Notifications -->
        @if (showSuccessToast()) {
          <div class="fixed top-6 left-0 right-0 flex justify-center z-50 animate-[slide-down_0.5s_ease-out] pointer-events-none px-4">
             <div class="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_15px_40px_rgba(16,185,129,0.3)] font-black text-xs uppercase tracking-wider flex items-center gap-3 backdrop-blur-md border border-emerald-500/20">
               <svg class="w-5 h-5 text-white shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
               </svg>
               ¡Pedido enviado con éxito!
             </div>
          </div>
        }

        <!-- Llamar Mozo Modal (Premium custom description) -->
        @if (showLlamarModal()) {
          <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
                <button (click)="showLlamarModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <span class="text-3xl block mb-2 select-none">🛎️</span>
                <h2 class="text-xl font-serif font-black text-gray-800 mb-1">Llamar al Mozo</h2>
                <p class="text-xs text-gray-400 font-semibold mb-5">Si necesitas algo específico, indícalo abajo (opcional).</p>
                
                <div class="mb-6">
                  <textarea 
                    [(ngModel)]="llamarMotivoInput"
                    rows="3"
                    class="w-full px-4 py-3 rounded-2xl border border-gray-150 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-xs font-bold transition-all text-gray-700 resize-none"
                    placeholder="Ej: Traer servilletas, cubiertos, hielo, etc."></textarea>
                </div>
                
                <button 
                  (click)="confirmarLlamarMozo()"
                  [disabled]="loadingLlamar()"
                  class="w-full bg-accent text-white py-4 rounded-2xl font-black text-xs hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg shadow-accent/25 flex justify-center items-center gap-2 uppercase tracking-wider">
                  @if (loadingLlamar()) {
                    <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full block animate-delay-150"></span>
                  } @else {
                    Confirmar Llamado
                  }
                </button>
             </div>
          </div>
        }

        <!-- Pedir Cuenta Modal (Payment options and change) -->
        @if (showPedirCuentaModal()) {
          <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
                <button (click)="showPedirCuentaModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <span class="text-3xl block mb-2 select-none">💵</span>
                <h2 class="text-xl font-serif font-black text-gray-800 mb-1">Pedir la Cuenta</h2>
                <p class="text-xs text-gray-400 font-semibold mb-5">Selecciona el método de pago para agilizar el servicio.</p>
                
                <div class="space-y-3 mb-6">
                  <!-- Payment Method Selection -->
                  <div class="flex gap-2">
                    <button 
                      (click)="metodoPago.set('efectivo')"
                      class="flex-1 py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      [ngClass]="metodoPago() === 'efectivo' ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-gray-150 text-gray-650'">
                      <span>💵</span> Efectivo
                    </button>
                    <button 
                      (click)="metodoPago.set('tarjeta')"
                      class="flex-1 py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      [ngClass]="metodoPago() === 'tarjeta' ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-gray-150 text-gray-650'">
                      <span>💳</span> POS / Tarjeta
                    </button>
                  </div>
                  
                  <!-- Cash Details -->
                  @if (metodoPago() === 'efectivo') {
                    <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 animate-scale-up">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">¿Con cuánto vas a pagar? (Opcional)</label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs text-gray-400">$</span>
                        <input 
                          type="number"
                          [(ngModel)]="pagaConMonto"
                          class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent/20 outline-none text-xs font-bold text-gray-700 bg-white"
                          placeholder="Ej: 5000">
                      </div>
                      <p class="text-[9px] text-gray-400 font-semibold mt-1">Nos ayuda a traer el cambio exacto.</p>
                    </div>
                  }
                </div>
                
                <button 
                  (click)="confirmarPedirCuenta()"
                  [disabled]="loadingCuenta()"
                  class="w-full bg-accent text-white py-4 rounded-2xl font-black text-xs hover:bg-accent/90 active:scale-[0.98] transition-all shadow-lg shadow-accent/25 flex justify-center items-center gap-2 uppercase tracking-wider">
                  @if (loadingCuenta()) {
                    <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-delay-150"></span>
                  } @else {
                    Confirmar Pedido de Cuenta
                  }
                </button>
             </div>
          </div>
        }
      </div>
    </div>
  }
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slide-down { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-2deg); } 75% { transform: translateX(6px) rotate(2deg); } }
    @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    .animate-scale-up { animation: scale-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .bg-grid {
      background-size: 24px 24px;
      background-image: linear-gradient(to right, rgba(15, 81, 50, 0.015) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(15, 81, 50, 0.015) 1px, transparent 1px);
    }
  `]
})
export class PedidoComponent implements OnInit {
  showSplitCheck = false;
  public brandingService = inject(BrandingService);
  restauranteFondo = signal<string | null>(null);
  
  activeBottomTab = signal<'inicio' | 'menu' | 'juegos'>('inicio');

  @Input() restaurante!: string;
  @Input() numero!: string;

  id = ''; // Se resolverá al GUID de la mesa retornado por el backend

  private signalrService = inject(SignalrService);
  private http = inject(HttpClient);
  cart = inject(CartService);

  isValidSession = signal<boolean | undefined>(undefined);
  requirePin = signal<boolean>(false);
  pinInput = '';
  pinError = signal<string | null>(null);
  validatingPin = signal(false);
  numeroMesa = signal<string>('');
  restauranteId = signal<string>('');

  selectedGame = signal<'dados' | 'trivia'>('dados');

  // Dice game states
  rollingDice = signal(false);
  playerDiceValue = signal<number>(1);
  botDiceValue = signal<number>(1);
  dicePlayerWins = signal<number>(0);
  diceBotWins = signal<number>(0);
  diceWinnerMessage = signal<string>('');

  // Trivia game states
  triviaCorrectCount = signal<number>(0);
  answeredTrivia = signal(false);
  selectedAnswerIndex = signal<number | null>(null);
  
  triviaQuestions = [
    { question: '¿Cuál es el ingrediente principal del pesto tradicional?', options: ['Perejil', 'Albahaca', 'Cilantro'], correctAnswer: 1 },
    { question: '¿De qué país es originaria la pizza Margherita?', options: ['Francia', 'Grecia', 'Italia'], correctAnswer: 2 },
    { question: '¿Qué fruta contiene una enzima que ablanda la carne?', options: ['Piña', 'Manzana', 'Naranja'], correctAnswer: 0 },
    { question: '¿Cuál es el tipo de pasta con forma de pajarita?', options: ['Farfalle', 'Penne', 'Fusilli'], correctAnswer: 0 },
    { question: '¿Qué destilado se produce a partir del agave azul?', options: ['Ron', 'Mezcal', 'Tequila'], correctAnswer: 2 },
    { question: '¿Qué país produce la mayor cantidad de café en el mundo?', options: ['Colombia', 'Brasil', 'Etiopía'], correctAnswer: 1 },
    { question: '¿Qué animal produce la leche para el Mozzarella tradicional?', options: ['Cabra', 'Oveja', 'Búfala'], correctAnswer: 2 },
    { question: '¿Qué especia le da al curry su color amarillo?', options: ['Comino', 'Cúrcuma', 'Pimentón'], correctAnswer: 1 },
    { question: '¿Cómo se llama el pan tostado untado con ajo y aceite?', options: ['Bruschetta', 'Croissant', 'Focaccia'], correctAnswer: 0 },
    { question: '¿Cuál es el hongo subterráneo más caro de la cocina?', options: ['Champiñón', 'Trufa negra', 'Portobello'], correctAnswer: 1 }
  ];

  currentQuestionIndex = signal<number>(0);
  currentQuestion = computed(() => this.triviaQuestions[this.currentQuestionIndex()]);

  // Split bill states
  showSplitModal = signal(false);
  nuevoComensalNombre = '';
  nuevoComensalApellido = '';
  comensales = signal<{ id: string; nombre: string; apellido: string }[]>([]);
  splitMode = signal<'equitativa' | 'items'>('equitativa');
  itemsConsumidos = signal<any[]>([]);
  itemAssignments = signal<{ [key: string]: string }>({});

  loadingLlamar = signal(false);
  loadingCuenta = signal(false);
  loadingPedido = signal(false);
  
  loadingCancelarLlamar = signal(false);
  loadingCancelarCuenta = signal(false);
  loadingCancelarPedido = signal(false);
  
  yaLlamo = signal(false);
  yaPidioCuenta = signal(false);

  activeLlamoTaskId = signal<string | null>(null);
  activeCuentaTaskId = signal<string | null>(null);
  activePedidoTaskId = signal<string | null>(null);
  activePedidoDetails = signal<string | null>(null);
  activePedidoEstado = signal<string>('Recibido');
  montoConsumo = signal<number | null>(null);

  ratingGeneral = signal<number>(5);
  ratingComida = signal<number>(5);
  ratingMozo = signal<number>(5);
  ratingServicio = signal<number>(5);
  ratingComment = signal<string>('');
  ratingSubmitted = signal<boolean>(false);
  submittingRating = signal<boolean>(false);


  showCartModal = signal(false);
  showSuccessToast = signal(false);

  showLlamarModal = signal(false);
  llamarMotivoInput = '';
  
  showPedirCuentaModal = signal(false);
  metodoPago = signal<'efectivo' | 'tarjeta'>('efectivo');
  pagaConMonto = '';

  constructor() {
    effect(() => {
      const completedTaskId = this.signalrService.taskCompleted();
      if (completedTaskId) {
        const completedLower = completedTaskId.toLowerCase();
        if (completedLower === this.activeLlamoTaskId()?.toLowerCase()) {
          this.yaLlamo.set(false);
          this.activeLlamoTaskId.set(null);
          localStorage.removeItem('mozo_go_llamo_task_id');
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
        }
        if (completedLower === this.activeCuentaTaskId()?.toLowerCase()) {
          this.yaPidioCuenta.set(false);
          this.activeCuentaTaskId.set(null);
          localStorage.removeItem('mozo_go_cuenta_task_id');
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
        }
        if (completedLower === this.activePedidoTaskId()?.toLowerCase()) {
          this.activePedidoTaskId.set(null);
          this.activePedidoDetails.set(null);
          localStorage.removeItem('mozo_go_pedido_task_id');
          localStorage.removeItem('mozo_go_pedido_details');
          localStorage.removeItem('mozo_go_pedido_estado');
        }
      }
    });

    effect(() => {
      const change = this.signalrService.comandaChanged();
      if (change) {
        this.verifyMesa(localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || undefined);
      }
    });

    effect(() => {
      const update = this.signalrService.mesaMontoConsumo();
      if (update && update.mesaId.toLowerCase() === this.id.toLowerCase()) {
        this.montoConsumo.set(update.monto);
        // Refresh items list and other table status
        this.verifyMesa(localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || undefined);
      }
    });
  }

  ngOnInit() {
    this.checkCooldowns();
    this.loadSplitState();
    const savedPin = localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`);
    this.verifyMesa(savedPin || undefined);
  }

  checkCooldowns() {
    const llamoTaskId = localStorage.getItem('mozo_go_llamo_task_id');
    if (llamoTaskId) this.activeLlamoTaskId.set(llamoTaskId);
    
    const cuentaTaskId = localStorage.getItem('mozo_go_cuenta_task_id');
    if (cuentaTaskId) this.activeCuentaTaskId.set(cuentaTaskId);
    
    const pedidoTaskId = localStorage.getItem('mozo_go_pedido_task_id');
    if (pedidoTaskId) {
      this.activePedidoTaskId.set(pedidoTaskId);
      this.activePedidoDetails.set(localStorage.getItem('mozo_go_pedido_details'));
      this.activePedidoEstado.set(localStorage.getItem('mozo_go_pedido_estado') || 'Recibido');
    }

    const llamoTime = localStorage.getItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    if (llamoTime) {
      const diff = Date.now() - parseInt(llamoTime, 10);
      if (diff < 15 * 60 * 1000) this.yaLlamo.set(true);
      else localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    }

    const cuentaTime = localStorage.getItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    if (cuentaTime) {
      const diff = Date.now() - parseInt(cuentaTime, 10);
      if (diff < 15 * 60 * 1000) this.yaPidioCuenta.set(true);
      else localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    }
  }

  verifyMesa(pinParam?: string) {
    if(pinParam) this.validatingPin.set(true);
    else this.isValidSession.set(undefined);
    const url = pinParam 
      ? `${environment.apiUrl}/api/mesas/verify?restaurante=${this.restaurante}&numero=${this.numero}&pin=${pinParam}`
      : `${environment.apiUrl}/api/mesas/verify?restaurante=${this.restaurante}&numero=${this.numero}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if(pinParam) {
          this.validatingPin.set(false);
          localStorage.setItem(`mesa_pin_${this.restaurante}_${this.numero}`, pinParam);
        }
        this.requirePin.set(false);
        this.pinError.set(null);
        this.id = res.mesaId; // Guardamos el GUID para las llamadas de SignalR
        if (res.restauranteId) {
          this.restauranteId.set(res.restauranteId);
          this.signalrService.joinGroup('Comensal', '', res.restauranteId);
        }

        // Sincronizar con el backend: si el mozo ya lo completó, desbloqueamos
        if (res.hasLlamado) {
          this.yaLlamo.set(true);
          if (res.llamoTaskId) {
            this.activeLlamoTaskId.set(res.llamoTaskId);
            localStorage.setItem('mozo_go_llamo_task_id', res.llamoTaskId);
          }
        } else {
          this.yaLlamo.set(false);
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
          localStorage.removeItem('mozo_go_llamo_task_id');
          this.activeLlamoTaskId.set(null);
        }

        if (res.hasCuenta) {
          this.yaPidioCuenta.set(true);
          if (res.cuentaTaskId) {
            this.activeCuentaTaskId.set(res.cuentaTaskId);
            localStorage.setItem('mozo_go_cuenta_task_id', res.cuentaTaskId);
          }
        } else {
          this.yaPidioCuenta.set(false);
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
          localStorage.removeItem('mozo_go_cuenta_task_id');
          this.activeCuentaTaskId.set(null);
        }

        if (res.montoConsumo !== undefined) {
          this.montoConsumo.set(res.montoConsumo);
        } else {
          this.montoConsumo.set(null);
        }

        if (res.itemsConsumidos) {
          this.itemsConsumidos.set(res.itemsConsumidos);
        } else {
          this.itemsConsumidos.set([]);
        }

        if (res.pedidoTaskId) {
          this.activePedidoTaskId.set(res.pedidoTaskId);
          this.activePedidoDetails.set(res.pedidoDetails);
          this.activePedidoEstado.set(res.pedidoEstado || 'Recibido');
          localStorage.setItem('mozo_go_pedido_task_id', res.pedidoTaskId);
          if (res.pedidoDetails) {
            localStorage.setItem('mozo_go_pedido_details', res.pedidoDetails);
          }
          if (res.pedidoEstado) {
            localStorage.setItem('mozo_go_pedido_estado', res.pedidoEstado);
          }
        } else {
          this.activePedidoTaskId.set(null);
          this.activePedidoDetails.set(null);
          this.activePedidoEstado.set('Recibido');
          localStorage.removeItem('mozo_go_pedido_task_id');
          localStorage.removeItem('mozo_go_pedido_details');
          localStorage.removeItem('mozo_go_pedido_estado');
        }

        if (res.numero) {
          this.numeroMesa.set(res.numero.toString());
        }
        
        this.applyRestaurantBranding(res);

        setTimeout(() => this.isValidSession.set(true), 800);
      },
      error: (err) => {
        if(pinParam) this.validatingPin.set(false);
        
        if (err.status === 401) {
          // Requiere PIN
          this.clearSplitState();
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.requirePin.set(true);
          this.isValidSession.set(undefined);
        } else if (err.status === 400 && pinParam && err.error?.code === 'PIN_INVALIDO') {
          // PIN Incorrecto
          this.applyRestaurantBranding(err.error);
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.pinError.set('El PIN ingresado es incorrecto.');
        } else if (err.status === 400 && err.error?.code === 'INACTIVA') {
          // Mesa inactiva
          this.applyRestaurantBranding(err.error);
          this.clearSplitState();
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.requirePin.set(false);
          setTimeout(() => this.isValidSession.set(false), 800);
        } else {
          // Error temporal de red u otro error del servidor. Conservamos el PIN y el estado de la división.
          console.error('Error de conexión o de red', err);
          setTimeout(() => this.isValidSession.set(false), 800);
        }
      }
    });
  }

  submitPin() {
    const sanitizedPin = this.pinInput.trim().replace(/\D/g, '');
    if (!sanitizedPin || sanitizedPin.length !== 4) {
      this.pinError.set('Ingrese un código exacto de 4 dígitos');
      return;
    }
    this.pinError.set(null);
    this.verifyMesa(sanitizedPin);
  }
  private applyRestaurantBranding(res: any) {
    if (res) {
      this.brandingService.applyBranding({
        primary: res.colorPrimario,
        secondary: res.colorSecundario,
        background: res.colorFondo
      });
      if (res.restauranteFondo) {
        this.restauranteFondo.set(res.restauranteFondo);
      }
      if (res.restauranteLogo) {
        this.brandingService.logo.set(res.restauranteLogo);
      }
      if (res.restauranteNombre) {
        this.brandingService.appName.set(res.restauranteNombre);
      }
    }
  }

  abrirModalLlamar() {
    this.llamarMotivoInput = '';
    this.showLlamarModal.set(true);
  }

  confirmarLlamarMozo() {
    this.showLlamarModal.set(false);
    let details = 'Solicita asistencia';
    if (this.llamarMotivoInput.trim()) {
      details = `Solicita asistencia: "${this.llamarMotivoInput.trim()}"`;
    }
    this.ejecutarLlamarMozo(details);
  }

  abrirModalCuenta() {
    this.pagaConMonto = '';
    this.metodoPago.set('efectivo');
    this.showPedirCuentaModal.set(true);
  }

  confirmarPedirCuenta() {
    this.showPedirCuentaModal.set(false);
    let details = 'Pago con Tarjeta / POS';
    if (this.metodoPago() === 'efectivo') {
      const monto = this.pagaConMonto.trim();
      details = monto ? `Pago en Efectivo (Paga con $${monto})` : 'Pago en Efectivo';
    }
    this.ejecutarPedirCuenta(details);
  }

  async ejecutarLlamarMozo(details?: string) {
    this.loadingLlamar.set(true);
    try {
      const taskId = await this.signalrService.sendLlamarMozo(this.id, details);
      if (taskId && taskId !== '00000000-0000-0000-0000-000000000000') {
        this.yaLlamo.set(true);
        this.activeLlamoTaskId.set(taskId);
        localStorage.setItem('mozo_go_llamo_task_id', taskId);
        localStorage.setItem(`mesa_${this.restaurante}_${this.numero}_llamo`, Date.now().toString());
      }
    } finally {
      setTimeout(() => this.loadingLlamar.set(false), 800);
    }
  }

  async ejecutarPedirCuenta(details?: string) {
    this.loadingCuenta.set(true);
    try {
      const taskId = await this.signalrService.sendPedirCuenta(this.id, details);
      if (taskId && taskId !== '00000000-0000-0000-0000-000000000000') {
        this.yaPidioCuenta.set(true);
        this.activeCuentaTaskId.set(taskId);
        localStorage.setItem('mozo_go_cuenta_task_id', taskId);
        localStorage.setItem(`mesa_${this.restaurante}_${this.numero}_cuenta`, Date.now().toString());
      }
    } finally {
      setTimeout(() => this.loadingCuenta.set(false), 800);
    }
  }

  enviarValoracion() {
    if (!this.id) return;
    const pin = localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || '';
    if (!pin) {
      alert('Código PIN no encontrado, no se puede enviar la valoración.');
      return;
    }
    
    this.submittingRating.set(true);
    
    const payload = {
      mesaId: this.id,
      codigoAcceso: pin,
      puntajeGeneral: this.ratingGeneral(),
      puntajeComida: this.ratingComida(),
      puntajeMozo: this.ratingMozo(),
      puntajeServicio: this.ratingServicio(),
      comentario: this.ratingComment()
    };

    this.http.post(`${environment.apiUrl}/api/valoraciones`, payload).subscribe({
      next: () => {
        this.submittingRating.set(false);
        this.ratingSubmitted.set(true);
      },
      error: (err) => {
        console.error(err);
        this.submittingRating.set(false);
        alert(err.error?.message || 'Error al enviar la valoración.');
      }
    });
  }

  async enviarPedido() {
    this.loadingPedido.set(true);
    const detailsArray = this.cart.items().map(i => `${i.quantity}x ${i.nombre}`);
    const fullDetails = detailsArray.join(', ');

    const pin = localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || '';
    const body = {
      mesaId: this.id,
      codigoAcceso: pin,
      items: this.cart.items().map(i => ({ menuItemId: i.id, cantidad: i.quantity }))
    };

    this.http.post<any>(`${environment.apiUrl}/api/pedido`, body).subscribe({
      next: (res) => {
        const taskId = res.taskId || res.pedidoId;
        this.activePedidoTaskId.set(taskId);
        this.activePedidoDetails.set(fullDetails);
        this.activePedidoEstado.set('Recibido');
        
        localStorage.setItem('mozo_go_pedido_task_id', taskId);
        localStorage.setItem('mozo_go_pedido_details', fullDetails);
        localStorage.setItem('mozo_go_pedido_estado', 'Recibido');
        
        this.showCartModal.set(false);
        this.cart.clearCart();
        this.loadingPedido.set(false);
        this.showSuccessToast.set(true);
        this.verifyMesa(localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || undefined);
        setTimeout(() => this.showSuccessToast.set(false), 3000);
      },
      error: (err) => {
        console.error('Error enviando el pedido:', err);
        this.loadingPedido.set(false);
      }
    });
  }

  async cancelarLlamado() {
    const taskId = this.activeLlamoTaskId();
    if (!taskId) return;
    this.loadingCancelarLlamar.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.yaLlamo.set(false);
      this.activeLlamoTaskId.set(null);
      localStorage.removeItem('mozo_go_llamo_task_id');
      localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    } finally {
      this.loadingCancelarLlamar.set(false);
    }
  }

  async cancelarCuenta() {
    const taskId = this.activeCuentaTaskId();
    if (!taskId) return;
    this.loadingCancelarCuenta.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.yaPidioCuenta.set(false);
      this.activeCuentaTaskId.set(null);
      localStorage.removeItem('mozo_go_cuenta_task_id');
      localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    } finally {
      this.loadingCancelarCuenta.set(false);
    }
  }

  async cancelarPedido() {
    const taskId = this.activePedidoTaskId();
    if (!taskId) return;
    this.loadingCancelarPedido.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.activePedidoTaskId.set(null);
      this.activePedidoDetails.set(null);
      localStorage.removeItem('mozo_go_pedido_task_id');
      localStorage.removeItem('mozo_go_pedido_details');
    } finally {
      this.loadingCancelarPedido.set(false);
    }
  }
  // Split bill computed signals and methods
  itemUnits = computed(() => {
    const units: { unitId: string; itemId: string; nombre: string; precio: number }[] = [];
    for (const item of this.itemsConsumidos()) {
      for (let i = 0; i < item.cantidad; i++) {
        units.push({
          unitId: `${item.id}_unit_${i}`,
          itemId: item.id,
          nombre: item.cantidad > 1 ? `${item.nombre} (${i + 1}/${item.cantidad})` : item.nombre,
          precio: item.precioUnitario
        });
      }
    }
    return units;
  });

  comensalesTotals = computed(() => {
    const list = this.comensales();
    const mode = this.splitMode();
    const totalMesa = this.montoConsumo() || 0;
    
    if (list.length === 0) return [];
    
    if (mode === 'equitativa') {
      const share = totalMesa / list.length;
      return list.map(c => ({
        ...c,
        total: share,
        details: 'División equitativa'
      }));
    } else {
      const assignments = this.itemAssignments();
      const units = this.itemUnits();
      
      const assignedTotals: { [comensalId: string]: number } = {};
      const assignedDetails: { [comensalId: string]: string[] } = {};
      list.forEach(c => {
        assignedTotals[c.id] = 0;
        assignedDetails[c.id] = [];
      });
      
      let unassignedTotal = 0;
      
      for (const unit of units) {
        const assigneeId = assignments[unit.unitId];
        if (assigneeId && assignedTotals[assigneeId] !== undefined) {
          assignedTotals[assigneeId] += unit.precio;
          assignedDetails[assigneeId].push(unit.nombre);
        } else {
          unassignedTotal += unit.precio;
        }
      }
      
      const unassignedShare = unassignedTotal / list.length;
      
      return list.map(c => {
        const ownTotal = assignedTotals[c.id];
        const finalTotal = ownTotal + unassignedShare;
        const detailsParts = [...assignedDetails[c.id]];
        if (unassignedShare > 0) {
          detailsParts.push(`Compartido ($${this.formatCurrency(unassignedShare)})`);
        }
        return {
          ...c,
          total: finalTotal,
          details: detailsParts.join(', ') || 'Sin consumos asignados'
        };
      });
    }
  });

  loadSplitState() {
    const keyComensales = `mozo_go_comensales_${this.restaurante}_${this.numero}`;
    const savedComensales = localStorage.getItem(keyComensales);
    if (savedComensales) {
      try {
        this.comensales.set(JSON.parse(savedComensales));
      } catch (e) {
        console.error('Error loading comensales', e);
      }
    }
    
    const keyAssignments = `mozo_go_assignments_${this.restaurante}_${this.numero}`;
    const savedAssignments = localStorage.getItem(keyAssignments);
    if (savedAssignments) {
      try {
        this.itemAssignments.set(JSON.parse(savedAssignments));
      } catch (e) {
        console.error('Error loading assignments', e);
      }
    }
    
    const keyMode = `mozo_go_splitmode_${this.restaurante}_${this.numero}`;
    const savedMode = localStorage.getItem(keyMode);
    if (savedMode === 'equitativa' || savedMode === 'items') {
      this.splitMode.set(savedMode);
    }
  }

  saveSplitState() {
    const keyComensales = `mozo_go_comensales_${this.restaurante}_${this.numero}`;
    localStorage.setItem(keyComensales, JSON.stringify(this.comensales()));
    
    const keyAssignments = `mozo_go_assignments_${this.restaurante}_${this.numero}`;
    localStorage.setItem(keyAssignments, JSON.stringify(this.itemAssignments()));
    
    const keyMode = `mozo_go_splitmode_${this.restaurante}_${this.numero}`;
    localStorage.setItem(keyMode, this.splitMode());
  }

  clearSplitState() {
    localStorage.removeItem(`mozo_go_comensales_${this.restaurante}_${this.numero}`);
    localStorage.removeItem(`mozo_go_assignments_${this.restaurante}_${this.numero}`);
    localStorage.removeItem(`mozo_go_splitmode_${this.restaurante}_${this.numero}`);
    this.comensales.set([]);
    this.itemAssignments.set({});
    this.splitMode.set('equitativa');
  }

  agregarComensal() {
    const nom = this.nuevoComensalNombre.trim();
    const ape = this.nuevoComensalApellido.trim();
    if (!nom || !ape) return;
    
    const nuevo = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      nombre: nom,
      apellido: ape
    };
    
    this.comensales.update(list => [...list, nuevo]);
    this.nuevoComensalNombre = '';
    this.nuevoComensalApellido = '';
    this.saveSplitState();
  }

  removerComensal(id: string) {
    this.comensales.update(list => list.filter(c => c.id !== id));
    
    const currentAssignments = { ...this.itemAssignments() };
    let changed = false;
    for (const key in currentAssignments) {
      if (currentAssignments[key] === id) {
        delete currentAssignments[key];
        changed = true;
      }
    }
    if (changed) {
      this.itemAssignments.set(currentAssignments);
    }
    this.saveSplitState();
  }

  assignItem(unitId: string, comensalId: string) {
    const currentAssignments = { ...this.itemAssignments() };
    if (comensalId) {
      currentAssignments[unitId] = comensalId;
    } else {
      delete currentAssignments[unitId];
    }
    this.itemAssignments.set(currentAssignments);
    this.saveSplitState();
  }

  changeSplitMode(mode: 'equitativa' | 'items') {
    this.splitMode.set(mode);
    this.saveSplitState();
  }

  compartirWhatsApp() {
    const list = this.comensalesTotals();
    if (list.length === 0) return;
    
    const totalMesaFormatted = this.formatCurrency(this.montoConsumo());
    let text = `📋 *MozoGo - División de Cuenta*\n`;
    text += `🍽️ *Mesa:* ${this.numeroMesa()}\n`;
    text += `💵 *Total Mesa:* $${totalMesaFormatted}\n`;
    text += `⚙️ *Modo:* ${this.splitMode() === 'equitativa' ? 'División Equitativa' : 'Por Consumos'}\n\n`;
    text += `👥 *Detalle por Comensal:*\n`;
    text += `---------------------------------\n`;
    
    list.forEach(c => {
      const totalFormatted = this.formatCurrency(c.total);
      text += `• *${c.nombre} ${c.apellido}*: $${totalFormatted}\n`;
      if (this.splitMode() === 'items') {
        text += `  _Detalle:_ ${c.details}\n`;
      }
      text += `---------------------------------\n`;
    });
    
    text += `\n¡Gracias por usar MozoGo! 🚀`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  abrirDividirCuenta() {
    this.verifyMesa(localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`) || undefined);
    this.showSplitModal.set(true);
  }

  formatCurrency(value: number | null): string {
    if (value === null) return '0';
    return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // Games logic
  getDiceEmoji(val: number): string {
    const diceEmojis = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[val] || '🎲';
  }

  rollDice() {
    this.rollingDice.set(true);
    this.diceWinnerMessage.set('');
    
    let counter = 0;
    const interval = setInterval(() => {
      this.playerDiceValue.set(Math.floor(Math.random() * 6) + 1);
      this.botDiceValue.set(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter > 6) {
        clearInterval(interval);
        
        const playerVal = Math.floor(Math.random() * 6) + 1;
        const botVal = Math.floor(Math.random() * 6) + 1;
        
        this.playerDiceValue.set(playerVal);
        this.botDiceValue.set(botVal);
        this.rollingDice.set(false);

        if (playerVal > botVal) {
          this.dicePlayerWins.update(w => w + 1);
          this.diceWinnerMessage.set('🎉 ¡Ganaste la ronda!');
        } else if (botVal > playerVal) {
          this.diceBotWins.update(w => w + 1);
          this.diceWinnerMessage.set('😢 Perdiste la ronda.');
        } else {
          this.diceWinnerMessage.set('🤝 ¡Empate!');
        }
      }
    }, 100);
  }

  resetDiceGame() {
    this.dicePlayerWins.set(0);
    this.diceBotWins.set(0);
    this.playerDiceValue.set(1);
    this.botDiceValue.set(1);
    this.diceWinnerMessage.set('');
  }

  answerQuestion(index: number) {
    if (this.answeredTrivia()) return;
    this.selectedAnswerIndex.set(index);
    this.answeredTrivia.set(true);

    if (index === this.currentQuestion().correctAnswer) {
      this.triviaCorrectCount.update(c => c + 1);
    }
  }

  getTriviaOptionClass(index: number): string {
    if (!this.answeredTrivia()) {
      return 'bg-white border-gray-205 text-gray-700 hover:bg-slate-50 hover:border-gray-300';
    }

    const correct = this.currentQuestion().correctAnswer;
    if (index === correct) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-800';
    }
    if (this.selectedAnswerIndex() === index) {
      return 'bg-red-50 border-red-300 text-red-800';
    }
    return 'bg-white border-gray-150 text-gray-400 opacity-60';
  }

  nextTriviaQuestion() {
    this.answeredTrivia.set(false);
    this.selectedAnswerIndex.set(null);
    let nextIdx = this.currentQuestionIndex() + 1;
    if (nextIdx >= this.triviaQuestions.length) {
      nextIdx = 0;
    }
    this.currentQuestionIndex.set(nextIdx);
  }
}
