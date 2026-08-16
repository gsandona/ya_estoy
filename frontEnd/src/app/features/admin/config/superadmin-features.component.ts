import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface SystemFeature {
  key: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-superadmin-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm text-primary">
      <div class="mb-6">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">Roles y Pantallas (Permisos)</h2>
        <p class="text-xs text-gray-400 font-semibold mt-1">Administra qué pantallas y funciones dinámicas tiene habilitadas cada Rol en el sistema.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Panel Izquierdo: Selección de Rol -->
        <div class="lg:col-span-1 space-y-3">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Seleccionar Rol</label>
          <div class="flex flex-col gap-2">
            @for (r of roles; track r.id) {
              <button (click)="selectRole(r.id)" 
                      class="flex flex-col items-start p-4 rounded-2xl text-left border transition-all active:scale-98"
                      [ngClass]="{
                        'bg-slate-900 border-slate-900 text-white shadow-md': selectedRoleId() === r.id,
                        'bg-slate-50 border-gray-150 text-gray-700 hover:bg-slate-100': selectedRoleId() !== r.id
                      }">
                <span class="font-bold text-sm">{{ r.name }}</span>
                <span class="text-[10px] mt-1" [ngClass]="selectedRoleId() === r.id ? 'text-slate-300' : 'text-slate-400'">{{ r.description }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Panel Derecho: Checkboxes de Funcionalidades -->
        <div class="lg:col-span-2 bg-slate-50 border border-gray-200 rounded-3xl p-6 relative">
          <div class="flex justify-between items-center mb-5 border-b border-gray-200 pb-3 select-none">
            <h3 class="font-bold text-base text-gray-800">
              Permisos Habilitados para: <span class="text-accent">{{ getSelectedRoleName() }}</span>
            </h3>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paso 2 de 2</span>
          </div>

          @if (loading()) {
            <div class="flex items-center justify-center py-16">
              <span class="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full block"></span>
            </div>
          } @else {
            <div class="space-y-4">
              @for (feat of allFeatures(); track feat.key) {
                <div class="bg-white border border-gray-150 p-4 rounded-2xl hover:border-gray-300 transition-all flex items-start gap-4">
                  <input type="checkbox" 
                         [checked]="isFeatureSelected(feat.key)" 
                         (change)="toggleFeature(feat.key)"
                         id="feat_{{feat.key}}"
                         class="h-5 w-5 rounded-lg border-gray-300 text-accent focus:ring-accent shrink-0 mt-0.5 cursor-pointer" />
                  
                  <label for="feat_{{feat.key}}" class="cursor-pointer">
                    <span class="block font-bold text-sm text-gray-800 select-none">{{ feat.label }}</span>
                    <span class="block text-xs text-gray-500 font-medium mt-1">{{ feat.description }}</span>
                    <span class="inline-block mt-2 bg-slate-100 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-slate-400">Key: {{ feat.key }}</span>
                  </label>
                </div>
              }

              <div class="flex justify-end gap-2 pt-4 border-t border-gray-250 mt-6">
                <button (click)="saveRoleFeatures()" [disabled]="saving()"
                        class="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-slate-800 transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50">
                  @if (saving()) {
                    <span class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full block"></span>
                  }
                  Guardar Cambios
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SuperadminFeaturesComponent implements OnInit {
  private http = inject(HttpClient);

  roles = [
    { id: 1, name: 'Mozo', description: 'Personal de atención en mesas' },
    { id: 2, name: 'Admin', description: 'Administrador del comercio' },
    { id: 3, name: 'SuperAdmin', description: 'Super Administrador global SaaS' },
    { id: 4, name: 'Cocina', description: 'Preparación de platos y comandas' },
    { id: 5, name: 'Caja', description: 'Facturación y cierre de caja' },
    { id: 6, name: 'MozoPortal', description: 'Vista pública para mozos del local' }
  ];

  selectedRoleId = signal<number>(1);
  allFeatures = signal<SystemFeature[]>([]);
  activeFeatures = signal<string[]>([]);
  
  loading = signal(false);
  saving = signal(false);

  ngOnInit() {
    this.loadAllFeatures();
    this.selectRole(1);
  }

  loadAllFeatures() {
    const token = localStorage.getItem('auth_token');
    this.http.get<SystemFeature[]>(`${environment.apiUrl}/api/features`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.allFeatures.set(data));
  }

  selectRole(roleId: number) {
    this.selectedRoleId.set(roleId);
    this.loading.set(true);

    const token = localStorage.getItem('auth_token');
    this.http.get<string[]>(`${environment.apiUrl}/api/features/role/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.activeFeatures.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getSelectedRoleName(): string {
    const match = this.roles.find(r => r.id === this.selectedRoleId());
    return match ? match.name : '';
  }

  isFeatureSelected(key: string): boolean {
    return this.activeFeatures().includes(key);
  }

  toggleFeature(key: string) {
    this.activeFeatures.update(list => {
      if (list.includes(key)) {
        return list.filter(k => k !== key);
      } else {
        return [...list, key];
      }
    });
  }

  saveRoleFeatures() {
    this.saving.set(true);
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`${environment.apiUrl}/api/features/role/${this.selectedRoleId()}`, 
      this.activeFeatures(), 
      { headers }
    ).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Funcionalidades y permisos asignados correctamente.');
      },
      error: (err) => {
        this.saving.set(false);
        alert('Error al guardar permisos.');
      }
    });
  }
}
