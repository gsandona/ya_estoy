import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestauranteService, Restaurante } from '../../../core/services/restaurante.service';

@Component({
  selector: 'app-abm-restaurantes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span class="text-2xl">🏪</span> Gestión de Restaurantes y Sucursales
          </h2>
          <p class="text-sm text-gray-500 mt-1">Administra los locales o sucursales de tu cuenta</p>
        </div>
        <button (click)="openCreateForm()" class="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
          <span>+</span> Nuevo Restaurante
        </button>
      </div>

      <!-- Formulario Mantenimiento -->
      <div *ngIf="showForm" class="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
        <h3 class="text-lg font-bold text-gray-800 mb-4">{{ isEditing ? 'Editar Local' : 'Nuevo Local / Sucursal' }}</h3>
        
        <form [formGroup]="restauranteForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
            <input type="text" formControlName="nombre" 
              class="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              [ngClass]="{'border-red-300': restauranteForm.get('nombre')?.invalid && restauranteForm.get('nombre')?.touched, 'border-gray-200': !(restauranteForm.get('nombre')?.invalid && restauranteForm.get('nombre')?.touched)}"
              placeholder="Ej: La Pasiva Centro">
            <span *ngIf="restauranteForm.get('nombre')?.invalid && restauranteForm.get('nombre')?.touched" class="text-xs text-red-500 mt-1">El nombre es requerido</span>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Ícono Representativo *</label>
            <div class="flex gap-2">
              <input type="text" formControlName="iconoPrincipal" maxlength="5"
                class="flex-1 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-2xl text-center"
                [ngClass]="{'border-red-300': restauranteForm.get('iconoPrincipal')?.invalid && restauranteForm.get('iconoPrincipal')?.touched, 'border-gray-200': !(restauranteForm.get('iconoPrincipal')?.invalid && restauranteForm.get('iconoPrincipal')?.touched)}"
                placeholder="Ej: 🍕">
            </div>
            <span *ngIf="restauranteForm.get('iconoPrincipal')?.invalid && restauranteForm.get('iconoPrincipal')?.touched" class="text-xs text-red-500 mt-1">Ingresa un emoji o icono corto</span>
          </div>

          <div class="form-group flex items-center mt-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="activo" class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary">
              <span class="text-sm font-semibold text-gray-700">Restaurante Activo</span>
            </label>
          </div>

          <div class="col-span-full flex justify-end gap-3 mt-4">
            <button type="button" (click)="cancelForm()" class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="restauranteForm.invalid || isSaving" class="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
              <span *ngIf="isSaving" class="animate-spin text-lg">↻</span>
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de Restaurantes -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Ícono</th>
              <th class="py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let rest of restaurantes" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-4 px-4 font-semibold text-gray-800">{{ rest.nombre }}</td>
              <td class="py-4 px-4">
                <div class="text-3xl">{{ rest.iconoPrincipal }}</div>
              </td>
              <td class="py-4 px-4">
                <span class="px-2.5 py-1 text-xs font-bold rounded-lg"
                  [ngClass]="rest.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ rest.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
              <td class="py-4 px-4 text-right">
                <button (click)="openEditForm(rest)" class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors mr-2" title="Editar">
                  ✏️
                </button>
                <button (click)="deleteRestaurante(rest)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  🗑️
                </button>
              </td>
            </tr>
            <tr *ngIf="restaurantes.length === 0 && !isLoading">
              <td colspan="4" class="py-8 text-center text-gray-500">No hay restaurantes registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AbmRestaurantesComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  isLoading = false;
  isSaving = false;
  
  showForm = false;
  isEditing = false;
  currentEditId: string | null = null;

  restauranteForm: FormGroup;

  constructor(
    private restauranteService: RestauranteService,
    private fb: FormBuilder
  ) {
    this.restauranteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      iconoPrincipal: ['🏪', [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.restauranteService.getAll().subscribe({
      next: (data) => {
        this.restaurantes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.currentEditId = null;
    this.restauranteForm.reset({ iconoPrincipal: '🏪', activo: true });
    this.showForm = true;
  }

  openEditForm(rest: Restaurante): void {
    this.isEditing = true;
    this.currentEditId = rest.id!;
    this.restauranteForm.patchValue({
      nombre: rest.nombre,
      iconoPrincipal: rest.iconoPrincipal,
      activo: rest.activo
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.restauranteForm.reset();
  }

  onSubmit(): void {
    if (this.restauranteForm.invalid) return;

    this.isSaving = true;
    const data: Restaurante = this.restauranteForm.value;

    if (this.isEditing && this.currentEditId) {
      data.id = this.currentEditId;
      this.restauranteService.update(this.currentEditId, data).subscribe({
        next: () => {
          this.loadData();
          this.cancelForm();
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
    } else {
      this.restauranteService.create(data).subscribe({
        next: () => {
          this.loadData();
          this.cancelForm();
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
    }
  }

  deleteRestaurante(rest: Restaurante): void {
    if (confirm(`¿Estás seguro de eliminar el restaurante "${rest.nombre}"? Esto podría afectar muchos datos asociados.`)) {
      this.restauranteService.delete(rest.id!).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el restaurante. Asegúrate de que no tenga datos asociados.')
      });
    }
  }
}
