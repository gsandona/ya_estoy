import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CategoryNode {
  id: string;
  nombre: string;
  emoji: string;
  parentCategoryId?: string | null;
  subCategories: CategoryNode[];
}

@Component({
  selector: 'app-superadmin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">Categorías de Menú</h2>
          <p class="text-gray-500 text-xs mt-1 font-semibold">Configura el árbol global de categorías y subcategorías que usarán los restaurantes.</p>
        </div>
        <button (click)="openCreateModal()" class="bg-primary text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-[#1a233b] transition-all active:scale-95 flex items-center gap-1.5">
          + Agregar Categoría / Subcategoría
        </button>
      </div>

      <!-- Error Alerts -->
      @if (errorMessage()) {
        <div class="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-6 text-xs font-bold flex justify-between items-center animate-fade-in">
          <span>⚠️ {{ errorMessage() }}</span>
          <button (click)="errorMessage.set('')" class="text-red-500 hover:text-red-700 font-bold text-sm select-none">&times;</button>
        </div>
      }

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (cat of categories(); track cat.id) {
          <div class="bg-sand/10 rounded-2xl border border-gray-250/50 p-5 flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl bg-white border border-gray-150 p-2.5 rounded-xl shadow-sm leading-none">{{ cat.emoji }}</span>
                  <div>
                    <h3 class="font-black text-gray-800 text-base leading-tight">{{ cat.nombre }}</h3>
                    <span class="text-[9px] uppercase tracking-wider text-slate-400 font-black">Categoría Principal</span>
                  </div>
                </div>
                <div class="flex gap-1.5">
                  <button (click)="openEditModal(cat)" class="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs transition active:scale-95" title="Editar">
                    ✏️
                  </button>
                  <button (click)="deleteCategory(cat.id)" class="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg text-xs transition active:scale-95" title="Eliminar">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Nested Subcategories -->
              <div class="space-y-2 mt-4 pt-4 border-t border-dashed border-gray-200">
                <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400">Subcategorías</h4>
                
                @if (cat.subCategories && cat.subCategories.length > 0) {
                  <div class="flex flex-wrap gap-2 pt-1">
                    @for (sub of cat.subCategories; track sub.id) {
                      <div class="flex items-center gap-1.5 bg-white border border-gray-200 pl-2.5 pr-1.5 py-1.5 rounded-xl shadow-sm text-xs font-bold text-gray-700">
                        <span>{{ sub.emoji }} {{ sub.nombre }}</span>
                        <div class="flex gap-1 ml-1 pl-1 border-l border-gray-100">
                          <button (click)="openEditModal(sub)" class="text-[10px] hover:scale-110 active:scale-90 transition p-0.5 select-none" title="Editar subcategoría">✏️</button>
                          <button (click)="deleteCategory(sub.id)" class="text-[10px] hover:scale-110 active:scale-90 text-red-500 transition p-0.5 select-none" title="Eliminar subcategoría">🗑️</button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[11px] text-gray-400 font-medium italic">Sin subcategorías creadas.</p>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-16">
            <span class="text-4xl block mb-2 opacity-50">📂</span>
            <p class="text-gray-400 text-sm font-semibold uppercase tracking-wider">No hay categorías globales en el sistema.</p>
          </div>
        }
      </div>

      <!-- Create / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl space-y-6 animate-scale-up">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 class="text-lg font-black text-gray-800">{{ editingId() ? 'Editar Categoría / Subcategoría' : 'Nueva Categoría / Subcategoría' }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 font-bold text-xl select-none">&times;</button>
            </div>

            <form #categoryForm="ngForm" (submit)="saveForm($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                <input type="text" [(ngModel)]="formData.nombre" name="nombre" #nombreCtrl="ngModel" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium" placeholder="Ej: Hamburguesas, Cervezas..." required>
                @if (nombreCtrl.invalid && nombreCtrl.touched) {
                  <span class="text-red-500 text-[10px] font-bold block mt-1">El nombre es obligatorio</span>
                }
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Emoji Logo</label>
                  <input type="text" [(ngModel)]="formData.emoji" name="emoji" #emojiCtrl="ngModel" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-xl font-bold" placeholder="🍔" maxLength="4" required>
                  @if (emojiCtrl.invalid && emojiCtrl.touched) {
                    <span class="text-red-500 text-[9px] font-bold block mt-1">Requerido</span>
                  }
                </div>

                <div class="col-span-2">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Categoría Padre (Opcional)</label>
                  <select [(ngModel)]="formData.parentCategoryId" name="parentCategoryId" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20">
                    <option [ngValue]="null">Ninguna (Categoría Principal)</option>
                    @for (cat of mainCategoriesList(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.emoji }} {{ cat.nombre }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" (click)="closeModal()" class="bg-gray-100 text-gray-600 border border-gray-250 px-5 py-3 rounded-xl font-bold text-xs hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" [disabled]="categoryForm.invalid || isSaving()" class="bg-primary text-white px-6 py-3 rounded-xl font-black text-xs shadow-md hover:bg-opacity-95 disabled:opacity-50">
                  @if (isSaving()) {
                    Guardando...
                  } @else {
                    {{ editingId() ? 'Actualizar' : 'Crear' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperadminCategoriesComponent implements OnInit {
  private http = inject(HttpClient);

  categories = signal<CategoryNode[]>([]);
  mainCategoriesList = signal<{ id: string; nombre: string; emoji: string }[]>([]);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  errorMessage = signal('');

  formData = {
    nombre: '',
    emoji: '',
    parentCategoryId: null as string | null
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<CategoryNode[]>(`${environment.apiUrl}/api/menu-categories`).subscribe({
      next: (data) => {
        this.categories.set(data);
        
        // Populate flat list of main categories for selector dropdown
        const mainList = data.map(c => ({ id: c.id, nombre: c.nombre, emoji: c.emoji }));
        this.mainCategoriesList.set(mainList);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorMessage.set('No se pudieron cargar las categorías del servidor.');
      }
    });
  }

  openCreateModal() {
    this.editingId.set(null);
    this.formData = {
      nombre: '',
      emoji: '🍔',
      parentCategoryId: null
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEditModal(cat: CategoryNode) {
    this.editingId.set(cat.id);
    this.formData = {
      nombre: cat.nombre,
      emoji: cat.emoji,
      parentCategoryId: cat.parentCategoryId || null
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveForm(e: Event) {
    e.preventDefault();
    this.isSaving.set(true);
    this.errorMessage.set('');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const id = this.editingId();
    if (id) {
      // Editar
      this.http.put(`${environment.apiUrl}/api/menu-categories/${id}`, this.formData, { headers }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showModal.set(false);
          this.loadCategories();
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.errorMessage.set(err.error || 'Error al actualizar la categoría.');
        }
      });
    } else {
      // Crear
      this.http.post(`${environment.apiUrl}/api/menu-categories`, this.formData, { headers }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showModal.set(false);
          this.loadCategories();
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.errorMessage.set(err.error || 'Error al crear la categoría.');
        }
      });
    }
  }

  deleteCategory(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Si tiene subcategorías, también se eliminarán.')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${environment.apiUrl}/api/menu-categories/${id}`, { headers }).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        const serverMsg = typeof err.error === 'string' ? err.error : '';
        this.errorMessage.set(serverMsg || 'No se puede eliminar la categoría porque tiene productos asociados.');
      }
    });
  }
}
