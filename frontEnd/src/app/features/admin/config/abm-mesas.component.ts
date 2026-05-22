import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminMesa, AdminUser } from './admin-data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abm-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestionar Mesas</h2>
        <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#1a233b]">+ Crear Mesa</button>
      </div>

      @if (showForm()) {
        <div class="bg-surface p-4 rounded-2xl mb-6 border border-gray-200">
          <form #mesaForm="ngForm" class="flex flex-col md:flex-row gap-4 items-end" autocomplete="off" (submit)="saveForm($event)">
            <div class="w-full md:w-32 relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Número</label>
              <input type="number" [(ngModel)]="formData.numero" name="numero" #numCtrl="ngModel" 
                     min="1" max="999"
                     class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" required>
              @if (numCtrl.invalid && numCtrl.touched) {
                <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Rango 1-999</span>
              }
            </div>
            <div class="flex-1 w-full relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Ubicación / Detalles</label>
              <input type="text" [(ngModel)]="formData.ubicacion" name="ubicacion" #ubicCtrl="ngModel"
                     maxlength="100" placeholder="Ej: Terraza Norte" 
                     class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
            </div>
            <div class="flex-1 w-full relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Mozo Asignado</label>
              <!-- Dinámico conectado a Mozos reales -->
              <select [(ngModel)]="formData.mozoId" name="mozoId" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                <option [value]="null">Sin asignar</option>
                @for (mozo of dataService.mozos(); track mozo.id) {
                  <option [value]="mozo.id">{{ mozo.email }}</option>
                }
              </select>
            </div>
            <button type="button" (click)="showForm.set(false)" class="bg-gray-200 text-gray-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-300 h-10">Cancelar</button>
            <button type="submit" [disabled]="mesaForm.invalid" class="bg-accent text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-opacity-90 h-10 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId() ? 'Actualizar' : 'Guardar' }}
            </button>
          </form>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (mesa of dataService.mesas(); track mesa.id) {
          <div class="border border-gray-200 rounded-2xl p-4 flex flex-col hover:border-accent transition relative group bg-white">
            
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openQrModal(mesa)" class="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">🖨️ QR</button>
              <button (click)="openEditForm(mesa)" class="text-indigo-500 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg">Editar</button>
              <button (click)="dataService.deleteMesa(mesa.id)" class="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-lg">Borrar</button>
            </div>

            <div class="flex items-center gap-3 mb-2">
              <div class="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black">{{ mesa.numero }}</div>
              <div>
                <h3 class="font-bold text-gray-800">Mesa {{ mesa.numero }}</h3>
                <p class="text-xs text-gray-500">{{ mesa.ubicacion }}</p>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span class="text-xs font-semibold text-gray-500">Asignado a:</span>
              <span class="text-sm font-bold px-2 py-1 bg-surface rounded-lg text-primary">
                {{ getMozoEmail(mesa.mozoId) }}
              </span>
            </div>
          </div>
        } @empty {
           <p class="col-span-full text-center py-6 text-gray-400">No hay mesas creadas.</p>
         }
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500 font-medium">Reorganiza el salón en memoria y súbelo al servidor.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-500 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-xl">✅ ¡Guardado!</span>
          }
          
          <button 
            (click)="syncBackend()"
            [disabled]="isSaving()"
            class="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-black shadow-[0_4px_15px_rgb(16,185,129,0.3)] hover:bg-[#0da473] transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2">
            @if (isSaving()) {
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Sincronizando...
            } @else {
              ☁️ Guardar y Publicar
            }
          </button>
        </div>
      </div>

      <!-- Modal QR -->
      @if (showQrModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button (click)="closeQrModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-2xl font-black text-gray-800 mb-1">Mesa {{ showQrModal()?.numero }}</h2>
            <p class="text-sm text-gray-500 font-medium mb-6">{{ showQrModal()?.ubicacion }}</p>
            
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 inline-block shadow-inner">
              <img [src]="getQrImageUrl(showQrModal()!)" alt="Código QR de la mesa" class="w-48 h-48 mx-auto rounded-lg" />
            </div>

            <p class="text-xs text-primary bg-surface py-2 px-4 rounded-xl mb-6 font-bold truncate">
              URL: /mesa/{{ showQrModal()?.numero }}
            </p>

            <div class="flex flex-col gap-3">
              <a [href]="getQrImageUrl(showQrModal()!)" download="Mesa_QR.png" target="_blank"
                 class="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-sm hover:bg-[#1a233b] transition-all text-center">
                ↓ Descargar Imagen QR
              </a>
              <button (click)="imprimirQr()" class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                🖨️ Imprimir Cartel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
  `]
})
export class AbmMesasComponent {
  dataService = inject(AdminDataService);
  http = inject(HttpClient);
  
  showForm = signal(false);
  editingId = signal<string | null>(null);
  
  isSaving = signal(false);
  saveSuccess = signal(false);

  formData: AdminMesa = { id: '', numero: 1, ubicacion: '', mozoId: 'Sin asignar' };
  showQrModal = signal<AdminMesa | null>(null);

  openQrModal(mesa: AdminMesa) {
    this.showQrModal.set(mesa);
  }

  closeQrModal() {
    this.showQrModal.set(null);
  }

  getQrImageUrl(mesa: AdminMesa) {
    // Exacta ruta literal pedida sin # usando el frontend que esté corriendo
    const baseUrl = window.location.origin;
    const targetUrl = `${baseUrl}/mesa/${mesa.numero}`;
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
            <p>${this.showQrModal()?.ubicacion}</p>
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

  getMozoEmail(mozoId: string | null): string {
    if (!mozoId) return 'Sin asignar';
    const mozo = this.dataService.mozos().find(m => m.id === mozoId);
    return mozo?.email || 'Sin asignar';
  }
}
