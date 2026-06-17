import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface CocinaPedido {
  id: string;
  mesaId: string;
  numeroMesa: number;
  mozoEmail: string;
  estado: 'Recibido' | 'EnPreparacion' | 'Listo' | 'Entregado' | 'Cancelado';
  fecha: string;
  items: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-admin-cocina',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto p-4 md:p-8">
      
      <!-- Standalone Header for kitchen screen -->
      <header class="bg-white shadow-sm border border-gray-100 px-6 py-4 rounded-[2rem] flex justify-between items-center bg-white/80 backdrop-blur-md mb-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-gray-200/50 flex">
            <img src="logo.png" class="w-full h-full object-cover" />
          </div>
          <div>
            <span class="font-black text-lg text-slate-800 tracking-tight">{{ auth.currentUser()?.restauranteNombre || 'MozoGo' }}</span>
            <span class="text-xs text-slate-400 font-bold block uppercase tracking-wider">Módulo Cocina</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end">
            <span class="font-bold text-xs text-slate-600">{{ auth.currentUser()?.email }}</span>
            <span class="text-[10px] text-green-500 font-semibold flex items-center gap-1 mt-0.5">
              <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Cocina Conectada
            </span>
          </div>
          <button (click)="logout()" class="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-bold transition-all text-xs border border-red-100/40">
            <span>🚪</span> Salir
          </button>
        </div>
      </header>

      <!-- Encabezado -->
      <div class="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            🍳 Dashboard de Cocina
          </h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Monitoreo de comandas en tiempo real y preparación de platos</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="loadPedidos()" class="bg-primary hover:bg-[#1a233b] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>🔄</span> Recargar Cola
          </button>
        </div>
      </div>

      <!-- Métricas Rápidas de Cocina -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-blue-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <h3 class="text-xs uppercase font-black tracking-widest text-blue-100 mb-1">En Cola / Espera</h3>
          <p class="text-4xl font-black">{{ pedidosEnEspera().length }}</p>
        </div>
        <div class="bg-amber-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <h3 class="text-xs uppercase font-black tracking-widest text-amber-100 mb-1">En Preparación</h3>
          <p class="text-4xl font-black">{{ pedidosPreparando().length }}</p>
        </div>
        <div class="bg-emerald-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <h3 class="text-xs uppercase font-black tracking-widest text-emerald-100 mb-1">Listos / Pronto</h3>
          <p class="text-4xl font-black">{{ pedidosListos().length }}</p>
        </div>
      </div>

      <!-- Vista de Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna 1: En Espera -->
        <div class="bg-slate-50/50 border border-gray-200/60 p-5 rounded-[2rem] flex flex-col min-h-[500px]">
          <h2 class="text-lg font-black text-gray-700 mb-4 flex items-center gap-2">
            ⏳ En Cola ({{ pedidosEnEspera().length }})
          </h2>
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 transition-all hover:border-blue-200">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-2xl font-black text-primary bg-primary/5 px-3 py-1 rounded-xl">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-gray-400 font-bold mt-2">Atiende: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-[10px] font-bold text-gray-400">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <!-- Items de Comanda -->
                <div class="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between text-sm">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-primary">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex justify-center items-center gap-1">
                  👨‍🍳 Empezar a Preparar
                </button>
              </div>
            } @empty {
              <p class="text-center text-gray-400 py-10 text-sm italic font-medium">No hay pedidos esperando.</p>
            }
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="bg-amber-50/20 border border-amber-200/40 p-5 rounded-[2rem] flex flex-col min-h-[500px]">
          <h2 class="text-lg font-black text-amber-800 mb-4 flex items-center gap-2">
            🔥 Preparando ({{ pedidosPreparando().length }})
          </h2>
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm space-y-4 transition-all hover:border-amber-300">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-2xl font-black text-amber-700 bg-amber-500/5 px-3 py-1 rounded-xl">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-gray-400 font-bold mt-2">Atiende: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-[10px] font-bold text-gray-400">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <!-- Items de Comanda -->
                <div class="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between text-sm">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-amber-600">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-2">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs transition">
                    Regresar
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition active:scale-95">
                    ✅ ¡Listo / Pronto!
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-center text-gray-400 py-10 text-sm italic font-medium">No hay platos preparándose.</p>
            }
          </div>
        </div>

        <!-- Columna 3: Pronto -->
        <div class="bg-emerald-50/20 border border-emerald-200/40 p-5 rounded-[2rem] flex flex-col min-h-[500px]">
          <h2 class="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2">
            🛎️ Listo para Llevar ({{ pedidosListos().length }})
          </h2>
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm space-y-4 transition-all hover:border-emerald-300">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-2xl font-black text-emerald-700 bg-emerald-500/5 px-3 py-1 rounded-xl">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-gray-400 font-bold mt-2">Atiende: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Completado</span>
                </div>
                
                <!-- Items de Comanda -->
                <div class="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between text-sm">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-emerald-600">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95">
                  🚪 Marcar como Entregado
                </button>
              </div>
            } @empty {
              <p class="text-center text-gray-400 py-10 text-sm italic font-medium">No hay pedidos listos pendientes de retiro.</p>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  `]
})
export class AdminCocinaComponent implements OnInit {
  private http = inject(HttpClient);
  private signalrService = inject(SignalrService);
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  pedidos = signal<CocinaPedido[]>([]);
  cookingOrderIds = signal<string[]>([]); // Lista local de IDs de comanda en preparación

  // Computados para cada columna
  pedidosEnEspera = computed(() => {
    return this.pedidos().filter(p => p.estado === 'EnPreparacion' && !this.cookingOrderIds().includes(p.id));
  });

  pedidosPreparando = computed(() => {
    return this.pedidos().filter(p => p.estado === 'EnPreparacion' && this.cookingOrderIds().includes(p.id));
  });

  pedidosListos = computed(() => {
    return this.pedidos().filter(p => p.estado === 'Listo');
  });

  constructor() {
    // Escuchar actualizaciones de SignalR
    effect(() => {
      // Si se aprueba un pedido, recargamos
      const task = this.signalrService.pendingTasks();
      // O si hay notificaciones en tiempo real, forzamos recarga
      this.loadPedidos();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Cargar comanda en preparación desde localStorage
    const savedCooking = localStorage.getItem('cocina_cooking_order_ids');
    if (savedCooking) {
      try {
        this.cookingOrderIds.set(JSON.parse(savedCooking));
      } catch (e) {}
    }
    this.loadPedidos();
  }

  loadPedidos() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.get<CocinaPedido[]>(`${environment.apiUrl}/api/pedido/activas`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.pedidos.set(data);
      },
      error: (err) => console.error('Error al cargar la cola de cocina:', err)
    });
  }

  empezarAPreparar(pedidoId: string) {
    this.cookingOrderIds.update(ids => {
      const newIds = [...ids, pedidoId];
      localStorage.setItem('cocina_cooking_order_ids', JSON.stringify(newIds));
      return newIds;
    });
  }

  devolverAEspera(pedidoId: string) {
    this.cookingOrderIds.update(ids => {
      const newIds = ids.filter(id => id !== pedidoId);
      localStorage.setItem('cocina_cooking_order_ids', JSON.stringify(newIds));
      return newIds;
    });
  }

  marcarComoListo(pedidoId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'Listo' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // Remover de cookingOrderIds
        this.cookingOrderIds.update(ids => {
          const newIds = ids.filter(id => id !== pedidoId);
          localStorage.setItem('cocina_cooking_order_ids', JSON.stringify(newIds));
          return newIds;
        });
        this.loadPedidos();
      },
      error: (err) => console.error('Error al marcar listo el pedido:', err)
    });
  }

  marcarComoEntregado(pedidoId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'Entregado' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadPedidos();
      },
      error: (err) => console.error('Error al marcar entregado el pedido:', err)
    });
  }

  getMinutesElapsed(fechaString: string): number {
    const orderTime = new Date(fechaString).getTime();
    const diffMs = Date.now() - orderTime;
    return Math.max(0, Math.floor(diffMs / 60000));
  }
}
