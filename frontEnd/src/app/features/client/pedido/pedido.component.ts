import { Component, Input, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SignalrService } from '../../../core/services/signalr.service';
import { CartService } from '../../../core/services/cart.service';
import { MenuComponent } from '../components/menu/menu.component';
import { environment } from '../../../../environments/environment';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  template: `
    @if (requirePin()) {
      <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 px-4 animate-fade-in text-center">
        <div class="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-gray-100">
          <div class="h-20 w-20 bg-accent/10 text-accent rounded-full mx-auto flex items-center justify-center text-3xl mb-6">🔒</div>
          <h2 class="text-2xl font-serif font-black text-primary mb-2">Mesa Protegida</h2>
          <p class="text-primary/60 text-sm mb-6">Por favor ingrese el PIN de acceso proporcionado por su Mozo para ver el menú.</p>
          
          <input type="tel" #pinInputRef (focus)="pinInputRef.scrollIntoView({behavior: 'smooth', block: 'center'})" 
                 [(ngModel)]="pinInput" name="pin"
                 placeholder="Ej: 4921" maxlength="4" pattern="[0-9]*"
                 class="w-full text-center text-3xl font-black tracking-widest px-4 py-4 rounded-xl border-2 border-[#E2DACF] focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all mb-4">
          
          @if(pinError()) {
            <p class="text-red-700 text-sm font-bold mb-4 animate-fade-in">{{ pinError() }}</p>
          }

          <button (click)="submitPin()" [disabled]="validatingPin()" class="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-lg hover:bg-accent/90 transition active:scale-95 flex justify-center items-center">
            @if(validatingPin()) {
               <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            } @else {
               Desbloquear Menú
            }
          </button>
        </div>
      </div>
    } @else if (isValidSession() === undefined) {
      <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 animate-fade-in text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div class="relative flex flex-col items-center">
          <div class="h-20 w-20 flex items-center justify-center mb-6 relative p-2">
            <span class="animate-spin absolute h-16 w-16 border-4 border-accent border-t-transparent rounded-full"></span>
            <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex">
              <img src="logo.png" class="w-full h-full object-cover" />
            </div>
          </div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight mb-2">MozoGo</h2>
          <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest animate-pulse">Validando Código QR...</p>
        </div>
      </div>
    } @else if (isValidSession() === false) {
      <div class="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 px-10 text-center animate-fade-in">
        <div class="h-28 w-28 bg-white text-red-500 rounded-full shadow-2xl flex items-center justify-center text-5xl mb-8 border-4 border-red-100 animate-[shake_0.5s_ease-out]">
          🛑
        </div>
        <h1 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Acceso Denegado</h1>
        <p class="text-lg text-gray-600 font-medium mb-8">
          El código QR ha expirado o la mesa está inactiva. Por favor avise al Mozo.
        </p>
        <button (click)="verifyMesa()" class="bg-white text-gray-800 font-bold py-3 px-8 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center gap-2">
          <span>🔄</span> Reintentar Conexión
        </button>
      </div>

    } @else {
      <div class="min-h-screen bg-surface flex flex-col items-center py-12 px-4 pb-32 animate-fade-in">
        <div class="mb-10 text-center w-full max-w-sm">
          <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-primary/10">
            {{ numeroMesa() || '...' }}
          </div>
          <h1 class="text-3xl font-serif font-black text-primary mb-1 tracking-tight">Menú Interactivo</h1>
          <p class="text-primary/40 text-xs font-semibold mb-4">Mesa {{ numeroMesa() }}</p>
          
          @if (montoConsumo() !== null && montoConsumo() !== undefined) {
            <div class="bg-sand border border-[#E2DACF] rounded-2xl p-4 shadow-inner mb-2 animate-fade-in flex justify-between items-center w-full">
              <div class="text-left">
                <span class="text-[10px] uppercase font-black text-primary/60 tracking-wider">Consumo Acumulado</span>
                <h2 class="text-2xl font-black text-accent mt-0.5">\${{ formatCurrency(montoConsumo()) }}</h2>
              </div>
              <button 
                (click)="abrirDividirCuenta()"
                class="bg-accent hover:bg-accent/90 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
                🥞 Dividir Cuenta
              </button>
            </div>
          }
        </div>

        <div class="w-full max-w-sm space-y-4">
          @if (yaLlamo()) {
            <div class="flex gap-2 w-full">
              <div class="flex-1 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-semibold text-lg flex justify-center items-center select-none">
                🛎️ Mozo notificado
              </div>
              <button 
                (click)="cancelarLlamado()"
                [disabled]="loadingCancelarLlamar()"
                class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex justify-center items-center transition-all active:scale-95 shadow-md">
                @if (loadingCancelarLlamar()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                } @else {
                  ❌
                }
              </button>
            </div>
          } @else {
            <button 
              (click)="llamarMozo()"
              [disabled]="loadingLlamar()"
              class="w-full h-16 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-semibold text-lg flex justify-center items-center transition-all active:scale-95 hover:brightness-105">
              @if (loadingLlamar()) {
                <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span> Llamando...
              } @else {
                🛎️ Llamar Mozo
              }
            </button>
          }

          @if (yaPidioCuenta()) {
            <div class="flex gap-2 w-full">
              <div class="flex-1 h-16 bg-accent/10 border border-accent/20 text-accent rounded-2xl font-semibold text-lg flex justify-center items-center select-none">
                💳 Cuenta solicitada
              </div>
              <button 
                (click)="cancelarCuenta()"
                [disabled]="loadingCancelarCuenta()"
                class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex justify-center items-center transition-all active:scale-95 shadow-md">
                @if (loadingCancelarCuenta()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                } @else {
                  ❌
                }
              </button>
            </div>
          } @else {
            <button 
              (click)="pedirCuenta()"
              [disabled]="loadingCuenta()"
              class="w-full h-16 bg-accent text-white rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] font-semibold text-lg flex justify-center items-center transition-all active:scale-95 hover:brightness-105">
              @if (loadingCuenta()) {
                <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span> Procesando...
              } @else {
                💳 Pedir Cuenta
              }
            </button>
          }

          <button 
            (click)="showMenu.set(!showMenu())"
            class="w-full h-16 bg-white border-2 border-transparent text-primary rounded-2xl shadow-sm font-semibold text-lg hover:border-gray-200 flex justify-center items-center transition-all">
            @if (showMenu()) {
              Ocultar Menú ⬆️
            } @else {
              📖 Ver Menú
            }
          </button>
        </div>

        <!-- Pending Order Card -->
        @if (activePedidoTaskId()) {
          <div class="w-full max-w-sm rounded-3xl p-5 shadow-sm animate-fade-in flex flex-col gap-3 border"
               [ngClass]="{
                 'bg-blue-50/50 border-blue-100 text-blue-800': activePedidoEstado() === 'Recibido',
                 'bg-sand border-[#E2DACF] text-primary': activePedidoEstado() === 'Aprobado',
                 'bg-amber-50/50 border-amber-100 text-amber-800': activePedidoEstado() === 'EnPreparacion',
                 'bg-green-50/50 border-green-100 text-green-800': activePedidoEstado() === 'Listo'
               }">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <span class="text-xl">
                  @if (activePedidoEstado() === 'Recibido') { 🍳 }
                  @if (activePedidoEstado() === 'Aprobado') { 👍 }
                  @if (activePedidoEstado() === 'EnPreparacion') { 🔥 }
                  @if (activePedidoEstado() === 'Listo') { 🛎️ }
                </span>
                <div>
                  <h3 class="font-bold text-gray-800 text-sm">Estado de tu Pedido</h3>
                  <p class="text-[10px] font-black uppercase tracking-wider"
                     [ngClass]="{
                       'text-blue-500': activePedidoEstado() === 'Recibido',
                       'text-primary/70': activePedidoEstado() === 'Aprobado',
                       'text-amber-600': activePedidoEstado() === 'EnPreparacion',
                       'text-green-600 animate-pulse': activePedidoEstado() === 'Listo'
                     }">
                    @if (activePedidoEstado() === 'Recibido') { Pendiente de Aprobación }
                    @if (activePedidoEstado() === 'Aprobado') { Aprobado }
                    @if (activePedidoEstado() === 'EnPreparacion') { En Preparación }
                    @if (activePedidoEstado() === 'Listo') { ¡Listo en Cocina! }
                  </p>
                </div>
              </div>
              @if (activePedidoEstado() === 'Recibido') {
                <button 
                  (click)="cancelarPedido()"
                  [disabled]="loadingCancelarPedido()"
                  class="text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1">
                  @if (loadingCancelarPedido()) {
                    <span class="animate-spin h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full"></span>
                  } @else {
                    Cancelar Pedido
                  }
                </button>
              }
            </div>
            <div class="bg-white/80 p-3 rounded-2xl text-xs font-semibold text-gray-600 border line-clamp-3"
                 [ngClass]="{
                   'border-blue-50/50': activePedidoEstado() === 'Recibido',
                   'border-amber-50/50': activePedidoEstado() === 'EnPreparacion',
                   'border-green-50/50': activePedidoEstado() === 'Listo'
                 }">
              {{ activePedidoDetails() }}
            </div>
          </div>
        }

        @if (showMenu()) {
          <div class="w-full max-w-md mt-10 animate-fade-in pb-20">
             <app-menu [restauranteId]="restauranteId()"></app-menu>
          </div>
        }

        <!-- Floating Cart -->
        @if (cart.totalItems() > 0 && !showCartModal()) {
          <div class="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-fade-in">
            <button 
              (click)="showCartModal.set(true)"
              class="w-full max-w-md bg-accent text-white rounded-2xl shadow-[0_10px_30px_rgba(128,26,45,0.15)] p-4 flex justify-between items-center active:scale-[0.98] transition-all border border-accent/20">
              <div class="flex items-center gap-3">
                 <div class="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center font-black text-sm">
                   {{ cart.totalItems() }}
                 </div>
                 <span class="font-bold">Ver Canasto</span>
              </div>
              <span class="font-black">\${{ cart.totalPrice() }}</span>
            </button>
          </div>
        }

        @if (showCartModal()) {
          <!-- Cart modal code -->
          <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
             <div class="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative">
                <button (click)="showCartModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 class="text-2xl font-black text-gray-800 mb-6">Tu Pedido</h2>
                <div class="max-h-64 overflow-y-auto space-y-4 mb-6 pr-2">
                   @for (item of cart.items(); track item.id) {
                     <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                           <div class="flex items-center bg-surface rounded-lg">
                              <button (click)="cart.decreaseQuantity(item.id)" class="px-3 py-1 font-bold text-gray-500 hover:text-red-500">-</button>
                              <span class="font-bold text-sm w-4 text-center">{{ item.quantity }}</span>
                              <button (click)="cart.addToCart(item)" class="px-3 py-1 font-bold text-gray-500 hover:text-accent">+</button>
                           </div>
                           <div class="flex-1 max-w-[120px] sm:max-w-none break-words">
                             <p class="font-bold text-gray-800 leading-tight">{{ item.nombre }}</p>
                             <p class="text-xs text-gray-500">\${{ item.precio }} c/u</p>
                           </div>
                        </div>
                        <span class="font-black text-gray-800">\${{ item.precio * item.quantity }}</span>
                     </div>
                   } @empty {
                     <p class="text-center text-gray-500 py-6">El canasto está vacío</p>
                   }
                </div>
                @if (cart.totalItems() > 0) {
                  <div class="border-t border-gray-100 pt-4 mb-6">
                    <div class="flex justify-between items-center">
                       <span class="font-bold text-primary/60">Total a pagar</span>
                       <span class="font-black text-2xl text-accent">\${{ cart.totalPrice() }}</span>
                    </div>
                  </div>
                  <button 
                    (click)="enviarPedido()"
                    [disabled]="loadingPedido()"
                    class="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg hover:bg-accent/90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(128,26,45,0.15)] flex justify-center items-center">
                    @if (loadingPedido()) {
                      <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    } @else {
                      Enviar Pedido a Cocina
                    }
                  </button>
                }
             </div>
          </div>
        }

        @if (showSplitModal()) {
          <div class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
             <div class="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
                <button (click)="showSplitModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 class="text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">
                  <span>🥞</span> Dividir Cuenta
                </h2>
                <p class="text-xs text-slate-500 mb-4">Administrá los comensales de la mesa y calcula el consumo correspondiente.</p>
                
                <!-- Scrollable Content Container -->
                <div class="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
                  
                  <!-- Formulario Agregar Comensal -->
                  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Agregar Comensal</h3>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" [(ngModel)]="nuevoComensalNombre" placeholder="Nombre" 
                             class="bg-white px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-accent focus:outline-none transition-all">
                      <input type="text" [(ngModel)]="nuevoComensalApellido" placeholder="Apellido" 
                             class="bg-white px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-accent focus:outline-none transition-all">
                    </div>
                    <button (click)="agregarComensal()" 
                            [disabled]="!nuevoComensalNombre.trim() || !nuevoComensalApellido.trim()"
                            class="w-full bg-accent hover:bg-accent/90 text-white font-bold text-sm py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                      + Agregar Comensal
                    </button>
                  </div>

                  <!-- Lista de Comensales Agregados -->
                  @if (comensales().length > 0) {
                    <div>
                      <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Comensales ({{ comensales().length }})</span>
                      </h3>
                      <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        @for (c of comensales(); track c.id) {
                          <span class="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700">
                            {{ c.nombre }} {{ c.apellido }}
                            <button (click)="removerComensal(c.id)" class="text-red-500 hover:text-red-700 ml-0.5 font-bold transition-colors">×</button>
                          </span>
                        }
                      </div>
                    </div>
                  }

                  @if (comensales().length > 0) {
                    <!-- Selector de Modo de División -->
                    <div>
                      <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Modo de División</h3>
                      <div class="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                          (click)="changeSplitMode('equitativa')" 
                          [ngClass]="{'bg-white shadow-sm font-bold text-accent': splitMode() === 'equitativa', 'text-slate-500 font-semibold': splitMode() !== 'equitativa'}"
                          class="flex-1 py-2 text-xs rounded-lg transition-all">
                          🟰 División Equitativa
                        </button>
                        <button 
                          (click)="changeSplitMode('items')" 
                          [ngClass]="{'bg-white shadow-sm font-bold text-accent': splitMode() === 'items', 'text-slate-500 font-semibold': splitMode() !== 'items'}"
                          class="flex-1 py-2 text-xs rounded-lg transition-all">
                          🛒 Por Consumos
                        </button>
                      </div>
                    </div>

                    <!-- Asignación de Items (si es Por Consumos) -->
                    @if (splitMode() === 'items') {
                      <div>
                        <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Asignar Consumos</h3>
                        <p class="text-[10px] text-slate-400 mb-3 italic">Los consumos que dejes sin asignar se dividirán en partes iguales entre todos.</p>
                        
                        <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
                          @for (unit of itemUnits(); track unit.unitId) {
                            <div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <div class="text-left">
                                <p class="text-xs font-bold text-slate-800 leading-tight">{{ unit.nombre }}</p>
                                <p class="text-[10px] text-slate-500 font-semibold">\${{ formatCurrency(unit.precio) }}</p>
                              </div>
                              <select 
                                [ngModel]="itemAssignments()[unit.unitId] || ''"
                                (ngModelChange)="assignItem(unit.unitId, $event)"
                                class="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2 focus:border-accent focus:ring-1 focus:ring-accent/10 outline-none font-semibold text-slate-700 max-w-[150px]">
                                <option value="">Compartido / Todos</option>
                                @for (c of comensales(); track c.id) {
                                  <option [value]="c.id">{{ c.nombre }} {{ c.apellido }}</option>
                                }
                              </select>
                            </div>
                          } @empty {
                            <p class="text-center text-xs text-slate-400 py-4 font-medium">No hay consumos entregados en esta mesa todavía.</p>
                          }
                        </div>
                      </div>
                    }

                    <!-- Resumen de Totales a Pagar -->
                    <div class="border-t border-slate-100 pt-4">
                      <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">Resumen de Cuenta</h3>
                      <div class="space-y-2">
                        @for (c of comensalesTotals(); track c.id) {
                          <div class="bg-sand/40 border border-[#E2DACF] p-3 rounded-xl flex justify-between items-start">
                            <div class="text-left max-w-[70%]">
                              <p class="text-sm font-bold text-primary">{{ c.nombre }} {{ c.apellido }}</p>
                              @if (splitMode() === 'items') {
                                <p class="text-[10px] text-primary/60 font-medium leading-tight truncate" [title]="c.details">
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
                        class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-green-500/10 active:scale-[0.98]">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.451 5.432 0 9.851-4.42 9.855-9.852.002-2.63-1.023-5.101-2.887-6.966a9.78 9.78 0 0 0-6.96-2.873c-5.433 0-9.853 4.42-9.858 9.853-.001 1.75.457 3.456 1.328 4.965l-1.017 3.714 3.822-1.002z"/>
                        </svg>
                        Compartir por WhatsApp
                      </button>
                    </div>

                  } @else {
                    <div class="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <span class="text-3xl block mb-2">👥</span>
                      <p class="text-sm font-bold text-slate-700">Comenzá por agregar comensales</p>
                      <p class="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Agrega los nombres y apellidos de las personas en la mesa para poder dividir la cuenta.</p>
                    </div>
                  }

                </div>
             </div>
          </div>
        }

        @if (showSuccessToast()) {
          <div class="fixed top-6 left-0 right-0 flex justify-center z-50 animate-[slide-down_0.5s_ease-out] pointer-events-none">
             <div class="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.4)] font-black flex items-center gap-3 backdrop-blur-md">
               <span class="text-xl">✅</span> ¡Pedido orquestado con éxito!
             </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slide-down { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-2deg); } 75% { transform: translateX(6px) rotate(2deg); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  `]
})
export class PedidoComponent implements OnInit {
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

  showMenu = signal(false);
  showCartModal = signal(false);
  showSuccessToast = signal(false);

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
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.pinError.set('El PIN ingresado es incorrecto.');
        } else if (err.status === 400 && err.error?.code === 'INACTIVA') {
          // Mesa inactiva
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

  async llamarMozo() {
    this.loadingLlamar.set(true);
    try {
      const taskId = await this.signalrService.sendLlamarMozo(this.id);
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

  async pedirCuenta() {
    this.loadingCuenta.set(true);
    try {
      const taskId = await this.signalrService.sendPedirCuenta(this.id);
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

  async enviarPedido() {
    this.loadingPedido.set(true);
    const detailsArray = this.cart.items().map(i => `${i.quantity}x ${i.nombre}`);
    const fullDetails = detailsArray.join(', ');

    const body = {
      mesaId: this.id,
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
}
