import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../core/services/signalr.service';
import { AdminDataService } from '../config/admin-data.service';
import { AuthService } from '../../../core/services/auth.service';

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
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight mb-4">Control de Mesas</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          @for(mesa of myMesas(); track mesa.id) {
            <div class="border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden"
                 [ngClass]="mesa.codigoAcceso ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <span class="text-lg font-bold text-gray-700">Mesa {{ mesa.numero }}</span>
              @if(mesa.codigoAcceso) {
                <span class="text-3xl font-black tracking-widest text-green-600 my-2">{{ mesa.codigoAcceso }}</span>
                <button (click)="cerrarMesa(mesa.id)" class="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-200 w-full">Cerrar</button>
              } @else {
                <span class="text-sm font-medium text-gray-400 my-3">Inactiva</span>
                <button (click)="abrirMesa(mesa.id)" class="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-700 w-full shadow-sm">Abrir</button>
              }
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight">Tareas Activas</h1>
          <p class="text-gray-500 font-medium mt-1">Monitorea y atiende las solicitudes en tiempo real</p>
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (task of myPendingTasks(); track task.id) {
          <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col gap-5 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group">
            
            <div class="absolute top-0 right-0 w-2 h-full" [ngClass]="getSideBarClass(task.type)"></div>

            <!-- Header -->
            <div class="flex justify-between items-start pr-4">
              <div class="flex items-center gap-4">
                <div class="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 text-primary flex items-center justify-center font-black text-2xl shadow-inner">
                  {{ task.tableId }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-xl">Mesa {{ task.tableId }}</h3>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-xs font-medium text-gray-400">Hace</span>
                    <span class="text-sm font-bold text-gray-600">{{ getMinutesElapsed(task.timestamp) }} min</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="px-3.5 py-1.5 text-[13px] font-bold rounded-xl tracking-wide uppercase shadow-sm" [ngClass]="getTypeClass(task.type)">
                {{ task.type }}
              </span>
              @if(auth.currentUser()?.role === 'Admin') {
                <button (click)="openReassignModal(task.id)" class="text-xs text-blue-500 hover:underline font-bold bg-blue-50 px-2 py-1 rounded">Reasignar</button>
              }
            </div>

            <!-- Body -->
            <div class="flex-1 min-h-[40px]">
              @if (task.details) {
                <p class="text-gray-600 text-sm bg-surface p-3.5 rounded-xl border border-gray-200 font-medium">{{ task.details }}</p>
              }
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-2">
              <button class="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-[#1a233b] transition-all active:scale-95 shadow-md">
                Atender
              </button>
              <button (click)="completar(task.id)" class="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl text-sm font-bold hover:border-accent hover:text-accent transition-all active:scale-95">
                Completar
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
      const res = await fetch(`https://localhost:7132/api/mesas/${mesaId}/abrir`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.auth.getToken()}` }
      });
      if(res.ok) this.dataService.refreshAll();
    } catch(e) { console.error(e); }
  }

  async cerrarMesa(mesaId: string) {
    try {
      const res = await fetch(`https://localhost:7132/api/mesas/${mesaId}/cerrar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.auth.getToken()}` }
      });
      if(res.ok) this.dataService.refreshAll();
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
