import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../../core/services/signalr.service';
import { MesaTask } from '../../../../core/models/task.model';
import { AdminDataService, AdminMesa } from '../../config/admin-data.service';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RestauranteService } from '../../../../core/services/restaurante.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
// ... (omitted changing imports array to not overwrite metadata incorrectly)
  selector: 'app-admin-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">↻</span> Sin conexión. Intentando reconectar al servidor...
        </div>
      }
      

      @if (activeTab() === 'mesas') {
        <!-- Panel de Mesas (Control y Administración) -->
        <div class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div class="flex items-center gap-2 cursor-pointer select-none" (click)="collapseMesas.set(!collapseMesas())">
              <div>
                <h2 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                  {{ lang.translations().tables.title }}
                  <span class="text-xs text-gray-400 inline-block transition-transform duration-300" [class.rotate-180]="collapseMesas()">▲</span>
                </h2>
                <p class="text-xs text-gray-400 font-medium mt-0.5">{{ lang.translations().tables.subtitle }}</p>
              </div>
            </div>
            @if (!collapseMesas() && (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin')) {
              <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#1a233b] transition-all flex items-center gap-1">
                <span>+</span> {{ lang.translations().tables.create }}
              </button>
            }
          </div>

          @if (!collapseMesas()) {
            @if (showForm()) {
              <div class="bg-surface p-5 rounded-3xl mb-6 border border-gray-200 shadow-inner animate-fade-in">
                <h3 class="text-sm font-black text-gray-700 mb-3 flex items-center gap-1">
                  {{ editingId() ? lang.translations().tables.edit : lang.translations().tables.new }}
                </h3>
                <form #mesaForm="ngForm" class="flex flex-col md:flex-row gap-4 items-end" autocomplete="off" (submit)="saveForm($event)">
                  <div class="w-full md:w-32 relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.number }}</label>
                    <input type="number" [(ngModel)]="formData.numero" name="numero" #numCtrl="ngModel" 
                           min="1" max="999"
                           class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-bold" required>
                    @if (numCtrl.invalid && numCtrl.touched) {
                      <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Rango 1-999</span>
                    }
                  </div>
                  <div class="flex-1 w-full relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.location }}</label>
                    <input type="text" [(ngModel)]="formData.ubicacion" name="ubicacion" #ubicCtrl="ngModel"
                           maxlength="100" placeholder="Ej: Terraza Norte" 
                           class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                  </div>
                  <div class="flex-1 w-full relative">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">{{ lang.translations().tables.waiter }}</label>
                    <select [(ngModel)]="formData.mozoId" name="mozoId" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                      <option [value]="null">{{ lang.translations().tables.unassigned }}</option>
                      @for (mozo of dataService.mozos(); track mozo.id) {
                        <option [value]="mozo.id">{{ mozo.username }}</option>
                      }
                    </select>
                  </div>
                  <div class="flex gap-2 w-full md:w-auto">
                    <button type="button" (click)="showForm.set(false)" class="flex-1 md:flex-none bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition-colors">{{ lang.translations().common.cancel }}</button>
                    <button type="submit" [disabled]="mesaForm.invalid" class="flex-1 md:flex-none bg-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ editingId() ? lang.translations().common.update : lang.translations().common.save }}
                    </button>
                  </div>
                </form>
              </div>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for(mesa of myMesas(); track mesa.id) {
                @if (mesa.codigoAcceso) {
                  <!-- Active Mesa Card -->
                  <div class="border border-green-200/80 rounded-3xl p-5 flex flex-col justify-between hover:border-green-400 transition relative group bg-white shadow-sm ring-4 ring-green-500/5">
                    <div class="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button (click)="openQrModal(mesa)" class="text-green-700 hover:text-green-900 font-bold text-[10px] bg-green-100/60 px-2.5 py-1 rounded-xl transition-colors border border-green-200/50">QR</button>
                      @if (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
                        <button (click)="openEditForm(mesa)" class="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] bg-indigo-50 px-2.5 py-1 rounded-xl transition-colors border border-indigo-100">{{ lang.translations().common.edit }}</button>
                        <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 px-2.5 py-1 rounded-xl transition-colors border border-red-100">{{ lang.translations().common.delete }}</button>
                      }
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg bg-green-500/10 text-green-700 shadow-inner">
                          {{ mesa.numero }}
                        </div>
                        <div>
                          <h3 class="font-black text-gray-800 text-sm">{{ lang.translations().kitchen.table }} {{ mesa.numero }}</h3>
                          <p class="text-[10px] text-gray-400 font-semibold truncate max-w-[120px]">{{ mesa.ubicacion || lang.translations().tables.noLocation }}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div class="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 flex flex-col justify-center items-center">
                          <span class="text-[8px] font-black text-emerald-600 uppercase tracking-wider">{{ lang.translations().tables.pinAccess }}</span>
                          <span class="text-sm font-black tracking-wider text-emerald-700">{{ mesa.codigoAcceso }}</span>
                        </div>

                        <div (click)="openBillingModal(mesa)" class="bg-slate-50 border border-slate-100 rounded-2xl p-2 flex flex-col justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all select-none">
                          <span class="text-[8px] font-black text-gray-400 uppercase tracking-wider text-center">{{ lang.translations().tables.consumed }}</span>
                          <div class="flex gap-1 items-center justify-center mt-0.5">
                            <span class="text-[10px] text-gray-500 font-black">$</span>
                            <span class="text-xs font-black text-gray-800">{{ mesa.montoConsumo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100/80 space-y-3">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-semibold text-gray-400">{{ lang.translations().tables.waiter }}:</span>
                        <span class="font-bold px-2 py-0.5 bg-slate-100 rounded-md text-primary truncate max-w-[120px]">
                          {{ getMozoUsername(mesa.mozoId) }}
                        </span>
                      </div>

                      <button (click)="openBillingModal(mesa)" class="bg-red-500 hover:bg-red-600 text-white py-2 rounded-2xl text-xs font-black shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.25)] transition-all active:scale-95 w-full flex items-center justify-center gap-1">
                        {{ lang.translations().tables.closeTable }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Inactive Mesa Card -->
                  <div class="border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-300 transition relative group bg-white shadow-sm hover:shadow-md">
                    <div class="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button (click)="openQrModal(mesa)" class="text-slate-600 hover:text-slate-800 font-bold text-[10px] bg-slate-100 px-2.5 py-1 rounded-xl transition-colors">QR</button>
                      @if (auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
                        <button (click)="openEditForm(mesa)" class="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] bg-indigo-50 px-2.5 py-1 rounded-xl transition-colors border border-indigo-100">{{ lang.translations().common.edit }}</button>
                        <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-500 hover:text-red-700 font-bold text-[10px] bg-red-50 px-2.5 py-1 rounded-xl transition-colors border border-red-100">{{ lang.translations().common.delete }}</button>
                      }
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg bg-slate-100 text-slate-400">
                          {{ mesa.numero }}
                        </div>
                        <div>
                          <h3 class="font-black text-gray-800 text-sm">{{ lang.translations().kitchen.table }} {{ mesa.numero }}</h3>
                          <p class="text-[10px] text-gray-400 font-semibold truncate max-w-[120px]">{{ mesa.ubicacion || lang.translations().tables.noLocation }}</p>
                        </div>
                      </div>

                      <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                        <span class="text-[10px] font-bold text-slate-400">{{ lang.translations().tables.available }}</span>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-semibold text-gray-400">{{ lang.translations().tables.waiter }}:</span>
                        <span class="font-bold px-2 py-0.5 bg-slate-100 rounded-md text-primary truncate max-w-[120px]">
                          {{ getMozoUsername(mesa.mozoId) }}
                        </span>
                      </div>

                      <button (click)="abrirMesa(mesa.id)" class="bg-primary hover:bg-[#1a233b] text-white py-2 rounded-2xl text-xs font-black shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.25)] transition-all active:scale-95 w-full flex items-center justify-center gap-1">
                        {{ lang.translations().tables.openTable }}
                      </button>
                    </div>
                  </div>
                }
              } @empty {
                <p class="col-span-full text-center py-6 text-gray-400 text-sm">{{ lang.translations().tables.emptyList }}</p>
              }
            </div>

            @if(auth.currentUser()?.role === 'Admin' || auth.currentUser()?.role === 'SuperAdmin') {
              <div class="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-400 font-medium text-center sm:text-left">Reorganiza el salón en memoria y súbelo al servidor para aplicar los cambios a los códigos QR y mozos asignados.</p>
                <div class="flex items-center gap-3">
                  @if (saveSuccess()) {
                    <span class="text-green-500 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-xl animate-pulse">¡Guardado!</span>
                  }
                  <button 
                    (click)="syncBackend()"
                    [disabled]="isSaving()"
                    class="bg-[#10b981] text-white px-6 py-2.5 rounded-xl font-black shadow-[0_4px_15px_rgb(16,185,129,0.3)] hover:bg-[#0da473] transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2 text-xs">
                    @if (isSaving()) {
                      <span class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Sincronizando...
                    } @else {
                      Guardar y Publicar
                    }
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Modal POS de Facturación y Consumos Extra (Caja) -->
    @if (showBillingModal() && billingMesa()) {
      <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-4xl w-full border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative max-h-[90vh] overflow-y-auto text-primary">
          <button (click)="showBillingModal.set(false)" class="absolute top-4 right-4 w-11 h-11 flex text-lg items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 font-black shadow-sm transition-all cursor-pointer">&times;</button>
          
          <!-- Columna Izquierda: Panel de Control de Cargos -->
          <div class="space-y-6">
            <div>
              <h2 class="text-xl font-black text-gray-800 tracking-tight">Cobro y Consumo</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Mesa {{ billingMesa()?.numero }} • PIN: {{ billingMesa()?.codigoAcceso }}
                • Mozo: {{ billingMesa()?.mozo?.nombreCompleto || billingMesa()?.mozo?.username || 'Sin mozo' }}
              </p>
            </div>

            <!-- Formulario 1: Agregar Plato de la Carta -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h3 class="text-xs font-black text-gray-700">Agregar plato del menú</h3>
              <div class="flex gap-2">
                <select [(ngModel)]="selectedMenuItemId" class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none">
                  <option value="">Selecciona un plato...</option>
                  @for (item of dataService.menuItems(); track item.id) {
                    @if (item.activo) {
                      <option [value]="item.id">{{ item.nombre }} (\${{ item.precio }})</option>
                    }
                  }
                </select>
                <input type="number" [(ngModel)]="extraQuantity" min="1" class="w-16 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-center outline-none">
                <button (click)="addExtraItem()" class="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-opacity-90 active:scale-95 transition-all shadow-sm">
                  +
                </button>
              </div>
            </div>

            <!-- Formulario 2: Agregar Cargo Manual -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h3 class="text-xs font-black text-gray-700">Agregar cargo manual</h3>
              <div class="grid grid-cols-3 gap-2">
                <input type="text" [(ngModel)]="manualChargeDescription" placeholder="Ej: Servicio de mesa" class="col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none text-gray-800">
                <input type="number" [(ngModel)]="manualChargeMonto" placeholder="$ Monto" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-center outline-none text-gray-800">
              </div>
              <button (click)="addManualCharge()" class="w-full bg-primary text-white py-2 rounded-xl text-xs font-black hover:bg-opacity-90 active:scale-95 transition-all shadow-sm">
                Agregar Cargo Extra
              </button>
            </div>

            <!-- Botones de Acción de Consumo -->
            <div class="pt-4 border-t border-gray-100 flex gap-2">
              <button (click)="showBillingModal.set(false)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl text-xs font-black transition-all active:scale-95">
                Volver
              </button>
              @if (extraItems().length > 0 || manualCharges().length > 0) {
                <button (click)="confirmarCobro()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                  Guardar Extras
                </button>
              }
            </div>
          </div>

          <!-- Columna Derecha: Ticket Previo de Consumo -->
          <div class="bg-gray-50 border-2 border-dashed border-gray-200 p-5 rounded-3xl flex flex-col justify-between font-mono text-[11px] text-primary/95 min-h-[350px]">
            <div class="space-y-4">
              <!-- Encabezado Ticket -->
              <div class="text-center pb-3 border-b border-dashed border-gray-200 space-y-1">
                <span class="text-xs font-black tracking-tight block">TICKET PREVIO</span>
                <span class="text-[9px] text-gray-500 block">Mesa {{ billingMesa()?.numero }} • PIN {{ billingMesa()?.codigoAcceso }}</span>
              </div>

              <!-- Listado de Consumos (Existentes + Nuevos) -->
              <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                <!-- Consumos de la base de datos -->
                @for (item of billingItems(); track item.id) {
                  <div class="flex justify-between items-start gap-1">
                    <div class="flex-1 text-left">
                      <span class="font-bold block text-gray-800">{{ item.nombre }}</span>
                      <span class="text-[9px] text-gray-500 font-semibold">{{ item.cantidad }} x \${{ item.precioUnitario | number:'1.2-2' }}</span>
                    </div>
                    <span class="font-black text-gray-800">\${{ item.total | number:'1.2-2' }}</span>
                  </div>
                }

                <!-- Consumos extras locales -->
                @for (item of extraItems(); track $index) {
                  <div class="flex justify-between items-start gap-1 bg-emerald-500/5 p-1 rounded">
                    <div class="flex-1 text-left">
                      <span class="font-black text-emerald-800 block">* {{ item.nombre }} (Extra)</span>
                      <span class="text-[9px] text-emerald-600 font-semibold">{{ item.cantidad }} x \${{ item.precioUnitario | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-black text-emerald-800">
                      <span>\${{ item.total | number:'1.2-2' }}</span>
                      <button (click)="removeExtraItem($index)" class="text-red-500 font-black hover:text-red-700 active:scale-90 text-[13px] line-none select-none">&times;</button>
                    </div>
                  </div>
                }

                <!-- Cargos manuales locales -->
                @for (charge of manualCharges(); track $index) {
                  <div class="flex justify-between items-start gap-1 bg-emerald-500/5 p-1 rounded">
                    <div class="flex-1 text-left">
                      <span class="font-black text-emerald-800 block">* {{ charge.descripcion }} (Cargo)</span>
                      <span class="text-[9px] text-emerald-600 font-semibold">1 x \${{ charge.monto | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-black text-emerald-800">
                      <span>\${{ charge.monto | number:'1.2-2' }}</span>
                      <button (click)="removeManualCharge($index)" class="text-red-500 font-black hover:text-red-700 active:scale-90 text-[13px] line-none select-none">&times;</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Footer del Ticket con Total y Cierre -->
            <div class="pt-4 border-t border-dashed border-gray-200 space-y-4">
              <div class="flex justify-between items-center text-xs font-black">
                <span>TOTAL A PAGAR</span>
                <span class="text-emerald-700 text-sm">\${{ getPreviewTotal() | number:'1.2-2' }}</span>
              </div>

              <!-- Botones de Acción -->
              <div class="flex gap-3">
                <button (click)="imprimirTicketFactura()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-slate-250">
                  🖨️ Imprimir
                </button>
                <button (click)="showConfirmCloseModal.set(true)" class="flex-[2] bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-1">
                  🧾 Cerrar Mesa
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    }

    <!-- Confirm Close Modal -->
    @if (showConfirmCloseModal()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-150 shadow-2xl space-y-5 animate-scale-up">
          <div class="pb-2 border-b border-gray-100">
            <h3 class="text-lg font-black text-gray-800">Confirmar Cierre de Cuenta</h3>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              Mesa {{ billingMesa()?.numero }} • Mozo: {{ billingMesa()?.mozo?.nombreCompleto || billingMesa()?.mozo?.username || 'Sin mozo' }}
            </p>
          </div>

          <div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            <!-- Render already saved billing items -->
            @for (item of billingItems(); track item.id) {
              <div class="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>{{ item.cantidad }}x {{ item.nombre }}</span>
                <span>\${{ item.total | number:'1.2-2' }}</span>
              </div>
            }
            
            <!-- Render pending extra items -->
            @for (item of extraItems(); track item.menuItemId) {
              <div class="flex justify-between items-center text-xs font-bold text-accent">
                <span>{{ item.cantidad }}x {{ item.nombre }} (Extra)</span>
                <span>\${{ item.total | number:'1.2-2' }}</span>
              </div>
            }

            <!-- Render pending manual charges -->
            @for (charge of manualCharges(); track charge.descripcion) {
              <div class="flex justify-between items-center text-xs font-bold text-accent">
                <span>1x {{ charge.descripcion }} (Manual)</span>
                <span>\${{ charge.monto | number:'1.2-2' }}</span>
              </div>
            }
          </div>

          <div class="pt-4 border-t border-dashed border-gray-200">
            <div class="flex justify-between items-center font-black text-gray-800 text-sm">
              <span>TOTAL FACTURA</span>
              <span class="text-emerald-700 text-base">\${{ getPreviewTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button (click)="showConfirmCloseModal.set(false)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-250 px-5 py-3 rounded-xl font-bold text-xs">
              Cancelar
            </button>
            <button (click)="ejecutarCierreYFacturacion()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all">
              Confirmar Pago y Facturar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class AdminMesasComponent {
  activeTab = signal<'tareas' | 'mesas'>('tareas');

  service = inject(SignalrService);
  dataService = inject(AdminDataService);
  auth = inject(AuthService);
  http = inject(HttpClient);
  lang = inject(LanguageService);
  private restauranteService = inject(RestauranteService);
  private tenantContext = inject(TenantContextService);
  
  currentDate = new Date();

  // Signals para Facturación y Consumos Extra (POS Caja)
  showBillingModal = signal(false);
  showConfirmCloseModal = signal(false);
  billingMesa = signal<AdminMesa | null>(null);
  billingItems = signal<any[]>([]);
  billingTotal = signal<number>(0);
  extraItems = signal<any[]>([]);
  manualCharges = signal<any[]>([]);
  selectedMenuItemId = '';
  extraQuantity = 1;
  manualChargeDescription = '';
  manualChargeMonto = 0;

  // Signals para Filtros
  filterType = signal<string>('All');
  filterMesa = signal<string>('All');
  filterMozo = signal<string>('All');

  // Asignaciones e inline abm
  showReassignModal = signal<string | null>(null);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  saveSuccess = signal(false);
  formData: AdminMesa = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };
  showQrModal = signal<AdminMesa | null>(null);
  restauranteNombre = signal<string>('restaurante');
  collapseMesas = signal(false);
  collapseTasks = signal(false);
  showControlMesas = signal(false);
  selectedTaskForView = signal<MesaTask | null>(null);

  myPendingTasks = computed(() => {
    let allTasks = this.service.pendingTasks();
    const userRole = this.auth.currentUser()?.role;
    const userId = this.auth.currentUser()?.id;

    // Filtros de Admin
    if (this.filterType() !== 'All') allTasks = allTasks.filter((t: any) => t.type === this.filterType());
    if (this.filterMesa() !== 'All') allTasks = allTasks.filter((t: any) => t.tableId.toString() === this.filterMesa());
    if (this.filterMozo() !== 'All') allTasks = allTasks.filter((t: any) => t.assignedMozoId === this.filterMozo() || (!t.assignedMozoId && this.dataService.mesas().find((m: any) => m.numero === t.tableId)?.mozoId === this.filterMozo()));

    let filtered = allTasks;
    if (userRole !== 'Admin') {
      // Filtro de Mozo (mis mesas o tareas reasignadas a mí)
      const myMesasNumeros = this.myMesas().map((m: any) => m.numero);
      filtered = allTasks.filter((t: any) => t.assignedMozoId === userId || (!t.assignedMozoId && myMesasNumeros.includes(t.tableId)));
    }

    // Ordenar con prioridad: Listo -> Recibido/SinEstado -> Cuenta -> Llamado -> EnPreparacion
    return [...filtered].sort((a, b) => {
      const getPriority = (t: MesaTask) => {
        if (t.type === 'Pedido') {
          if (t.pedidoEstado === 'Listo') return 1;
          if (t.pedidoEstado === 'Recibido' || !t.pedidoEstado) return 2;
          if (t.pedidoEstado === 'EnPreparacion') return 5;
        }
        if (t.type === 'Cuenta') return 3;
        if (t.type === 'Llamado') return 4;
        return 6;
      };
      const prioA = getPriority(a);
      const prioB = getPriority(b);
      if (prioA !== prioB) return prioA - prioB;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  });

  myMesas = computed(() => {
    const userRole = this.auth.currentUser()?.role;
    const userId = this.auth.currentUser()?.id;
    if (userRole === 'Admin') return this.dataService.mesas();
    return this.dataService.mesas().filter((m: any) => m.mozoId === userId);
  });

  constructor() {
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    const currentUser = this.auth.currentUser();
    if (currentUser && currentUser.restauranteNombre) {
      this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
    }

    this.tenantContext.tenantId$.subscribe(tenantId => {
      if (tenantId) {
        if (currentUser && currentUser.restauranteId === tenantId && currentUser.restauranteNombre) {
          this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
          return;
        }

        this.restauranteService.getById(tenantId).subscribe({
          next: (rest) => {
            if (rest && rest.nombre) {
              this.restauranteNombre.set(this.slugify(rest.nombre));
            }
          },
          error: (err) => {
            console.error('Error al obtener restaurante por id, usando fallback:', err);
            if (currentUser && currentUser.restauranteNombre) {
              this.restauranteNombre.set(this.slugify(currentUser.restauranteNombre));
            }
          }
        });
      } else {
        this.restauranteNombre.set('restaurante');
      }
    });
  }

  slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  openQrModal(mesa: AdminMesa) {
    this.showQrModal.set(mesa);
  }

  closeQrModal() {
    this.showQrModal.set(null);
  }

  getQrImageUrl(mesa: AdminMesa) {
    const baseUrl = window.location.origin;
    const targetUrl = `${baseUrl}/mesa/${this.restauranteNombre()}/${mesa.numero}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(targetUrl)}`;
  }

  imprimirQr() {
    if (!this.showQrModal()) return;
    const imgUrl = this.getQrImageUrl(this.showQrModal()!);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Imprimir QR Mesa ${this.showQrModal()?.numero}</title></head>
          <body style="text-align: center; font-family: sans-serif; padding-top: 50px;">
            <h1>Mesa ${this.showQrModal()?.numero}</h1>
            <p>${this.showQrModal()?.ubicacion || 'Sin ubicación'}</p>
            <img src="${imgUrl}" style="width: 300px; height: 300px; border: 2px solid #000; padding: 10px; border-radius: 10px;" />
            <br/><br/>
            <p style="color: #666;">Escanea para pedir</p>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };
    this.showForm.set(true);
  }

  openEditForm(mesa: AdminMesa) {
    this.editingId.set(mesa.id);
    this.formData = { ...mesa };
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    if (this.editingId()) {
      this.dataService.updateMesa(this.formData);
    } else {
      this.dataService.addMesa({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.mesas();
    
    this.http.post(`${environment.apiUrl}/api/mesas/bulk`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        console.error('El backend rechazó el guardado:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend (' + environment.apiUrl + '/api/mesas/bulk) rechazó tu pedido de resincronización.');
      }
    });
  }

  getMozoUsername(mozoId: string | null): string {
    if (!mozoId) return 'Sin asignar';
    const mozo = this.dataService.mozos().find((m: any) => m.id === mozoId);
    return mozo?.username || 'Sin asignar';
  }

  getMinutesElapsed(date: Date): number {
    const diffMs = this.currentDate.getTime() - new Date(date).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  getTypeBgClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Pedido': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Cuenta': return 'bg-accent/10 text-accent border border-accent/20';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getTypeTagClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-100 text-yellow-700';
      case 'Pedido': return 'bg-blue-100 text-blue-700';
      case 'Cuenta': return 'bg-accent/10 text-accent';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getSideBarClass(type: string): string {
    switch(type) {
      case 'Llamado': return 'bg-yellow-400';
      case 'Pedido': return 'bg-blue-400';
      case 'Cuenta': return 'bg-accent';
      default: return 'bg-gray-300';
    }
  }

  completar(taskId: string) {
    this.service.completeTask(taskId);
  }

  aprobarPedido(taskId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.post(`${environment.apiUrl}/api/pedido/${taskId}/aprobar`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // Tarea completada y retirada automáticamente por SignalR
      },
      error: (err) => console.error('Error al aprobar pedido:', err)
    });
  }

  entregarPedido(pedidoId: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.post(`${environment.apiUrl}/api/pedido/${pedidoId}/estado`, { estado: 'Entregado' }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // La actualización de SignalR retirará la tarea automáticamente
      },
      error: (err) => console.error('Error al entregar pedido:', err)
    });
  }

  actualizarMontoConsumo(mesaId: string, event: any) {
    const valueStr = event.target.value;
    const monto = valueStr === '' ? null : parseFloat(valueStr);
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/monto`, monto, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    }).subscribe({
      next: (res: any) => {
        // Actualizar localmente la mesa en el dataService
        this.dataService.mesas.update((mesas: any) => 
          mesas.map((m: any) => m.id === mesaId ? { ...m, montoConsumo: res.montoConsumo } : m)
        );
      },
      error: (err) => console.error('Error al actualizar monto consumo:', err)
    });
  }

  async abrirMesa(mesaId: string) {
    try {
      this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/abrir`, null).subscribe({
        next: () => this.dataService.refreshAll(),
        error: (e) => console.error(e)
      });
    } catch(e) { console.error(e); }
  }

  async cerrarMesa(mesaId: string) {
    this.showConfirmCloseModal.set(true);
  }

  async ejecutarCierreYFacturacion() {
    const mesa = this.billingMesa();
    if (!mesa) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Check if there are pending extra items or manual charges to save first
    const hasUnsavedExtras = this.extraItems().length > 0 || this.manualCharges().length > 0;

    if (hasUnsavedExtras) {
      const payload = {
        items: [
          ...this.extraItems().map((i: any) => ({ menuItemId: i.menuItemId, cantidad: i.cantidad })),
          ...this.manualCharges().map((c: any) => ({ descripcion: c.descripcion, monto: c.monto }))
        ]
      };

      this.http.post<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/agregar-consumo`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      }).subscribe({
        next: () => {
          this.procederConCerrarMesaAPI(mesa.id);
        },
        error: (err) => {
          console.error('Error al guardar consumos antes de cerrar:', err);
          alert('Hubo un error al guardar los consumos extras. Cierre cancelado.');
        }
      });
    } else {
      this.procederConCerrarMesaAPI(mesa.id);
    }
  }

  private procederConCerrarMesaAPI(mesaId: string) {
    const token = localStorage.getItem('auth_token');
    this.http.post(`${environment.apiUrl}/api/mesas/${mesaId}/cerrar`, null, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.dataService.refreshAll();
        this.showConfirmCloseModal.set(false);
        this.showBillingModal.set(false);
        this.billingMesa.set(null);
      },
      error: (e) => {
        console.error(e);
        alert('Hubo un error al cerrar la mesa.');
      }
    });
  }

  imprimirTicketFactura() {
    const mesa = this.billingMesa();
    if (!mesa) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let itemsHtml = '';
      
      this.billingItems().forEach(item => {
        itemsHtml += `
          <tr style="border-bottom: 1px dashed #ccc;">
            <td style="padding: 6px 0; font-size: 13px;">${item.nombre}</td>
            <td style="padding: 6px 0; font-size: 13px; text-align: center;">${item.cantidad}</td>
            <td style="padding: 6px 0; font-size: 13px; text-align: right;">$${item.precioUnitario.toFixed(2)}</td>
            <td style="padding: 6px 0; font-size: 13px; font-weight: bold; text-align: right;">$${item.total.toFixed(2)}</td>
          </tr>
        `;
      });

      this.extraItems().forEach(item => {
        itemsHtml += `
          <tr style="border-bottom: 1px dashed #ccc; color: #155724; background-color: #d4edda;">
            <td style="padding: 6px 0; font-size: 13px;">* ${item.nombre} (Extra)</td>
            <td style="padding: 6px 0; font-size: 13px; text-align: center;">${item.cantidad}</td>
            <td style="padding: 6px 0; font-size: 13px; text-align: right;">$${item.precioUnitario.toFixed(2)}</td>
            <td style="padding: 6px 0; font-size: 13px; font-weight: bold; text-align: right;">$${item.total.toFixed(2)}</td>
          </tr>
        `;
      });

      this.manualCharges().forEach(charge => {
        itemsHtml += `
          <tr style="border-bottom: 1px dashed #ccc; color: #155724; background-color: #d4edda;">
            <td style="padding: 6px 0; font-size: 13px;" colspan="3">* ${charge.descripcion} (Cargo)</td>
            <td style="padding: 6px 0; font-size: 13px; font-weight: bold; text-align: right;">$${charge.monto.toFixed(2)}</td>
          </tr>
        `;
      });

      const restName = this.auth.currentUser()?.restauranteNombre || 'MozoGo';

      printWindow.document.write(`
        <html>
          <head>
            <title>Factura Mesa ${mesa.numero}</title>
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
              <h2>${restName.toUpperCase()}</h2>
              <p style="font-size: 11px; margin: 2px 0; font-weight: bold;">TICKET DE CONSUMO</p>
              <h1 style="font-size: 22px; margin: 5px 0; font-weight: 900;">MESA ${mesa.numero}</h1>
            </div>
            
            <div class="divider"></div>
            
            <div class="details">
              <p><b>Fecha:</b> ${new Date().toLocaleString()}</p>
              <p><b>Mozo:</b> ${mesa.mozo?.nombreCompleto || mesa.mozo?.username || 'Sin mozo asignado'}</p>
              <p><b>Código de Acceso:</b> ${mesa.codigoAcceso || 'N/A'}</p>
            </div>
            
            <div class="divider"></div>
            
            <table>
              <thead>
                <tr style="border-bottom: 2px solid #000;">
                  <th style="text-align: left; font-size: 12px; padding-bottom: 4px;">Item</th>
                  <th style="text-align: center; font-size: 12px; padding-bottom: 4px;">Cant</th>
                  <th style="text-align: right; font-size: 12px; padding-bottom: 4px;">P.Unit</th>
                  <th style="text-align: right; font-size: 12px; padding-bottom: 4px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 900; margin: 15px 0;">
              <span>TOTAL A PAGAR:</span>
              <span>$${this.getPreviewTotal().toFixed(2)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; font-size: 11px; margin-top: 15px; font-weight: bold;">
              ¡Muchas gracias por su visita!
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

  openBillingModal(mesa: any) {
    this.billingMesa.set(mesa);
    this.extraItems.set([]);
    this.manualCharges.set([]);
    this.selectedMenuItemId = '';
    this.extraQuantity = 1;
    this.manualChargeDescription = '';
    this.manualChargeMonto = 0;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.get<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/consumos`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.billingItems.set(data.items);
        this.billingTotal.set(data.total);
        this.showBillingModal.set(true);
      },
      error: (err) => console.error('Error al cargar consumos de mesa:', err)
    });
  }

  addExtraItem() {
    if (!this.selectedMenuItemId || this.extraQuantity < 1) return;
    const matchedItem = this.dataService.menuItems().find((i: any) => i.id === this.selectedMenuItemId);
    if (!matchedItem) return;

    const existingIndex = this.extraItems().findIndex((i: any) => i.menuItemId === this.selectedMenuItemId);
    if (existingIndex > -1) {
      this.extraItems.update((items: any) => {
        items[existingIndex].cantidad += this.extraQuantity;
        items[existingIndex].total = items[existingIndex].cantidad * items[existingIndex].precioUnitario;
        return [...items];
      });
    } else {
      this.extraItems.update((items: any) => [...items, {
        menuItemId: matchedItem.id,
        nombre: matchedItem.nombre,
        cantidad: this.extraQuantity,
        precioUnitario: matchedItem.precio,
        total: this.extraQuantity * matchedItem.precio
      }]);
    }
    this.selectedMenuItemId = '';
    this.extraQuantity = 1;
  }

  removeExtraItem(index: number) {
    this.extraItems.update((items: any) => items.filter((_: any, i: any) => i !== index));
  }

  addManualCharge() {
    if (!this.manualChargeDescription.trim() || this.manualChargeMonto <= 0) return;
    this.manualCharges.update((charges: any) => [...charges, {
      descripcion: this.manualChargeDescription.trim(),
      monto: this.manualChargeMonto
    }]);
    this.manualChargeDescription = '';
    this.manualChargeMonto = 0;
  }

  removeManualCharge(index: number) {
    this.manualCharges.update((charges: any) => charges.filter((_: any, i: any) => i !== index));
  }

  getPreviewTotal(): number {
    const dbTotal = this.billingTotal();
    const extraTotal = this.extraItems().reduce((acc, i) => acc + i.total, 0);
    const manualTotal = this.manualCharges().reduce((acc, c) => acc + c.monto, 0);
    return dbTotal + extraTotal + manualTotal;
  }

  confirmarCobro() {
    const mesa = this.billingMesa();
    if (!mesa) return;

    const payload = {
      items: [
        ...this.extraItems().map((i: any) => ({ menuItemId: i.menuItemId, cantidad: i.cantidad })),
        ...this.manualCharges().map((c: any) => ({ descripcion: c.descripcion, monto: c.monto }))
      ]
    };

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.http.post<any>(`${environment.apiUrl}/api/mesas/${mesa.id}/agregar-consumo`, payload, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    }).subscribe({
      next: (res) => {
        this.dataService.refreshAll();
        // Recargar consumos y limpiar temporales locales
        this.openBillingModal(mesa);
        alert('Consumos extras guardados en la mesa.');
      },
      error: (err) => console.error('Error al agregar consumos:', err)
    });
  }

  openReassignModal(taskId: string) {
    this.showReassignModal.set(taskId);
  }

  async reasignar(taskId: string, newMozoId: string) {
    await this.service.sendReasignarTarea(taskId, newMozoId);
    this.showReassignModal.set(null);
  }
}
