import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminMenuItem } from './admin-data.service';

@Component({
  selector: 'app-abm-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestionar Menú</h2>
        <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#1a233b]">+ Agregar Producto</button>
      </div>

      @if (showForm()) {
        <div class="bg-surface p-4 rounded-2xl mb-6 border border-gray-200">
          <form class="flex flex-col gap-4 items-end" autocomplete="off" (submit)="saveForm($event)">
            <div class="flex flex-col md:flex-row gap-4 w-full">
              <div class="flex-1">
                <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
                <input type="text" [(ngModel)]="formData.nombre" name="nombre" class="w-full px-3 py-2 rounded-xl border border-gray-300" required>
              </div>
              <div class="w-full md:w-32">
                <label class="block text-xs font-semibold text-gray-500 mb-1">Precio ($)</label>
                <input type="number" [(ngModel)]="formData.precio" name="precio" class="w-full px-3 py-2 rounded-xl border border-gray-300" required>
              </div>
              <div class="w-full md:w-48">
                <label class="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                <select [(ngModel)]="formData.categoria" name="categoria" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white" required>
                  <option value="Aderezos">Aderezos</option>
                  <option value="Postres">Postres</option>
                  <option value="Bebidas calientes">Bebidas calientes</option>
                  <option value="Bebidas frias">Bebidas frias</option>
                </select>
              </div>
            </div>
            <div class="w-full">
               <label class="block text-xs font-semibold text-gray-500 mb-1">Descripción corta</label>
               <input type="text" [(ngModel)]="formData.descripcion" name="descripcion" autocomplete="off" class="w-full px-3 py-2 rounded-xl border border-gray-300" required>
            </div>
            
            <div class="flex gap-2 w-full justify-between items-center">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="formData.activo" name="activo" class="h-5 w-5 rounded border-gray-300 text-accent">
                <span class="text-sm font-bold text-gray-700">Producto Activo</span>
              </label>
              <div class="flex gap-2">
                <button type="button" (click)="showForm.set(false)" class="bg-gray-200 text-gray-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-300">Cancelar</button>
                <button type="submit" class="bg-accent text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-opacity-90">
                  {{ editingId() ? 'Actualizar Producto' : 'Añadir a Carta' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      }

      <div class="space-y-3">
         @for (item of dataService.menuItems(); track item.id) {
           <div class="flex justify-between items-center p-4 bg-surface rounded-2xl border border-gray-100 group" [class.opacity-50]="!item.activo">
             <div>
               <div class="flex items-center gap-2 mb-1">
                 <span class="text-xs font-bold px-2 py-0.5 rounded border border-gray-200 text-gray-500">{{ item.categoria }}</span>
                 @if (!item.activo) { <span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Inactivo</span> }
               </div>
               <h3 class="font-bold text-gray-800">{{ item.nombre }}</h3>
               <p class="text-sm text-gray-500 clamp-1">{{ item.descripcion }}</p>
             </div>
             <div class="flex items-center gap-4">
               <span class="font-black text-primary text-lg">\${{ item.precio }}</span>
               
               <div class="flex gap-2">
                 <button (click)="openEditForm(item)" class="bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-indigo-100">✏️</button>
                 <button (click)="dataService.deleteMenuItem(item.id)" class="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-red-100">🗑️</button>
               </div>
             </div>
           </div>
         } @empty {
           <p class="text-center py-6 text-gray-400">No hay productos en el menú.</p>
         }
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500 font-medium">Los cambios son locales hasta guardar.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-500 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-xl">✅ ¡Guardado en servidor!</span>
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
export class AbmMenuComponent {
  dataService = inject(AdminDataService);
  http = inject(HttpClient);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  
  isSaving = signal(false);
  saveSuccess = signal(false);

  formData: AdminMenuItem = { id: '', categoria: '', nombre: '', precio: 0, descripcion: '', activo: true };

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', categoria: '', nombre: '', precio: 0, descripcion: '', activo: true };
    this.showForm.set(true);
  }

  openEditForm(item: AdminMenuItem) {
    this.editingId.set(item.id);
    this.formData = { ...item };
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    if (this.editingId()) {
      this.dataService.updateMenuItem(this.formData);
    } else {
      // El backend va a identificar un registro "nuevo" inserto en el array porque su GUID no existe en las DB
      this.dataService.addMenuItem({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    // Realizamos un POST masivo al backend con todo el array local actual
    const payload = this.dataService.menuItems();
    
    this.http.post('https://localhost:7132/api/menu/bulk', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('El backend rechazó el guardado:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend no está encendido o rechazó la petición. Los cambios a tu carta no se han guardado.');
      }
    });
  }
}
