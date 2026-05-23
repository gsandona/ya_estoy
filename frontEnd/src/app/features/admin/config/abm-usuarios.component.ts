import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminUser } from './admin-data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abm-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestionar Staff</h2>
        <button (click)="openCreateForm()" class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#1a233b]">+ Nuevo Usuario</button>
      </div>

      @if (showForm()) {
        <div class="bg-surface p-4 rounded-2xl mb-6 border border-gray-200">
          <form #userForm="ngForm" class="flex flex-col md:flex-row gap-4 items-end" autocomplete="off" (submit)="saveForm($event)">
            <div class="flex-1 w-full relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre de Usuario</label>
              <input type="text" [(ngModel)]="formData.email" name="email" #userEmailCtrl="ngModel" 
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-gray-800"
                required minlength="3" [ngClass]="{'border-red-500': userEmailCtrl.invalid && userEmailCtrl.touched}">
              @if (userEmailCtrl.invalid && userEmailCtrl.touched) {
                <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Mínimo 3 caracteres</span>
              }
            </div>
            <div class="flex-1 w-full relative">
              <label class="block text-xs font-semibold text-gray-500 mb-1">
                Contraseña {{ editingId() ? '(Vacío para dejar la misma)' : '' }}
              </label>
              <input type="password" [(ngModel)]="formData.password" name="password" autocomplete="new-password" #userPassCtrl="ngModel"
                     maxlength="30" minlength="6"
                     class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" [required]="!editingId()">
              @if (userPassCtrl.invalid && userPassCtrl.touched) {
                <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Mínimo 6 caracteres</span>
              }
            </div>
            <div class="w-full md:w-32">
              <label class="block text-xs font-semibold text-gray-500 mb-1">Rol</label>
              <select [(ngModel)]="formData.role" name="role" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white">
                <option value="Mozo">Mozo</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="button" (click)="showForm.set(false)" class="bg-gray-200 text-gray-600 px-6 py-2 rounded-xl font-bold hover:bg-gray-300 h-10">Cancelar</button>
            <button type="submit" [disabled]="userForm.invalid" class="bg-accent text-white px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-opacity-90 h-10 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId() ? 'Actualizar' : 'Guardar' }}
            </button>
          </form>
        </div>
      }

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
              <tr>
                <th class="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="py-3 px-4 text-right font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
          </thead>
          <tbody>
            @for (user of dataService.users(); track user.id) {
              <tr class="border-b border-gray-50 hover:bg-surface/50 transition">
                <td class="py-3 px-4 font-semibold text-gray-800">{{ user.email }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 text-xs font-bold rounded-lg" [ngClass]="user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button (click)="openEditForm(user)" class="text-indigo-500 hover:text-indigo-700 text-sm font-bold mr-4">Editar</button>
                  <button (click)="dataService.deleteUser(user.id)" class="text-red-500 hover:text-red-700 text-sm font-bold">Quitar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="text-center py-6 text-gray-400">Sin usuarios cargados</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500 font-medium">Los cambios son locales hasta presionar publicarlos.</p>
        
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
              Pulsando Cuentas...
            } @else {
              ☁️ Guardar y Publicar
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class AbmUsuariosComponent {
  dataService = inject(AdminDataService);
  http = inject(HttpClient);
  
  showForm = signal(false);
  editingId = signal<string | null>(null);
  
  isSaving = signal(false);
  saveSuccess = signal(false);
  
  formData: AdminUser = { id: '', email: '', role: 'Mozo', password: '' };
  tempPassword = '';

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', email: '', role: 'Mozo', password: '' };
    this.tempPassword = '';
    this.showForm.set(true);
  }

  openEditForm(user: AdminUser) {
    this.editingId.set(user.id);
    this.formData = { ...user, password: '' }; // Siempre arranca en blanco al editar por seguridad
    this.tempPassword = ''; 
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    if (this.editingId()) {
      // Si el campo de password se dejó vacío durante una edición, enviamos null o eliminamos la propiedad para que Backend respete la actual
      const payloadToUpdate = { ...this.formData };
      if (!payloadToUpdate.password || payloadToUpdate.password.trim() === '') {
        payloadToUpdate.password = undefined; // C# lo recibe como nulo y lo salta en EF
      }
      this.dataService.updateUser(payloadToUpdate);
    } else {
      this.dataService.addUser({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.users();
    
    this.http.post(`${environment.apiUrl}/api/users/bulk`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        console.error('El backend rechazó el guardado en bloque:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend (' + environment.apiUrl + '/api/users/bulk) rechazó guardar tu lista nueva de usuarios.');
      }
    });
  }
}
