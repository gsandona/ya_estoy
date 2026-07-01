import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';

interface Venta {
  id: string;
  restauranteId: string;
  mesaNumero: number;
  codigoAcceso: string;
  fechaHora: string;
  total: number;
  detallesJson: string; // JSON string
}

interface ConsumoItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

@Component({
  selector: 'app-admin-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in pb-24">
      
      <!-- Encabezado de Reportes -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <span>📈</span> Resumen de Ventas Diario
          </h1>
          <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Visualiza los cobros finalizados de las mesas y detalles de facturación
          </p>
        </div>
        
        <!-- Controles de Filtros -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          @if (auth.isSuperAdmin()) {
            <select [(ngModel)]="filterRestauranteId" (change)="loadVentas()" class="px-4 py-2.5 bg-surface border border-gray-200 rounded-xl font-bold text-xs text-gray-700 outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Todos los restaurantes</option>
              @for (r of restaurantes(); track r.id) {
                <option [value]="r.id">{{ r.nombre }}</option>
              }
            </select>
          }
          
          <input type="date" [(ngModel)]="selectedDate" (change)="loadVentas()" class="px-4 py-2.5 bg-surface border border-gray-200 rounded-xl font-bold text-xs text-gray-700 outline-none focus:ring-2 focus:ring-primary/20">
          
          <button (click)="imprimirReporte()" class="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-opacity-95 transition-all active:scale-95 flex items-center gap-1.5">
            <span>🖨️</span> Imprimir
          </button>
        </div>
      </div>

      <!-- KPIs del Día -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 border-t-4 border-t-emerald-500 rounded-2xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Recaudado</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">\\\${{ totalRecaudado() | number:'1.2-2' }}</p>
          </div>
          <div class="text-2xl text-emerald-500">💰</div>
        </div>
        <div class="bg-white border border-gray-200 border-t-4 border-t-indigo-500 rounded-2xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-[10px] uppercase font-bold tracking-widest text-gray-400">Mesas Cerradas</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">{{ ventas().length }}</p>
          </div>
          <div class="text-2xl text-indigo-500">🍽️</div>
        </div>
        <div class="bg-white border border-gray-200 border-t-4 border-t-amber-500 rounded-2xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-[10px] uppercase font-bold tracking-widest text-gray-400">Ticket Promedio</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">\\\${{ ticketPromedio() | number:'1.2-2' }}</p>
          </div>
          <div class="text-2xl text-amber-500">📈</div>
        </div>
      </div>

      <!-- Listado de Transacciones -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-black text-gray-800 mb-4 flex items-center gap-1.5">
          📋 Detalles de Facturación
        </h2>
        
        <div class="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider">
              <tr>
                <th class="py-4 px-4">Hora</th>
                <th class="py-4 px-4 text-center">Mesa</th>
                <th class="py-4 px-4">Código PIN</th>
                <th class="py-4 px-4 text-right">Total Facturado</th>
                <th class="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 font-bold text-gray-700">
              @for (venta of ventas(); track venta.id) {
                <tr class="hover:bg-primary/5 transition-colors">
                  <td class="py-3.5 px-4 text-gray-400">{{ venta.fechaHora | date:'shortTime' }}</td>
                  <td class="py-3.5 px-4 text-center">
                    <span class="px-2.5 py-1 bg-gray-100 text-primary rounded-lg">Mesa {{ venta.mesaNumero }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-gray-500">{{ venta.codigoAcceso }}</td>
                  <td class="py-3.5 px-4 text-right text-emerald-700 font-black">\\\${{ venta.total | number:'1.2-2' }}</td>
                  <td class="py-3.5 px-4 text-center">
                    <button (click)="verDetalle(venta)" class="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm hover:bg-emerald-100 transition active:scale-95">
                      Ver Ticket
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-12 text-center text-gray-400 font-bold bg-gray-50/50">
                    No se registran ventas cerradas para la fecha seleccionada.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Detalle (Ticket) -->
      @if (selectedVenta()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-primary font-mono max-h-[85vh] overflow-y-auto">
            <button (click)="selectedVenta.set(null)" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 font-black shadow-sm transition-all">&times;</button>
            
            <!-- Estructura del Ticket de Restaurante -->
            <div class="text-center pb-4 border-b border-dashed border-[#DCD0C0] space-y-1">
              <span class="text-lg font-black tracking-tight block">TICKET DE CONSUMO</span>
              <span class="text-[10px] text-gray-500 block">Mesa {{ selectedVenta()?.mesaNumero }} • Código {{ selectedVenta()?.codigoAcceso }}</span>
              <span class="text-[9px] text-gray-400 block">{{ selectedVenta()?.fechaHora | date:'medium' }}</span>
            </div>

            <!-- Listado de Items -->
            <div class="py-4 border-b border-dashed border-[#DCD0C0] space-y-2 text-xs">
              @for (item of parseDetalles(selectedVenta()?.detallesJson); track item.nombre) {
                <div class="flex justify-between items-start gap-2">
                  <div class="flex-1">
                    <span class="block font-bold">{{ item.nombre }}</span>
                    <span class="text-[10px] text-gray-500 font-semibold">\\\${{ item.precioUnitario | number:'1.2-2' }}</span>
                  </div>
                  <span class="font-black text-gray-800">\\\${{ item.total | number:'1.2-2' }}</span>
                </div>
              }
            </div>

            <!-- Total -->
            <div class="pt-4 flex justify-between items-center text-sm font-black">
              <span>TOTAL FACTURADO</span>
              <span class="text-emerald-700">\\\${{ selectedVenta()?.total | number:'1.2-2' }}</span>
            </div>

            <div class="mt-8 text-center text-[9px] text-gray-400 font-semibold">
              ¡Gracias por visitarnos! • Sistema de Cobros MozoGo
            </div>
          </div>
        </div>
      }
      
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
  `]
})
export class AdminVentasComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  lang = inject(LanguageService);

  restaurantes = signal<any[]>([]);
  ventas = signal<Venta[]>([]);
  
  filterRestauranteId = '';
  selectedDate = new Date().toISOString().split('T')[0];

  selectedVenta = signal<Venta | null>(null);

  totalRecaudado = computed(() => {
    return this.ventas().reduce((acc, v) => acc + v.total, 0);
  });

  ticketPromedio = computed(() => {
    const total = this.ventas().length;
    return total > 0 ? this.totalRecaudado() / total : 0;
  });

  ngOnInit() {
    if (this.auth.isSuperAdmin()) {
      this.loadRestaurantes();
    }
    this.loadVentas();
  }

  loadRestaurantes() {
    this.http.get<any[]>(`${environment.apiUrl}/api/restaurantes`).subscribe(data => {
      this.restaurantes.set(data);
    });
  }

  loadVentas() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    let url = `${environment.apiUrl}/api/ventas/resumen?fecha=${this.selectedDate}`;
    if (this.filterRestauranteId) {
      url += `&restauranteId=${this.filterRestauranteId}`;
    }

    this.http.get<Venta[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.ventas.set(data);
      },
      error: (err) => console.error('Error al cargar ventas:', err)
    });
  }

  verDetalle(venta: Venta) {
    this.selectedVenta.set(venta);
  }

  parseDetalles(jsonStr?: string): ConsumoItem[] {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  }

  imprimirReporte() {
    window.print();
  }
}
