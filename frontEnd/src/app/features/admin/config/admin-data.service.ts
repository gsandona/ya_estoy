import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TenantContextService } from '../../../core/services/tenant-context.service';

export interface AdminUser { id: string; username: string; role: 'Admin' | 'Mozo' | 'SuperAdmin'; password?: string; }
export interface AdminMesa { id: string; numero: number; ubicacion: string; mozoId: string; codigoAcceso?: string; estado?: number; montoConsumo?: number; }
export interface AdminMenuItem { 
  id: string; 
  categoria: string;
  nombre: string; 
  precio: number; 
  descripcion: string; 
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private http = inject(HttpClient);
  private tenantContext = inject(TenantContextService);

  // Sin mocks reales, inicializan vacío
  public users = signal<AdminUser[]>([]);
  public mesas = signal<AdminMesa[]>([]);
  public menuItems = signal<AdminMenuItem[]>([]);
  public isLoading = signal(true);
  
  public mozos = computed(() => this.users().filter(u => u.role === 'Mozo'));

  constructor() {
    this.tenantContext.tenantId$.subscribe(tenantId => {
      if (tenantId) {
        this.refreshAll();
      } else {
        // Limpiar datos si no hay inquilino activo (logout)
        this.users.set([]);
        this.mesas.set([]);
        this.menuItems.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // Trae todo nuevamente
  refreshAll() {
    this.isLoading.set(true);
    let usersDone = false;
    let mesasDone = false;
    let menuDone = false;

    const checkDone = () => {
      if (usersDone && mesasDone && menuDone) {
        this.isLoading.set(false);
      }
    };

    this.http.get<AdminUser[]>(`${environment.apiUrl}/api/users`).subscribe({
      next: d => { this.users.set(d); usersDone = true; checkDone(); },
      error: () => { this.users.set([]); usersDone = true; checkDone(); }
    });
    
    this.http.get<AdminMesa[]>(`${environment.apiUrl}/api/mesas`).subscribe({
      next: d => { this.mesas.set(d); mesasDone = true; checkDone(); },
      error: () => { this.mesas.set([]); mesasDone = true; checkDone(); }
    });
    
    this.http.get<AdminMenuItem[]>(`${environment.apiUrl}/api/menu`).subscribe({
      next: d => { this.menuItems.set(d); menuDone = true; checkDone(); },
      error: () => { this.menuItems.set([]); menuDone = true; checkDone(); }
    });
  }

  // CRUD Usuarios Memoria Local Bulk
  addUser(u: AdminUser) { this.users.update(l => [...l, u]); }
  updateUser(u: AdminUser) { this.users.update(l => l.map(x => x.id === u.id ? u : x)); }
  deleteUser(id: string) { this.users.update(l => l.filter(x => x.id !== id)); }

  // CRUD Mesas Memoria Local Bulk
  addMesa(m: AdminMesa) { this.mesas.update(l => [...l, m]); }
  updateMesa(m: AdminMesa) { this.mesas.update(l => l.map(x => x.id === m.id ? m : x)); }
  deleteMesa(id: string) { this.mesas.update(l => l.filter(x => x.id !== id)); }

  // CRUD Menú Interactivo de Memoria local
  addMenuItem(m: AdminMenuItem) { this.menuItems.update(l => [...l, m]); }
  updateMenuItem(m: AdminMenuItem) { this.menuItems.update(l => l.map(x => x.id === m.id ? m : x)); }
  deleteMenuItem(id: string) { this.menuItems.update(l => l.filter(x => x.id !== id)); }
}
