import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../core/services/signalr.service';
import { MesaTask } from '../../../core/models/task.model';
import { AdminDataService, AdminMesa } from '../config/admin-data.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RestauranteService } from '../../../core/services/restaurante.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
// ... (omitted changing imports array to not overwrite metadata incorrectly)
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">↻</span> Sin conexión. Intentando reconectar al servidor...
        </div>
      }
           <!-- Barra Superior de Navegación -->
      <div class="flex justify-between items-center bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] p-4 rounded-3xl shadow-sm mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">🛎️</span>
          <span class="text-base font-black text-gray-800 tracking-tight">{{ lang.translations().tables.controlPanel }}</span>
        </div>
        <button (click)="showControlMesas.set(!showControlMesas())"
                [class]="showControlMesas() ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'"
                class="px-5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-all flex items-center gap-2 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z" />
          </svg>
          {{ lang.translations().tables.tablesBtn }}
        </button>
      </div>

      @if (showControlMesas()) {
        <!-- Panel de Mesas (Control y Administración) -->
        <div class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div class="flex items-center gap-2 cursor-pointer select-none" (click)="collapseMesas.set(!collapseMesas())">
              <div>
                <h2 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                  {{ lang.translations().tables.title }}
                  <span class="text-xs text-gray-400 inline-block transition-transform duration-300" [class.rotate-180]="collapseMesas()">▲</span>
                </h2>
                <p class="text-xs text-gray-400 font-medium mt-0.5">{{ lang.translations().tables.subtitle }}</p>
              </div>
            </div>
            @if (!collapseMesas() && (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin')) {
              <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#1a233b] transition-all flex items-center gap-1">
                <span>+</span> {{ lang.translations().tables.create }}
              </button>
            }
          </div>

          @if (!collapseMesas()) {
            @if (showForm()) {
              <div class="bg-surface p-5 rounded-3xl mb-6 border border-gray-200 shadow-inner animate-fade-in">
                <h3 class="text-sm font-black text-gray-700 mb-3 flex items-center gap-1">
                  {{ editingId() ? lang.translations().tables.edit : lang.translations().tables.new }}
                </h3>
                <form #mesaForm="ngForm" class="flex flex-col md:flex-row gap-4 items-end" autocomplete="off" (submit)="saveForm($event)">
                  <div class="w-full md:w-32 relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.number }}</label>
                    <input type="number" [(ngModel)]="formData.numero" name="numero" #numCtrl="ngModel" 
                           min="1" max="999"
                           class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-bold" required>
                    @if (numCtrl.invalid && numCtrl.touched) {
                      <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Rango 1-999</span>
                    }
                  </div>
                  <div class="flex-1 w-full relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.location }}</label>
                    <input type="text" [(ngModel)]="formData.ubicacion" name="ubicacion" #ubicCtrl="ngModel"
                           maxlength="100" placeholder="Ej: Terraza Norte" 
                           class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                  </div>
                  <div class="flex-1 w-full relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.waiter }}</label>
                    <select [(ngModel)]="formData.mozoId" name="mozoId" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                      <option [value]="null">{{ lang.translations().tables.unassigned }}</option>
                      @for (mozo of dataService.mozos(); track mozo.id) {
                        <option [value]="mozo.id">{{ mozo.username }}</option>
                      }
                    </select>
                  </div>
                  <div class="flex gap-2 w-full md:w-auto">
                    <button type="button" (click)="showForm.set(false)" class="flex-1 md:flex-none bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition-colors">{{ lang.translations().common.cancel }}</button>
                    <button type="submit" [disabled]="mesaForm.invalid" class="flex-1 md:flex-none bg-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ editingId() ? lang.translations().common.update : lang.translations().common.save }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for(mesa of myMesas(); track mesa.id) {
                @if (mesa.codigoAcceso) {
                  <!-- Active Mesa Card -->
                  <div class="border border-green-200/80 rounded-3xl p-5 flex flex-col justify-between hover:border-green-400 transition relative group bg-white shadow-sm ring-4 ring-green-500/5">
                    <div class="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button (click)="openQrModal(mesa)" class="text-green-700 hover:text-green-900 font-bold text-[10px] bg-green-100/60 px-2.5 py-1 rounded-xl transition-colors border border-green-200/50">QR</button>
                      @if (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
                        <button (click)="openEditForm(mesa)" class="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] bg-indigo-50 px-2.5 py-1 rounded-xl transition-colors border border-indigo-100">{{ lang.translations().common.edit }}</button>
                        <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 px-2.5 py-1 rounded-xl transition-colors border border-red-100">{{ lang.translations().common.delete }}</button>
                      }
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg bg-green-500/10 text-green-700 shadow-inner">
                          {{ mesa.numero }}
                        </div>
                        <div>
                          <h3 class="font-black text-gray-800 text-sm">{{ lang.translations().kitchen.table }} {{ mesa.numero }}</h3>
                          <p class="text-[10px] text-gray-400 font-semibold truncate max-w-[120px]">{{ mesa.ubicacion || lang.translations().tables.noLocation }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div class="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 flex flex-col justify-center items-center">
                          <span class="text-[8px] font-black text-emerald-600 uppercase tracking-wider">{{ lang.translations().tables.pinAccess }}</span>
                          <span class="text-sm font-black tracking-wider text-emerald-700">{{ mesa.codigoAcceso }}</span>
                        </div>

                        <div (click)="openBillingModal(mesa)" class="bg-slate-50 border border-slate-100 rounded-2xl p-2 flex flex-col justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all select-none">
                          <span class="text-[8px] font-black text-gray-400 uppercase tracking-wider text-center">{{ lang.translations().tables.consumed }}</span>
                          <div class="flex gap-1 items-center justify-center mt-0.5">
                            <span class="text-[10px] text-gray-500 font-black">$</span>
                            <span class="text-xs font-black text-gray-800">{{ mesa.montoConsumo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100/80 space-y-3">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-semibold text-gray-400">{{ lang.translations().tables.waiter }}:</span>
                        <span class="font-bold px-2 py-0.5 bg-slate-100 rounded-md text-primary truncate max-w-[120px]">
                          {{ getMozoUsername(mesa.mozoId) }}
                        </span>
                      </div>

                      <button (click)="openBillingModal(mesa)" class="bg-red-500 hover:bg-red-600 text-white py-2 rounded-2xl text-xs font-black shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)] transition-all active:scale-95 w-full flex items-center justify-center gap-1">
                        {{ lang.translations().tables.closeTable }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Inactive Mesa Card -->
                  <div class="border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-300 transition relative group bg-white shadow-sm hover:shadow-md">
                    <div class="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button (click)="openQrModal(mesa)" class="text-slate-600 hover:text-slate-800 font-bold text-[10px] bg-slate-100 px-2.5 py-1 rounded-xl transition-colors">QR</button>
                      @if (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
                        <button (click)="openEditForm(mesa)" class="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] bg-indigo-50 px-2.5 py-1 rounded-xl transition-colors border border-indigo-100">{{ lang.translations().common.edit }}</button>
                        <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 px-2.5 py-1 rounded-xl transition-colors border border-red-100">{{ lang.translations().common.delete }}</button>
                      }
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg bg-slate-100 text-slate-400">
                          {{ mesa.numero }}
                        </div>
                        <div>
                          <h3 class="font-black text-gray-800 text-sm">{{ lang.translations().kitchen.table }} {{ mesa.numero }}</h3>
                          <p class="text-[10px] text-gray-400 font-semibold truncate max-w-[120px]">{{ mesa.ubicacion || lang.translations().tables.noLocation }}</p>
                        </div>
                      </div>

                      <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                        <span class="text-[10px] font-bold text-slate-400">{{ lang.translations().tables.available }}</span>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-semibold text-gray-400">{{ lang.translations().tables.waiter }}:</span>
                        <span class="font-bold px-2 py-0.5 bg-slate-100 rounded-md text-primary truncate max-w-[120px]">
                          {{ getMozoUsername(mesa.mozoId) }}
                        </span>
                      </div>

                      <button (click)="abrirMesa(mesa.id)" class="bg-primary hover:bg-[#1a233b] text-white py-2 rounded-2xl text-xs font-black shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.25)] transition-all active:scale-95 w-full flex items-center justify-center gap-1">
                        {{ lang.translations().tables.openTable }}
                      </button>
                    </div>
                  </div>
                }
              } @empty {
                <p class="col-span-full text-center py-6 text-gray-400 text-sm">{{ lang.translations().tables.emptyList }}</p>
              }
            </div>

            @if(auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
              <div class="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-400 font-medium text-center sm:text-left">Reorganiza el salón en memoria y súbelo al servidor para aplicar los cambios a los códigos QR y mozos asignados.</p>
                <div class="flex items-center gap-3">
                  @if (saveSuccess()) {
                    <span class="text-green-500 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-xl animate-pulse">¡Guardado!</span>
                  }
                  <button 
                    (click)="syncBackend()"
                    [disabled]="isSaving()"
                    class="bg-[#10b981] text-white px-6 py-2.5 rounded-xl font-black shadow-[0_4px_15px_rgb(16,185,129,0.3)] hover:bg-[#0da473] transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2 text-xs">
                    @if (isSaving()) {
                      <span class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Sincronizando...
                    } @else {
                      Guardar y Publicar
                    }
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Panel de Solicitudes Activas -->
      <div class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-2 cursor-pointer select-none" (click)="collapseTasks.set(!collapseTasks())">
            <div>
              <h1 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                Solicitudes Activas
                <span class="text-xs text-gray-400 inline-block transition-transform duration-300" [class.rotate-180]="collapseTasks()">▲</span>
              </h1>
              <p class="text-sm text-gray-500 font-medium mt-1">Monitorea y atiende los pedidos en tiempo real</p>
            </div>
          </div>
          
          <!-- Filtros (Solo Admin) -->
          @if(!collapseTasks() && auth.currentUser()?.role === 'Admin') {
            <div class="flex flex-wrap items-center gap-3 bg-surface/50 px-4 py-2 rounded-2xl border border-gray-200 backdrop-blur-sm">
              <select [ngModel]="filterType()" (ngModelChange)="filterType.set($event)" class="bg-white border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todos los Tipos</option>
                <option value="Llamado">Llamado</option>
                <option value="Pedido">Pedido</option>
                <option value="Cuenta">Cuenta</option>
              </select>
              <select [ngModel]="filterMesa()" (ngModelChange)="filterMesa.set($event)" class="bg-white border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todas las Mesas</option>
                @for(m of dataService.mesas(); track m.id) { <option [value]="m.numero">Mesa {{m.numero}}</option> }
              </select>
              <select [ngModel]="filterMozo()" (ngModelChange)="filterMozo.set($event)" class="bg-white border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todos los Mozos</option>
                @for(mz of dataService.mozos(); track mz.id) { <option [value]="mz.id">{{mz.username}}</option> }
              </select>
            </div>
          }
        </div>
      </div>

      @if (!collapseTasks()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (task of myPendingTasks(); track task.id) {
            <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] rounded-2xl p-3.5 flex flex-col relative overflow-hidden transition-all group hover:border-amber-700/30 hover:-translate-y-0.5 shadow-sm">
              
              <!-- Barra superior indicadora -->
              <div class="absolute top-0 left-0 w-full h-1" [ngClass]="getSideBarClass(task.type)"></div>

              <div class="flex justify-between items-start mb-2.5 pt-1">
                <div class="flex items-center gap-2.5">
                   <div class="w-10 h-10 rounded-xl flex flex-col justify-center items-center font-black shadow-inner" [ngClass]="getTypeBgClass(task.type)">
                     <span class="text-[8px] opacity-80 leading-none mb-0.5 uppercase tracking-wide">Mesa</span>
                     <span class="text-base leading-none">{{ task.tableId }}</span>
                   </div>
                   <div>
                     <span class="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md animate-fade-in" [ngClass]="getTypeTagClass(task.type)">{{task.type}}</span>
                     @if (task.type === 'Pedido') {
                       @if (task.pedidoEstado === 'Recibido' || !task.pedidoEstado) {
                         <span class="ml-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">Por Aprobar</span>
                       } @else if (task.pedidoEstado === 'EnPreparacion') {
                         <span class="ml-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">En Cocina</span>
                       } @else if (task.pedidoEstado === 'Listo') {
                         <span class="ml-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse">¡Listo!</span>
                       }
                     }
                     <div class="text-[9px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                       Hace {{ getMinutesElapsed(task.timestamp) }} min
                     </div>
                   </div>
                </div>
                
                @if(auth.currentUser()?.role === 'Admin') {
                  <button (click)="openReassignModal(task.id)" class="text-[9px] text-indigo-600 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-500 px-2 py-0.5 rounded-md transition-colors border border-indigo-100">Reasignar</button>
                }
              </div>

              <div class="flex-1 bg-white/80 rounded-xl p-2.5 mb-3 border border-amber-900/5">
                 @if (task.details) {
                   <p class="text-gray-600 text-xs font-semibold line-clamp-2 leading-relaxed">{{ task.details }}</p>
                 } @else {
                   <p class="text-gray-400 text-xs italic">Atención requerida en la mesa.</p>
                 }
              </div>

              <div class="flex gap-2 mt-auto">
                <button (click)="selectedTaskForView.set(task)" class="flex-1 bg-white text-gray-700 py-1.5 rounded-xl text-xs font-black border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                  Ver
                </button>
                @if (task.type === 'Pedido') {
                  @if (task.pedidoEstado === 'Recibido' || !task.pedidoEstado) {
                    <button (click)="aprobarPedido(task.id)" class="flex-[2] bg-emerald-600 text-white py-1.5 rounded-xl text-xs font-black hover:bg-emerald-700 shadow-sm transition-transform active:scale-95">
                      Aprobar
                    </button>
                  } @else if (task.pedidoEstado === 'EnPreparacion') {
                    <button (click)="entregarPedido(task.id)" class="flex-[2] bg-slate-700 text-white py-1.5 rounded-xl text-xs font-black hover:bg-slate-800 shadow-sm transition-transform active:scale-95">
                      Cerrar
                    </button>
                  } @else if (task.pedidoEstado === 'Listo') {
                    <button (click)="entregarPedido(task.id)" class="flex-[2] bg-[#10b981] text-white py-1.5 rounded-xl text-xs font-black hover:bg-[#0da473] shadow-sm transition-transform active:scale-95">
                      Entregar
                    </button>
                  }
                } @else {
                  <button (click)="completar(task.id)" class="flex-[2] bg-primary text-white py-1.5 rounded-xl text-xs font-black hover:bg-primary/90 shadow-sm transition-transform active:scale-95">
                    Completar
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
              <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                <span class="text-2xl opacity-40">🛎️</span>
              </div>
              <h3 class="text-lg font-black text-gray-600 mb-0.5">Todo al día</h3>
              <p class="text-gray-400 font-medium text-xs">No hay solicitudes pendientes en este momento.</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Reasignar -->
    @if(showReassignModal()) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20 relative">
          <button (click)="showReassignModal.set(null)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-colors">&times;</button>
          
          <h3 class="text-xl font-black mb-1 text-gray-800 flex items-center gap-2">Reasignar</h3>
          <p class="text-sm text-gray-500 mb-6 font-medium">Transfiere esta tarea a otro mozo disponible.</p>
          
          <div class="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            @for(mz of dataService.mozos(); track mz.id) {
              <button (click)="reasignar(showReassignModal()!, mz.id)" class="w-full text-left px-4 py-3 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 font-bold text-gray-700 transition-all flex items-center gap-3 group">
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs group-hover:bg-primary/10 group-hover:text-primary">👤</div>
                {{mz.username}}
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Modal QR -->
    @if (showQrModal()) {
      <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center border border-white/20">
          <button (click)="closeQrModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h2 class="text-2xl font-black text-gray-800 mb-1">Mesa {{ showQrModal()?.numero }}</h2>
          <p class="text-sm text-gray-500 font-medium mb-6">{{ showQrModal()?.ubicacion || 'Sin ubicación' }}</p>
          
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 inline-block shadow-inner">
            <img [src]="getQrImageUrl(showQrModal()!)" alt="Código QR de la mesa" class="w-48 h-48 mx-auto rounded-lg" />
          </div>

          <p class="text-xs text-primary bg-surface py-2 px-4 rounded-xl mb-6 font-bold truncate">
            URL: /mesa/{{ restauranteNombre() }}/{{ showQrModal()?.numero }}
          </p>

          <div class="flex flex-col gap-3">
            <a [href]="getQrImageUrl(showQrModal()!)" download="Mesa_QR.png" target="_blank"
               class="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-sm hover:bg-[#1a233b] transition-all text-center text-xs text-sm">
              ↓ Descargar Imagen QR
            </a>
            <button (click)="imprimirQr()" class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all text-xs text-sm">
              Imprimir Cartel
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Ver Detalle de Tarea -->
    @if (selectedTaskForView()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#FAF6EE] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border-2 border-[#DCD0C0] text-gray-800">
          <button (click)="selectedTaskForView.set(null)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 font-bold transition-all border border-gray-200/60 shadow-sm">
            &times;
          </button>
          
          <h3 class="text-lg font-black text-gray-800 mb-1 border-b border-amber-900/10 pb-2">Mesa {{ selectedTaskForView()?.tableId }}</h3>
          
          <div class="space-y-3.5 my-4">
            <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-2">
              <span class="font-bold text-gray-400">Tipo de Alerta:</span>
              <span class="font-black px-2.5 py-0.5 rounded-md uppercase text-[10px]" [ngClass]="getTypeTagClass(selectedTaskForView()!.type)">
                {{ selectedTaskForView()?.type }}
              </span>
            </div>
            @if (selectedTaskForView()?.type === 'Pedido') {
              <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-2">
                <span class="font-bold text-gray-400">Estado del Pedido:</span>
                <span class="font-black px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                  {{ selectedTaskForView()?.pedidoEstado || 'Recibido' }}
                </span>
              </div>
            }
            <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-2">
              <span class="font-bold text-gray-400">Tiempo Transcurrido:</span>
              <span class="font-black text-gray-700">
                Hace {{ getMinutesElapsed(selectedTaskForView()!.timestamp) }} min
              </span>
            </div>
            <div class="bg-white/90 p-4 rounded-2xl border border-amber-900/10 shadow-inner">
              <span class="block text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-wide">Detalles de la Solicitud:</span>
              <p class="text-xs font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                {{ selectedTaskForView()?.details || 'Atención general requerida en la mesa.' }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 mt-6 pt-3 border-t border-amber-900/10">
            <button (click)="selectedTaskForView.set(null)" class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-black hover:bg-gray-300 transition-colors shadow-sm">
              Cerrar
            </button>
            @if (selectedTaskForView()?.type === 'Pedido') {
              @if (selectedTaskForView()?.pedidoEstado === 'Recibido' || !selectedTaskForView()?.pedidoEstado) {
                <button (click)="aprobarPedido(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 shadow-sm transition-transform active:scale-95">
                  Aprobar
                </button>
              } @else {
                <button (click)="entregarPedido(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-primary text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#1a233b] shadow-sm transition-transform active:scale-95">
                  Cerrar Pedido
                </button>
              }
            } @else {
              <button (click)="completar(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-primary text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#1a233b] shadow-sm transition-transform active:scale-95">
                Completar
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Modal POS de Facturación y Consumos Extra (Caja) -->
    @if (showBillingModal() && billingMesa()) {
      <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-4xl w-full border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative max-h-[90vh] overflow-y-auto text-primary">
          <button (click)="showBillingModal.set(false)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 font-black shadow-sm transition-all cursor-pointer">&times;</button>
          
          <!-- Columna Izquierda: Panel de Control de Cargos -->
          <div class="space-y-6">
            <div>
              <h2 class="text-xl font-black text-gray-800 tracking-tight">Cobro y Consumo</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Mesa {{ billingMesa()?.numero }} • PIN: {{ billingMesa()?.codigoAcceso }}
                • Mozo: {{ billingMesa()?.mozo?.nombreCompleto || billingMesa()?.mozo?.username || 'Sin mozo' }}
              </p>
            </div>

            <!-- Formulario 1: Agregar Plato de la Carta -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h3 class="text-xs font-black text-gray-700">Agregar plato del menú</h3>
              <div class="flex gap-2">
                <select [(ngModel)]="selectedMenuItemId" class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                  <option value="">Selecciona un plato...</option>
                  @for (item of dataService.menuItems(); track item.id) {
                    @if (item.activo) {
                      <option [value]="item.id">{{ item.nombre }} (\${{ item.precio }})</option>
                    }
                  }
                </select>
                <input type="number" [(ngModel)]="extraQuantity" min="1" class="w-16 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-center outline-none">
                <button (click)="addExtraItem()" class="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-opacity-90 active:scale-95 transition-all shadow-sm">
                  +
                </button>
              </div>
            </div>

            <!-- Formulario 2: Agregar Cargo Manual -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h3 class="text-xs font-black text-gray-700">Agregar cargo manual</h3>
              <div class="grid grid-cols-3 gap-2">
                <input type="text" [(ngModel)]="manualChargeDescription" placeholder="Ej: Servicio de mesa" class="col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none text-gray-800">
                <input type="number" [(ngModel)]="manualChargeMonto" placeholder="$ Monto" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-center outline-none text-gray-800">
              </div>
              <button (click)="addManualCharge()" class="w-full bg-primary text-white py-2 rounded-xl text-xs font-black hover:bg-opacity-90 active:scale-95 transition-all shadow-sm">
                Agregar Cargo Extra
              </button>
            </div>

            <!-- Botones de Acción de Consumo -->
            <div class="pt-4 border-t border-gray-100 flex gap-2">
              <button (click)="showBillingModal.set(false)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl text-xs font-black transition-all active:scale-95">
                Volver
              </button>
              @if (extraItems().length > 0 || manualCharges().length > 0) {
                <button (click)="confirmarCobro()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                  Guardar Extras
                </button>
              }
            </div>
          </div>

          <!-- Columna Derecha: Ticket Previo de Consumo -->
          <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] p-5 rounded-3xl flex flex-col justify-between font-mono text-[11px] text-primary/95 min-h-[350px]">
            <div class="space-y-4">
              <!-- Encabezado Ticket -->
              <div class="text-center pb-3 border-b border-dashed border-[#DCD0C0] space-y-1">
                <span class="text-xs font-black tracking-tight block">TICKET PREVIO</span>
                <span class="text-[9px] text-gray-500 block">Mesa {{ billingMesa()?.numero }} • PIN {{ billingMesa()?.codigoAcceso }}</span>
              </div>

              <!-- Listado de Consumos (Existentes + Nuevos) -->
              <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                <!-- Consumos de la base de datos -->
                @for (item of billingItems(); track item.id) {
                  <div class="flex justify-between items-start gap-1">
                    <div class="flex-1 text-left">
                      <span class="font-bold block text-gray-800">{{ item.nombre }}</span>
                      <span class="text-[9px] text-gray-500 font-semibold">{{ item.cantidad }} x \${{ item.precioUnitario | number:'1.2-2' }}</span>
                    </div>
                    <span class="font-black text-gray-800">\${{ item.total | number:'1.2-2' }}</span>
                  </div>
                }

                <!-- Consumos extras locales -->
                @for (item of extraItems(); track $index) {
                  <div class="flex justify-between items-start gap-1 bg-emerald-500/5 p-1 rounded">
                    <div class="flex-1 text-left">
                      <span class="font-black text-emerald-800 block">* {{ item.nombre }} (Extra)</span>
                      <span class="text-[9px] text-emerald-600 font-semibold">{{ item.cantidad }} x \${{ item.precioUnitario | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-black text-emerald-800">
                      <span>\${{ item.total | number:'1.2-2' }}</span>
                      <button (click)="removeExtraItem($index)" class="text-red-500 font-black hover:text-red-700 active:scale-90 text-[13px] line-none select-none">&times;</button>
                    </div>
                  </div>
                }

                <!-- Cargos manuales locales -->
                @for (charge of manualCharges(); track $index) {
                  <div class="flex justify-between items-start gap-1 bg-emerald-500/5 p-1 rounded">
                    <div class="flex-1 text-left">
                      <span class="font-black text-emerald-800 block">* {{ charge.descripcion }} (Cargo)</span>
                      <span class="text-[9px] text-emerald-600 font-semibold">1 x \${{ charge.monto | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-black text-emerald-800">
                      <span>\${{ charge.monto | number:'1.2-2' }}</span>
                      <button (click)="removeManualCharge($index)" class="text-red-500 font-black hover:text-red-700 active:scale-90 text-[13px] line-none select-none">&times;</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Footer del Ticket con Total y Cierre -->
            <div class="pt-4 border-t border-dashed border-[#DCD0C0] space-y-4">
              <div class="flex justify-between items-center text-xs font-black">
                <span>TOTAL A PAGAR</span>
                <span class="text-emerald-700 text-sm">\${{ getPreviewTotal() | number:'1.2-2' }}</span>
              </div>

              <!-- Cerrar Mesa -->
              <button (click)="showConfirmCloseModal.set(true)" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-1">
                🧾 Registrar Pago y Cerrar Mesa
              </button>
            </div>
          </div>
          
        </div>
      </div>
    }

    <!-- Confirm Close Modal -->
    @if (showConfirmCloseModal()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-150 shadow-2xl space-y-5 animate-scale-up">
          <div class="pb-2 border-b border-gray-100">
            <h3 class="text-lg font-black text-gray-800">Confirmar Cierre de Cuenta</h3>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              Mesa {{ billingMesa()?.numero }} • Mozo: {{ billingMesa()?.mozo?.nombreCompleto || billingMesa()?.mozo?.username || 'Sin mozo' }}
            </p>
          </div>

          <div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            <!-- Render already saved billing items -->
            @for (item of billingItems(); track item.id) {
              <div class="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>{{ item.cantidad }}x {{ item.nombre }}</span>
                <span>\${{ item.total | number:'1.2-2' }}</span>
              </div>
            }
            
            <!-- Render pending extra items -->
            @for (item of extraItems(); track item.menuItemId) {
              <div class="flex justify-between items-center text-xs font-bold text-accent">
                <span>{{ item.cantidad }}x {{ item.nombre }} (Extra)</span>
                <span>\${{ item.total | number:'1.2-2' }}</span>
              </div>
            }

            <!-- Render pending manual charges -->
            @for (charge of manualCharges(); track charge.descripcion) {
              <div class="flex justify-between items-center text-xs font-bold text-accent">
                <span>1x {{ charge.descripcion }} (Manual)</span>
                <span>\${{ charge.monto | number:'1.2-2' }}</span>
              </div>
            }
          </div>

          <div class="pt-4 border-t border-dashed border-gray-200">
            <div class="flex justify-between items-center font-black text-gray-800 text-sm">
              <span>TOTAL FACTURA</span>
              <span class="text-emerald-700 text-base">\${{ getPreviewTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button (click)="showConfirmCloseModal.set(false)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-250 px-5 py-3 rounded-xl font-bold text-xs">
              Cancelar
            </button>
            <button (click)="ejecutarCierreYFacturacion()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all">
              Confirmar Pago y Facturar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class AdminDashboardComponent {
  service = inject(SignalrService);
  dataService = inject(AdminDataService);
  auth = inject(AuthService);
  http = inject(HttpClient);
  lang = inject(LanguageService);
  private restauranteService = inject(RestauranteService);
  private tenantContext = inject(TenantContextService);
  
  currentDate = new Date();

  // Signals para Facturación y Consumos Extra (POS Caja)
  showBillingModal = signal(false);
  showConfirmCloseModal = signal(false);
  billingMesa = signal<AdminMesa | null>(null);
  billingItems = signal<any[]>([]);
  billingTotal = signal<number>(0);
  extraItems = signal<any[]>([]);
  manualCharges = signal<any[]>([]);
  selectedMenuItemId = '';
  extraQuantity = 1;
  manualChargeDescription = '';
  manualChargeMonto = 0;

  // Signals para Filtros
  filterType = signal<string>('All');
  filterMesa = signal<string>('All');
  filterMozo = signal<string>('All');

  // Asignaciones e inline abm
  showReassignModal = signal<string | null>(null);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  saveSuccess = signal(false);
  formData: AdminMesa = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };
  showQrModal = signal<AdminMesa | null>(null);
  restauranteNombre = signal<string>('restaurante');
  collapseMesas = signal(false);
  collapseTasks = signal(false);
  showControlMesas = signal(false);
  selectedTaskForView = signal<MesaTask | null>(null);

  myPendingTasks = computed(() => {
    let allTasks = this.service.pendingTasks();
    const userRole = this.auth.currentUser()?.role;
    const userId = this.auth.currentUser()?.id;

    // Filtros de Admin
    if (this.filterType() !== 'All') allTasks = allTasks.filter(t => t.type === this.filterType());
    if (this.filterMesa() !== 'All') allTasks = allTasks.filter(t => t.tableId.toString() === this.filterMesa());
    if (this.filterMozo() !== 'All') allTasks = allTasks.filter(t => t.assignedMozoId === this.filterMozo() || (!t.assignedMozoId && this.dataService.mesas().find(m => m.numero === t.tableId)?.mozoId === this.filterMozo()));

    let filtered = allTasks;
    if (userRole !== 'Admin') {
      // Filtro de Mozo (mis mesas o tareas reasignadas a mí)
      const myMesasNumeros = this.myMesas().map(m => m.numero);
      filtered = allTasks.filter(t => t.assignedMozoId === userId || (!t.assignedMozoId && myMesasNumeros.includes(t.tableId)));
    }

    // Ordenar con prioridad: Listo -> Recibido/SinEstado -> Cuenta -> Llamado -> EnPreparacion
    return [...filtered].sort((a, b) => {
      const getPriority = (t: MesaTask) => {
        if (t.type === 'Pedido') {
          if (t.pedidoEstado === 'Listo') return 1;
          if (t.pedidoEstado === 'Recibido' || !t.pedidoEstado) return 2;
          if (t.pedidoEstado === 'EnPreparacion') return 5;
        }
        if (t.type === 'Cuenta') return 3;
        if (t.type === 'Llamado') return 4;
        return 6;
      };
      const prioA = getPriority(a);
      const prioB = getPriority(b);
      if (prioA !== prioB) return prioA - prioB;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  });

  myMesas = computed(() => {
    const userRole = this.auth.currentUser()?.role;
    const userId = this.auth.currentUser()?.id;
    if (userRole === 'Admin') return this.dataService.mesas();
    return this.dataService.mesas().filter(m => m.mozoId === userId);
  });

  constructor() {
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    const currentUser = this.auth.currentUser();
    if (currentUser && currentUser.restauranteNombre) {
      this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
    }

    this.tenantContext.tenantId$.subscribe(tenantId => {
      if (tenantId) {
        if (currentUser && currentUser.restauranteId === tenantId && currentUser.restauranteNombre) {
          this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
          return;
        }

        this.restauranteService.getById(tenantId).subscribe({
          next: (rest) => {
            if (rest && rest.nombre) {
              this.restauranteNombre.set(this.slugify(rest.nombre));
            }
          },
          error: (err) => {
            console.error('Error al obtener restaurante por id, usando fallback:', err);
            if (currentUser && currentUser.restauranteNombre) {
              this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
            }
          }
        });
      } else {
        this.restauranteNombre.set('restaurante');
      }
    });
  }

  slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  openQrModal(mesa: AdminMesa) {
    this.showQrModal.set(mesa);
  }

  closeQrModal() {
    this.showQrModal.set(null);
  }

  getQrImageUrl(mesa: AdminMesa) {
    const baseUrl = window.location.origin;
    const targetUrl = `${baseUrl}/mesa/${this.restauranteNombre()}/${mesa.numero}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(targetUrl)}`;
  }

  imprimirQr() {
    if (!this.showQrModal()) return;
    const imgUrl = this.getQrImageUrl(this.showQrModal()!);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Imprimir QR Mesa ${this.showQrModal()?.numero}</title></head>
          <body style="text-align: center; font-family: sans-serif; padding-top: 50px;">
            <h1>Mesa ${this.showQrModal()?.numero}</h1>
            <p>${this.showQrModal()?.ubicacion || 'Sin ubicación'}</p>
            <img src="${imgUrl}" style="width: 300px; height: 300px; border: 2px solid #000; padding: 10px; border-radius: 10px;" />
            <br/><br/>
            <p style="color: #666;">Escanea para pedir</p>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };
    this.showForm.set(true);
  }

  openEditForm(mesa: AdminMesa) {
    this.editingId.set(mesa.id);
    this.formData = { ...mesa };
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    if (this.editingId()) {
      this.dataService.updateMesa(this.formData);
    } else {
      this.dataService.addMesa({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.mesas();
    
    this.http.post(`${environment.apiUrl}/api/mesas/bulk`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        console.error('El backend rechazó el guardado:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend (' + environment.apiUrl + '/api/mesas/bulk) rechazó tu pedido de resincronización.');
      }
    });
  }

  getMozoUsername(mozoId: string | null): string {
    if (!mozoId) return 'Sin asignar';
    const mozo = this.dataService.mozos().find(m => m.id === mozoId);
    return mozo?.username || 'Sin asignar';
  }

  getMinutesElapsed(date: Date): number {
    const diffMs = this.currentDate.getTime() - new Date(date).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  getTypeBgClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Pedido': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Cuenta': return 'bg-accent/10 text-accent border border-accent/20';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getTypeTagClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-100 text-yellow-700';
      case 'Pedido': return 'bg-blue-100 text-blue-700';
      case 'Cuenta': return 'bg-accent/10 text-accent';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getSideBarClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-400';
      case 'Pedido': return 'bg-blue-400';
      case 'Cuenta': return 'bg-accent';
      default: return 'bg-gray-300';
    }
  }

  completar(taskId: string) {
    this.service.completeTask(taskId);
  }

  aprobarPedido(taskId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.post(`${environment.apiUrl}/api/pedido/${taskId}/aprobar`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // Tarea completada y retirada automáticamente por SignalR
      },
      error: (err) => console.error('Error al aprobar pedido:', err)
    });
  }

  entregarPedido(pedidoId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'Entregado' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // La actualización de SignalR retirará la tarea automáticamente
      },
      error: (err) => console.error('Error al entregar pedido:', err)
    });
  }

  actualizarMontoConsumo(mesaId: string, event: any) {
    const valueStr = event.target.value;
    const monto = valueStr === '' ? null : parseFloat(valueStr);
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/monto`, monto, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    }).subscribe({
      next: (res: any) => {
        // Actualizar localmente la mesa en el dataService
        this.dataService.mesas.update(mesas => 
          mesas.map(m => m.id === mesaId ? { ...m, montoConsumo: res.montoConsumo } : m)
        );
      },
      error: (err) => console.error('Error al actualizar monto consumo:', err)
    });
  }

  async abrirMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/abrir`, null).subscribe({
        next: () => this.dataService.refreshAll(),
        error: (e) => console.error(e)
      });
    } catch(e) { console.error(e); }
  }

  async cerrarMesa(mesaId: string) {
    this.showConfirmCloseModal.set(true);
  }

  async ejecutarCierreYFacturacion() {
    const mesa = this.billingMesa();
    if (!mesa) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Check if there are pending extra items or manual charges to save first
    const hasUnsavedExtras = this.extraItems().length > 0 || this.manualCharges().length > 0;

    if (hasUnsavedExtras) {
      const payload = {
        items: [
          ...this.extraItems().map(i => ({ menuItemId: i.menuItemId, cantidad: i.cantidad })),
          ...this.manualCharges().map(c => ({ descripcion: c.descripcion, monto: c.monto }))
        ]
      };

      this.http.post<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/agregar-consumo`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      }).subscribe({
        next: () => {
          this.procederConCerrarMesaAPI(mesa.id);
        },
        error: (err) => {
          console.error('Error al guardar consumos antes de cerrar:', err);
          alert('Hubo un error al guardar los consumos extras. Cierre cancelado.');
        }
      });
    } else {
      this.procederConCerrarMesaAPI(mesa.id);
    }
  }

  private procederConCerrarMesaAPI(mesaId: string) {
    const token = localStorage.getItem('auth_token');
    this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/cerrar`, null, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.dataService.refreshAll();
        this.showConfirmCloseModal.set(false);
        this.showBillingModal.set(false);
        this.billingMesa.set(null);
      },
      error: (e) => {
        console.error(e);
        alert('Hubo un error al cerrar la mesa.');
      }
    });
  }

  openBillingModal(mesa: any) {
    this.billingMesa.set(mesa);
    this.extraItems.set([]);
    this.manualCharges.set([]);
    this.selectedMenuItemId = '';
    this.extraQuantity = 1;
    this.manualChargeDescription = '';
    this.manualChargeMonto = 0;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.get<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/consumos`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.billingItems.set(data.items);
        this.billingTotal.set(data.total);
        this.showBillingModal.set(true);
      },
      error: (err) => console.error('Error al cargar consumos de mesa:', err)
    });
  }

  addExtraItem() {
    if (!this.selectedMenuItemId || this.extraQuantity < 1) return;
    const matchedItem = this.dataService.menuItems().find(i => i.id === this.selectedMenuItemId);
    if (!matchedItem) return;

    const existingIndex = this.extraItems().findIndex(i => i.menuItemId === this.selectedMenuItemId);
    if (existingIndex > -1) {
      this.extraItems.update(items => {
        items[existingIndex].cantidad += this.extraQuantity;
        items[existingIndex].total = items[existingIndex].cantidad * items[existingIndex].precioUnitario;
        return [...items];
      });
    } else {
      this.extraItems.update(items => [...items, {
        menuItemId: matchedItem.id,
        nombre: matchedItem.nombre,
        cantidad: this.extraQuantity,
        precioUnitario: matchedItem.precio,
        total: this.extraQuantity * matchedItem.precio
      }]);
    }
    this.selectedMenuItemId = '';
    this.extraQuantity = 1;
  }

  removeExtraItem(index: number) {
    this.extraItems.update(items => items.filter((_, i) => i !== index));
  }

  addManualCharge() {
    if (!this.manualChargeDescription.trim() || this.manualChargeMonto <= 0) return;
    this.manualCharges.update(charges => [...charges, {
      descripcion: this.manualChargeDescription.trim(),
      monto: this.manualChargeMonto
    }]);
    this.manualChargeDescription = '';
    this.manualChargeMonto = 0;
  }

  removeManualCharge(index: number) {
    this.manualCharges.update(charges => charges.filter((_, i) => i !== index));
  }

  getPreviewTotal(): number {
    const dbTotal = this.billingTotal();
    const extraTotal = this.extraItems().reduce((acc, i) => acc + i.total, 0);
    const manualTotal = this.manualCharges().reduce((acc, c) => acc + c.monto, 0);
    return dbTotal + extraTotal + manualTotal;
  }

  confirmarCobro() {
    const mesa = this.billingMesa();
    if (!mesa) return;

    const payload = {
      items: [
        ...this.extraItems().map(i => ({ menuItemId: i.menuItemId, cantidad: i.cantidad })),
        ...this.manualCharges().map(c => ({ descripcion: c.descripcion, monto: c.monto }))
      ]
    };

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/agregar-consumo`, payload, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    }).subscribe({
      next: (res) => {
        this.dataService.refreshAll();
        // Recargar consumos y limpiar temporales locales
        this.openBillingModal(mesa);
        alert('Consumos extras guardados en la mesa.');
      },
      error: (err) => console.error('Error al agregar consumos:', err)
    });
  }

  openReassignModal(taskId: string) {
    this.showReassignModal.set(taskId);
  }

  async reasignar(taskId: string, newMozoId: string) {
    await this.service.sendReasignarTarea(taskId, newMozoId);
    this.showReassignModal.set(null);
  }
}
