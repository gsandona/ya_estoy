import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface ProductSale {
  producto: string;
  cantidad: number;
  recaudacion: number;
}

@Component({
  selector: 'app-admin-menu-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-slate-50 overflow-y-auto p-6 md:p-8 animate-fade-in">
      <!-- Encabezado de la página -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-serif font-black text-slate-800 tracking-tight flex items-center gap-2">
            📊 Ventas de Platos
          </h1>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Dashboard e informe de rendimiento de productos vendidos
          </p>
        </div>
        
        <!-- Controles de Filtros -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-sm">
            <span class="text-xs font-bold text-gray-500 uppercase">Fecha:</span>
            <input 
              type="date" 
              [(ngModel)]="selectedDate" 
              (change)="loadProductMetrics()"
              class="border-none outline-none font-bold text-sm text-gray-700 bg-transparent cursor-pointer"
            />
          </div>
          
          <button 
            (click)="loadProductMetrics()"
            class="bg-primary hover:bg-primary/95 text-white font-black text-xs px-5 py-3 rounded-2xl transition active:scale-95 shadow-md shadow-primary/10 flex items-center gap-1.5"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <!-- Spinner de carga -->
      @if (loading()) {
        <div class="flex-1 flex flex-col items-center justify-center py-20">
          <span class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-3"></span>
          <p class="text-sm font-bold text-slate-500">Cargando métricas de platos...</p>
        </div>
      } @else {
        <!-- KPIs Principales -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <!-- KPI 1: Total Platos -->
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div class="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              🍔
            </div>
            <div>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platos Vendidos</span>
              <h3 class="text-2xl font-black text-gray-800 mt-0.5">{{ totalItemsSold() }}</h3>
            </div>
          </div>

          <!-- KPI 2: Recaudación -->
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div class="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              💰
            </div>
            <div>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recaudación Menú</span>
              <h3 class="text-2xl font-black text-emerald-700 mt-0.5">\${{ totalRevenue() | number:'1.2-2' }}</h3>
            </div>
          </div>

          <!-- KPI 3: Producto Estrella -->
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div class="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              ⭐
            </div>
            <div class="overflow-hidden">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto Estrella</span>
              <h3 class="text-lg font-black text-gray-800 mt-0.5 truncate max-w-[200px]" [title]="topProduct()?.Producto">
                {{ topProduct() ? topProduct()?.Producto : 'Ninguno' }}
              </h3>
              @if (topProduct()) {
                <p class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                  {{ topProduct()?.Cantidad }} unidades
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Cuerpo del Dashboard -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 class="text-xl font-serif font-black text-slate-800">Clasificación de Ventas</h2>
              <p class="text-xs text-gray-400 font-semibold uppercase mt-0.5">Clasificación detallada por volumen y recaudación</p>
            </div>
            
            <!-- Buscador en tiempo real -->
            <div class="relative w-full sm:w-64">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                🔍
              </span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                placeholder="Buscar plato..."
                class="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-xs font-semibold transition"
              />
            </div>
          </div>

          <!-- Listado y Gráficos Modernos -->
          @if (filteredSales().length === 0) {
            <div class="py-20 text-center text-slate-400 italic text-sm">
              No se registraron ventas de platos para el día seleccionado.
            </div>
          } @else {
            <div class="space-y-6">
              @for (item of filteredSales(); track item.producto; let i = $index) {
                <div class="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  
                  <!-- Info del Producto -->
                  <div class="flex items-center gap-4 w-full md:w-1/3">
                    <div class="h-9 w-9 bg-primary/10 text-primary font-black rounded-xl flex items-center justify-center shrink-0 text-sm">
                      #{{ i + 1 }}
                    </div>
                    <div class="truncate">
                      <h4 class="font-bold text-slate-800 text-sm truncate" [title]="item.producto">
                        {{ item.producto }}
                      </h4>
                      <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {{ item.cantidad }} unidades vendidas
                      </span>
                    </div>
                  </div>

                  <!-- Barra de Progreso de Ventas -->
                  <div class="w-full md:flex-1 space-y-1">
                    <div class="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                      <span>Proporción de Ventas</span>
                      <span>{{ getPercent(item.cantidad) | number:'1.0-1' }}%</span>
                    </div>
                    <div class="w-full h-3 bg-gray-200/60 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-accent rounded-full transition-all duration-500"
                        [style.width.%]="getPercent(item.cantidad)"
                      ></div>
                    </div>
                  </div>

                  <!-- Recaudación -->
                  <div class="text-right w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end border-t md:border-t-0 pt-2.5 md:pt-0 border-dashed border-gray-200">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest md:hidden">Recaudación:</span>
                    <div>
                      <h4 class="font-black text-emerald-700 text-sm">\${{ item.recaudacion | number:'1.2-2' }}</h4>
                      <p class="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                        Promedio: \${{ (item.recaudacion / item.cantidad) | number:'1.0-1' }} c/u
                      </p>
                    </div>
                  </div>

                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  `]
})
export class AdminMenuMetricsComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  selectedDate = '';
  searchQuery = '';
  loading = signal(false);
  salesData = signal<ProductSale[]>([]);

  // Computes
  totalItemsSold = computed(() => this.salesData().reduce((sum, item) => sum + item.cantidad, 0));
  totalRevenue = computed(() => this.salesData().reduce((sum, item) => sum + item.recaudacion, 0));
  topProduct = computed(() => {
    const list = this.salesData();
    if (list.length === 0) return null;
    return list.reduce((prev, current) => (prev.cantidad > current.cantidad) ? prev : current);
  });

  filteredSales = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.salesData();
    return this.salesData().filter(item => item.producto.toLowerCase().includes(query));
  });

  ngOnInit() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    this.selectedDate = localToday.toISOString().split('T')[0];
    
    this.loadProductMetrics();
  }

  loadProductMetrics() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.loading.set(true);

    // Compute UTC start and end based on selected date
    const localDate = new Date(this.selectedDate + 'T00:00:00');
    const startOfDay = new Date(localDate);
    const endOfDay = new Date(localDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startUtc = startOfDay.toISOString();
    const endUtc = endOfDay.toISOString();

    const url = `${environment.apiUrl}/api/ventas/productos?startUtc=${startUtc}&endUtc=${endUtc}`;

    this.http.get<ProductSale[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.salesData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar ventas de platos:', err);
        this.loading.set(false);
      }
    });
  }

  getPercent(qty: number): number {
    const total = this.totalItemsSold();
    if (total === 0) return 0;
    return (qty / total) * 100;
  }
}
