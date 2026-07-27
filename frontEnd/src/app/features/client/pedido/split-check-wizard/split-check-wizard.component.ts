import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SplitMode = 'equal' | 'percentage' | 'custom' | null;

@Component({
  selector: 'app-split-check-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center animate-fade-in p-4 sm:p-0">
      <div class="bg-white w-full max-w-md rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-up">
        
        <!-- Botón de Cerrar -->
        <button (click)="close()" class="absolute top-4 right-4 w-11 h-11 bg-gray-100 text-xl hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold transition-colors z-10">
          &times;
        </button>

        <!-- Cabecera -->
        <div class="p-6 pb-4 border-b border-gray-100 text-center relative">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          </div>
          <h2 class="text-xl font-black text-primary tracking-tight">Dividir Cuenta</h2>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">Total: \${{ total | number:'1.2-2' }}</p>
        </div>

        <div class="p-6 flex-1 overflow-y-auto">
          <!-- Paso 1: Modo -->
          @if (!mode()) {
            <div class="space-y-3 animate-fade-in">
              <h3 class="text-sm font-bold text-gray-800 text-center mb-4">¿Cómo quieres dividir?</h3>
              
              <button (click)="setMode('equal')" class="w-full bg-surface border border-gray-100 hover:border-accent hover:bg-accent/5 p-4 rounded-2xl flex items-center gap-4 transition-all text-left">
                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-accent font-black">÷</div>
                <div>
                  <p class="font-bold text-primary">Partes iguales</p>
                  <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Ej: 3 personas pagan lo mismo</p>
                </div>
              </button>

              <button (click)="setMode('percentage')" class="w-full bg-surface border border-gray-100 hover:border-accent hover:bg-accent/5 p-4 rounded-2xl flex items-center gap-4 transition-all text-left">
                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-accent font-black">%</div>
                <div>
                  <p class="font-bold text-primary">Por porcentaje</p>
                  <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Ej: Yo pago el 30%</p>
                </div>
              </button>

              <button (click)="setMode('custom')" class="w-full bg-surface border border-gray-100 hover:border-accent hover:bg-accent/5 p-4 rounded-2xl flex items-center gap-4 transition-all text-left">
                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-accent font-black">$</div>
                <div>
                  <p class="font-bold text-primary">Monto específico</p>
                  <p class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Ej: Yo pago $500</p>
                </div>
              </button>
            </div>
          }

          <!-- Paso 2: Calculadora -->
          @if (mode()) {
            <div class="animate-fade-in flex flex-col h-full">
              
              <!-- Selector Partes Iguales -->
              @if (mode() === 'equal') {
                <div class="text-center mb-6">
                  <h3 class="text-sm font-bold text-gray-800 mb-4">¿Entre cuántos?</h3>
                  <div class="flex items-center justify-center gap-4">
                    <button (click)="people.set(Math.max(2, people() - 1))" class="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xl transition-colors">-</button>
                    <span class="text-4xl font-black text-primary w-12">{{ people() }}</span>
                    <button (click)="people.set(people() + 1)" class="w-12 h-12 rounded-full bg-accent/10 hover:bg-accent/20 text-accent font-black text-xl transition-colors">+</button>
                  </div>
                </div>
              }

              <!-- Selector Porcentaje -->
              @if (mode() === 'percentage') {
                <div class="text-center mb-6">
                  <h3 class="text-sm font-bold text-gray-800 mb-4">Ingresa el porcentaje</h3>
                  <div class="flex items-center justify-center gap-2">
                    <input type="number" [(ngModel)]="percentageInput" (ngModelChange)="updateFromPercentage($event)" class="w-24 text-center text-3xl font-black text-primary bg-surface border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all">
                    <span class="text-2xl font-black text-gray-400">%</span>
                  </div>
                  <div class="flex gap-2 justify-center mt-4">
                    <button (click)="percentageInput = 10; updateFromPercentage(10)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors">10%</button>
                    <button (click)="percentageInput = 25; updateFromPercentage(25)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors">25%</button>
                    <button (click)="percentageInput = 50; updateFromPercentage(50)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors">50%</button>
                  </div>
                </div>
              }

              <!-- Selector Monto -->
              @if (mode() === 'custom') {
                <div class="text-center mb-6">
                  <h3 class="text-sm font-bold text-gray-800 mb-4">Ingresa el monto a pagar</h3>
                  <div class="flex items-center justify-center gap-2">
                    <span class="text-2xl font-black text-gray-400">$</span>
                    <input type="number" [(ngModel)]="amountInput" (ngModelChange)="updateFromAmount($event)" class="w-32 text-center text-3xl font-black text-primary bg-surface border-2 border-gray-100 rounded-xl p-2 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all">
                  </div>
                </div>
              }

              <!-- Resultado -->
              <div class="mt-auto bg-gray-50 border border-gray-100 p-5 rounded-2xl text-center shadow-inner">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">
                  {{ mode() === 'equal' ? 'Cada uno paga' : 'Te toca pagar' }}
                </span>
                <div class="text-4xl font-black text-accent">\${{ calculatedAmount() | number:'1.2-2' }}</div>
                
                @if (mode() !== 'equal' && remainingAmount() > 0) {
                  <p class="text-xs font-semibold text-gray-500 mt-3">Quedan <span class="font-bold text-gray-700">\${{ remainingAmount() | number:'1.2-2' }}</span> para el resto.</p>
                }
              </div>

              <!-- Acciones -->
              <div class="grid grid-cols-2 gap-3 mt-6">
                <button (click)="mode.set(null)" class="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black transition-colors active:scale-95">
                  Cambiar
                </button>
                <button (click)="close()" class="py-3 bg-primary hover:bg-[#1a233b] text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 transition-all active:scale-95">
                  Listo
                </button>
              </div>

            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SplitCheckWizardComponent {
  Math = Math;

  @Input() total: number = 0;
  @Output() closeWizard = new EventEmitter<void>();

  mode = signal<SplitMode>(null);
  
  // Equal
  people = signal(2);
  
  // Percentage / Custom
  percentageInput = 50;
  amountInput = 0;

  calculatedAmount = computed(() => {
    if (!this.mode()) return 0;
    if (this.mode() === 'equal') {
      return this.total / this.people();
    }
    return this.amountInput;
  });

  remainingAmount = computed(() => {
    return Math.max(0, this.total - this.calculatedAmount());
  });

  setMode(m: SplitMode) {
    this.mode.set(m);
    if (m === 'percentage') {
      this.updateFromPercentage(50);
      this.percentageInput = 50;
    }
    if (m === 'custom') {
      this.amountInput = Math.floor(this.total / 2);
    }
  }

  updateFromPercentage(p: number) {
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    this.amountInput = this.total * (p / 100);
  }

  updateFromAmount(a: number) {
    if (a < 0) a = 0;
    if (a > this.total) a = this.total;
    this.amountInput = a;
    this.percentageInput = Math.round((a / this.total) * 100);
  }

  close() {
    this.closeWizard.emit();
  }
}
