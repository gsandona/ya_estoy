import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminMenuItem } from './admin-data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abm-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">Gestionar Menú</h2>
        <button (click)="openCreateForm()" class="bg-primary text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-[#1a233b] transition-all active:scale-95 flex items-center gap-1.5">
          + Agregar Producto
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-sand/30 p-6 rounded-2xl mb-6 border border-gray-200">
          <form #menuForm="ngForm" class="flex flex-col gap-5 items-end" autocomplete="off" (submit)="saveForm($event)">
            <div class="flex flex-col md:flex-row gap-4 w-full">
              <div class="flex-1 relative">
                <label class="block text-xs font-bold text-slate-500 mb-1">Nombre del Producto</label>
                <input type="text" [(ngModel)]="formData.nombre" name="nombre" #nombreCtrl="ngModel" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" [ngClass]="{'border-red-500': nombreCtrl.invalid && nombreCtrl.touched}" required>
                @if (nombreCtrl.invalid && nombreCtrl.touched) {
                  <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Obligatorio</span>
                }
              </div>
              <div class="w-full md:w-32 relative">
                <label class="block text-xs font-bold text-slate-500 mb-1">Precio ($)</label>
                <input type="number" [(ngModel)]="formData.precio" name="precio" #precioCtrl="ngModel" min="0" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" [ngClass]="{'border-red-500': precioCtrl.invalid && precioCtrl.touched}" required>
                @if (precioCtrl.invalid && precioCtrl.touched) {
                  <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Precio inválido</span>
                }
              </div>
              <div class="w-full md:w-64">
                <label class="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                <input type="text" [(ngModel)]="formData.categoria" name="categoria" #categoriaCtrl="ngModel" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" required>
                <!-- Quick Category chips -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (cat of quickCategories; track cat) {
                    <button type="button" (click)="formData.categoria = cat" class="px-2.5 py-1 text-[10px] font-black rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-slate-600 transition active:scale-95 outline-none select-none">
                      {{ cat }}
                    </button>
                  }
                </div>
              </div>
            </div>
            <div class="w-full">
               <label class="block text-xs font-bold text-slate-500 mb-1">Descripción corta</label>
               <input type="text" [(ngModel)]="formData.descripcion" name="descripcion" autocomplete="off" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" required>
            </div>
            
            <div class="flex gap-2 w-full justify-between items-center mt-2">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" [(ngModel)]="formData.activo" name="activo" class="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent/10">
                <span class="text-sm font-bold text-gray-700">Producto Activo en Carta</span>
              </label>
              <div class="flex gap-2">
                <button type="button" (click)="showForm.set(false)" class="bg-gray-100 text-gray-600 border border-gray-250 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200">Cancelar</button>
                <button type="submit" [disabled]="menuForm.invalid" class="bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-opacity-95 disabled:opacity-50">
                  {{ editingId() ? 'Actualizar Producto' : 'Añadir a Carta' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      }

      <div class="space-y-3">
         @for (item of dataService.menuItems(); track item.id) {
           <div class="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-150 group hover:border-gray-300 hover:shadow-sm transition-all" [class.opacity-50]="!item.activo">
             <div>
               <div class="flex items-center gap-2 mb-1.5">
                 <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-gray-200 text-gray-500 bg-gray-50">{{ item.categoria }}</span>
                 @if (item.activo) {
                   <span class="text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                     <span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                     Activo
                   </span>
                 } @else {
                   <span class="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">Inactivo</span>
                 }
               </div>
               <h3 class="font-bold text-gray-800 text-base leading-tight">{{ item.nombre }}</h3>
               <p class="text-xs text-gray-500 clamp-1 mt-1 font-medium">{{ item.descripcion }}</p>
             </div>
             <div class="flex items-center gap-4">
               <span class="font-black text-primary text-lg">\${{ item.precio }}</span>
               
               <div class="flex gap-2">
                 <button (click)="openEditForm(item)" class="bg-green-50 text-green-700 hover:bg-green-100 border border-green-150/40 p-2 rounded-xl text-xs font-bold transition active:scale-95" title="Editar">
                   ✏️
                 </button>
                 <button (click)="dataService.deleteMenuItem(item.id)" class="bg-red-50 text-red-600 hover:bg-red-100 border border-red-150/40 p-2 rounded-xl text-xs font-bold transition active:scale-95" title="Eliminar">
                   🗑️
                 </button>
               </div>
             </div>
           </div>
         } @empty {
           <p class="text-center py-10 text-gray-400 text-sm font-medium">No hay productos en el menú.</p>
         }
      </div>

      <div class="mt-8 pt-6 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Los cambios son locales hasta guardar y publicar.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-700 font-bold text-xs bg-green-50 border border-green-100 px-3 py-2 rounded-xl animate-fade-in">✅ ¡Guardado en servidor!</span>
          }
          
          <button 
            (click)="syncBackend()"
            [disabled]="isSaving()"
            class="bg-accent text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-opacity-95 transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2">
            @if (isSaving()) {
              <span class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
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

  quickCategories = ['Platos', 'Pizzas', 'Postres', 'Bebidas Frías', 'Bebidas Calientes', 'Cervezas', 'Aderezos'];

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
      this.dataService.addMenuItem({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.menuItems();
    
    this.http.post(`${environment.apiUrl}/api/menu/bulk`, payload).subscribe({
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
