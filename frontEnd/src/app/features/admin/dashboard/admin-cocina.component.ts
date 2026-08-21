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
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      <!-- Panel Title -->
      <div class="bg-slate-900/60 backdrop-blur p-6 rounded-[2rem] border border-slate-800/85 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🍳</span> {{ lang.translations().kitchen.title }}
          </h1>
          <p class="text-slate-400 text-sm font-medium mt-1">{{ lang.translations().kitchen.subtitle }}</p>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <button (click)="toggleMute()" 
                  [class]="signalrService.notificationSettings().muteAll ? 'bg-rose-950/30 text-rose-450 border-rose-900/50 hover:bg-rose-900/20' : 'bg-emerald-950/30 text-emerald-450 border-emerald-900/50 hover:bg-emerald-900/20'"
                  class="border px-5 py-3 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 outline-none select-none flex-1 md:flex-initial">
            <span>{{ signalrService.notificationSettings().muteAll ? '🔇' : '🔊' }}</span>
            {{ signalrService.notificationSettings().muteAll ? 'Sonido Silenciado' : 'Sonido Activado' }}
          </button>
          
          <button (click)="loadPedidos()" class="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-3 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex-1 md:flex-initial">
            {{ lang.translations().kitchen.refresh }}
          </button>
        </div>
      </div>

      <!-- Métricas en Tarjetas KDS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-slate-900 border-l-4 border-l-cyan-500 border-y border-r border-slate-800/60 rounded-2xl p-5 shadow-lg flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-black tracking-wider text-slate-400">{{ lang.translations().kitchen.espera }}</h3>
            <p class="text-4xl font-black mt-1 text-white tracking-tight">{{ pedidosEnEspera().length }}</p>
          </div>
          <div class="text-3xl text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">⏱️</div>
        </div>
        <div class="bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-800/60 rounded-2xl p-5 shadow-lg flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-black tracking-wider text-slate-400">{{ lang.translations().kitchen.preparando }}</h3>
            <p class="text-4xl font-black mt-1 text-white tracking-tight">{{ pedidosPreparando().length }}</p>
          </div>
          <div class="text-3xl text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse">🔥</div>
        </div>
        <div class="bg-slate-900 border-l-4 border-l-emerald-500 border-y border-r border-slate-800/60 rounded-2xl p-5 shadow-lg flex justify-between items-center">
          <div>
            <h3 class="text-xs uppercase font-black tracking-wider text-slate-400">{{ lang.translations().kitchen.despacho }}</h3>
            <p class="text-4xl font-black mt-1 text-white tracking-tight">{{ pedidosListos().length }}</p>
          </div>
          <div class="text-3xl text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">✓</div>
        </div>
      </div>

      <!-- Columnas del Flujo KDS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna 1: En Cola -->
        <div class="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-2xl">
          <div class="flex justify-between items-center mb-4.5 border-b border-slate-800/60 pb-3">
            <h2 class="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
              {{ lang.translations().kitchen.waiting }} ({{ pedidosEnEspera().length }})
            </h2>
            <span class="bg-cyan-950/40 text-cyan-400 text-[10px] px-2.5 py-0.5 rounded-lg font-black border border-cyan-900/30 uppercase tracking-wider">{{ lang.translations().kitchen.espera }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl transition-all relative overflow-hidden group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-lg font-black text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-slate-400 font-bold mt-3 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <!-- Dynamic Time Badge -->
                    <span class="text-[10px] font-black px-2.5 py-0.75 rounded-lg border uppercase tracking-wider transition-all animate-fade-in"
                          [ngClass]="{
                            'bg-slate-855 text-slate-300 border-slate-750': getMinutesElapsed(pedido.fecha) < 10,
                            'bg-amber-950/40 text-amber-400 border-amber-900/40': getMinutesElapsed(pedido.fecha) >= 10 && getMinutesElapsed(pedido.fecha) < 20,
                            'bg-rose-950/50 text-rose-400 border-rose-900/40 animate-pulse': getMinutesElapsed(pedido.fecha) >= 20
                          }">
                      ⏱ {{ getMinutesElapsed(pedido.fecha) }} min
                    </span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[10px] text-slate-400 hover:text-white font-bold bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-750 hover:border-slate-700 transition-colors shadow-md" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <!-- Items list -->
                <div class="bg-slate-950/60 rounded-xl p-3 space-y-2 border border-slate-900">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-slate-900/50 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-350">{{ item.nombre }}</span>
                      <span class="font-black text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-900/30">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-[0.98] flex justify-center items-center gap-1 shadow-lg shadow-cyan-955/30 uppercase tracking-wider">
                  {{ lang.translations().kitchen.startCooking }}
                </button>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
                <p class="text-slate-500 text-xs font-semibold">{{ lang.translations().kitchen.noOrders }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Columna 2: Preparando -->
        <div class="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-2xl">
          <div class="flex justify-between items-center mb-4.5 border-b border-slate-800/60 pb-3">
            <h2 class="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
              {{ lang.translations().kitchen.preparando }} ({{ pedidosPreparando().length }})
            </h2>
            <span class="bg-amber-950/40 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-lg font-black border border-amber-900/30 uppercase tracking-wider">{{ lang.translations().kitchen.activos }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl transition-all relative overflow-hidden group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-lg font-black text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-slate-400 font-bold mt-3 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-[10px] font-black px-2.5 py-0.75 rounded-lg border uppercase tracking-wider transition-all"
                          [ngClass]="{
                            'bg-slate-855 text-slate-300 border-slate-750': getMinutesElapsed(pedido.fecha) < 10,
                            'bg-amber-950/40 text-amber-400 border-amber-900/40': getMinutesElapsed(pedido.fecha) >= 10 && getMinutesElapsed(pedido.fecha) < 20,
                            'bg-rose-950/50 text-rose-450 border-rose-900/40 animate-pulse': getMinutesElapsed(pedido.fecha) >= 20
                          }">
                      ⏱ {{ getMinutesElapsed(pedido.fecha) }} min
                    </span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[10px] text-slate-400 hover:text-white font-bold bg-slate-855 px-2.5 py-1.5 rounded-lg border border-slate-750 hover:border-slate-700 transition-colors shadow-md" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <div class="bg-slate-950/60 rounded-xl p-3 space-y-2 border border-slate-900">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-slate-900/50 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-350">{{ item.nombre }}</span>
                      <span class="font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-900/30">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-2">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-black py-3 rounded-xl text-xs transition border border-slate-700 uppercase tracking-wider">
                    {{ lang.translations().kitchen.back }}
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition active:scale-[0.98] shadow-lg shadow-emerald-955/30 uppercase tracking-wider">
                    {{ lang.translations().kitchen.finishCooking }}
                  </button>
                </div>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
                <p class="text-slate-500 text-xs font-semibold">{{ lang.translations().kitchen.noPreparing }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Columna 3: Listo para despachar -->
        <div class="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-2xl">
          <div class="flex justify-between items-center mb-4.5 border-b border-slate-800/60 pb-3">
            <h2 class="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              {{ lang.translations().kitchen.listos }} ({{ pedidosListos().length }})
            </h2>
            <span class="bg-emerald-950/40 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-lg font-black border border-emerald-900/30 uppercase tracking-wider">{{ lang.translations().kitchen.despacho }}</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xl transition-all relative overflow-hidden group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-lg font-black text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-slate-400 font-bold mt-3 truncate max-w-[140px]">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/45 px-2.5 py-0.75 rounded-lg uppercase tracking-wider">Listo</span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[10px] text-slate-400 hover:text-white font-bold bg-slate-855 px-2.5 py-1.5 rounded-lg border border-slate-750 hover:border-slate-700 transition-colors shadow-md" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <div class="bg-slate-950/60 rounded-xl p-3 space-y-2 border border-slate-900">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-slate-900/50 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-slate-355">{{ item.nombre }}</span>
                      <span class="font-black text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-900/30">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-slate-850 hover:bg-slate-800 text-emerald-400 hover:text-emerald-350 border border-slate-750 hover:border-slate-700 font-black py-3 rounded-xl text-xs transition active:scale-[0.98] shadow-md uppercase tracking-wider">
                  {{ lang.translations().kitchen.deliver }}
                </button>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
                <p class="text-slate-500 text-xs font-semibold">{{ lang.translations().kitchen.noReady }}</p>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    .bg-slate-855 { background-color: rgb(24, 32, 49); }
    .text-slate-350 { color: rgb(185, 195, 212); }
    .text-slate-355 { color: rgb(190, 200, 216); }
    .border-slate-850 { border-color: rgb(24, 32, 49); }
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

  imprimirPedidoCocina(pedido: any) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = pedido.items.map((item: any) => `
        <tr style="border-bottom: 1px dashed #ccc;">
          <td style="padding: 6px 0; font-size: 14px; font-weight: bold; width: 40px;">x${item.cantidad}</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: bold;">${item.nombre}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda Cocina Mesa ${pedido.numeroMesa}</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 15px 5px; color: #000; text-align: left; }
              .header { text-align: center; margin-bottom: 10px; }
              .header h2 { margin: 0 0 5px 0; font-size: 18px; font-weight: 900; text-transform: uppercase; }
              .details { font-size: 11px; margin-bottom: 10px; line-height: 1.3; }
              .details p { margin: 2px 0; }
              .divider { border-top: 2px dashed #000; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>COMANDA COCINA</h2>
              <h1 style="font-size: 26px; margin: 5px 0; font-weight: 900; border: 2px solid #000; padding: 4px; display: inline-block;">MESA ${pedido.numeroMesa}</h1>
            </div>
            
            <div class="divider"></div>
            
            <div class="details">
              <p><b>Fecha:</b> ${new Date(pedido.fecha).toLocaleString()}</p>
              <p><b>Mozo:</b> ${pedido.mozoEmail || 'Sin mozo asignado'}</p>
              <p><b>Estado:</b> ${pedido.estado.toUpperCase()}</p>
            </div>
            
            <div class="divider"></div>
            
            <table>
              <thead>
                <tr style="border-bottom: 2px solid #000;">
                  <th style="text-align: left; font-size: 12px; padding-bottom: 4px;">Cant</th>
                  <th style="text-align: left; font-size: 12px; padding-bottom: 4px;">Descripción</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div style="text-align: center; font-size: 10px; margin-top: 15px; font-weight: bold; text-transform: uppercase;">
              --- Fin de Comanda ---
            </div>
            
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}
