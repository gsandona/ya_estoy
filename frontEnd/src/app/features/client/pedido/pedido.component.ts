import { Component, Input, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SignalrService } from '../../../core/services/signalr.service';
import { CartService } from '../../../core/services/cart.service';
import { MenuComponent } from '../components/menu/menu.component';
import { environment } from '../../../../environments/environment';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  template: `
    @if (requirePin()) {
      <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 px-4 animate-fade-in text-center">
        <div class="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-gray-100">
          <div class="h-20 w-20 bg-green-50 text-green-600 rounded-full mx-auto flex items-center justify-center text-3xl mb-6">🔒</div>
          <h2 class="text-2xl font-black text-gray-800 mb-2">Mesa Protegida</h2>
          <p class="text-gray-500 text-sm mb-6">Por favor ingrese el PIN de acceso proporcionado por su Mozo para ver el menú.</p>
          
          <input type="tel" #pinInputRef (focus)="pinInputRef.scrollIntoView({behavior: 'smooth', block: 'center'})" 
                 [(ngModel)]="pinInput" name="pin"
                 placeholder="Ej: 4921" maxlength="4" pattern="[0-9]*"
                 class="w-full text-center text-3xl font-black tracking-widest px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all mb-4">
          
          @if(pinError()) {
            <p class="text-red-500 text-sm font-bold mb-4 animate-fade-in">{{ pinError() }}</p>
          }

          <button (click)="submitPin()" [disabled]="validatingPin()" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition active:scale-95 flex justify-center items-center">
            @if(validatingPin()) {
               <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            } @else {
               Desbloquear Menú
            }
          </button>
        </div>
      </div>
    } @else if (isValidSession() === undefined) {
      <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 animate-fade-in text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div class="relative flex flex-col items-center">
          <div class="h-20 w-20 flex items-center justify-center mb-6 relative p-2">
            <span class="animate-spin absolute h-16 w-16 border-4 border-accent border-t-transparent rounded-full"></span>
            <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-100 flex">
              <img src="logo.png" class="w-full h-full object-cover" />
            </div>
          </div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight mb-2">MozoGo</h2>
          <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest animate-pulse">Validando Código QR...</p>
        </div>
      </div>
    } @else if (isValidSession() === false) {
      <div class="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 px-10 text-center animate-fade-in">
        <div class="h-28 w-28 bg-white text-red-500 rounded-full shadow-2xl flex items-center justify-center text-5xl mb-8 border-4 border-red-100 animate-[shake_0.5s_ease-out]">
          🛑
        </div>
        <h1 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Acceso Denegado</h1>
        <p class="text-lg text-gray-600 font-medium mb-8">
          El código QR ha expirado o la mesa está inactiva. Por favor avise al Mozo.
        </p>
        <button (click)="verifyMesa()" class="bg-white text-gray-800 font-bold py-3 px-8 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center gap-2">
          <span>🔄</span> Reintentar Conexión
        </button>
      </div>

    } @else {
      <div class="min-h-screen bg-surface flex flex-col items-center py-12 px-4 pb-32 animate-fade-in">
        <div class="mb-10 text-center">
          <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-primary/20">
            {{ numeroMesa() || '...' }}
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Menú Interactivo</h1>
        </div>

        <div class="w-full max-w-sm space-y-4">
          @if (yaLlamo()) {
            <div class="flex gap-2 w-full">
              <div class="flex-1 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-semibold text-lg flex justify-center items-center select-none">
                🛎️ Mozo notificado
              </div>
              <button 
                (click)="cancelarLlamado()"
                [disabled]="loadingCancelarLlamar()"
                class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex justify-center items-center transition-all active:scale-95 shadow-md">
                @if (loadingCancelarLlamar()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                } @else {
                  ❌
                }
              </button>
            </div>
          } @else {
            <button 
              (click)="llamarMozo()"
              [disabled]="loadingLlamar()"
              class="w-full h-16 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-semibold text-lg flex justify-center items-center transition-all active:scale-95 hover:brightness-105">
              @if (loadingLlamar()) {
                <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span> Llamando...
              } @else {
                🛎️ Llamar Mozo
              }
            </button>
          }

          @if (yaPidioCuenta()) {
            <div class="flex gap-2 w-full">
              <div class="flex-1 h-16 bg-accent/10 border border-accent/20 text-accent rounded-2xl font-semibold text-lg flex justify-center items-center select-none">
                💳 Cuenta solicitada
              </div>
              <button 
                (click)="cancelarCuenta()"
                [disabled]="loadingCancelarCuenta()"
                class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex justify-center items-center transition-all active:scale-95 shadow-md">
                @if (loadingCancelarCuenta()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                } @else {
                  ❌
                }
              </button>
            </div>
          } @else {
            <button 
              (click)="pedirCuenta()"
              [disabled]="loadingCuenta()"
              class="w-full h-16 bg-accent text-white rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] font-semibold text-lg flex justify-center items-center transition-all active:scale-95 hover:brightness-105">
              @if (loadingCuenta()) {
                <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span> Procesando...
              } @else {
                💳 Pedir Cuenta
              }
            </button>
          }

          <button 
            (click)="showMenu.set(!showMenu())"
            class="w-full h-16 bg-white border-2 border-transparent text-primary rounded-2xl shadow-sm font-semibold text-lg hover:border-gray-200 flex justify-center items-center transition-all">
            @if (showMenu()) {
              Ocultar Menú ⬆️
            } @else {
              📖 Ver Menú
            }
          </button>
        </div>

        <!-- Pending Order Card -->
        @if (activePedidoTaskId()) {
          <div class="w-full max-w-sm bg-blue-50/50 border border-blue-100 rounded-3xl p-5 shadow-sm animate-fade-in flex flex-col gap-3">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <span class="text-xl">🍳</span>
                <div>
                  <h3 class="font-bold text-gray-800 text-sm">Pedido en Cocina</h3>
                  <p class="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Pendiente de Aprobación</p>
                </div>
              </div>
              <button 
                (click)="cancelarPedido()"
                [disabled]="loadingCancelarPedido()"
                class="text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1">
                @if (loadingCancelarPedido()) {
                  <span class="animate-spin h-3.5 w-3.5 border-2 border-red-500 border-t-transparent rounded-full"></span>
                } @else {
                  Cancelar Pedido
                }
              </button>
            </div>
            <div class="bg-white/80 p-3 rounded-2xl text-xs font-semibold text-gray-600 border border-blue-50/50 line-clamp-3">
              {{ activePedidoDetails() }}
            </div>
          </div>
        }

        @if (showMenu()) {
          <div class="w-full max-w-md mt-10 animate-fade-in pb-20">
             <app-menu [restauranteId]="restauranteId()"></app-menu>
          </div>
        }

        <!-- Floating Cart -->
        @if (cart.totalItems() > 0 && !showCartModal()) {
          <div class="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 animate-fade-in">
            <button 
              (click)="showCartModal.set(true)"
              class="w-full max-w-md bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex justify-between items-center active:scale-[0.98] transition-all border border-gray-700">
              <div class="flex items-center gap-3">
                 <div class="bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                   {{ cart.totalItems() }}
                 </div>
                 <span class="font-bold">Ver Canasto</span>
              </div>
              <span class="font-black">\${{ cart.totalPrice() }}</span>
            </button>
          </div>
        }

        @if (showCartModal()) {
          <!-- Cart modal code -->
          <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
             <div class="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative">
                <button (click)="showCartModal.set(false)" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 class="text-2xl font-black text-gray-800 mb-6">Tu Pedido</h2>
                <div class="max-h-64 overflow-y-auto space-y-4 mb-6 pr-2">
                   @for (item of cart.items(); track item.id) {
                     <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                           <div class="flex items-center bg-surface rounded-lg">
                              <button (click)="cart.decreaseQuantity(item.id)" class="px-3 py-1 font-bold text-gray-500 hover:text-red-500">-</button>
                              <span class="font-bold text-sm w-4 text-center">{{ item.quantity }}</span>
                              <button (click)="cart.addToCart(item)" class="px-3 py-1 font-bold text-gray-500 hover:text-accent">+</button>
                           </div>
                           <div class="flex-1 max-w-[120px] sm:max-w-none break-words">
                             <p class="font-bold text-gray-800 leading-tight">{{ item.nombre }}</p>
                             <p class="text-xs text-gray-500">\${{ item.precio }} c/u</p>
                           </div>
                        </div>
                        <span class="font-black text-gray-800">\${{ item.precio * item.quantity }}</span>
                     </div>
                   } @empty {
                     <p class="text-center text-gray-500 py-6">El canasto está vacío</p>
                   }
                </div>
                @if (cart.totalItems() > 0) {
                  <div class="border-t border-gray-100 pt-4 mb-6">
                    <div class="flex justify-between items-center">
                       <span class="font-bold text-gray-500">Total a pagar</span>
                       <span class="font-black text-2xl text-primary">\${{ cart.totalPrice() }}</span>
                    </div>
                  </div>
                  <button 
                    (click)="enviarPedido()"
                    [disabled]="loadingPedido()"
                    class="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0da473] active:scale-[0.98] transition-all shadow-[0_8px_30px_rgb(16,185,129,0.3)] flex justify-center items-center">
                    @if (loadingPedido()) {
                      <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    } @else {
                      Enviar Pedido a Cocina
                    }
                  </button>
                }
             </div>
          </div>
        }

        @if (showSuccessToast()) {
          <div class="fixed top-6 left-0 right-0 flex justify-center z-50 animate-[slide-down_0.5s_ease-out] pointer-events-none">
             <div class="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.4)] font-black flex items-center gap-3 backdrop-blur-md">
               <span class="text-xl">✅</span> ¡Pedido orquestado con éxito!
             </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slide-down { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-2deg); } 75% { transform: translateX(6px) rotate(2deg); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  `]
})
export class PedidoComponent implements OnInit {
  @Input() restaurante!: string;
  @Input() numero!: string;

  id = ''; // Se resolverá al GUID de la mesa retornado por el backend

  private signalrService = inject(SignalrService);
  private http = inject(HttpClient);
  cart = inject(CartService);

  isValidSession = signal<boolean | undefined>(undefined);
  requirePin = signal<boolean>(false);
  pinInput = '';
  pinError = signal<string | null>(null);
  validatingPin = signal(false);
  numeroMesa = signal<string>('');
  restauranteId = signal<string>('');

  loadingLlamar = signal(false);
  loadingCuenta = signal(false);
  loadingPedido = signal(false);
  
  loadingCancelarLlamar = signal(false);
  loadingCancelarCuenta = signal(false);
  loadingCancelarPedido = signal(false);
  
  yaLlamo = signal(false);
  yaPidioCuenta = signal(false);

  activeLlamoTaskId = signal<string | null>(null);
  activeCuentaTaskId = signal<string | null>(null);
  activePedidoTaskId = signal<string | null>(null);
  activePedidoDetails = signal<string | null>(null);

  showMenu = signal(false);
  showCartModal = signal(false);
  showSuccessToast = signal(false);

  constructor() {
    effect(() => {
      const completedTaskId = this.signalrService.taskCompleted();
      if (completedTaskId) {
        const completedLower = completedTaskId.toLowerCase();
        if (completedLower === this.activeLlamoTaskId()?.toLowerCase()) {
          this.yaLlamo.set(false);
          this.activeLlamoTaskId.set(null);
          localStorage.removeItem('mozo_go_llamo_task_id');
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
        }
        if (completedLower === this.activeCuentaTaskId()?.toLowerCase()) {
          this.yaPidioCuenta.set(false);
          this.activeCuentaTaskId.set(null);
          localStorage.removeItem('mozo_go_cuenta_task_id');
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
        }
        if (completedLower === this.activePedidoTaskId()?.toLowerCase()) {
          this.activePedidoTaskId.set(null);
          this.activePedidoDetails.set(null);
          localStorage.removeItem('mozo_go_pedido_task_id');
          localStorage.removeItem('mozo_go_pedido_details');
        }
      }
    });
  }

  ngOnInit() {
    this.checkCooldowns();
    const savedPin = localStorage.getItem(`mesa_pin_${this.restaurante}_${this.numero}`);
    this.verifyMesa(savedPin || undefined);
  }

  checkCooldowns() {
    const llamoTaskId = localStorage.getItem('mozo_go_llamo_task_id');
    if (llamoTaskId) this.activeLlamoTaskId.set(llamoTaskId);
    
    const cuentaTaskId = localStorage.getItem('mozo_go_cuenta_task_id');
    if (cuentaTaskId) this.activeCuentaTaskId.set(cuentaTaskId);
    
    const pedidoTaskId = localStorage.getItem('mozo_go_pedido_task_id');
    if (pedidoTaskId) {
      this.activePedidoTaskId.set(pedidoTaskId);
      this.activePedidoDetails.set(localStorage.getItem('mozo_go_pedido_details'));
    }

    const llamoTime = localStorage.getItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    if (llamoTime) {
      const diff = Date.now() - parseInt(llamoTime, 10);
      if (diff < 15 * 60 * 1000) this.yaLlamo.set(true);
      else localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    }

    const cuentaTime = localStorage.getItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    if (cuentaTime) {
      const diff = Date.now() - parseInt(cuentaTime, 10);
      if (diff < 15 * 60 * 1000) this.yaPidioCuenta.set(true);
      else localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    }
  }

  verifyMesa(pinParam?: string) {
    if(pinParam) this.validatingPin.set(true);
    else this.isValidSession.set(undefined);
    const url = pinParam 
      ? `${environment.apiUrl}/api/mesas/verify?restaurante=${this.restaurante}&numero=${this.numero}&pin=${pinParam}`
      : `${environment.apiUrl}/api/mesas/verify?restaurante=${this.restaurante}&numero=${this.numero}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if(pinParam) {
          this.validatingPin.set(false);
          localStorage.setItem(`mesa_pin_${this.restaurante}_${this.numero}`, pinParam);
        }
        this.requirePin.set(false);
        this.pinError.set(null);
        this.id = res.mesaId; // Guardamos el GUID para las llamadas de SignalR
        if (res.restauranteId) {
          this.restauranteId.set(res.restauranteId);
        }

        // Sincronizar con el backend: si el mozo ya lo completó, desbloqueamos
        if (res.hasLlamado) {
          this.yaLlamo.set(true);
          if (res.llamoTaskId) {
            this.activeLlamoTaskId.set(res.llamoTaskId);
            localStorage.setItem('mozo_go_llamo_task_id', res.llamoTaskId);
          }
        } else {
          this.yaLlamo.set(false);
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
          localStorage.removeItem('mozo_go_llamo_task_id');
          this.activeLlamoTaskId.set(null);
        }

        if (res.hasCuenta) {
          this.yaPidioCuenta.set(true);
          if (res.cuentaTaskId) {
            this.activeCuentaTaskId.set(res.cuentaTaskId);
            localStorage.setItem('mozo_go_cuenta_task_id', res.cuentaTaskId);
          }
        } else {
          this.yaPidioCuenta.set(false);
          localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
          localStorage.removeItem('mozo_go_cuenta_task_id');
          this.activeCuentaTaskId.set(null);
        }

        if (res.pedidoTaskId) {
          this.activePedidoTaskId.set(res.pedidoTaskId);
          this.activePedidoDetails.set(res.pedidoDetails);
          localStorage.setItem('mozo_go_pedido_task_id', res.pedidoTaskId);
          if (res.pedidoDetails) {
            localStorage.setItem('mozo_go_pedido_details', res.pedidoDetails);
          }
        } else {
          this.activePedidoTaskId.set(null);
          this.activePedidoDetails.set(null);
          localStorage.removeItem('mozo_go_pedido_task_id');
          localStorage.removeItem('mozo_go_pedido_details');
        }

        if (res.numero) {
          this.numeroMesa.set(res.numero.toString());
        }

        setTimeout(() => this.isValidSession.set(true), 800);
      },
      error: (err) => {
        if(pinParam) this.validatingPin.set(false);
        if (err.status === 401) {
          // Requiere PIN
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.requirePin.set(true);
          this.isValidSession.set(undefined);
        } else if (err.status === 400 && pinParam) {
          // PIN Incorrecto
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.pinError.set('El PIN ingresado es incorrecto.');
        } else {
          // Mesa apagada, token expiro, etc.
          localStorage.removeItem(`mesa_pin_${this.restaurante}_${this.numero}`);
          this.requirePin.set(false);
          console.error('Violación de seguridad o mesa inactiva', err);
          setTimeout(() => this.isValidSession.set(false), 800);
        }
      }
    });
  }

  submitPin() {
    const sanitizedPin = this.pinInput.trim().replace(/\D/g, '');
    if (!sanitizedPin || sanitizedPin.length !== 4) {
      this.pinError.set('Ingrese un código exacto de 4 dígitos');
      return;
    }
    this.pinError.set(null);
    this.verifyMesa(sanitizedPin);
  }

  async llamarMozo() {
    this.loadingLlamar.set(true);
    try {
      const taskId = await this.signalrService.sendLlamarMozo(this.id);
      if (taskId && taskId !== '00000000-0000-0000-0000-000000000000') {
        this.yaLlamo.set(true);
        this.activeLlamoTaskId.set(taskId);
        localStorage.setItem('mozo_go_llamo_task_id', taskId);
        localStorage.setItem(`mesa_${this.restaurante}_${this.numero}_llamo`, Date.now().toString());
      }
    } finally {
      setTimeout(() => this.loadingLlamar.set(false), 800);
    }
  }

  async pedirCuenta() {
    this.loadingCuenta.set(true);
    try {
      const taskId = await this.signalrService.sendPedirCuenta(this.id);
      if (taskId && taskId !== '00000000-0000-0000-0000-000000000000') {
        this.yaPidioCuenta.set(true);
        this.activeCuentaTaskId.set(taskId);
        localStorage.setItem('mozo_go_cuenta_task_id', taskId);
        localStorage.setItem(`mesa_${this.restaurante}_${this.numero}_cuenta`, Date.now().toString());
      }
    } finally {
      setTimeout(() => this.loadingCuenta.set(false), 800);
    }
  }

  async enviarPedido() {
    this.loadingPedido.set(true);
    try {
      const detailsArray = this.cart.items().map(i => `${i.quantity}x ${i.nombre}`);
      const fullDetails = detailsArray.join(', ');

      const taskId = await this.signalrService.sendNuevoPedido(this.id, fullDetails);
      if (taskId && taskId !== '00000000-0000-0000-0000-000000000000') {
        this.activePedidoTaskId.set(taskId);
        this.activePedidoDetails.set(fullDetails);
        localStorage.setItem('mozo_go_pedido_task_id', taskId);
        localStorage.setItem('mozo_go_pedido_details', fullDetails);
      }
      
      this.showCartModal.set(false);
      this.cart.clearCart();
      
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 3000);
    } catch (err) {
      console.error('Error enviando el pedido:', err);
    } finally {
      this.loadingPedido.set(false);
    }
  }

  async cancelarLlamado() {
    const taskId = this.activeLlamoTaskId();
    if (!taskId) return;
    this.loadingCancelarLlamar.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.yaLlamo.set(false);
      this.activeLlamoTaskId.set(null);
      localStorage.removeItem('mozo_go_llamo_task_id');
      localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_llamo`);
    } finally {
      this.loadingCancelarLlamar.set(false);
    }
  }

  async cancelarCuenta() {
    const taskId = this.activeCuentaTaskId();
    if (!taskId) return;
    this.loadingCancelarCuenta.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.yaPidioCuenta.set(false);
      this.activeCuentaTaskId.set(null);
      localStorage.removeItem('mozo_go_cuenta_task_id');
      localStorage.removeItem(`mesa_${this.restaurante}_${this.numero}_cuenta`);
    } finally {
      this.loadingCancelarCuenta.set(false);
    }
  }

  async cancelarPedido() {
    const taskId = this.activePedidoTaskId();
    if (!taskId) return;
    this.loadingCancelarPedido.set(true);
    try {
      await this.signalrService.cancelTask(taskId);
      this.activePedidoTaskId.set(null);
      this.activePedidoDetails.set(null);
      localStorage.removeItem('mozo_go_pedido_task_id');
      localStorage.removeItem('mozo_go_pedido_details');
    } finally {
      this.loadingCancelarPedido.set(false);
    }
  }
}
