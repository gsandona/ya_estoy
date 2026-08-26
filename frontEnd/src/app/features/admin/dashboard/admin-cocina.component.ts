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
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto text-gray-800">
      
      <!-- Panel Header and Title -->
      <div class="bg-white border border-gray-200 p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🍳</span>
          <div>
            <h1 class="text-lg font-black text-gray-800 tracking-tight">
              {{ lang.translations().kitchen.title }}
            </h1>
            <p class="text-gray-400 text-xs font-semibold mt-0.5">{{ lang.translations().kitchen.subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <button (click)="toggleMute()" 
                  [class]="signalrService.notificationSettings().muteAll ? 'bg-red-50 text-red-600 border-red-150 hover:bg-red-100/50' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100/50'"
                  class="border px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 outline-none select-none flex-1 md:flex-initial">
            <span>{{ signalrService.notificationSettings().muteAll ? '🔇' : '🔊' }}</span>
            {{ signalrService.notificationSettings().muteAll ? 'Sonido Silenciado' : 'Sonido Activado' }}
          </button>
          
          <button (click)="loadPedidos()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex-1 md:flex-initial border border-transparent">
            {{ lang.translations().kitchen.refresh }}
          </button>
        </div>
      </div>

      <!-- Top Banner "Cocina" (Exactly like the sketch mockup) -->
      <div class="bg-emerald-100 border-2 border-emerald-200 py-3 px-6 rounded-[1.5rem] text-center shadow-sm w-full select-none">
        <h2 class="text-sm font-black text-emerald-800 uppercase tracking-[0.25em] m-0">
          Cocina
        </h2>
      </div>

      <!-- KDS Flow Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Column 1: Pendiente (Yellow cards) -->
        <div class="bg-gray-50 border border-gray-200/80 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4.5 border-b border-gray-200 pb-3">
            <h2 class="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
              {{ lang.translations().kitchen.waiting }} ({{ pedidosEnEspera().length }})
            </h2>
            <span class="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">Pendiente</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosEnEspera(); track pedido.id) {
              <div class="bg-[#fef3c7] border-2 border-[#f59e0b]/30 rounded-[2rem] p-5 space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-[#78350f] group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-gray-800 bg-white/80 px-3.5 py-1.5 rounded-xl border border-white/50 shadow-sm">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-[#92400e] font-bold mt-3.5">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-[9px] font-black px-2.5 py-1 rounded-lg bg-white/70 border border-white/50 text-[#78350f] tracking-wider transition-all">
                      ⏱ {{ getMinutesElapsed(pedido.fecha) }} min
                    </span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[9px] text-[#92400e] hover:text-gray-900 font-bold bg-white/50 px-2.5 py-1 rounded-lg border border-white/40 transition-colors shadow-sm" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <!-- Items list (white card backdrop for maximum readability) -->
                <div class="bg-white/80 rounded-2xl p-4 space-y-2 border border-white/30 shadow-inner">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-[#fef3c7]/60 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-[#78350f] bg-[#fef3c7] px-2 py-0.5 rounded-lg border border-[#f59e0b]/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>
 
                <button (click)="empezarAPreparar(pedido.id)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs transition-all active:scale-[0.98] flex justify-center items-center gap-1 shadow-sm uppercase tracking-wider border border-transparent">
                  {{ lang.translations().kitchen.startCooking }}
                </button>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-gray-300 rounded-2xl">
                <p class="text-gray-400 text-xs font-semibold">{{ lang.translations().kitchen.noOrders }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Column 2: Preparación (Blue cards) -->
        <div class="bg-gray-50 border border-gray-200/80 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4.5 border-b border-gray-200 pb-3">
            <h2 class="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></span>
              {{ lang.translations().kitchen.preparando }} ({{ pedidosPreparando().length }})
            </h2>
            <span class="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">Preparación</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosPreparando(); track pedido.id) {
              <div class="bg-[#dbeafe] border-2 border-[#3b82f6]/30 rounded-[2rem] p-5 space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-[#1e3a8a] group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-gray-800 bg-white/80 px-3.5 py-1.5 rounded-xl border border-white/50 shadow-sm">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-[#1e40af] font-bold mt-3.5">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-[9px] font-black px-2.5 py-1 rounded-lg bg-white/70 border border-white/50 text-[#1e3a8a] tracking-wider transition-all">
                      ⏱ {{ getMinutesElapsed(pedido.fecha) }} min
                    </span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[9px] text-[#1e40af] hover:text-gray-900 font-bold bg-white/50 px-2.5 py-1 rounded-lg border border-white/40 transition-colors shadow-sm" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <!-- Items list -->
                <div class="bg-white/80 rounded-2xl p-4 space-y-2 border border-white/30 shadow-inner">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-[#dbeafe]/60 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-[#1e3a8a] bg-[#dbeafe] px-2 py-0.5 rounded-lg border border-[#3b82f6]/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>

                <div class="flex gap-2">
                  <button (click)="devolverAEspera(pedido.id)" class="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-xl text-xs transition border border-gray-300 uppercase tracking-wider active:scale-95">
                    {{ lang.translations().kitchen.back }}
                  </button>
                  <button (click)="marcarComoListo(pedido.id)" class="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs transition active:scale-[0.98] shadow-sm uppercase tracking-wider">
                    {{ lang.translations().kitchen.finishCooking }}
                  </button>
                </div>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-gray-300 rounded-2xl">
                <p class="text-gray-400 text-xs font-semibold">{{ lang.translations().kitchen.noPreparing }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Column 3: Listo (Green cards) -->
        <div class="bg-gray-50 border border-gray-200/80 p-5 rounded-3xl flex flex-col min-h-[500px] shadow-sm">
          <div class="flex justify-between items-center mb-4.5 border-b border-gray-200 pb-3">
            <h2 class="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
              {{ lang.translations().kitchen.listos }} ({{ pedidosListos().length }})
            </h2>
            <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider">Listo</span>
          </div>
          
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-1">
            @for (pedido of pedidosListos(); track pedido.id) {
              <div class="bg-[#d1fae5] border-2 border-[#10b981]/30 rounded-[2rem] p-5 space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-[#065f46] group">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-base font-black text-gray-800 bg-white/80 px-3.5 py-1.5 rounded-xl border border-white/50 shadow-sm">Mesa {{ pedido.numeroMesa }}</span>
                    <p class="text-[10px] text-[#065f46] font-bold mt-3.5">Mozo: {{ pedido.mozoEmail }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-[9px] font-black text-emerald-800 bg-white/70 border border-white/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">Listo</span>
                    <button (click)="imprimirPedidoCocina(pedido)" class="text-[9px] text-[#065f46] hover:text-gray-900 font-bold bg-white/50 px-2.5 py-1 rounded-lg border border-white/40 transition-colors shadow-sm" title="Imprimir Comanda">🖨️ Ticket</button>
                  </div>
                </div>
                
                <!-- Items list -->
                <div class="bg-white/80 rounded-2xl p-4 space-y-2 border border-white/30 shadow-inner">
                  @for (item of pedido.items; track item.nombre) {
                    <div class="flex justify-between items-center text-xs border-b border-[#d1fae5]/60 pb-1.5 last:border-b-0 last:pb-0">
                      <span class="font-bold text-gray-800">{{ item.nombre }}</span>
                      <span class="font-black text-[#065f46] bg-[#d1fae5] px-2 py-0.5 rounded-lg border border-[#10b981]/20">x{{ item.cantidad }}</span>
                    </div>
                  }
                </div>
 
                <button (click)="marcarComoEntregado(pedido.id)" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-2.5 rounded-xl text-xs transition active:scale-[0.98] shadow-sm uppercase tracking-wider border border-transparent">
                  {{ lang.translations().kitchen.deliver }}
                </button>
              </div>
            } @empty {
              <div class="py-16 text-center border border-dashed border-gray-300 rounded-2xl">
                <p class="text-gray-400 text-xs font-semibold">{{ lang.translations().kitchen.noReady }}</p>
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
