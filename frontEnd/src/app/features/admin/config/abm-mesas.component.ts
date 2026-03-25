import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminMesa } from './admin-data.service';

@Component({
  selector: 'app-abm-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestionar Mesas</h2>
        <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#1a233b]">+ Crear Mesa</button>
      </div>

      @if (showForm()) {
        <div class="bg-surface p-4 rounded-2xl mb-6 border border-gray-200">
          <form class="flex flex-col md:flex-row gap-4 items-end" (submit)="saveForm($event)">
            <div class="w-full md:w-32">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Número</label>
              <input type="number" [(ngModel)]="formData.numero" name="numero" class="w-full px-3 py-2 rounded-xl border border-gray-300" required>
            </div>
            <div class="flex-1 w-full">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Ubicación / Detalles</label>
              <input type="text" [(ngModel)]="formData.ubicacion" name="ubicacion" placeholder="Ej: Terraza Norte" class="w-full px-3 py-2 rounded-xl border border-gray-300">
            </div>
            <div class="flex-1 w-full">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Mozo Asignado</label>
              <!-- Dinámico conectado a Mozos reales -->
              <select [(ngModel)]="formData.mozoId" name="mozoId" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white">
                <option value="Sin asignar">Sin asignar</option>
                @for (mozo of dataService.mozos(); track mozo.id) {
                  <option [value]="mozo.email">{{ mozo.email }}</option>
                }
              </select>
            </div>
            <button type="button" (click)="showForm.set(false)" class="bg-gray-200 text-gray-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-300 h-10">Cancelar</button>
            <button type="submit" class="bg-accent text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-opacity-90 h-10">
              {{ editingId() ? 'Actualizar' : 'Guardar' }}
            </button>
          </form>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (mesa of dataService.mesas(); track mesa.id) {
          <div class="border border-gray-200 rounded-2xl p-4 flex flex-col hover:border-accent transition relative group bg-white">
            
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openEditForm(mesa)" class="text-indigo-500 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg">Editar</button>
              <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-lg">Borrar</button>
            </div>

            <div class="flex items-center gap-3 mb-2">
              <div class="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black">{{ mesa.numero }}</div>
              <div>
                <h3 class="font-bold text-gray-800">Mesa {{ mesa.numero }}</h3>
                <p class="text-xs text-gray-500">{{ mesa.ubicacion }}</p>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span class="text-xs font-semibold text-gray-500">Asignado a:</span>
              <span class="text-sm font-bold px-2 py-1 bg-surface rounded-lg text-primary">{{ mesa.mozoId }}</span>
            </div>
          </div>
        } @empty {
           <p class="col-span-full text-center py-6 text-gray-400">No hay mesas creadas.</p>
         }
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500 font-medium">Reorganiza el salón en memoria y súbelo al servidor.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-500 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-xl">✅ ¡Guardado!</span>
          }
          
          <button 
            (click)="syncBackend()"
            [disabled]="isSaving()"
            class="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black shadow-[0_4px_15px_rgb(16,185,129,0.3)] hover:bg-[#0da473] transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2">
            @if (isSaving()) {
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Sincronizando...
            } @else {
              ☁️ Guardar y Publicar
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class AbmMesasComponent {
  dataService = inject(AdminDataService);
  http = inject(HttpClient);
  
  showForm = signal(false);
  editingId = signal<string | null>(null);
  
  isSaving = signal(false);
  saveSuccess = signal(false);

  formData: AdminMesa = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };

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
    
    this.http.post('https://yaestoy.onrender.com/api/mesas/bulk', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        console.error('El backend rechazó el guardado:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend (' + 'https://yaestoy.onrender.com/api/mesas/bulk' + ') rechazó tu pedido de resincronización.');
      }
    });
  }
}
