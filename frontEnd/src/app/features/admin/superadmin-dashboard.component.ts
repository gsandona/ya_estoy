import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { AbmRestaurantesComponent } from './config/abm-restaurantes.component';

interface Restaurante {
  id: string;
  nombre: string;
  logoUrl?: string;
  activo: boolean;
  fechaCreacion: string;
}

interface SystemSetting {
  key: string;
  value: string;
}

interface Log {
  id: string;
  fechaHora: string;
  usuarioEmail?: string;
  accion?: string;
  entidad?: string;
  detalles: string;
  restauranteId: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AbmRestaurantesComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-black mb-8">Centro de Control SaaS</h1>
      
      <!-- Tabs -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button (click)="activeTab.set('restaurantes')" [class.bg-primary]="activeTab() === 'restaurantes'" [class.text-white]="activeTab() === 'restaurantes'" [class.bg-white]="activeTab() !== 'restaurantes'" [class.text-gray-600]="activeTab() !== 'restaurantes'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Restaurantes</button>
        <button (click)="activeTab.set('auditoria')" [class.bg-primary]="activeTab() === 'auditoria'" [class.text-white]="activeTab() === 'auditoria'" [class.bg-white]="activeTab() !== 'auditoria'" [class.text-gray-600]="activeTab() !== 'auditoria'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Auditoría</button>
        <button (click)="activeTab.set('errores')" [class.bg-primary]="activeTab() === 'errores'" [class.text-white]="activeTab() === 'errores'" [class.bg-white]="activeTab() !== 'errores'" [class.text-gray-600]="activeTab() !== 'errores'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Errores</button>
        <button (click)="activeTab.set('branding')" [class.bg-primary]="activeTab() === 'branding'" [class.text-white]="activeTab() === 'branding'" [class.bg-white]="activeTab() !== 'branding'" [class.text-gray-600]="activeTab() !== 'branding'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Branding Global</button>
      </div>

      <!-- Tab Restaurantes -->
      @if (activeTab() === 'restaurantes') {
        <div class="animate-fade-in">
          <app-abm-restaurantes></app-abm-restaurantes>
        </div>
      }

      <!-- Tab Auditoria -->
      @if (activeTab() === 'auditoria') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-800">Logs de Auditoría</h2>
            <select [(ngModel)]="filterRestauranteId" (change)="loadAuditoria()" class="px-4 py-2 bg-surface border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Todos los restaurantes</option>
              @for (r of restaurantes(); track r.id) {
                <option [value]="r.id">{{ r.nombre }}</option>
              }
            </select>
          </div>
          
          <div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50/80 border-b border-gray-100">
                <tr class="text-gray-500 uppercase tracking-wider text-xs font-bold">
                  <th class="py-4 px-4">Fecha</th>
                  <th class="py-4 px-4">Usuario</th>
                  <th class="py-4 px-4">Acción</th>
                  <th class="py-4 px-4">Entidad</th>
                  <th class="py-4 px-4">Detalles</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (log of logsAuditoria(); track log.id) {
                  <tr class="hover:bg-primary/5 transition-colors group">
                    <td class="py-3 px-4 text-gray-500 whitespace-nowrap">{{ log.fechaHora | date:'short' }}</td>
                    <td class="py-3 px-4 text-primary font-bold">{{ log.usuarioEmail }}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">{{ log.accion }}</span>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-indigo-500">{{ log.entidad }}</td>
                    <td class="py-3 px-4 text-gray-600">{{ log.detalles }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="py-8 text-center text-gray-400 font-medium">No hay registros de auditoría.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Errores -->
      @if (activeTab() === 'errores') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in">
          <div class="flex justify-between items-center mb-6">
             <h2 class="text-2xl font-black text-red-600 flex items-center gap-2">⚠️ Registro de Errores Críticos</h2>
             <button (click)="loadErrores()" class="bg-gray-100 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm text-gray-700">Refrescar</button>
          </div>
          
          <div class="space-y-4">
            @for (err of logsErrores(); track err.id) {
              <div class="p-5 bg-[#fff5f5] border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3 border-b border-red-100 pb-2">
                  <span class="text-sm font-bold text-red-800">{{ err.fechaHora | date:'medium' }}</span>
                  <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold">ERROR</span>
                </div>
                <!-- Bloque de código estilo terminal para la excepción -->
                <pre class="bg-[#1a1b26] text-[#a9b1d6] p-4 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed shadow-inner border border-gray-800">{{ err.detalles }}</pre>
              </div>
            } @empty {
              <div class="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span class="text-4xl grayscale opacity-50 mb-3 block">✅</span>
                <p class="text-gray-500 font-bold">El sistema está estable y sin errores.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab Branding -->
      @if (activeTab() === 'branding') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in max-w-2xl mx-auto">
          <h2 class="text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">✨ Branding Global (Marca Blanca)</h2>
          <p class="text-gray-500 mb-8 text-sm">Personaliza el nombre y el logo principal de la plataforma SaaS. Estos se mostrarán en la pantalla de inicio de sesión.</p>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nombre de la Aplicación</label>
              <input type="text" [(ngModel)]="globalAppName" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-800" placeholder="Ej: Mi Sistema QR">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Logo Global</label>
              
              <div class="flex items-center gap-6 mt-2">
                <div class="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                  <img *ngIf="globalLogoBase64" [src]="globalLogoBase64" class="w-full h-full object-contain p-2" />
                  <span *ngIf="!globalLogoBase64" class="text-3xl opacity-20">📷</span>
                </div>
                
                <div class="flex-1">
                  <input type="file" #fileInput (change)="onGlobalLogoSelected($event)" accept="image/png, image/jpeg, image/svg+xml" class="hidden">
                  <button (click)="fileInput.click()" class="bg-surface border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors mb-2 block">
                    Subir Imagen
                  </button>
                  <p class="text-xs text-gray-400">Recomendado: PNG transparente, max 500kb.</p>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button (click)="saveBranding()" class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2">
                <span *ngIf="isSavingBranding" class="animate-spin">↻</span>
                Guardar Branding
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminDashboardComponent {
  private http = inject(HttpClient);
  
  activeTab = signal<'restaurantes' | 'auditoria' | 'errores' | 'branding'>('restaurantes');
  restaurantes = signal<Restaurante[]>([]);
  logsAuditoria = signal<Log[]>([]);
  logsErrores = signal<Log[]>([]);
  
  filterRestauranteId = '';

  globalAppName = '';
  globalLogoBase64 = '';
  isSavingBranding = false;

  constructor() {
    this.loadRestaurantes();
    this.loadBranding();
  }

  loadRestaurantes() {
    this.http.get<Restaurante[]>(`${environment.apiUrl}/api/restaurantes`).subscribe(data => {
      this.restaurantes.set(data);
      this.loadAuditoria();
      this.loadErrores();
    });
  }

  loadBranding() {
    this.http.get<SystemSetting[]>(`${environment.apiUrl}/api/settings/public`).subscribe(data => {
      const appName = data.find(s => s.key === 'GlobalAppName')?.value;
      const appLogo = data.find(s => s.key === 'GlobalLogoBase64')?.value;
      if (appName) this.globalAppName = appName;
      if (appLogo) this.globalLogoBase64 = appLogo;
    });
  }

  onGlobalLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.globalLogoBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveBranding() {
    this.isSavingBranding = true;
    
    // Save App Name
    this.http.post(`${environment.apiUrl}/api/settings`, { key: 'GlobalAppName', value: this.globalAppName }).subscribe();
    
    // Save Logo Base64
    this.http.post(`${environment.apiUrl}/api/settings`, { key: 'GlobalLogoBase64', value: this.globalLogoBase64 }).subscribe({
      next: () => {
        this.isSavingBranding = false;
        alert('Branding guardado correctamente.');
      },
      error: () => {
        this.isSavingBranding = false;
        alert('Error al guardar el branding.');
      }
    });
  }

  loadAuditoria() {
    let url = `${environment.apiUrl}/api/logs/auditoria`;
    if (this.filterRestauranteId) url += `?restauranteId=${this.filterRestauranteId}`;
    this.http.get<Log[]>(url).subscribe(data => this.logsAuditoria.set(data));
  }

  loadErrores() {
    let url = `${environment.apiUrl}/api/logs/errores`;
    if (this.filterRestauranteId) url += `?restauranteId=${this.filterRestauranteId}`;
    this.http.get<Log[]>(url).subscribe(data => this.logsErrores.set(data));
  }
}
