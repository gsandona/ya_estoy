import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SplitMode = 'equal' | 'percentage' | 'custom';

@Component({
  selector: 'app-split-check-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center animate-fade-in p-4 sm:p-0">
      <div class="bg-white w-full max-w-md rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-up border border-gray-200">
        
        <!-- Botón de Cerrar -->
        <button (click)="close()" class="absolute top-4 right-4 w-10 h-10 bg-gray-100 text-xl hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold transition-colors z-10">
          &times;
        </button>

        <!-- Cabecera con Total Editable -->
        <div class="p-6 pb-4 border-b border-gray-200 text-center relative bg-slate-50">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 mb-2 shadow-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Dividir Cuenta</h2>
          <div class="mt-2 max-w-[220px] mx-auto relative flex items-center">
            <span class="absolute left-3 font-black text-slate-500 text-sm">$</span>
            <input 
              type="number" 
              min="0"
              [ngModel]="activeTotal()" 
              (ngModelChange)="onTotalChange($event)"
              placeholder="Monto total"
              class="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-300 focus:border-slate-900 rounded-xl text-center font-black text-slate-900 text-base outline-none">
          </div>
        </div>

        <div class="p-6 flex-1 overflow-y-auto space-y-5">
          <!-- Selector de Modo -->
          <div class="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button type="button" (click)="setMode('equal')" 
                    [ngClass]="mode() === 'equal' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-700 hover:bg-slate-200/70 font-bold'"
                    class="py-2 px-2 rounded-xl text-xs transition-all">
              ÷ Iguales
            </button>
            <button type="button" (click)="setMode('percentage')" 
                    [ngClass]="mode() === 'percentage' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-700 hover:bg-slate-200/70 font-bold'"
                    class="py-2 px-2 rounded-xl text-xs transition-all">
              % Porcentaje
            </button>
            <button type="button" (click)="setMode('custom')" 
                    [ngClass]="mode() === 'custom' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-700 hover:bg-slate-200/70 font-bold'"
                    class="py-2 px-2 rounded-xl text-xs transition-all">
              $ Monto
            </button>
          </div>

          <!-- Selector Partes Iguales -->
          @if (mode() === 'equal') {
            <div class="text-center">
              <h3 class="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">¿Entre cuántas personas?</h3>
              <div class="flex items-center justify-center gap-4">
                <button type="button" (click)="people.set(Math.max(1, people() - 1))" class="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xl transition-colors">-</button>
                <span class="text-4xl font-black text-slate-900 w-14">{{ people() }}</span>
                <button type="button" (click)="people.set(people() + 1)" class="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xl transition-colors">+</button>
              </div>
            </div>
          }

          <!-- Selector Porcentaje -->
          @if (mode() === 'percentage') {
            <div class="text-center">
              <h3 class="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">Ingresa el porcentaje</h3>
              <div class="flex items-center justify-center gap-2">
                <input type="number" [(ngModel)]="percentageInput" (ngModelChange)="updateFromPercentage($event)" class="w-24 text-center text-3xl font-black text-slate-900 bg-gray-50 border-2 border-gray-300 rounded-xl p-2 outline-none focus:border-slate-900 transition-all">
                <span class="text-2xl font-black text-gray-500">%</span>
              </div>
              <div class="flex gap-2 justify-center mt-3">
                @for (pct of [10, 25, 33, 50]; track pct) {
                  <button type="button" (click)="percentageInput = pct; updateFromPercentage(pct)" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 transition-colors">{{ pct }}%</button>
                }
              </div>
            </div>
          }

          <!-- Selector Monto -->
          @if (mode() === 'custom') {
            <div class="text-center">
              <h3 class="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">Ingresa el monto a pagar</h3>
              <div class="flex items-center justify-center gap-2">
                <span class="text-2xl font-black text-gray-500">$</span>
                <input type="number" [(ngModel)]="amountInput" (ngModelChange)="updateFromAmount($event)" class="w-36 text-center text-3xl font-black text-slate-900 bg-gray-50 border-2 border-gray-300 rounded-xl p-2 outline-none focus:border-slate-900 transition-all">
              </div>
            </div>
          }

          <!-- Resultado -->
          <div class="bg-slate-900 text-white p-5 rounded-2xl text-center shadow-lg">
            <span class="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 block">
              {{ mode() === 'equal' ? 'Cada uno paga' : 'Te toca pagar' }}
            </span>
            <div class="text-4xl font-black text-white font-serif">\${{ calculatedAmount() | number:'1.0-0' }}</div>
            
            @if (mode() !== 'equal' && remainingAmount() > 0) {
              <p class="text-xs font-semibold text-slate-300 mt-3">Quedan <span class="font-bold text-amber-400">\${{ remainingAmount() | number:'1.0-0' }}</span> para el resto.</p>
            }
          </div>

          <!-- Acciones -->
          <button type="button" (click)="close()" class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95">
            Listo
          </button>
        </div>
      </div>
    </div>
  `
})
export class SplitCheckWizardComponent implements OnInit {
  Math = Math;

  @Input() total: number = 0;
  @Output() closeWizard = new EventEmitter<void>();

  customTotal = signal<number | null>(null);
  mode = signal<SplitMode>('equal');
  people = signal(2);
  
  percentageInput = 50;
  amountInput = 0;

  activeTotal = computed(() => {
    return this.customTotal() !== null ? this.customTotal()! : (this.total || 0);
  });

  calculatedAmount = computed(() => {
    const tot = this.activeTotal();
    if (this.mode() === 'equal') {
      return tot / Math.max(1, this.people());
    }
    if (this.mode() === 'percentage') {
      return tot * (Math.max(0, Math.min(100, this.percentageInput || 0)) / 100);
    }
    return this.amountInput || 0;
  });

  remainingAmount = computed(() => {
    return Math.max(0, this.activeTotal() - this.calculatedAmount());
  });

  ngOnInit() {
    if (this.total > 0) {
      this.amountInput = Math.floor(this.total / 2);
    }
  }

  onTotalChange(val: any) {
    const num = Number(val);
    this.customTotal.set(isNaN(num) || num < 0 ? 0 : num);
  }

  setMode(m: SplitMode) {
    this.mode.set(m);
    const tot = this.activeTotal();
    if (m === 'percentage') {
      this.percentageInput = 50;
      this.updateFromPercentage(50);
    }
    if (m === 'custom') {
      this.amountInput = Math.floor(tot / 2);
    }
  }

  updateFromPercentage(p: number) {
    if (p < 0) p = 0;
    if (p > 100) p = 100;
    this.amountInput = Math.round(this.activeTotal() * (p / 100));
  }

  updateFromAmount(a: number) {
    const tot = this.activeTotal();
    if (a < 0) a = 0;
    if (tot > 0 && a > tot) a = tot;
    this.amountInput = a;
    this.percentageInput = tot > 0 ? Math.round((a / tot) * 100) : 0;
  }

  close() {
    this.closeWizard.emit();
  }
}
