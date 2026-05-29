import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestauranteService, Restaurante } from '../../../core/services/restaurante.service';

@Component({
  selector: 'app-abm-restaurantes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-800">Clientes / Restaurantes</h2>
          <p class="text-sm text-gray-500 mt-1">Administra los locales o sucursales de tu cuenta</p>
        </div>
        <button (click)="openCreateForm()" class="bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
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
            <label class="block text-sm font-semibold text-gray-700 mb-1">Logo de la Sucursal</label>
            <div class="flex gap-4 items-center">
              <div class="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                 <img *ngIf="restauranteForm.get('logoUrl')?.value" [src]="restauranteForm.get('logoUrl')?.value" class="w-full h-full object-contain p-1" />
                 <span *ngIf="!restauranteForm.get('logoUrl')?.value" class="text-xl opacity-20">📷</span>
              </div>
              <div class="flex-1">
                <input type="file" #restFile (change)="onLogoSelected($event)" accept="image/png, image/jpeg, image/svg+xml" class="hidden">
                <button type="button" (click)="restFile.click()" class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Subir Imagen
                </button>
              </div>
            </div>
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

      <!-- Tabla -->
      <div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50/80 border-b border-gray-100">
            <tr class="text-gray-500 uppercase tracking-wider text-xs font-bold">
              <th class="py-4 px-4">Logo</th>
              <th class="py-4 px-4">Nombre</th>
              <th class="py-4 px-4">Estado</th>
              <th class="py-4 px-4">Creación</th>
              <th class="py-4 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let r of restaurantes" class="hover:bg-primary/5 transition-colors group">
              <td class="py-3 px-4">
                <div class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                  <img *ngIf="r.logoUrl" [src]="r.logoUrl" class="w-full h-full object-contain p-1" />
                  <span *ngIf="!r.logoUrl" class="text-gray-300 text-xs font-bold">N/A</span>
                </div>
              </td>
              <td class="py-3 px-4 font-bold text-gray-800">{{ r.nombre }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 text-xs font-bold rounded-lg" [ngClass]="r.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ r.activo ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500">{{ r.fechaCreacion | date:'mediumDate' }}</td>
              <td class="py-3 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="openEditForm(r)" class="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs mr-2 transition-colors">Editar</button>
                <button (click)="deleteRestaurante(r)" class="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">Borrar</button>
              </td>
            </tr>
            <tr *ngIf="restaurantes.length === 0 && !isLoading">
              <td colspan="5" class="py-8 text-center text-gray-500">No hay restaurantes registrados.</td>
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
      logoUrl: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.restauranteForm.patchValue({ logoUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
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
    this.restauranteForm.reset({ activo: true, logoUrl: '' });
    this.showForm = true;
  }

  openEditForm(rest: Restaurante): void {
    this.isEditing = true;
    this.currentEditId = rest.id!;
    this.restauranteForm.patchValue({
      nombre: rest.nombre,
      logoUrl: rest.logoUrl || '',
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
