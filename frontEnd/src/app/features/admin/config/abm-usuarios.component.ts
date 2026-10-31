import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminUser } from './admin-data.service';
import { BrandingService } from '../../../core/services/branding.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abm-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-black text-gray-800 tracking-tight">Gestionar Staff</h2>
        <button (click)="openCreateForm()" class="bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-slate-800 transition active:scale-95">
          + Nuevo Usuario
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-gray-200">
          <form #userForm="ngForm" class="flex flex-col gap-5 items-end" autocomplete="off" (submit)="saveForm($event)">
            <div class="flex flex-col md:flex-row gap-4 w-full items-start">
              
              <div class="flex-1 w-full relative">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-slate-600">Nombre de Usuario (usuario&#64;local)</label>
                  @if (formData.username && !hasAtSymbol(formData.username)) {
                    <button type="button" (click)="applySuffix()"
                      class="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition">
                      + Agregar &#64;{{ detectedSuffix() }}
                    </button>
                  }
                </div>
                <input type="text" [(ngModel)]="formData.username" name="username" #usernameCtrl="ngModel"
                  (blur)="onUsernameBlur()"
                  [placeholder]="getUsernamePlaceholder()"
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-slate-900 text-sm text-gray-900 bg-white"
                  required minlength="5" [pattern]="staffUsernamePattern"
                  [ngClass]="{'border-red-500': (usernameCtrl.invalid && usernameCtrl.touched) || (formData.username && !isUsernameValid())}">
                
                <div class="mt-1.5 flex items-center justify-between gap-2">
                  @if (formData.username && isUsernameValid()) {
                    <span class="text-emerald-600 text-[11px] font-bold">
                      ✓ Formato válido ({{ formData.username.trim().toLowerCase() }})
                    </span>
                  } @else if ((usernameCtrl.invalid && usernameCtrl.touched) || (formData.username && !isUsernameValid())) {
                    <span class="text-red-600 text-[11px] font-bold">
                      @if(usernameCtrl.errors?.['required']) { Obligatorio. }
                      @else { Formato obligatorio: usuario&#64;local (ej: mozo&#64;{{ detectedSuffix() }}) }
                    </span>
                  } @else {
                    <span class="text-slate-500 text-[11px] font-semibold">
                      Sufijo sugerido para este local: <strong class="text-slate-700">&#64;{{ detectedSuffix() }}</strong>
                    </span>
                  }
                </div>
              </div>

              <div class="flex-1 w-full relative">
                <label class="block text-xs font-bold text-slate-600 mb-1">
                  Contraseña {{ editingId() ? '(Vacío para dejar la misma)' : '' }}
                </label>
                <input type="password" [(ngModel)]="formData.password" name="password" autocomplete="new-password" #userPassCtrl="ngModel"
                       class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-slate-900 text-sm text-gray-900 bg-white" [required]="!editingId()">
                
                <!-- Password Strength Indicators -->
                @if (formData.password) {
                  <div class="mt-2 p-3 bg-white rounded-xl border border-gray-200 text-[10px] font-bold text-slate-500 space-y-1">
                    <p class="text-slate-700 mb-1 uppercase tracking-wider text-[9px] font-black">Requisitos de Seguridad:</p>
                    <p [ngClass]="formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'">
                      {{ formData.password.length >= 8 ? '✓' : '✗' }} Mínimo 8 caracteres (Llevas: {{ formData.password.length }})
                    </p>
                    <p [ngClass]="hasThreeDigits(formData.password) ? 'text-green-600' : 'text-red-600'">
                      {{ hasThreeDigits(formData.password) ? '✓' : '✗' }} Al menos 3 números (Llevas: {{ getDigitCount(formData.password) }})
                    </p>
                    <p [ngClass]="hasUpperAndLower(formData.password) ? 'text-green-600' : 'text-red-600'">
                      {{ hasUpperAndLower(formData.password) ? '✓' : '✗' }} Mayúscula y minúscula
                    </p>
                    <p [ngClass]="hasSpecialSymbol(formData.password) ? 'text-green-600' : 'text-red-600'">
                      {{ hasSpecialSymbol(formData.password) ? '✓' : '✗' }} Al menos 1 símbolo (ej: .,+°!&#64;#)
                    </p>
                  </div>
                }
              </div>

              <div class="w-full md:w-36">
                <label class="block text-xs font-bold text-slate-600 mb-1">Rol</label>
                <select [(ngModel)]="formData.role" name="role" class="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm text-gray-900">
                  <option value="Admin">Admin</option>
                  <option value="Caja">Caja</option>
                  <option value="Cocina">Cocina</option>
                  <option value="Mozo">Mozo</option>
                  <option value="MozoPortal">MozoPortal</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2 justify-end w-full">
              <button type="button" (click)="showForm.set(false)" class="bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200">Cancelar</button>
              <button type="submit" [disabled]="userForm.invalid || !isUsernameValid() || (!!formData.password && !isPasswordStrong(formData.password))" class="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ editingId() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      }

      <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white mt-4">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
              <tr class="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 text-xs uppercase tracking-wider">
                <th class="py-3.5 px-4 text-left font-black">Usuario</th>
                <th class="py-3.5 px-4 text-left font-black">Rol</th>
                <th class="py-3.5 px-4 text-right font-black">Acciones</th>
              </tr>
          </thead>
          <tbody>
            @for (user of dataService.users(); track user.id) {
              @if (user.role !== 'SuperAdmin') {
                <tr class="border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <td class="py-3 px-4 font-semibold text-gray-800">{{ user.username }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider" 
                      [ngClass]="{
                        'bg-purple-100 text-purple-700': user.role === 'Admin',
                        'bg-green-100 text-green-700': user.role === 'Caja',
                        'bg-amber-100 text-amber-700': user.role === 'Cocina',
                        'bg-blue-100 text-blue-700': user.role === 'Mozo',
                        'bg-teal-100 text-teal-700': user.role === 'MozoPortal',
                        'bg-gray-100 text-gray-700': user.role === 'SuperAdmin'
                      }">
                      {{ user.role === 'MozoPortal' ? 'Mozo Portal' : user.role }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button (click)="openEditForm(user)" class="text-green-700 hover:text-green-900 text-xs font-bold mr-4 bg-green-50 px-2 py-1 rounded border border-green-100">Editar</button>
                    <button (click)="dataService.deleteUser(user.id)" class="text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100">Quitar</button>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="3" class="text-center py-8 text-gray-400 font-semibold">Sin usuarios cargados en el staff.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Los cambios son locales hasta guardar y publicarlos.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-700 font-bold text-xs bg-green-50 border border-green-100 px-3 py-2 rounded-xl animate-fade-in">✅ ¡Guardado en servidor!</span>
          }
          
          <button 
            (click)="syncBackend()"
            [disabled]="isSaving()"
            class="bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2">
            @if (isSaving()) {
              <span class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              Sincronizando...
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
  branding = inject(BrandingService);
  http = inject(HttpClient);
  
  showForm = signal(false);
  editingId = signal<string | null>(null);
  
  isSaving = signal(false);
  saveSuccess = signal(false);
  staffUsernamePattern = '^[a-zA-Z0-9._-]{2,30}@[a-zA-Z0-9_-]{2,30}$';
  
  formData: AdminUser = { id: '', username: '', role: 'Mozo', password: '' };

  detectedSuffix = computed(() => {
    const existingWithAt = this.dataService.users().find(u => u.username && u.username.includes('@'));
    if (existingWithAt) {
      const parts = existingWithAt.username.split('@');
      if (parts[1] && parts[1].trim().length >= 2) {
        return parts[1].trim().toLowerCase();
      }
    }

    const rawName = (this.branding.appName() || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (rawName.includes('pub')) return 'pub';
    if (rawName.includes('pizzeria') || rawName.includes('donatello')) return 'pizzeria';
    const slug = rawName.replace(/[^a-z0-9]/g, '');
    if (slug && slug !== 'mozogo' && slug.length >= 2) {
      return slug.slice(0, 20);
    }
    return 'local';
  });

  hasAtSymbol(val: string): boolean {
    return (val || '').includes('@');
  }

  getUsernamePlaceholder(): string {
    return `Ej: pedro@${this.detectedSuffix()}`;
  }

  isUsernameValid(): boolean {
    const clean = (this.formData.username || '').trim().toLowerCase();
    return /^[a-zA-Z0-9._-]{2,30}@[a-zA-Z0-9_-]{2,30}$/.test(clean);
  }

  applySuffix() {
    const raw = (this.formData.username || '').trim().toLowerCase();
    if (!raw) return;
    const prefix = raw.split('@')[0].replace(/[^a-z0-9._-]/g, '');
    if (prefix) {
      this.formData.username = `${prefix}@${this.detectedSuffix()}`;
    }
  }

  onUsernameBlur() {
    const raw = (this.formData.username || '').trim().toLowerCase();
    if (!raw) return;
    if (!raw.includes('@')) {
      this.applySuffix();
    } else {
      this.formData.username = raw;
    }
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', username: '', role: 'Mozo', password: '' };
    this.showForm.set(true);
  }

  openEditForm(user: AdminUser) {
    this.editingId.set(user.id);
    this.formData = { ...user, password: '' };
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    this.formData.username = this.formData.username.trim().toLowerCase();
    if (!this.isUsernameValid()) {
      return;
    }

    if (this.editingId()) {
      const payloadToUpdate = { ...this.formData, username: this.formData.username };
      if (!payloadToUpdate.password || payloadToUpdate.password.trim() === '') {
        payloadToUpdate.password = undefined;
      }
      this.dataService.updateUser(payloadToUpdate);
    } else {
      this.dataService.addUser({ ...this.formData, username: this.formData.username, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.users().map(u => ({
      ...u,
      username: u.username.trim().toLowerCase()
    }));
    
    this.http.post(`${environment.apiUrl}/api/users/bulk`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err: any) => {
        console.error('El backend rechazó el guardado en bloque:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend no está encendido o rechazó la petición. Los cambios a tu staff no se han guardado.');
      }
    });
  }

  // Password validators
  isPasswordStrong(pass: string): boolean {
    if (!pass) return true;
    if (pass.length < 8) return false;
    if (!this.hasThreeDigits(pass)) return false;
    if (!this.hasUpperAndLower(pass)) return false;
    if (!this.hasSpecialSymbol(pass)) return false;
    return true;
  }

  hasThreeDigits(pass: string): boolean {
    const digits = pass.match(/\d/g);
    return !!digits && digits.length >= 3;
  }

  getDigitCount(pass: string): number {
    const digits = pass.match(/\d/g);
    return digits ? digits.length : 0;
  }

  hasUpperAndLower(pass: string): boolean {
    return /[A-Z]/.test(pass) && /[a-z]/.test(pass);
  }

  hasSpecialSymbol(pass: string): boolean {
    return /[^a-zA-Z0-9]/.test(pass);
  }
}
