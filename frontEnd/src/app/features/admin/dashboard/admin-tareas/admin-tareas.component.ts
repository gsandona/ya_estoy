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
  selector: 'app-admin-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      
      @if (!service.isConnected()) {
        <div class="bg-red-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold mb-4 animate-[slide-down_0.3s_ease-out]">
          <span class="animate-spin">↻</span> Sin conexión. Intentando reconectar al servidor...
        </div>
      }
      

        <!-- Cabecera de Solicitudes Activas -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div class="flex items-center gap-2 select-none">
            <div>
              <h1 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                Solicitudes Activas
              </h1>
              <p class="text-sm text-gray-500 font-medium mt-1">Monitorea y atiende los pedidos en tiempo real</p>
            </div>
          </div>
          
          <!-- Filtros (Solo Admin) -->
          @if(auth.currentUser()?.role === 'Admin') {
            <div class="flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-250 shadow-sm">
              <select [ngModel]="filterType()" (ngModelChange)="filterType.set($event)" class="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todos los Tipos</option>
                <option value="Llamado">Llamado</option>
                <option value="Pedido">Pedido</option>
                <option value="Cuenta">Cuenta</option>
              </select>
              <select [ngModel]="filterMesa()" (ngModelChange)="filterMesa.set($event)" class="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todas las Mesas</option>
                @for(m of dataService.mesas(); track m.id) { <option [value]="m.numero">Mesa {{m.numero}}</option> }
              </select>
              <select [ngModel]="filterMozo()" (ngModelChange)="filterMozo.set($event)" class="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
                <option value="All">Todos los Mozos</option>
                @for(mz of dataService.mozos(); track mz.id) { <option [value]="mz.id">{{mz.username}}</option> }
              </select>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (task of myPendingTasks(); track task.id) {
            <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-3.5 flex flex-col relative overflow-hidden transition-all group hover:border-gray-700/30 hover:-translate-y-0.5 shadow-sm">
              
              <!-- Barra superior indicadora -->
              <div class="absolute top-0 left-0 w-full h-1" [ngClass]="getSideBarClass(task.type)"></div>

              <div class="flex justify-between items-start mb-2.5 pt-1">
                <div class="flex items-center gap-2.5">
                   <div class="w-10 h-10 rounded-xl flex flex-col justify-center items-center font-black shadow-inner" [ngClass]="getTypeBgClass(task.type)">
                     <span class="text-[8px] opacity-80 leading-none mb-0.5 uppercase tracking-wide">Mesa</span>
                     <span class="text-base leading-none">{{ task.tableId }}</span>
                   </div>
                   <div>
                     <span class="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md animate-fade-in" [ngClass]="getTypeTagClass(task.type)">{{task.type}}</span>
                     @if (task.type === 'Pedido') {
                       @if (task.pedidoEstado === 'Recibido' || !task.pedidoEstado) {
                         <span class="ml-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">Por Aprobar</span>
                       } @else if (task.pedidoEstado === 'EnPreparacion') {
                         <span class="ml-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-50 text-amber-600 border border-gray-100">En Cocina</span>
                       } @else if (task.pedidoEstado === 'Listo') {
                         <span class="ml-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse">¡Listo!</span>
                       }
                     }
                     <div class="text-[9px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                       Hace {{ getMinutesElapsed(task.timestamp) }} min
                     </div>
                   </div>
                </div>
                
                @if(auth.currentUser()?.role === 'Admin') {
                  <button (click)="openReassignModal(task.id)" class="text-[9px] text-indigo-600 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-500 px-2 py-0.5 rounded-md transition-colors border border-indigo-100">Reasignar</button>
                }
              </div>

              <div class="flex-1 bg-white/80 rounded-xl p-2.5 mb-3 border border-gray-200">
                 @if (task.details) {
                   <p class="text-gray-600 text-xs font-semibold line-clamp-2 leading-relaxed">{{ task.details }}</p>
                 } @else {
                   <p class="text-gray-400 text-xs italic">Atención requerida en la mesa.</p>
                 }
              </div>

              <div class="flex gap-2 mt-auto">
                <button (click)="selectedTaskForView.set(task)" class="flex-1 bg-white text-gray-700 py-1.5 rounded-xl text-xs font-black border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                  Ver
                </button>
                @if (task.type === 'Pedido') {
                  @if (task.pedidoEstado === 'Recibido' || !task.pedidoEstado) {
                    <button (click)="aprobarPedido(task.id)" class="flex-[2] bg-emerald-600 text-white py-1.5 rounded-xl text-xs font-black hover:bg-emerald-700 shadow-sm transition-transform active:scale-95">
                      Aprobar
                    </button>
                  } @else if (task.pedidoEstado === 'EnPreparacion') {
                    <button (click)="entregarPedido(task.id)" class="flex-[2] bg-slate-700 text-white py-1.5 rounded-xl text-xs font-black hover:bg-slate-800 shadow-sm transition-transform active:scale-95">
                      Cerrar
                    </button>
                  } @else if (task.pedidoEstado === 'Listo') {
                    <button (click)="entregarPedido(task.id)" class="flex-[2] bg-[#10b981] text-white py-1.5 rounded-xl text-xs font-black hover:bg-[#0da473] shadow-sm transition-transform active:scale-95">
                      Entregar
                    </button>
                  }
                } @else {
                  <button (click)="completar(task.id)" class="flex-[2] bg-primary text-white py-1.5 rounded-xl text-xs font-black hover:bg-primary/90 shadow-sm transition-transform active:scale-95">
                    Completar
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
              <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                <span class="text-2xl opacity-40">🛎️</span>
              </div>
              <h3 class="text-lg font-black text-gray-600 mb-0.5">Todo al día</h3>
              <p class="text-gray-400 font-medium text-xs">No hay solicitudes pendientes en este momento.</p>
            </div>
          }
        </div>
    </div>

    <!-- Modal Reasignar -->
    @if(showReassignModal()) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20 relative">
          <button (click)="showReassignModal.set(null)" class="absolute top-4 right-4 w-11 h-11 flex text-lg items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-colors">&times;</button>
          
          <h3 class="text-xl font-black mb-1 text-gray-800 flex items-center gap-2">Reasignar</h3>
          <p class="text-sm text-gray-500 mb-6 font-medium">Transfiere esta tarea a otro mozo disponible.</p>
          
          <div class="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            @for(mz of dataService.mozos(); track mz.id) {
              <button (click)="reasignar(showReassignModal()!, mz.id)" class="w-full text-left px-4 py-3 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 font-bold text-gray-700 transition-all flex items-center gap-3 group">
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs group-hover:bg-primary/10 group-hover:text-primary">👤</div>
                {{mz.username}}
              </button>
            }
          </div>
        </div>
      </div>
    }



    <!-- Modal Ver Detalle de Tarea -->
    @if (selectedTaskForView()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div class="bg-gray-50 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border-2 border-gray-200 text-gray-800">
          <button (click)="selectedTaskForView.set(null)" class="absolute top-4 right-4 w-11 h-11 flex text-lg items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 font-bold transition-all border border-gray-200/60 shadow-sm">
            &times;
          </button>
          
          <h3 class="text-lg font-black text-gray-800 mb-1 border-b border-gray-200 pb-2">Mesa {{ selectedTaskForView()?.tableId }}</h3>
          
          <div class="space-y-3.5 my-4">
            <div class="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
              <span class="font-bold text-gray-400">Tipo de Alerta:</span>
              <span class="font-black px-2.5 py-0.5 rounded-md uppercase text-[10px]" [ngClass]="getTypeTagClass(selectedTaskForView()!.type)">
                {{ selectedTaskForView()?.type }}
              </span>
            </div>
            @if (selectedTaskForView()?.type === 'Pedido') {
              <div class="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
                <span class="font-bold text-gray-400">Estado del Pedido:</span>
                <span class="font-black px-2.5 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 text-[10px]">
                  {{ selectedTaskForView()?.pedidoEstado || 'Recibido' }}
                </span>
              </div>
            }
            <div class="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
              <span class="font-bold text-gray-400">Tiempo Transcurrido:</span>
              <span class="font-black text-gray-700">
                Hace {{ getMinutesElapsed(selectedTaskForView()!.timestamp) }} min
              </span>
            </div>
            <div class="bg-white/90 p-4 rounded-2xl border border-gray-200 shadow-inner">
              <span class="block text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-wide">Detalles de la Solicitud:</span>
              <p class="text-xs font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                {{ selectedTaskForView()?.details || 'Atención general requerida en la mesa.' }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 mt-6 pt-3 border-t border-gray-200">
            <button (click)="selectedTaskForView.set(null)" class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-black hover:bg-gray-300 transition-colors shadow-sm">
              Cerrar
            </button>
            @if (selectedTaskForView()?.type === 'Pedido') {
              @if (selectedTaskForView()?.pedidoEstado === 'Recibido' || !selectedTaskForView()?.pedidoEstado) {
                <button (click)="aprobarPedido(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 shadow-sm transition-transform active:scale-95">
                  Aprobar
                </button>
              } @else {
                <button (click)="entregarPedido(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-primary text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#1a233b] shadow-sm transition-transform active:scale-95">
                  Cerrar Pedido
                </button>
              }
            } @else {
              <button (click)="completar(selectedTaskForView()!.id); selectedTaskForView.set(null);" class="flex-[2] bg-primary text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#1a233b] shadow-sm transition-transform active:scale-95">
                Completar
              </button>
            }
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
export class AdminTareasComponent {

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
