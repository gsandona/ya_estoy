import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { AbmRestaurantesComponent } from './config/abm-restaurantes.component';
import { SuperadminCategoriesComponent } from './config/superadmin-categories.component';
import { SuperadminUsuariosComponent } from './config/superadmin-usuarios.component';
import { SuperadminFeaturesComponent } from './config/superadmin-features.component';

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
  usuarioUsername?: string;
  accion?: string;
  entidad?: string;
  detalles: string;
  restauranteId: string;
}

interface ErrorLog {
  id: string;
  fechaHora: string;
  mensaje: string;
  stackTrace: string;
  rutaAPI: string;
  usuarioInvolucrado?: string;
  restauranteId: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AbmRestaurantesComponent, SuperadminCategoriesComponent, SuperadminUsuariosComponent, SuperadminFeaturesComponent],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-black mb-8">Centro de Control SaaS</h1>
      
      <!-- Tabs -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button (click)="activeTab.set('restaurantes')" [class.bg-primary]="activeTab() === 'restaurantes'" [class.text-white]="activeTab() === 'restaurantes'" [class.bg-white]="activeTab() !== 'restaurantes'" [class.text-gray-600]="activeTab() !== 'restaurantes'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Restaurantes</button>
        <button (click)="activeTab.set('usuarios')" [class.bg-primary]="activeTab() === 'usuarios'" [class.text-white]="activeTab() === 'usuarios'" [class.bg-white]="activeTab() !== 'usuarios'" [class.text-gray-600]="activeTab() !== 'usuarios'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Usuarios</button>
        <button (click)="activeTab.set('permisos')" [class.bg-primary]="activeTab() === 'permisos'" [class.text-white]="activeTab() === 'permisos'" [class.bg-white]="activeTab() !== 'permisos'" [class.text-gray-600]="activeTab() !== 'permisos'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Permisos</button>
        <button (click)="activeTab.set('dashboard-config')" [class.bg-primary]="activeTab() === 'dashboard-config'" [class.text-white]="activeTab() === 'dashboard-config'" [class.bg-white]="activeTab() !== 'dashboard-config'" [class.text-gray-600]="activeTab() !== 'dashboard-config'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Configurar Dashboards</button>
        <button (click)="activeTab.set('menu-categories')" [class.bg-primary]="activeTab() === 'menu-categories'" [class.text-white]="activeTab() === 'menu-categories'" [class.bg-white]="activeTab() !== 'menu-categories'" [class.text-gray-600]="activeTab() !== 'menu-categories'" class="px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Categorías de Menú</button>
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

      <!-- Tab Configurar Dashboards -->
      @if (activeTab() === 'dashboard-config') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in max-w-2xl mx-auto">
          <h2 class="text-2xl font-black text-gray-800 mb-2">Parametrización de Dashboards</h2>
          <p class="text-gray-500 mb-6 text-sm">Selecciona un restaurante y configura qué métricas mostrar en su panel de inicio, y en qué orden.</p>
          
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">Restaurante</label>
            <select [(ngModel)]="configRestauranteId" (change)="loadDashboardWidgetConfigs()" class="w-full px-4 py-3 bg-surface border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Selecciona un restaurante...</option>
              @for (r of restaurantes(); track r.id) {
                <option [value]="r.id">{{ r.nombre }}</option>
              }
            </select>
          </div>

          @if (configRestauranteId) {
            <div class="space-y-4">
              @for (widget of widgetConfigs(); track widget.widgetKey; let i = $index) {
                <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                  <div class="flex items-center gap-3">
                    <input type="checkbox" [(ngModel)]="widget.activo" class="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent/10 cursor-pointer">
                    <div>
                      <span class="font-bold text-gray-800 text-sm">{{ getWidgetLabel(widget.widgetKey) }}</span>
                      <span class="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Orden de Visualización: {{ i + 1 }}</span>
                    </div>
                  </div>
                  
                  <div class="flex gap-1.5 items-center">
                    <button (click)="moveWidgetUp(i)" [disabled]="i === 0" class="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 active:scale-95 transition font-bold" title="Subir orden">
                      ↑
                    </button>
                    <button (click)="moveWidgetDown(i)" [disabled]="i === widgetConfigs().length - 1" class="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 active:scale-95 transition font-bold" title="Bajar orden">
                      ↓
                    </button>
                    <button (click)="removeWidget(i)" class="p-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg active:scale-95 transition font-bold ml-2" title="Eliminar Widget">
                      🗑️
                    </button>
                  </div>
                </div>
              }

              <div class="pt-6 border-t border-gray-100 flex justify-between items-center gap-3">
                <button (click)="openAddWidgetModal()" class="bg-emerald-50 text-emerald-700 border border-emerald-250 px-5 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-100 transition active:scale-95">
                  + Agregar Widget
                </button>

                <button (click)="saveDashboardWidgetConfigs()" class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2">
                  @if (isSavingDashboardConfig()) {
                    <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  }
                  Guardar Configuración
                </button>
              </div>
            </div>
          } @else {
            <div class="text-center py-10 text-gray-400 font-semibold text-sm">
              Por favor selecciona un restaurante de la lista para ver y configurar sus componentes.
            </div>
          }
        </div>
      }

      <!-- Modal Agregar Widget -->
      @if (showAddWidgetModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button (click)="showAddWidgetModal.set(false)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-colors">&times;</button>
            
            <h3 class="text-xl font-black mb-1 text-gray-800">Agregar Widget</h3>
            <p class="text-[10px] text-gray-400 mb-6 font-semibold uppercase tracking-wider">Métricas listas para acoplar al panel</p>
            
            <div class="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              @for (widget of availableWidgetsToAdd(); track widget.key) {
                <button (click)="addWidgetToRestaurante(widget.key)" class="w-full text-left px-4 py-3 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 font-bold text-gray-700 transition-all flex justify-between items-center group">
                  <div>
                    <span class="block text-sm text-gray-800 font-bold group-hover:text-emerald-700">{{ widget.label }}</span>
                    <span class="block text-[9px] text-gray-400 font-medium mt-0.5">{{ widget.desc }}</span>
                  </div>
                  <span class="text-emerald-600 font-black text-lg">+</span>
                </button>
              } @empty {
                <p class="text-center text-xs text-gray-400 font-bold py-6">Todos los widgets ya han sido agregados.</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Tab Auditoria -->
      @if (activeTab() === 'auditoria') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in">
          <div class="flex flex-col gap-4 mb-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-black text-gray-800">Logs de Auditoría</h2>
            </div>
            
            <!-- Filters bar -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Restaurante</label>
                <select [(ngModel)]="filterRestauranteId" (change)="loadAuditoria()" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                  <option value="">Todos los restaurantes</option>
                  @for (r of restaurantes(); track r.id) {
                    <option [value]="r.id">{{ r.nombre }}</option>
                  }
                </select>
              </div>
              
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Usuario (Mozo)</label>
                <input type="text" [(ngModel)]="filterUsuario" (input)="loadAuditoria()" placeholder="Buscar por usuario..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-primary">
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Fecha Desde</label>
                <input type="date" [(ngModel)]="filterFechaInicio" (change)="loadAuditoria()" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
              </div>

              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Fecha Hasta</label>
                <input type="date" [(ngModel)]="filterFechaFin" (change)="loadAuditoria()" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
              </div>
            </div>
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
                    <td class="py-3 px-4 text-primary font-bold">{{ log.usuarioUsername }}</td>
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
             <h2 class="text-2xl font-black text-red-600 flex items-center gap-2">Registro de Errores Críticos</h2>
             <button (click)="loadErrores()" class="bg-gray-100 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm text-gray-700">Refrescar</button>
          </div>
          
          <div class="space-y-4">
            @for (err of logsErrores(); track err.id) {
              <div class="p-5 bg-red-50/20 border border-red-100 rounded-3xl shadow-sm space-y-3">
                <div class="flex flex-wrap justify-between items-center gap-2 border-b border-red-100 pb-2.5">
                  <div class="flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span class="text-xs font-black text-red-800 uppercase tracking-wider">ERROR DETECTADO</span>
                  </div>
                  <span class="text-xs font-bold text-gray-500">{{ err.fechaHora | date:'medium' }}</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-600">
                  <div class="bg-white/80 p-2.5 rounded-xl border border-red-50/40">
                    <span class="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Ruta API</span>
                    <span class="font-mono text-gray-700">{{ err.rutaAPI }}</span>
                  </div>
                  <div class="bg-white/80 p-2.5 rounded-xl border border-red-50/40">
                    <span class="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Usuario</span>
                    <span class="text-gray-700">{{ err.usuarioInvolucrado || 'Anónimo / Sistema' }}</span>
                  </div>
                </div>

                <div class="bg-white/90 p-4 rounded-2xl border border-red-100 shadow-inner">
                  <span class="block text-[9px] font-black text-red-700 mb-1.5 uppercase tracking-wide">Mensaje de Excepción</span>
                  <p class="text-xs font-black text-red-900 whitespace-pre-wrap leading-relaxed">{{ err.mensaje }}</p>
                </div>

                @if (err.stackTrace) {
                  <details class="group bg-gray-50 border border-gray-150 rounded-2xl p-3">
                    <summary class="text-xs font-black text-gray-500 cursor-pointer select-none outline-none flex justify-between items-center">
                      <span>Ver Stack Trace Completo</span>
                      <span class="transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <pre class="mt-3 bg-white p-4 rounded-xl text-[10px] text-gray-600 overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed border border-gray-200">{{ err.stackTrace }}</pre>
                  </details>
                }
              </div>
            } @empty {
              <div class="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <p class="text-gray-500 font-bold">El sistema está estable y sin errores.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab Branding -->
      @if (activeTab() === 'branding') {
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-gray-100 animate-fade-in max-w-2xl mx-auto">
          <h2 class="text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">Branding Global (Marca Blanca)</h2>
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
                  <svg *ngIf="!globalLogoBase64" class="w-8 h-8 opacity-20 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
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

      <!-- Tab Categorías de Menú -->
      @if (activeTab() === 'menu-categories') {
        <div class="animate-fade-in">
          <app-superadmin-categories></app-superadmin-categories>
        </div>
      }
      @if (activeTab() === 'usuarios') {
        <div class="animate-fade-in">
          <app-superadmin-usuarios></app-superadmin-usuarios>
        </div>
      }
      @if (activeTab() === 'permisos') {
        <div class="animate-fade-in">
          <app-superadmin-features></app-superadmin-features>
        </div>
      }
    </div>
  `
})
export class SuperAdminDashboardComponent {
  private http = inject(HttpClient);
  
  activeTab = signal<'restaurantes' | 'usuarios' | 'permisos' | 'dashboard-config' | 'auditoria' | 'errores' | 'branding' | 'menu-categories'>('restaurantes');
  restaurantes = signal<Restaurante[]>([]);
  logsAuditoria = signal<Log[]>([]);
  logsErrores = signal<ErrorLog[]>([]);
  
  filterRestauranteId = '';
  filterUsuario = '';
  filterFechaInicio = '';
  filterFechaFin = '';

  globalAppName = '';
  globalLogoBase64 = '';
  isSavingBranding = false;

  // Dashboard configs signals
  configRestauranteId = '';
  widgetConfigs = signal<any[]>([]);
  isSavingDashboardConfig = signal(false);
  showAddWidgetModal = signal(false);

  allPossibleWidgets = [
    { key: 'KPI_Ventas', label: '💰 KPI: Ventas Totales', desc: 'Ingresos monetarios totales facturados.' },
    { key: 'KPI_Pedidos', label: '🍳 KPI: Pedidos a Cocina', desc: 'Volumen total de pedidos comandados.' },
    { key: 'KPI_Llamados', label: '✅ KPI: Llamados Cerrados', desc: 'Llamados resueltos por el staff.' },
    { key: 'KPI_Alertas', label: '🚨 KPI: Alertas Activas', desc: 'Llamados pendientes en espera de atención.' },
    { key: 'StaffPerformance', label: '🤵 Desempeño del Staff (Mozos)', desc: 'Productividad y volumen de servicio por mozo.' },
    { key: 'TopTables', label: '📊 Ranking de Mesas', desc: 'Listado de mesas con mayor uso y rotación.' },
    { key: 'PeakHours', label: '⏰ Horarios Pico', desc: 'Distribución de solicitudes según la hora del día.' },
    // 5 nuevos widgets solicitados:
    { key: 'AvgServiceTime', label: '⏱️ KPI: Tiempo de Atención', desc: 'Minutos promedio para resolver un llamado de cliente.' },
    { key: 'OrderCancelRate', label: '❌ KPI: Tasa de Cancelación', desc: 'Porcentaje de comandas anuladas sobre el total.' },
    { key: 'ClientCallsPerTable', label: '🛎️ KPI: Llamados por Mesa', desc: 'Promedio de llamados emitidos por mesa ocupada.' },
    { key: 'BusyTablesCount', label: '🔥 KPI: Ocupación en Vivo', desc: 'Porcentaje actual de mesas en estado ocupada.' },
    { key: 'VentasPorCategoria', label: '🍕 Distribución por Categoría', desc: 'Desglose proporcional de facturación por tipos de platos.' }
  ];

  availableWidgetsToAdd = computed(() => {
    const currentKeys = this.widgetConfigs().map(w => w.widgetKey);
    return this.allPossibleWidgets.filter(w => !currentKeys.includes(w.key));
  });

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
    this.http.post(`${environment.apiUrl}/api/settings`, { key: 'GlobalAppName', value: this.globalAppName }).subscribe();
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
    let url = `${environment.apiUrl}/api/logs/auditoria?`;
    const params: string[] = [];
    if (this.filterRestauranteId) params.push(`restauranteId=${this.filterRestauranteId}`);
    if (this.filterUsuario) params.push(`usuario=${encodeURIComponent(this.filterUsuario)}`);
    if (this.filterFechaInicio) params.push(`fechaInicio=${this.filterFechaInicio}`);
    if (this.filterFechaFin) params.push(`fechaFin=${this.filterFechaFin}`);
    
    url += params.join('&');
    this.http.get<Log[]>(url).subscribe(data => this.logsAuditoria.set(data));
  }

  loadErrores() {
    let url = `${environment.apiUrl}/api/logs/errores`;
    if (this.filterRestauranteId) url += `?restauranteId=${this.filterRestauranteId}`;
    this.http.get<ErrorLog[]>(url).subscribe(data => this.logsErrores.set(data));
  }

  // Dashboard configuration methods
  loadDashboardWidgetConfigs() {
    if (!this.configRestauranteId) return;
    this.http.get<any[]>(`${environment.apiUrl}/api/dashboardconfig/${this.configRestauranteId}`).subscribe(data => {
      this.widgetConfigs.set(data);
    });
  }

  saveDashboardWidgetConfigs() {
    this.isSavingDashboardConfig.set(true);
    const payload = this.widgetConfigs().map((w, idx) => ({
      ...w,
      orden: idx + 1
    }));
    this.http.post(`${environment.apiUrl}/api/dashboardconfig`, payload).subscribe({
      next: () => {
        this.isSavingDashboardConfig.set(false);
        alert('Configuración de dashboard guardada correctamente.');
      },
      error: (err) => {
        console.error(err);
        this.isSavingDashboardConfig.set(false);
        alert('Error al guardar la configuración.');
      }
    });
  }

  moveWidgetUp(idx: number) {
    if (idx === 0) return;
    this.widgetConfigs.update(list => {
      const copy = [...list];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  }

  moveWidgetDown(idx: number) {
    this.widgetConfigs.update(list => {
      if (idx === list.length - 1) return list;
      const copy = [...list];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  }

  removeWidget(idx: number) {
    this.widgetConfigs.update(list => list.filter((_, i) => i !== idx));
  }

  openAddWidgetModal() {
    this.showAddWidgetModal.set(true);
  }

  addWidgetToRestaurante(key: string) {
    this.widgetConfigs.update(list => [...list, {
      id: '00000000-0000-0000-0000-000000000000',
      restauranteId: this.configRestauranteId,
      widgetKey: key,
      orden: list.length + 1,
      activo: true
    }]);
    this.showAddWidgetModal.set(false);
  }

  getWidgetLabel(key: string): string {
    const matched = this.allPossibleWidgets.find(w => w.key === key);
    return matched ? matched.label : key;
  }
}
