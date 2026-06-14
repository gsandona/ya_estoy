import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

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
            📈 Panel de Métricas de Negocio
          </h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Estadísticas útiles, rendimiento del staff y tendencias comerciales en tiempo real</p>
        </div>
        <button (click)="loadStats()" class="bg-primary hover:bg-[#1a233b] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
          <span>🔄</span> Actualizar Datos
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
          <h3 class="text-lg font-black text-gray-800">Cargando estadísticas comerciales...</h3>
          <p class="text-gray-400 text-xs mt-1 font-semibold uppercase tracking-wider animate-pulse">Procesando base de datos</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center max-w-lg mx-auto">
          <span class="text-3xl mb-2 block">⚠️</span>
          <h3 class="font-bold text-lg mb-1">Error al recuperar métricas</h3>
          <p class="text-sm text-red-500 font-medium mb-4">{{ error() }}</p>
          <button (click)="loadStats()" class="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-red-700 transition">Reintentar</button>
        </div>
      } @else {
        <!-- Fila de Tarjetas KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Ventas Facturadas -->
          <div class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div class="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">$</div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-xs uppercase font-black tracking-widest text-emerald-100">Ventas Facturadas</span>
              <span class="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">💰</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight mb-2">\${{ formatCurrency(stats()?.totalVentasFacturadas) }}</h2>
            <p class="text-xs text-emerald-100 font-bold">Estimado de pedidos confirmados</p>
          </div>

          <!-- Pedidos a Cocina -->
          <div class="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div class="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">🍳</div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-xs uppercase font-black tracking-widest text-blue-100">Pedidos Cocina</span>
              <span class="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">🍔</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight mb-2">{{ stats()?.totalPedidosCocina }}</h2>
            <p class="text-xs text-blue-100 font-bold">Total órdenes de comida enviadas</p>
          </div>

          <!-- Alertas Completadas -->
          <div class="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div class="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">✓</div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-xs uppercase font-black tracking-widest text-violet-100">Llamados Atendidos</span>
              <span class="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">🛎️</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight mb-2">{{ stats()?.totalTareasCerradas }}</h2>
            <p class="text-xs text-violet-100 font-bold">Llamados y cuentas cerradas</p>
          </div>

          <!-- Tareas Activas -->
          <div class="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div class="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">⏳</div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-xs uppercase font-black tracking-widest text-rose-100">Alertas Activas</span>
              <span class="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">🚨</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight mb-2">{{ stats()?.totalTareasPendientes }}</h2>
            <p class="text-xs text-rose-100 font-bold">Pendientes de atención inmediata</p>
          </div>
        </div>

        <!-- Fila de Secciones Detalladas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Desempeño de Mozos -->
          <div class="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                👤 Rendimiento del Personal (Mozos)
              </h3>
              <p class="text-xs text-gray-400 font-medium mb-6">Tareas resueltas e indicadores de carga de trabajo por mesero</p>
              
              <div class="space-y-5">
                @for(mozo of stats()?.mozoPerformance; track mozo.mozoEmail) {
                  <div class="flex flex-col gap-2 p-4 bg-surface rounded-2xl border border-gray-100 transition-transform hover:translate-x-1 duration-200">
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">👤</div>
                        <div>
                          <p class="font-bold text-gray-700 text-sm truncate max-w-[150px] sm:max-w-none">{{ mozo.mozoEmail }}</p>
                          <p class="text-[10px] text-gray-400 font-semibold">Mozo Activo</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-sm font-black text-gray-800">{{ mozo.tareasCompletadas }} resueltas</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <div class="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-1">
                        <span>Carga actual (mesas ocupadas asignadas)</span>
                        <span>{{ mozo.mesasAsignadasActualmente }} mesas</span>
                      </div>
                      <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div class="bg-accent h-full rounded-full transition-all duration-500" [style.width.%]="getPercentWidth(mozo.mesasAsignadasActualmente, 10)"></div>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <p class="text-center text-gray-400 py-10 text-sm">No hay mozos registrados en este restaurante.</p>
                }
              </div>
            </div>
          </div>

          <!-- Mesas más solicitadas -->
          <div class="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
                🪑 Mesas más Demandadas (Top 5)
              </h3>
              <p class="text-xs text-gray-400 font-medium mb-6">Identifica las mesas con mayor cantidad de alertas y actividad</p>
              
              <div class="space-y-4">
                @for(mesa of stats()?.mesasMasUtilizadas; track mesa.numeroMesa; let i = $index) {
                  <div class="flex items-center justify-between p-3.5 bg-surface rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
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
                      <span class="text-sm font-black text-gray-700 bg-white border border-gray-100 px-3 py-1.5 rounded-xl">{{ mesa.totalServicios }} alertas</span>
                    </div>
                  </div>
                } @empty {
                  <p class="text-center text-gray-400 py-10 text-sm">No hay datos de uso de mesas registrados.</p>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- Histograma de Horarios de Mayor Frecuencia -->
        <div class="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 class="text-xl font-black text-gray-800 tracking-tight mb-1 flex items-center gap-2">
            ⏰ Horarios de Mayor Frecuencia
          </h3>
          <p class="text-xs text-gray-400 font-medium mb-6">Distribución horaria de llamados, pedidos y solicitudes durante el día</p>
          
          <div class="flex flex-col gap-3">
            @for(h of filterPeakHours(); track h.hora) {
              <div class="flex items-center gap-3">
                <span class="w-16 text-right text-xs font-black text-gray-500 shrink-0">{{ h.label }}</span>
                <div class="flex-1 bg-gray-100 h-6 rounded-lg overflow-hidden border border-gray-50 relative">
                  <div class="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] h-full rounded-lg transition-all duration-700" 
                       [style.width.%]="getPercentWidth(h.totalServicios, getMaxHourCount())"></div>
                  <span class="absolute left-3 top-0 bottom-0 flex items-center text-[10px] font-black text-gray-700">{{ h.totalServicios }} llamadas</span>
                </div>
              </div>
            } @empty {
              <p class="text-center text-gray-400 py-10 text-sm">Aún no hay llamadas registradas hoy.</p>
            }
          </div>
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

  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<any>(null);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${environment.apiUrl}/api/tareas/estadisticas`).subscribe({
      next: (res) => {
        this.stats.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al recuperar las estadísticas:', err);
        this.error.set('No se pudieron recuperar los datos comerciales. Asegúrate de que el backend esté corriendo y tu rol tenga permisos.');
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
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-slate-100 text-slate-800';
      case 2: return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  filterPeakHours(): Array<{ label: string; hora: number; totalServicios: number }> {
    const list: Array<{ label: string; hora: number; totalServicios: number }> = [];
    const rawHours = this.stats()?.horariosFrecuentes || [];
    
    for (let i = 0; i < 24; i++) {
      const match = rawHours.find((h: any) => h.hora === i);
      const count = match ? match.totalServicios : 0;
      
      if (count > 0 || (i >= 11 && i <= 15) || (i >= 19 && i <= 23)) {
        list.push({
          label: `${i.toString().padStart(2, '0')}:00 hs`,
          hora: i,
          totalServicios: count
        });
      }
    }
    return list;
  }

  getMaxHourCount(): number {
    const hours = this.stats()?.horariosFrecuentes || [];
    if (hours.length === 0) return 1;
    return Math.max(1, ...hours.map((h: any) => h.totalServicios));
  }
}
