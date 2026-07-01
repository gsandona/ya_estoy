import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';

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
    <div class="min-h-screen bg-sand text-primary font-sans p-4 md:p-8 space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      <!-- Panel Title -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-800 tracking-tight">{{ lang.translations().kitchen.title }}</h1>
          <p class="text-primary/60 text-sm font-medium mt-1">{{ lang.translations().kitchen.subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="toggleMute()" 
                  [class]="signalrService.notificationSettings().muteAll ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'"
                  class="border px-5 py-3 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1.5 outline-none select-none">
            <span>{{ signalrService.notificationSettings().muteAll ? '🔇' : '🔊' }}</span>
            {{ signalrService.notificationSettings().muteAll ? 'Sonido Silenciado' : 'Sonido Activado' }}
          </button>
          
          <button (click)="loadPedidos()" class="bg-primary hover:bg-opacity-95 text-white border border-transparent px-5 py-3 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95">
            {{ lang.translations().kitchen.refresh }}
          </button>
        </div>
      </div>

      <!-- Métricas en Tarjetas claras -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 border-t-4 border-t-blue-500 rounded-xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-primary/60">{{ lang.translations().kitchen.espera }}</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">{{ pedidosEnEspera().length }}</p>
          </div>
          <div class="text-xl text-blue-500">⏱️</div>
        </div>
        <div class="bg-white border border-gray-200 border-t-4 border-t-amber-500 rounded-xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-primary/60">{{ lang.translations().kitchen.preparando }}</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">{{ pedidosPreparando().length }}</p>
          </div>
          <div class="text-2xl text-amber-500">🔥</div>
        </div>
        <div class="bg-white border border-gray-200 border-t-4 border-t-accent rounded-xl p-5 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-bold tracking-widest text-primary/60">{{ lang.translations().kitchen.despacho }}</h3>
            <p class="text-3xl font-black mt-1 text-gray-800">{{ pedidosListos().length }}</p>
          </div>
          <div class="text-2xl text-accent">✓</div>
        </div>
      </div>

      <!-- Columnas del Flujo -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna 1: En Cola -->
        <div class="bg-white border border-gray-200/80 p-4 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-3.5 border-b border-gray-100 pb-2.5">
            <h2 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.waiting }} ({{ pedidosEnEspera().length }})
            </h2>
            <span class="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-blue-100">{{ lang.translations().kitchen.espera }}</span>
          </div>
          
          <div class="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] rounded-xl p-3.5 space-y-3 hover:border-amber-700/30 transition-colors">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-primary bg-white/90 px-2.5 py-1 rounded-md border border-amber-900/10">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[9px] text-primary/60 font-bold mt-2 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-[9px] font-bold text-primary/70 bg-white px-2 py-0.5 rounded-md border border-gray-150">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <!-- Items list -->
                <div class="bg-white/80 rounded-lg p-2.5 space-y-1.5 border border-amber-900/5">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-1 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-700">{{ item.nombre }}</span>
                      <span class="font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-lg text-xs transition-all active:scale-[0.98] flex justify-center items-center gap-1 shadow-sm">
                  {{ lang.translations().kitchen.startCooking }}
                </button>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-xs italic font-medium">{{ lang.translations().kitchen.noOrders }}</p>
            }
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="bg-white border border-gray-200/80 p-4 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-3.5 border-b border-gray-100 pb-2.5">
            <h2 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.preparando }} ({{ pedidosPreparando().length }})
            </h2>
            <span class="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-amber-100">{{ lang.translations().kitchen.activos }}</span>
          </div>
          
          <div class="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] rounded-xl p-3.5 space-y-3 hover:border-amber-700/30 transition-colors">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-primary bg-white/90 px-2.5 py-1 rounded-md border border-amber-900/10">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[9px] text-primary/60 font-bold mt-2 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-[9px] font-bold text-primary/70 bg-white px-2 py-0.5 rounded-md border border-gray-150">⏱ {{ getMinutesElapsed(pedido.fecha) }} min</span>
                </div>
                
                <div class="bg-white/80 rounded-lg p-2.5 space-y-1.5 border border-amber-900/5">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-1 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-700">{{ item.nombre }}</span>
                      <span class="font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-2">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-primary font-black py-2 rounded-lg text-xs transition border border-gray-250">
                    {{ lang.translations().kitchen.back }}
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-accent hover:bg-accent/90 text-white font-black py-2 rounded-lg text-xs transition active:scale-[0.98] shadow-sm">
                    {{ lang.translations().kitchen.finishCooking }}
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-xs italic font-medium">{{ lang.translations().kitchen.noPreparing }}</p>
            }
          </div>
        </div>

        <!-- Columna 3: Listo para despachar -->
        <div class="bg-white border border-gray-200/80 p-4 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-3.5 border-b border-gray-100 pb-2.5">
            <h2 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.listos }} ({{ pedidosListos().length }})
            </h2>
            <span class="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-green-100">{{ lang.translations().kitchen.despacho }}</span>
          </div>
          
          <div class="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-[#FAF6EE] border-2 border-dashed border-[#DCD0C0] rounded-xl p-3.5 space-y-3 hover:border-amber-700/30 transition-colors">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-primary bg-white/90 px-2.5 py-1 rounded-md border border-amber-900/10">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[9px] text-primary/60 font-bold mt-2 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-[9px] font-black text-green-700 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-md">Listo</span>
                </div>
                
                <div class="bg-white/80 rounded-lg p-2.5 space-y-1.5 border border-amber-900/5">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-amber-900/5 pb-1 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-700">{{ item.nombre }}</span>
                      <span class="font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-accent hover:bg-accent/90 text-white font-black py-2 rounded-lg text-xs transition active:scale-[0.98] shadow-sm">
                  {{ lang.translations().kitchen.deliver }}
                </button>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-xs italic font-medium">{{ lang.translations().kitchen.noReady }}</p>
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
  public signalrService = inject(SignalrService);
  auth = inject(AuthService);
  router = inject(Router);
  lang = inject(LanguageService);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleMute() {
    const currentMute = this.signalrService.notificationSettings().muteAll;
    this.signalrService.updateNotificationSettings({ muteAll: !currentMute });
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
