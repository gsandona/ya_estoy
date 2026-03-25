import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AdminUser { id: string; email: string; role: 'Admin' | 'Mozo'; password?: string; }
export interface AdminMesa { id: string; numero: number; ubicacion: string; mozoId: string; }
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

  // Sin mocks reales, inicializan vacío
  public users = signal<AdminUser[]>([]);
  public mesas = signal<AdminMesa[]>([]);
  public menuItems = signal<AdminMenuItem[]>([]);
  
  public mozos = computed(() => this.users().filter(u => u.role === 'Mozo'));

  constructor() {
    this.refreshAll();
  }

  // Trae todo nuevamente
  refreshAll() {
    this.http.get<AdminUser[]>('https://yaestoy.onrender.com/api/users').subscribe({
      next: d => this.users.set(d),
      error: () => this.users.set([]) // backend caído, lista vacía
    });
    
    this.http.get<AdminMesa[]>('https://yaestoy.onrender.com/api/mesas').subscribe({
      next: d => this.mesas.set(d),
      error: () => this.mesas.set([])
    });
    
    this.http.get<AdminMenuItem[]>('https://yaestoy.onrender.com/api/menu').subscribe({
      next: d => this.menuItems.set(d),
      error: () => this.menuItems.set([])
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
