import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight">Mesa Tasks</h1>
          <p class="text-gray-500 font-medium mt-1">Monitorea y atiende las solicitudes en tiempo real</p>
        </div>
        <div class="flex items-center gap-3 bg-surface px-4 py-2 rounded-xl border border-gray-200">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          <span class="text-sm font-bold text-gray-700 tracking-wide uppercase">Conexión Activa</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (task of service.pendingTasks(); track task.id) {
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
            
            <div class="flex">
              <span class="px-3.5 py-1.5 text-[13px] font-bold rounded-xl tracking-wide uppercase shadow-sm"
                [ngClass]="getTypeClass(task.type)">
                {{ task.type }}
              </span>
            </div>

            <!-- Body -->
            <div class="flex-1 min-h-[40px]">
              @if (task.details) {
                <p class="text-gray-600 text-sm bg-surface p-3.5 rounded-xl border border-gray-200 font-medium">{{ task.details }}</p>
              }
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-2">
              <button 
                class="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-[#1a233b] transition-all active:scale-95 shadow-md">
                Atender
              </button>
              <button 
                (click)="completar(task.id)"
                class="flex-1 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl text-sm font-bold hover:border-accent hover:text-accent transition-all active:scale-95">
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
  currentDate = new Date();

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
}
