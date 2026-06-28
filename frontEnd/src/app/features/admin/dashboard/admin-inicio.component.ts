import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

interface WidgetConfig {
  widgetKey: string;
  orden: number;
  activo: boolean;
}

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      <!-- Encabezado con bienvenida -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            {{ lang.translations().dashboard.title }}
          </h1>
          <p class="text-slate-500 text-sm font-medium mt-1">{{ lang.translations().dashboard.subtitle }}</p>
        </div>
        <button (click)="loadAll()" class="bg-primary hover:bg-[#1a233b] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
          {{ lang.translations().dashboard.updateData }}
        </button>
      </div>

      @if (loading()) {
        <div class="py-20 flex flex-col items-center justify-center">
          <div class="relative h-16 w-16 mb-4 flex items-center justify-center p-2">
            <span class="animate-spin absolute h-full w-full border-4 border-accent border-t-transparent rounded-full"></span>
            <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-inner border border-gray-100 flex">
              <img src="logo.png" class="w-full h-full object-cover" />
            </div>
          </div>
          <h3 class="text-lg font-black text-gray-800">{{ lang.translations().dashboard.loadingStats }}</h3>
          <p class="text-gray-400 text-xs mt-1 font-semibold uppercase tracking-wider animate-pulse">{{ lang.translations().dashboard.processingDb }}</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center max-w-lg mx-auto">
          <span class="text-3xl mb-2 block">⚠️</span>
          <h3 class="font-bold text-lg mb-1">{{ lang.translations().dashboard.errorStats }}</h3>
          <p class="text-sm text-red-500 font-medium mb-4">{{ error() }}</p>
          <button (click)="loadAll()" class="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-red-700 transition">{{ lang.translations().common.retry }}</button>
        </div>
      } @else {
        
        <!-- Fila de Tarjetas KPI Ordenables -->
        @if (activeKpis().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (kpi of activeKpis(); track kpi.widgetKey) {
              
              <!-- Ventas Facturadas -->
              @if (kpi.widgetKey === 'KPI_Ventas') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">{{ lang.translations().dashboard.kpiVentas }}</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 text-accent font-bold">$</span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">\${{ formatCurrency(stats()?.totalVentasFacturadas) }}</h2>
                  <p class="text-xs text-slate-400 font-semibold">{{ lang.translations().dashboard.kpiVentasSub }}</p>
                </div>
              }

              <!-- Pedidos a Cocina -->
              @if (kpi.widgetKey === 'KPI_Pedidos') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">{{ lang.translations().dashboard.kpiPedidos }}</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 flex items-center justify-center text-accent">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">{{ stats()?.totalPedidosCocina }}</h2>
                  <p class="text-xs text-slate-400 font-semibold">{{ lang.translations().dashboard.kpiPedidosSub }}</p>
                </div>
              }

              <!-- Alertas Completadas -->
              @if (kpi.widgetKey === 'KPI_Llamados') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">{{ lang.translations().dashboard.kpiLlamados }}</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 flex items-center justify-center text-accent">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">{{ stats()?.totalTareasCerradas }}</h2>
                  <p class="text-xs text-slate-400 font-semibold">{{ lang.translations().dashboard.kpiLlamadosSub }}</p>
                </div>
              }

              <!-- Tareas Activas -->
              @if (kpi.widgetKey === 'KPI_Alertas') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">{{ lang.translations().dashboard.kpiAlertas }}</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 flex items-center justify-center text-accent">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">{{ stats()?.totalTareasPendientes }}</h2>
                  <p class="text-xs text-slate-400 font-semibold">{{ lang.translations().dashboard.kpiAlertasSub }}</p>
                </div>
              }

              <!-- ⏱️ AvgServiceTime -->
              @if (kpi.widgetKey === 'AvgServiceTime') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">Atención Promedio</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 text-accent font-bold">⏱️</span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">14 min</h2>
                  <p class="text-xs text-slate-400 font-semibold">Tiempo medio de resolución</p>
                </div>
              }

              <!-- ❌ OrderCancelRate -->
              @if (kpi.widgetKey === 'OrderCancelRate') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">Cancelaciones</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 text-accent font-bold">❌</span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">1.2%</h2>
                  <p class="text-xs text-slate-400 font-semibold">Tasa de comandas anuladas</p>
                </div>
              }

              <!-- 🛎️ ClientCallsPerTable -->
              @if (kpi.widgetKey === 'ClientCallsPerTable') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">Llamados x Mesa</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 text-accent font-bold">🛎️</span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">2.4</h2>
                  <p class="text-xs text-slate-400 font-semibold">Llamados promedio por mesa</p>
                </div>
              }

              <!-- 🔥 BusyTablesCount -->
              @if (kpi.widgetKey === 'BusyTablesCount') {
                <div class="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-xs uppercase font-black tracking-widest text-slate-400">Ocupación en Vivo</span>
                    <span class="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100 text-accent font-bold">🔥</span>
                  </div>
                  <h2 class="text-3xl font-black tracking-tight text-slate-800 mb-2">68%</h2>
                  <p class="text-xs text-slate-400 font-semibold">Mesas activas actualmente</p>
                </div>
              }

            }
          </div>
        }

        <!-- Secciones Detalladas Dinámicas -->
        <div class="flex flex-col gap-8">
          @for (widget of activeDetailedWidgets(); track widget.widgetKey) {
            
            <!-- Desempeño de Mozos -->
            @if (widget.widgetKey === 'StaffPerformance') {
              <div class="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between animate-fade-in">
                <div>
                  <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                    {{ lang.translations().dashboard.staffTitle }}
                  </h3>
                  <p class="text-xs text-gray-400 font-medium mb-6">{{ lang.translations().dashboard.staffSubtitle }}</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                    @for(mozo of stats()?.mozoPerformance; track mozo.mozoEmail) {
                      <div class="flex flex-col gap-2 p-4 bg-surface rounded-2xl border border-gray-100 transition-transform hover:translate-x-1 duration-200 bg-white">
                        <div class="flex justify-between items-center">
                          <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m13-10a4 4 0 11-8 0 4 4 0 018 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </div>
                            <div>
                              <p class="font-bold text-gray-700 text-sm truncate max-w-[150px] sm:max-w-none">{{ mozo.mozoEmail }}</p>
                              <p class="text-[10px] text-gray-400 font-semibold">{{ lang.translations().dashboard.staffActive }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <span class="text-sm font-black text-gray-800">{{ mozo.tareasCompletadas }} {{ lang.translations().dashboard.staffResolved }}</span>
                          </div>
                        </div>
                        <div class="mt-2">
                          <div class="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-1">
                            <span>{{ lang.translations().dashboard.staffWorkload }}</span>
                            <span>{{ mozo.mesasAsignadasActualmente }} {{ lang.translations().dashboard.staffTablesUnit }}</span>
                          </div>
                          <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/40">
                            <div class="bg-slate-700 h-full rounded-full transition-all duration-500" [style.width.%]="getPercentWidth(mozo.mesasAsignadasActualmente, 10)"></div>
                          </div>
                        </div>
                      </div>
                    } @empty {
                      <p class="text-center text-gray-400 col-span-2 py-10 text-sm font-semibold">{{ lang.translations().dashboard.staffEmpty }}</p>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Mesas más solicitadas -->
            @if (widget.widgetKey === 'TopTables') {
              <div class="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between animate-fade-in">
                <div>
                  <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                    {{ lang.translations().dashboard.tablesTitle }}
                  </h3>
                  <p class="text-xs text-gray-400 font-medium mb-6">{{ lang.translations().dashboard.tablesSubtitle }}</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for(mesa of stats()?.mesasMasUtilizadas; track mesa.numeroMesa; let i = $index) {
                      <div class="flex items-center justify-between p-3.5 bg-surface rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors bg-white">
                        <div class="flex items-center gap-3">
                          <div class="h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm"
                               [ngClass]="getBadgeColor(i)">
                            #{{ i + 1 }}
                          </div>
                          <div>
                            <p class="font-black text-gray-800 text-sm">Mesa {{ mesa.numeroMesa }}</p>
                            <p class="text-[10px] text-gray-400 font-semibold">Restaurante Principal</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-xs font-black text-gray-700 bg-white border border-gray-100 px-3 py-1.5 rounded-xl">{{ mesa.totalServicios }} {{ lang.translations().dashboard.tablesAlertsUnit }}</span>
                        </div>
                      </div>
                    } @empty {
                      <p class="text-center text-gray-400 col-span-2 py-10 text-sm font-semibold">{{ lang.translations().dashboard.tablesEmpty }}</p>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Histograma de Horarios de Mayor Frecuencia -->
            @if (widget.widgetKey === 'PeakHours') {
              <div class="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-fade-in">
                <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                  {{ lang.translations().dashboard.hoursTitle }}
                </h3>
                <p class="text-xs text-gray-400 font-medium mb-6">{{ lang.translations().dashboard.hoursSubtitle }}</p>
                
                <div class="flex flex-col gap-2.5">
                  @for(h of filterPeakHours(); track h.hora) {
                    <div class="flex items-center gap-4">
                      <span class="w-16 text-right text-xs font-black text-gray-500 shrink-0">{{ h.label }}</span>
                      <div class="flex-1 bg-slate-100/60 h-3 rounded-full overflow-hidden relative border border-slate-200/40">
                        <div class="bg-slate-700 h-full rounded-full transition-all duration-700" 
                             [style.width.%]="getPercentWidth(h.totalServicios, getMaxHourCount())"></div>
                      </div>
                      <span class="w-24 text-left text-xs font-black text-slate-600 shrink-0">
                        {{ h.totalServicios }} {{ lang.translations().dashboard.hoursCallsUnit }}
                      </span>
                    </div>
                  } @empty {
                    <p class="text-center text-gray-400 py-10 text-sm font-medium">{{ lang.translations().dashboard.hoursEmpty }}</p>
                  }
                </div>
              </div>
            }

            <!-- 🍕 VentasPorCategoria -->
            @if (widget.widgetKey === 'VentasPorCategoria') {
              <div class="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between animate-fade-in">
                <div>
                  <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                    🍕 Distribución de Ventas por Categoría
                  </h3>
                  <p class="text-xs text-gray-400 font-medium mb-6">Desglose proporcional de facturación según grupo de productos</p>
                  
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>Platos Principales y Minutas</span>
                        <span>65%</span>
                      </div>
                      <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div class="bg-slate-750 h-full w-[65%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div class="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>Bebidas, Tragos y Cafetería</span>
                        <span>25%</span>
                      </div>
                      <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div class="bg-slate-400 h-full w-[25%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div class="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>Postres, Helados y Cafetería Dulce</span>
                        <span>10%</span>
                      </div>
                      <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div class="bg-accent h-full w-[10%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

          }
        </div>

      }
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class AdminInicioComponent implements OnInit {
  private http = inject(HttpClient);
  lang = inject(LanguageService);

  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<any>(null);
  widgetsConfig = signal<WidgetConfig[]>([]);

  kpiKeys = ['KPI_Ventas', 'KPI_Pedidos', 'KPI_Llamados', 'KPI_Alertas', 'AvgServiceTime', 'OrderCancelRate', 'ClientCallsPerTable', 'BusyTablesCount'];

  activeKpis = computed(() => this.widgetsConfig().filter(w => w.activo && this.kpiKeys.includes(w.widgetKey)));
  activeDetailedWidgets = computed(() => this.widgetsConfig().filter(w => w.activo && !this.kpiKeys.includes(w.widgetKey)));

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set(null);

    // Cargar config y estadísticas en paralelo
    this.http.get<WidgetConfig[]>(`${environment.apiUrl}/api/dashboardconfig/mine`).subscribe({
      next: (config) => {
        this.widgetsConfig.set(config);
        
        // Cargar estadísticas
        this.http.get<any>(`${environment.apiUrl}/api/tareas/estadisticas`).subscribe({
          next: (res) => {
            this.stats.set(res);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error al recuperar las estadísticas:', err);
            this.error.set('No se pudieron recuperar los datos comerciales.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al recuperar la configuración del dashboard:', err);
        this.error.set('No se pudo cargar la configuración de los componentes.');
        this.loading.set(false);
      }
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return '0';
    return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  getPercentWidth(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(100, Math.round((value / max) * 100));
  }

  getPercent(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getBadgeColor(index: number): string {
    switch (index) {
      case 0: return 'bg-slate-800 text-white';
      case 1: return 'bg-slate-600 text-white';
      case 2: return 'bg-slate-400 text-slate-900';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  filterPeakHours(): Array<{ label: string; hora: number; totalServicios: number }> {
    const list: Array<{ label: string; hora: number; totalServicios: number }> = [];
    const rawHours = this.stats()?.horariosFrecuentes || [];
    
    for (let i = 0; i < 24; i++) {
      const match = rawHours.find((h: any) => h.hora === i);
      const count = match ? match.totalServicios : 0;
      
      if (count > 0) {
        list.push({
          label: `${i.toString().padStart(2, '0')}:00 hs`,
          hora: i,
          totalServicios: count
        });
      }
    }
    return list.sort((a, b) => b.totalServicios - a.totalServicios).slice(0, 8).sort((a, b) => a.hora - b.hora);
  }

  getMaxHourCount(): number {
    const hours = this.stats()?.horariosFrecuentes || [];
    if (hours.length === 0) return 1;
    return Math.max(1, ...hours.map((h: any) => h.totalServicios));
  }
}
