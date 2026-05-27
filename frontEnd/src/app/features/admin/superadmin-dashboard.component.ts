import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

interface Restaurante {
  id: string;
  nombre: string;
  iconoPrincipal?: string;
  activo: boolean;
  fechaCreacion: string;
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-black mb-8">Centro de Control SaaS</h1>
      
      <!-- Tabs -->
      <div class="flex gap-4 mb-8">
        <button (click)="activeTab.set('restaurantes')" [class.bg-primary]="activeTab() === 'restaurantes'" [class.text-white]="activeTab() === 'restaurantes'" class="px-6 py-2 rounded-xl font-bold bg-white text-gray-600 shadow-sm">Restaurantes</button>
        <button (click)="activeTab.set('auditoria')" [class.bg-primary]="activeTab() === 'auditoria'" [class.text-white]="activeTab() === 'auditoria'" class="px-6 py-2 rounded-xl font-bold bg-white text-gray-600 shadow-sm">Auditoría</button>
        <button (click)="activeTab.set('errores')" [class.bg-primary]="activeTab() === 'errores'" [class.text-white]="activeTab() === 'errores'" class="px-6 py-2 rounded-xl font-bold bg-white text-gray-600 shadow-sm">Errores</button>
      </div>

      <!-- Tab Restaurantes -->
      @if (activeTab() === 'restaurantes') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Clientes / Restaurantes</h2>
            <button class="bg-primary text-white px-4 py-2 rounded-lg font-bold">Nuevo Cliente</button>
          </div>
          
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-500 text-sm uppercase tracking-wider border-b">
                <th class="py-3">Nombre</th>
                <th class="py-3">Color</th>
                <th class="py-3">Estado</th>
                <th class="py-3">Creación</th>
              </tr>
            </thead>
            <tbody>
              @for (r of restaurantes(); track r.id) {
                <tr class="border-b hover:bg-gray-50">
                  <td class="py-4 font-bold">{{ r.nombre }}</td>
                  <td class="py-4">
                    <div class="flex items-center gap-2">
                      <div class="text-2xl">{{ r.iconoPrincipal }}</div>
                      <span class="text-xs text-gray-500 font-medium">{{ r.nombre }}</span>
                    </div>
                  </td>
                  <td class="py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded-lg" [ngClass]="r.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ r.activo ? 'ACTIVO' : 'INACTIVO' }}
                    </span>
                  </td>
                  <td class="py-4 text-sm text-gray-500">{{ r.fechaCreacion | date }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tab Auditoria -->
      @if (activeTab() === 'auditoria') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-4">Logs de Auditoría</h2>
          <select [(ngModel)]="filterRestauranteId" (change)="loadAuditoria()" class="mb-4 px-4 py-2 border rounded-xl">
            <option value="">Todos los restaurantes</option>
            @for (r of restaurantes(); track r.id) {
              <option [value]="r.id">{{ r.nombre }}</option>
            }
          </select>
          <div class="max-h-[500px] overflow-y-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="py-2 px-2">Fecha</th>
                  <th class="py-2 px-2">Usuario</th>
                  <th class="py-2 px-2">Acción</th>
                  <th class="py-2 px-2">Entidad</th>
                  <th class="py-2 px-2">Detalles</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logsAuditoria(); track log.id) {
                  <tr class="border-b">
                    <td class="py-2 px-2">{{ log.fechaHora | date:'short' }}</td>
                    <td class="py-2 px-2 text-primary font-bold">{{ log.usuarioEmail }}</td>
                    <td class="py-2 px-2">{{ log.accion }}</td>
                    <td class="py-2 px-2 font-mono text-xs">{{ log.entidad }}</td>
                    <td class="py-2 px-2 text-gray-500">{{ log.detalles }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Errores -->
      @if (activeTab() === 'errores') {
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold text-red-600 mb-4">Registro de Errores Críticos</h2>
          <button (click)="loadErrores()" class="mb-4 bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200">Refrescar</button>
          <div class="space-y-4">
            @for (err of logsErrores(); track err.id) {
              <div class="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-red-800">{{ err.fechaHora | date:'medium' }}</span>
                </div>
                <p class="font-bold text-red-700 mb-2">{{ err.detalles }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminDashboardComponent {
  private http = inject(HttpClient);
  
  activeTab = signal<'restaurantes' | 'auditoria' | 'errores'>('restaurantes');
  restaurantes = signal<Restaurante[]>([]);
  logsAuditoria = signal<Log[]>([]);
  logsErrores = signal<Log[]>([]);
  
  filterRestauranteId = '';

  constructor() {
    this.loadRestaurantes();
  }

  loadRestaurantes() {
    this.http.get<Restaurante[]>(`${environment.apiUrl}/api/restaurantes`).subscribe(data => {
      this.restaurantes.set(data);
      this.loadAuditoria();
      this.loadErrores();
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
