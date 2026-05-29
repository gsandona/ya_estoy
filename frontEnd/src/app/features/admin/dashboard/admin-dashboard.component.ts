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
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">↻</span> Sin conexión. Intentando reconectar al servidor...
        </div>
      }
      
      <!-- Panel de Mesas (Control de PIN) -->
      <div class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2">🕹️ Control de Mesas</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          @for(mesa of myMesas(); track mesa.id) {
            <div class="border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
                 [ngClass]="mesa.codigoAcceso ? 'bg-green-50/50 border-green-200' : 'bg-gray-50/50 border-gray-200'">
              <span class="text-sm font-bold text-gray-700">Mesa {{ mesa.numero }}</span>
              @if(mesa.codigoAcceso) {
                <span class="text-2xl font-black tracking-widest text-green-600 drop-shadow-sm">{{ mesa.codigoAcceso }}</span>
                <button (click)="cerrarMesa(mesa.id)" class="bg-red-100 text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-red-200 w-full transition-colors">Cerrar</button>
              } @else {
                <span class="text-xs font-medium text-gray-400 py-1.5">Inactiva</span>
                <button (click)="abrirMesa(mesa.id)" class="bg-primary text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/90 w-full shadow-sm transition-colors">Abrir</button>
              }
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">🔔 Solicitudes Activas</h1>
          <p class="text-sm text-gray-500 font-medium mt-1">Monitorea y atiende los pedidos en tiempo real</p>
        </div>
        
        <!-- Filtros (Solo Admin) -->
        @if(auth.currentUser()?.role === 'Admin') {
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
              @for(mz of dataService.mozos(); track mz.id) { <option [value]="mz.id">{{mz.email}}</option> }
            </select>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (task of myPendingTasks(); track task.id) {
          <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 flex flex-col relative overflow-hidden transition-all group hover:-translate-y-1">
            
            <!-- Barra superior indicadora -->
            <div class="absolute top-0 left-0 w-full h-1.5" [ngClass]="getSideBarClass(task.type)"></div>

            <div class="flex justify-between items-start mb-3 pt-1">
              <div class="flex items-center gap-3">
                 <div class="w-12 h-12 rounded-2xl flex flex-col justify-center items-center font-black shadow-inner" [ngClass]="getTypeBgClass(task.type)">
                   <span class="text-xs opacity-80 leading-none mb-0.5">Mesa</span>
                   <span class="text-xl leading-none">{{ task.tableId }}</span>
                 </div>
                 <div>
                   <span class="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md" [ngClass]="getTypeTagClass(task.type)">{{task.type}}</span>
                   <div class="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                     ⏱ Hace {{ getMinutesElapsed(task.timestamp) }} min
                   </div>
                 </div>
              </div>
              
              @if(auth.currentUser()?.role === 'Admin') {
                <button (click)="openReassignModal(task.id)" class="text-[10px] text-indigo-600 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-500 px-2.5 py-1 rounded-lg transition-colors border border-indigo-100">Reasignar</button>
              }
            </div>

            <div class="flex-1 bg-surface/50 rounded-xl p-3 mb-4 border border-gray-50">
               @if (task.details) {
                 <p class="text-gray-600 text-sm font-medium line-clamp-2 leading-snug">{{ task.details }}</p>
               } @else {
                 <p class="text-gray-400 text-sm italic">Atención requerida en la mesa.</p>
               }
            </div>

            <div class="flex gap-2 mt-auto">
              <button class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                Ver 👁️
              </button>
              <button (click)="completar(task.id)" class="flex-[2] bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary/90 shadow-sm transition-transform active:scale-95">
                Completar ✔
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
            <div class="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <span class="text-3xl filter grayscale opacity-40">✨</span>
            </div>
            <h3 class="text-xl font-black text-gray-600 mb-1">Todo al día</h3>
            <p class="text-gray-400 font-medium text-sm">No hay solicitudes pendientes en este momento.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal Reasignar -->
    @if(showReassignModal()) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20 relative">
          <button (click)="showReassignModal.set(null)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-colors">&times;</button>
          
          <h3 class="text-xl font-black mb-1 text-gray-800 flex items-center gap-2">🔄 Reasignar</h3>
          <p class="text-sm text-gray-500 mb-6 font-medium">Transfiere esta tarea a otro mozo disponible.</p>
          
          <div class="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            @for(mz of dataService.mozos(); track mz.id) {
              <button (click)="reasignar(showReassignModal()!, mz.id)" class="w-full text-left px-4 py-3 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 font-bold text-gray-700 transition-all flex items-center gap-3 group">
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs group-hover:bg-primary/10 group-hover:text-primary">👤</div>
                {{mz.email}}
              </button>
            }
          </div>
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

  async abrirMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/abrir`, null).subscribe({
        next: () => this.dataService.refreshAll(),
        error: (e) => console.error(e)
      });
    } catch(e) { console.error(e); }
  }

  async cerrarMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/cerrar`, null).subscribe({
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
