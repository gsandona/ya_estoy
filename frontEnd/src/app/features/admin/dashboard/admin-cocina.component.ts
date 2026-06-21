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
  estado: 'Recibido' | 'EnPreparacion' | 'Listo' | 'Entregado' | 'Cancelado' | 'Aprobado';
  fecha: string;
  items: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-admin-cocina',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      <!-- Kitchen Header -->
      <header class="bg-slate-900 border border-slate-800/80 px-6 py-4 rounded-2xl flex justify-between items-center shadow-md mb-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden border border-slate-700/60 flex bg-slate-850">
            <img src="logo.png" class="w-full h-full object-cover" />
          </div>
          <div>
            <span class="font-black text-lg text-slate-100 tracking-tight">{{ auth.currentUser()?.restauranteNombre || 'MozoGo' }}</span>
            <span class="text-xs text-slate-400 font-bold block uppercase tracking-wider">MÓDULO DE COCINA</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end">
            <span class="font-bold text-xs text-slate-300">{{ auth.currentUser()?.email }}</span>
            <span class="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Conectado
            </span>
          </div>
          <button (click)="logout()" class="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 font-bold transition-all text-xs border border-red-900/30">
            Salir
          </button>
        </div>
      </header>

      <!-- Panel Title -->
      <div class="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800/85 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-100 tracking-tight">Monitoreo de Comandas</h1>
          <p class="text-slate-400 text-sm font-medium mt-1">Control de platos entrantes, en preparación y listos para despacho.</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="loadPedidos()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95">
            Actualizar Pantalla
          </button>
        </div>
      </div>

      <!-- Métricas en Slate -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-slate-900 border-t-4 border-blue-500 rounded-xl p-5 shadow-md flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-slate-400">En Espera</h3>
            <p class="text-3xl font-black mt-1 text-slate-100">{{ pedidosEnEspera().length }}</p>
          </div>
          <div class="text-xl text-blue-500">⏱️</div>
        </div>
        <div class="bg-slate-900 border-t-4 border-amber-500 rounded-xl p-5 shadow-md flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-slate-400">En Preparación</h3>
            <p class="text-3xl font-black mt-1 text-slate-100">{{ pedidosPreparando().length }}</p>
          </div>
          <div class="text-2xl text-amber-500">🔥</div>
        </div>
        <div class="bg-slate-900 border-t-4 border-emerald-500 rounded-xl p-5 shadow-md flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-slate-400">Listos</h3>
            <p class="text-3xl font-black mt-1 text-slate-100">{{ pedidosListos().length }}</p>
          </div>
          <div class="text-2xl text-emerald-500">✓</div>
        </div>
      </div>

      <!-- Columnas del Flujo -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna 1: En Cola -->
        <div class="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col min-h-[500px]">
          <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h2 class="text-base font-black text-slate-200 uppercase tracking-wider">
              En Cola ({{ pedidosEnEspera().length }})
            </h2>
            <span class="bg-blue-900/40 text-blue-400 text-xs px-2.5 py-0.5 rounded-md font-bold border border-blue-900/30">Espera</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-slate-100 bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-slate-400 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-bold text-slate-400 bg-slate-850 px-2 py-1 rounded-md border border-slate-800">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <!-- Items list (highly readable) -->
                <div class="bg-slate-950/60 rounded-lg p-4 space-y-3 border border-slate-800">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-slate-900/50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-100 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-blue-400 text-xl bg-blue-950/30 px-2.5 py-0.5 rounded-md border border-blue-900/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-1">
                  Iniciar Preparación
                </button>
              </div>
            } @empty {
              <p class="text-center text-slate-500 py-12 text-sm italic font-medium">No hay comandas en espera.</p>
            }
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col min-h-[500px]">
          <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h2 class="text-base font-black text-slate-200 uppercase tracking-wider">
              En Preparación ({{ pedidosPreparando().length }})
            </h2>
            <span class="bg-amber-900/40 text-amber-400 text-xs px-2.5 py-0.5 rounded-md font-bold border border-amber-900/30">Activos</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-slate-100 bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-slate-400 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-bold text-slate-400 bg-slate-850 px-2 py-1 rounded-md border border-slate-800">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <div class="bg-slate-950/60 rounded-lg p-4 space-y-3 border border-slate-800">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-slate-900/50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-100 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-amber-400 text-xl bg-amber-950/30 px-2.5 py-0.5 rounded-md border border-amber-900/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-3">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-3 rounded-lg text-xs transition border border-slate-750">
                    Regresar
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-xs transition active:scale-[0.98]">
                    Terminado
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-center text-slate-500 py-12 text-sm italic font-medium">No hay platos en preparación.</p>
            }
          </div>
        </div>

        <!-- Columna 3: Listo para retirar -->
        <div class="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col min-h-[500px]">
          <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <h2 class="text-base font-black text-slate-200 uppercase tracking-wider">
              Listos para Despacho ({{ pedidosListos().length }})
            </h2>
            <span class="bg-emerald-900/40 text-emerald-400 text-xs px-2.5 py-0.5 rounded-md font-bold border border-emerald-900/30">Listos</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-slate-100 bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-slate-400 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded-md">Listo</span>
                </div>
                
                <div class="bg-slate-950/60 rounded-lg p-4 space-y-3 border border-slate-800">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-slate-900/50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-100 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-emerald-400 text-xl bg-emerald-950/30 px-2.5 py-0.5 rounded-md border border-emerald-900/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-bold py-3.5 rounded-lg text-sm transition active:scale-[0.98]">
                  Entregar Pedido
                </button>
              </div>
            } @empty {
              <p class="text-center text-slate-500 py-12 text-sm italic font-medium">No hay comandas listas.</p>
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
    return this.pedidos().filter(p => p.estado === 'Aprobado');
  });

  pedidosPreparando = computed(() => {
    return this.pedidos().filter(p => p.estado === 'EnPreparacion');
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
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'EnPreparacion' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.cookingOrderIds.update(ids => {
          const newIds = [...ids, pedidoId];
          localStorage.setItem('cocina_cooking_order_ids', JSON.stringify(newIds));
          return newIds;
        });
        this.loadPedidos();
      },
      error: (err) => console.error('Error al iniciar preparación:', err)
    });
  }

  devolverAEspera(pedidoId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'Aprobado' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.cookingOrderIds.update(ids => {
          const newIds = ids.filter(id => id !== pedidoId);
          localStorage.setItem('cocina_cooking_order_ids', JSON.stringify(newIds));
          return newIds;
        });
        this.loadPedidos();
      },
      error: (err) => console.error('Error al regresar pedido a la cola:', err)
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
