import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMesasComponent } from './admin-mesas/admin-mesas.component';
import { AdminTareasComponent } from './admin-tareas/admin-tareas.component';
import { SignalrService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminMesasComponent, AdminTareasComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">Ôå╗</span> Sin conexi├│n. Intentando reconectar al servidor...
        </div>
      }
      
      <!-- Tab Toggle Superior -->
      <div class="flex justify-center mb-6">
        <div class="bg-gray-100 p-1 rounded-2xl flex shadow-inner">
          <button (click)="activeTab.set('tareas')" 
                  [class]="activeTab() === 'tareas' ? 'bg-white text-primary shadow-sm font-black' : 'text-gray-500 font-bold hover:text-gray-700'"
                  class="px-8 py-3 rounded-xl text-sm transition-all flex items-center gap-2">
            ­ƒôï Tareas
          </button>
          <button (click)="activeTab.set('mesas')" 
                  [class]="activeTab() === 'mesas' ? 'bg-white text-primary shadow-sm font-black' : 'text-gray-500 font-bold hover:text-gray-700'"
                  class="px-8 py-3 rounded-xl text-sm transition-all flex items-center gap-2">
            ­ƒì¢´©Å Mesas
          </button>
        </div>
      </div>

      @if (activeTab() === 'mesas') {
        <app-admin-mesas />
      }

      @if (activeTab() === 'tareas') {
        <app-admin-tareas />
      }
    </div>
  `
})
export class AdminDashboardComponent {
  activeTab = signal<'mesas' | 'tareas'>('tareas');
  service = inject(SignalrService);
}
