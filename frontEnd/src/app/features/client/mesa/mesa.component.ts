import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../core/services/signalr.service';
import { MenuComponent } from '../components/menu/menu.component';

@Component({
  selector: 'app-mesa',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center py-12 px-4">
      
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary text-white text-3xl font-bold mb-4 shadow-lg">
          {{ id }}
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Menú Interactivo</h1>
        <p class="text-gray-500 font-medium">Escanea, pide y disfruta</p>
      </div>

      <div class="w-full max-w-sm space-y-4">
        
        <button 
          (click)="llamarMozo()"
          [disabled]="loadingLlamar()"
          class="w-full h-16 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-semibold text-lg flex justify-center items-center transition-all active:scale-[0.98] hover:bg-[#1a233b] disabled:opacity-75 disabled:active:scale-100">
          @if (loadingLlamar()) {
            <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span>
            Llamando...
          } @else {
            🛎️ Llamar Mozo
          }
        </button>

        <button 
          (click)="pedirCuenta()"
          [disabled]="loadingCuenta()"
          class="w-full h-16 bg-accent text-white rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] font-semibold text-lg flex justify-center items-center transition-all active:scale-[0.98] hover:bg-[#0da473] disabled:opacity-75 disabled:active:scale-100">
          @if (loadingCuenta()) {
            <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span>
            Procesando...
          } @else {
            💳 Pedir Cuenta
          }
        </button>
        
        <button 
          (click)="toggleMenu()"
          class="w-full h-16 bg-white border-2 border-transparent text-primary rounded-2xl shadow-sm font-semibold text-lg hover:border-gray-200 flex justify-center items-center transition-all active:scale-[0.98]">
          📖 Ver Menú
        </button>
      </div>

      @if (showMenu()) {
        <div class="w-full max-w-md mt-10 animate-fade-in">
          <app-menu (orderPlaced)="onOrderPlaced($event)"></app-menu>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
  `]
})
export class MesaComponent {
  @Input() id!: string;
  @Input() token!: string;

  private signalrService = inject(SignalrService);

  loadingLlamar = signal(false);
  loadingCuenta = signal(false);
  showMenu = signal(false);

  async llamarMozo() {
    this.loadingLlamar.set(true);
    try {
      await this.signalrService.sendLlamarMozo(Number(this.id));
    } finally {
      setTimeout(() => this.loadingLlamar.set(false), 800);
    }
  }

  async pedirCuenta() {
    this.loadingCuenta.set(true);
    try {
      await this.signalrService.sendPedirCuenta(Number(this.id));
    } finally {
      setTimeout(() => this.loadingCuenta.set(false), 800);
    }
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  async onOrderPlaced(details: string) {
    console.log('Order placed', details);
    try {
      await this.signalrService.sendNuevoPedido(Number(this.id), details);
    } catch (err) {
      console.error('Error enviando el pedido:', err);
    }
  }
}
