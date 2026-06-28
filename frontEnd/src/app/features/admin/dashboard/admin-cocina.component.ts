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
      
      <!-- Kitchen Header -->
      <header class="bg-white border border-gray-200/80 px-6 py-4 rounded-2xl flex justify-between items-center shadow-sm mb-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 flex bg-sand/40">
            <img src="logo.png" class="w-full h-full object-cover" />
          </div>
          <div>
            <span class="font-black text-lg text-gray-800 tracking-tight">{{ auth.currentUser()?.restauranteNombre || 'MozoGo' }}</span>
            <span class="text-xs text-primary/60 font-bold block uppercase tracking-wider">{{ lang.translations().kitchen.title | uppercase }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button (click)="lang.toggleLanguage()" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-primary hover:bg-gray-100 text-xs font-black transition-all active:scale-95 outline-none select-none">
            <span>🌐</span> {{ lang.currentLang() | uppercase }}
          </button>
          <div class="hidden sm:flex flex-col items-end">
            <span class="font-bold text-xs text-primary/80">{{ auth.currentUser()?.username }}</span>
            <span class="text-[10px] text-accent font-semibold flex items-center gap-1.5 mt-0.5">
              <span class="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
              {{ lang.translations().common.online }}
            </span>
          </div>
          <button (click)="logout()" class="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-all text-xs border border-red-200/30">
            {{ lang.translations().common.logout }}
          </button>
        </div>
      </header>

      <!-- Panel Title -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-800 tracking-tight">{{ lang.translations().kitchen.title }}</h1>
          <p class="text-primary/60 text-sm font-medium mt-1">{{ lang.translations().kitchen.subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
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
        <div class="bg-white border border-gray-200/80 p-5 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h2 class="text-base font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.waiting }} ({{ pedidosEnEspera().length }})
            </h2>
            <span class="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-md font-bold border border-blue-100">{{ lang.translations().kitchen.espera }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-sand/30 border border-gray-200 rounded-xl p-5 space-y-4 hover:border-accent/40 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-primary bg-white px-3.5 py-1.5 rounded-lg border border-primary/20">{{ lang.translations().kitchen.table }} {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-primary/60 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-bold text-primary/70 bg-white px-2 py-1 rounded-md border border-gray-150">⏱ {{ getMinutesElapsed(pedido.fecha) }} {{ lang.translations().kitchen.minutes }}</span>
                </div>
                
                <!-- Items list (highly readable) -->
                <div class="bg-white rounded-lg p-4 space-y-3 border border-gray-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-gray-50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-blue-700 text-xl bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-1">
                  {{ lang.translations().kitchen.startCooking }}
                </button>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-sm italic font-medium">{{ lang.translations().kitchen.noOrders }}</p>
            }
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="bg-white border border-gray-200/80 p-5 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h2 class="text-base font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.preparando }} ({{ pedidosPreparando().length }})
            </h2>
            <span class="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-md font-bold border border-amber-100">{{ lang.translations().kitchen.activos }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-sand/30 border border-gray-200 rounded-xl p-5 space-y-4 hover:border-accent/40 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-primary bg-white px-3.5 py-1.5 rounded-lg border border-primary/20">{{ lang.translations().kitchen.table }} {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-primary/60 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-bold text-primary/70 bg-white px-2 py-1 rounded-md border border-gray-150">⏱ {{ getMinutesElapsed(pedido.fecha) }} {{ lang.translations().kitchen.minutes }}</span>
                </div>
                
                <div class="bg-white rounded-lg p-4 space-y-3 border border-gray-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-gray-50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-amber-700 text-xl bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-3">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-primary font-bold py-3 rounded-lg text-xs transition border border-gray-250">
                    {{ lang.translations().kitchen.back }}
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-lg text-xs transition active:scale-[0.98]">
                    {{ lang.translations().kitchen.finishCooking }}
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-sm italic font-medium">{{ lang.translations().kitchen.noPreparing }}</p>
            }
          </div>
        </div>

        <!-- Columna 3: Listo para despachar -->
        <div class="bg-white border border-gray-200/80 p-5 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h2 class="text-base font-black text-gray-800 uppercase tracking-wider">
              {{ lang.translations().kitchen.listos }} ({{ pedidosListos().length }})
            </h2>
            <span class="bg-green-50 text-green-700 text-xs px-2.5 py-0.5 rounded-md font-bold border border-green-100">{{ lang.translations().kitchen.despacho }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-sand/30 border border-gray-200 rounded-xl p-5 space-y-4 hover:border-accent/40 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="text-3xl font-black text-primary bg-white px-3.5 py-1.5 rounded-lg border border-primary/20">{{ lang.translations().kitchen.table }} {{ pedido.numeroMesa }}</span>
                    <p class="text-xs text-primary/60 font-bold mt-3">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <span class="text-xs font-black text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-md">{{ lang.translations().kitchen.despacho }}</span>
                </div>
                
                <div class="bg-white rounded-lg p-4 space-y-3 border border-gray-100">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-base border-b border-gray-50 pb-2 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800 text-lg">{{ item.nombre }}</span>
                      <span class="font-black text-green-700 text-xl bg-green-50 px-2.5 py-0.5 rounded-md border border-green-100">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg text-sm transition active:scale-[0.98]">
                  {{ lang.translations().kitchen.deliver }}
                </button>
              </div>
            } @empty {
              <p class="text-center text-primary/40 py-12 text-sm italic font-medium">{{ lang.translations().kitchen.noReady }}</p>
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
  lang = inject(LanguageService);

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
