import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Restaurante {
  id: string;
  nombre: string;
  iconoPrincipal?: string;
}

export interface SystemUser {
  id: string;
  nombreCompleto?: string;
  username: string;
  role: string;
  restauranteId?: string;
  restauranteNombre?: string;
}

@Component({
  selector: 'app-superadmin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm text-primary">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">Usuarios de Sistema</h2>
          <p class="text-xs text-gray-400 font-semibold mt-1">Crea y administra los usuarios para todos los restaurantes y roles.</p>
        </div>
        <button (click)="openCreateForm()" class="bg-primary text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-slate-800 transition active:scale-95">
          + Nuevo Usuario
        </button>
      </div>

      <!-- Formulario Crear/Editar -->
      @if (showForm()) {
        <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-gray-200 animate-fade-in">
          <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider mb-4">
            {{ editingId() ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
          </h3>
          <form #userForm="ngForm" (submit)="saveForm($event)" class="space-y-4" autocomplete="off">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre Completo -->
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Nombre Completo</label>
                <input type="text" [(ngModel)]="formData.nombreCompleto" name="nombreCompleto" required
                       class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" />
              </div>

              <!-- Username -->
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Nombre de Usuario</label>
                <input type="text" [(ngModel)]="formData.username" name="username" required minlength="3"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" />
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Rol</label>
                <select [(ngModel)]="formData.role" name="role" required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm bg-white cursor-pointer">
                  <option [value]="1">Mozo</option>
                  <option [value]="2">Admin</option>
                  <option [value]="3">SuperAdmin</option>
                  <option [value]="4">Cocina</option>
                  <option [value]="5">Caja</option>
                  <option [value]="6">MozoPortal</option>
                </select>
              </div>

              <!-- Restaurante -->
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Restaurante</label>
                <select [(ngModel)]="formData.restauranteId" name="restauranteId" required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm bg-white cursor-pointer">
                  @for (r of restaurantes(); track r.id) {
                    <option [value]="r.id">{{ r.iconoPrincipal || '🍽️' }} {{ r.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Contraseña (Solo nuevo) -->
              @if (!editingId()) {
                <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
                  <input type="password" [(ngModel)]="formData.password" name="password" required
                         class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" />
                  <p class="text-[10px] text-gray-400 mt-1">Mínimo 8 caracteres, al menos 1 mayúscula y 1 símbolo especial.</p>
                </div>
              }
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="closeForm()" class="bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300 transition">
                Cancelar
              </button>
              <button type="submit" [disabled]="userForm.invalid" class="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition">
                {{ editingId() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Listado de Usuarios -->
      <div class="overflow-x-auto rounded-2xl border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold text-xs uppercase border-b border-gray-200 select-none">
              <th class="p-4">Nombre Completo</th>
              <th class="p-4">Usuario</th>
              <th class="p-4">Rol</th>
              <th class="p-4">Restaurante</th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 text-sm font-medium">
            @for (u of usuarios(); track u.id) {
              <tr class="hover:bg-slate-50/50 transition">
                <td class="p-4 font-bold text-gray-800">{{ u.nombreCompleto || 'Usuario' }}</td>
                <td class="p-4 text-gray-600">{{ u.username }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                        [ngClass]="{
                          'bg-blue-50 text-blue-700': u.role === 'Admin',
                          'bg-indigo-50 text-indigo-700': u.role === 'Mozo',
                          'bg-purple-50 text-purple-700': u.role === 'SuperAdmin',
                          'bg-orange-50 text-orange-700': u.role === 'Cocina',
                          'bg-emerald-50 text-emerald-700': u.role === 'Caja',
                          'bg-slate-100 text-slate-700': u.role === 'MozoPortal'
                        }">
                    {{ u.role }}
                  </span>
                </td>
                <td class="p-4 text-slate-500 font-semibold">{{ u.restauranteNombre || 'Sin asignar' }}</td>
                <td class="p-4">
                  <div class="flex gap-2 justify-center">
                    <button (click)="openEditForm(u)" class="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition active:scale-95">
                      Editar
                    </button>
                    <button (click)="openChangePasswordModal(u)" class="text-amber-600 hover:text-amber-800 font-bold text-[11px] bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 transition active:scale-95">
                      Cambiar Clave
                    </button>
                    <button (click)="deleteUser(u.id)" class="text-red-500 hover:text-red-700 font-bold text-[11px] bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition active:scale-95">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal Cambiar Contraseña -->
      @if (showPasswordModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100 animate-scale-up">
            <h3 class="text-lg font-black text-gray-800 mb-2 flex items-center gap-1.5">🔑 Cambiar Contraseña</h3>
            <p class="text-xs text-gray-500 font-medium mb-4">Ingresa una nueva contraseña para <strong>{{ passwordTargetUser()?.username }}</strong>.</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Nueva Contraseña</label>
                <input type="password" [(ngModel)]="newPassword" (ngModelChange)="checkPasswordStrength()" name="newPassword"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm" />
              </div>

              <!-- Requisitos de Contraseña -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-gray-150 text-xs font-medium space-y-2 select-none">
                <span class="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">Requisitos obligatorios:</span>
                <div class="flex items-center gap-2" [class.text-emerald-600]="strengthChecks.length" [class.text-slate-400]="!strengthChecks.length">
                  <span>{{ strengthChecks.length ? '✓' : '○' }}</span> Al menos 8 caracteres
                </div>
                <div class="flex items-center gap-2" [class.text-emerald-600]="strengthChecks.upper" [class.text-slate-400]="!strengthChecks.upper">
                  <span>{{ strengthChecks.upper ? '✓' : '○' }}</span> Al menos una letra mayúscula
                </div>
                <div class="flex items-center gap-2" [class.text-emerald-600]="strengthChecks.symbol" [class.text-slate-400]="!strengthChecks.symbol">
                  <span>{{ strengthChecks.symbol ? '✓' : '○' }}</span> Al menos un símbolo o signo especial
                </div>
              </div>

              @if (passwordError()) {
                <div class="text-xs font-bold text-red-500 px-1">{{ passwordError() }}</div>
              }

              <div class="flex justify-end gap-2 pt-2">
                <button (click)="closePasswordModal()" class="bg-gray-100 hover:bg-gray-250 text-gray-700 border border-gray-250 px-5 py-3 rounded-xl font-bold text-xs">
                  Cancelar
                </button>
                <button (click)="submitPasswordChange()" [disabled]="!isPasswordValid || submittingPassword()"
                        class="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-black text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (submittingPassword()) {
                    <span class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full block"></span>
                  }
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperadminUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  
  usuarios = signal<SystemUser[]>([]);
  restaurantes = signal<Restaurante[]>([]);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formData = {
    nombreCompleto: '',
    username: '',
    role: 1, // Enums en C#: Mozo=1, Admin=2, SuperAdmin=3, Cocina=4, Caja=5, MozoPortal=6
    restauranteId: '',
    password: ''
  };

  // Password modal states
  showPasswordModal = signal(false);
  passwordTargetUser = signal<SystemUser | null>(null);
  newPassword = '';
  isPasswordValid = false;
  submittingPassword = signal(false);
  passwordError = signal<string | null>(null);
  
  strengthChecks = {
    length: false,
    upper: false,
    symbol: false
  };

  ngOnInit() {
    this.loadUsuarios();
    this.loadRestaurantes();
  }

  loadUsuarios() {
    const token = localStorage.getItem('auth_token');
    this.http.get<SystemUser[]>(`${environment.apiUrl}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.usuarios.set(data));
  }

  loadRestaurantes() {
    const token = localStorage.getItem('auth_token');
    this.http.get<Restaurante[]>(`${environment.apiUrl}/api/restaurantes`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.restaurantes.set(data));
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formData = {
      nombreCompleto: '',
      username: '',
      role: 1, // Default to Mozo
      restauranteId: this.restaurantes().length > 0 ? this.restaurantes()[0].id : '',
      password: ''
    };
    this.showForm.set(true);
  }

  openEditForm(user: SystemUser) {
    this.editingId.set(user.id);
    
    // Convertir string de rol a int para combo
    let roleInt = 1;
    if (user.role === 'Admin') roleInt = 2;
    else if (user.role === 'SuperAdmin') roleInt = 3;
    else if (user.role === 'Cocina') roleInt = 4;
    else if (user.role === 'Caja') roleInt = 5;
    else if (user.role === 'MozoPortal') roleInt = 6;

    this.formData = {
      nombreCompleto: user.nombreCompleto || '',
      username: user.username,
      role: roleInt,
      restauranteId: user.restauranteId || '',
      password: ''
    };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveForm(e: Event) {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    if (this.editingId()) {
      // Editar
      const payload = {
        nombreCompleto: this.formData.nombreCompleto,
        username: this.formData.username,
        role: Number(this.formData.role),
        restauranteId: this.formData.restauranteId
      };
      this.http.put(`${environment.apiUrl}/api/users/${this.editingId()}`, payload, { headers }).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeForm();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al actualizar usuario.');
        }
      });
    } else {
      // Crear
      const payload = {
        nombreCompleto: this.formData.nombreCompleto,
        username: this.formData.username,
        role: Number(this.formData.role),
        restauranteId: this.formData.restauranteId,
        password: this.formData.password
      };
      this.http.post(`${environment.apiUrl}/api/users`, payload, { headers }).subscribe({
        next: () => {
          this.loadUsuarios();
          this.closeForm();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al crear usuario.');
        }
      });
    }
  }

  deleteUser(userId: string) {
    if (!confirm('¿Está seguro de eliminar este usuario del sistema?')) return;
    const token = localStorage.getItem('auth_token');
    this.http.delete(`${environment.apiUrl}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(() => {
      this.loadUsuarios();
    });
  }

  // Password reset operations
  openChangePasswordModal(user: SystemUser) {
    this.passwordTargetUser.set(user);
    this.newPassword = '';
    this.isPasswordValid = false;
    this.passwordError.set(null);
    this.checkPasswordStrength();
    this.showPasswordModal.set(true);
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
    this.passwordTargetUser.set(null);
  }

  checkPasswordStrength() {
    const p = this.newPassword;
    this.strengthChecks.length = p.length >= 8;
    this.strengthChecks.upper = /[A-Z]/.test(p);
    this.strengthChecks.symbol = /[^a-zA-Z0-9]/.test(p);

    this.isPasswordValid = this.strengthChecks.length && this.strengthChecks.upper && this.strengthChecks.symbol;
  }

  submitPasswordChange() {
    const user = this.passwordTargetUser();
    if (!user || !this.isPasswordValid) return;

    this.submittingPassword.set(true);
    this.passwordError.set(null);
    const token = localStorage.getItem('auth_token');
    
    this.http.post(`${environment.apiUrl}/api/users/${user.id}/change-password`, 
      { password: this.newPassword }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.submittingPassword.set(false);
        this.closePasswordModal();
        alert('Contraseña cambiada exitosamente.');
      },
      error: (err) => {
        this.submittingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Error al cambiar contraseña.');
      }
    });
  }
}
