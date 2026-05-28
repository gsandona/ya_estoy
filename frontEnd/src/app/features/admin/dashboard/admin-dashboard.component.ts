import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../core/services/signalr.service';
import { AdminDataService } from '../config/admin-data.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

@Component({
// ... (omitted changing imports array to not overwrite metadata incorrectly)
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-20">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">↻</span> Sin conexión. Intentando reconectar al servidor...
        </div>
      }
      
      <!-- Panel de Mesas (Control de PIN) -->
      <div class="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 class="text-xl sm:text-2xl font-black text-gray-800 tracking-tight mb-3">Control de Mesas</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
          @for(mesa of myMesas(); track mesa.id) {
            <div class="border rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1.5 relative overflow-hidden"
                 [ngClass]="mesa.codigoAcceso ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <span class="text-sm sm:text-base font-bold text-gray-700">Mesa {{ mesa.numero }}</span>
              @if(mesa.codigoAcceso) {
                <span class="text-xl sm:text-2xl font-black tracking-widest text-green-600 my-1">{{ mesa.codigoAcceso }}</span>
                <button (click)="cerrarMesa(mesa.id)" class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold hover:bg-red-200 w-full">Cerrar</button>
              } @else {
                <span class="text-[10px] sm:text-xs font-medium text-gray-400 my-1.5">Inactiva</span>
                <button (click)="abrirMesa(mesa.id)" class="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold hover:bg-green-700 w-full shadow-sm">Abrir</button>
              }
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Tareas Activas</h1>
          <p class="text-xs sm:text-sm text-gray-500 font-medium mt-1">Monitorea y atiende las solicitudes</p>
        </div>
        
        <!-- Filtros (Solo Admin) -->
        @if(auth.currentUser()?.role === 'Admin') {
          <div class="flex flex-wrap items-center gap-3 bg-surface px-4 py-3 rounded-xl border border-gray-200">
            <select [ngModel]="filterType()" (ngModelChange)="filterType.set($event)" class="bg-white border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-accent focus:border-accent">
              <option value="All">Todos los Tipos</option>
              <option value="Llamado">Llamado</option>
              <option value="Pedido">Pedido</option>
              <option value="Cuenta">Cuenta</option>
            </select>
            <select [ngModel]="filterMesa()" (ngModelChange)="filterMesa.set($event)" class="bg-white border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-accent focus:border-accent">
              <option value="All">Todas las Mesas</option>
              @for(m of dataService.mesas(); track m.id) { <option [value]="m.numero">Mesa {{m.numero}}</option> }
            </select>
            <select [ngModel]="filterMozo()" (ngModelChange)="filterMozo.set($event)" class="bg-white border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:ring-accent focus:border-accent">
              <option value="All">Todos los Mozos</option>
              @for(mz of dataService.mozos(); track mz.id) { <option [value]="mz.id">{{mz.email}}</option> }
            </select>
          </div>
        }
      </div>

      <div class="flex flex-col gap-3">
        @for (task of myPendingTasks(); track task.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-row items-center gap-4 relative overflow-hidden transition-colors hover:bg-slate-50">
            
            <!-- Barra lateral indicadora -->
            <div class="absolute top-0 left-0 w-1.5 h-full" [ngClass]="getSideBarClass(task.type)"></div>

            <!-- Mesa Info (Izquierda) -->
            <div class="pl-2 flex flex-col justify-center items-center min-w-[60px] border-r border-gray-100 pr-3">
               <span class="text-[10px] font-black tracking-wider text-gray-400 uppercase">{{task.type}}</span>
               <span class="text-2xl font-black text-gray-800 leading-none mt-1">{{ task.tableId }}</span>
            </div>

            <!-- Centro: Detalles y Tiempo -->
            <div class="flex-1 flex flex-col justify-center min-w-0">
               <div class="flex items-center gap-2 mb-1">
                 <span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                   ⏱ {{ getMinutesElapsed(task.timestamp) }} min
                 </span>
                 @if(auth.currentUser()?.role === 'Admin') {
                   <button (click)="openReassignModal(task.id)" class="text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Reasignar</button>
                 }
               </div>
               @if (task.details) {
                 <p class="text-gray-600 text-xs sm:text-sm font-medium truncate">{{ task.details }}</p>
               } @else {
                 <p class="text-gray-400 text-xs italic">Sin detalles</p>
               }
            </div>

            <!-- Derecha: Botones -->
            <div class="flex flex-col sm:flex-row gap-2">
              <button class="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1a233b] transition-colors shadow-sm whitespace-nowrap">
                Atender
              </button>
              <button (click)="completar(task.id)" class="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-xs font-bold hover:border-accent hover:text-accent transition-colors whitespace-nowrap">
                Listo ✔
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
            <div class="h-24 w-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm">
              <span class="text-4xl filter grayscale opacity-50">📋</span>
            </div>
            <h3 class="text-xl font-bold text-gray-500 mb-2">Todo al día</h3>
            <p class="text-gray-400 font-medium">No hay solicitudes pendientes en este momento.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal Reasignar -->
    @if(showReassignModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <h3 class="text-xl font-bold mb-4 text-gray-800">Reasignar Tarea</h3>
          <p class="text-sm text-gray-500 mb-4">Selecciona al mozo que se encargará de esta solicitud.</p>
          <div class="space-y-2 mb-6 max-h-60 overflow-y-auto">
            @for(mz of dataService.mozos(); track mz.id) {
              <button (click)="reasignar(showReassignModal()!, mz.id)" class="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-accent hover:bg-accent/5 font-medium transition-colors">
                {{mz.email}}
              </button>
            }
          </div>
          <button (click)="showReassignModal.set(null)" class="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">Cancelar</button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
  
  currentDate = new Date();

  // Signals para Filtros
  filterType = signal<string>('All');
  filterMesa = signal<string>('All');
  filterMozo = signal<string>('All');

  // Asignaciones
  showReassignModal = signal<string | null>(null);

  myPendingTasks = computed(() => {
    let allTasks = this.service.pendingTasks();
    const userRole = this.auth.currentUser()?.role;
    const userId = this.auth.currentUser()?.id;

    // Filtros de Admin
    if (this.filterType() !== 'All') allTasks = allTasks.filter(t => t.type === this.filterType());
    if (this.filterMesa() !== 'All') allTasks = allTasks.filter(t => t.tableId.toString() === this.filterMesa());
    if (this.filterMozo() !== 'All') allTasks = allTasks.filter(t => t.assignedMozoId === this.filterMozo() || (!t.assignedMozoId && this.dataService.mesas().find(m => m.numero === t.tableId)?.mozoId === this.filterMozo()));

    if (userRole === 'Admin') return allTasks;

    // Filtro de Mozo (mis mesas o tareas reasignadas a mí)
    const myMesasNumeros = this.myMesas().map(m => m.numero);
    return allTasks.filter(t => t.assignedMozoId === userId || (!t.assignedMozoId && myMesasNumeros.includes(t.tableId)));
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
  }

  getMinutesElapsed(date: Date): number {
    const diffMs = this.currentDate.getTime() - new Date(date).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  getTypeClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Pedido': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Cuenta': return 'bg-accent/10 text-accent border border-accent/20';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
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

  async abrirMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/abrir`, {}).subscribe({
        next: () => this.dataService.refreshAll(),
        error: (e) => console.error(e)
      });
    } catch(e) { console.error(e); }
  }

  async cerrarMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/cerrar`, {}).subscribe({
        next: () => this.dataService.refreshAll(),
        error: (e) => console.error(e)
      });
    } catch(e) { console.error(e); }
  }

  openReassignModal(taskId: string) {
    this.showReassignModal.set(taskId);
  }

  async reasignar(taskId: string, newMozoId: string) {
    await this.service.sendReasignarTarea(taskId, newMozoId);
    this.showReassignModal.set(null);
  }
}
