import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminDataService, AdminMenuItem } from './admin-data.service';
import { environment } from '../../../../environments/environment';

interface CategoryNode {
  id: string;
  nombre: string;
  emoji: string;
  parentCategoryId?: string | null;
  subCategories: CategoryNode[];
}

@Component({
  selector: 'app-abm-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">Gestionar Menú</h2>
          <p class="text-gray-400 text-xs font-semibold uppercase mt-0.5 tracking-wider">Publica platos ordenados por categorías</p>
        </div>
        <button (click)="openCreateForm()" class="bg-primary text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-[#1a233b] transition-all active:scale-95 flex items-center gap-1.5 self-end sm:self-auto">
          + Agregar Producto
        </button>
      </div>

      <!-- Category Filter Chips -->
      <div class="mb-6 space-y-3">
        <!-- Main Category Filter -->
        <div class="flex flex-wrap gap-2">
          <button 
            (click)="selectFilterCategory(null)"
            [class.bg-primary]="activeFilterCategoryId() === null"
            [class.text-white]="activeFilterCategoryId() === null"
            [class.bg-gray-50]="activeFilterCategoryId() !== null"
            [class.text-gray-600]="activeFilterCategoryId() !== null"
            [class.border-gray-200]="activeFilterCategoryId() !== null"
            class="px-4 py-2 border rounded-xl text-xs font-black transition active:scale-95 outline-none select-none">
            📂 Todos
          </button>
          
          @for (cat of categoriesList(); track cat.id) {
            <button 
              (click)="selectFilterCategory(cat)"
              [class.bg-primary]="activeFilterCategoryId() === cat.id"
              [class.text-white]="activeFilterCategoryId() === cat.id"
              [class.bg-gray-50]="activeFilterCategoryId() !== cat.id"
              [class.text-gray-600]="activeFilterCategoryId() !== cat.id"
              [class.border-gray-200]="activeFilterCategoryId() !== cat.id"
              class="px-4 py-2 border rounded-xl text-xs font-black transition active:scale-95 outline-none select-none">
              {{ cat.emoji }} {{ cat.nombre }}
            </button>
          }
        </div>

        <!-- Subcategory Filter (Visible only when a main category is selected and has subcategories) -->
        @if (activeFilterCategory() && activeFilterCategory()!.subCategories.length > 0) {
          <div class="flex flex-wrap gap-2 p-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl animate-fade-in">
            <button 
              (click)="selectFilterSubCategory(null)"
              [class.bg-accent]="activeFilterSubCategoryId() === null"
              [class.text-white]="activeFilterSubCategoryId() === null"
              [class.bg-white]="activeFilterSubCategoryId() !== null"
              [class.text-gray-600]="activeFilterSubCategoryId() !== null"
              [class.border-gray-250]="activeFilterSubCategoryId() !== null"
              class="px-3.5 py-1.5 border rounded-lg text-[10px] font-black transition active:scale-95 outline-none select-none">
              Ver Todo
            </button>

            @for (sub of activeFilterCategory()!.subCategories; track sub.id) {
              <button 
                (click)="selectFilterSubCategory(sub)"
                [class.bg-accent]="activeFilterSubCategoryId() === sub.id"
                [class.text-white]="activeFilterSubCategoryId() === sub.id"
                [class.bg-white]="activeFilterSubCategoryId() !== sub.id"
                [class.text-gray-600]="activeFilterSubCategoryId() !== sub.id"
                [class.border-gray-250]="activeFilterSubCategoryId() !== sub.id"
                class="px-3.5 py-1.5 border rounded-lg text-[10px] font-black transition active:scale-95 outline-none select-none">
                {{ sub.emoji }} {{ sub.nombre }}
              </button>
            }
          </div>
        }
      </div>

      <!-- Modal Stepper Form -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 w-full max-w-xl border border-gray-100 shadow-2xl space-y-5 animate-scale-up">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-gray-800">
                  {{ editingId() ? 'Editar Producto' : 'Agregar Producto al Menú' }}
                </h3>
                <span class="text-[10px] font-black uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded border border-primary/20">
                  Paso {{ currentStep() }} de 3
                </span>
              </div>
              <button (click)="showForm.set(false)" class="text-gray-400 hover:text-gray-600 font-bold text-xl select-none">&times;</button>
            </div>

            <!-- STEP 1: Main Category Selection -->
            @if (currentStep() === 1) {
              <div class="space-y-4 animate-fade-in">
                <div>
                  <h4 class="text-sm font-black text-gray-700">Selecciona la Categoría Principal</h4>
                  <p class="text-[11px] text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">Elige el grupo general de tu producto</p>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  @for (cat of categoriesList(); track cat.id) {
                    <button 
                      type="button"
                      (click)="selectParentCat(cat)"
                      class="flex flex-col items-center justify-center p-5 bg-sand/10 hover:bg-sand/30 border border-gray-250/50 hover:border-gray-300 rounded-2xl transition active:scale-95 space-y-2.5 outline-none select-none">
                      <span class="text-4xl bg-white border border-gray-150 p-2.5 rounded-xl shadow-sm leading-none">{{ cat.emoji }}</span>
                      <span class="font-black text-xs text-gray-700 leading-tight text-center">{{ cat.nombre }}</span>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- STEP 2: Subcategory Selection -->
            @if (currentStep() === 2) {
              <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="text-sm font-black text-gray-700">Selecciona la Subcategoría</h4>
                    <p class="text-[11px] text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">Filtro para {{ selectedParentCat()?.nombre }}</p>
                  </div>
                  <button type="button" (click)="currentStep.set(1)" class="text-xs font-bold text-slate-500 hover:text-slate-700">← Cambiar categoría</button>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  <!-- Option to use main category directly without subcategory -->
                  <button 
                    type="button"
                    (click)="selectSubCat(null)"
                    class="flex flex-col items-center justify-center p-5 bg-sand/5 hover:bg-sand/20 border border-dashed border-gray-350 hover:border-gray-400 rounded-2xl transition active:scale-95 space-y-2.5 outline-none select-none">
                    <span class="text-3xl">➡️</span>
                    <span class="font-black text-xs text-gray-500 leading-tight text-center">Usar "{{ selectedParentCat()?.nombre }}"</span>
                  </button>

                  @for (sub of selectedParentCat()?.subCategories; track sub.id) {
                    <button 
                      type="button"
                      (click)="selectSubCat(sub)"
                      class="flex flex-col items-center justify-center p-5 bg-sand/10 hover:bg-sand/30 border border-gray-250/50 hover:border-gray-300 rounded-2xl transition active:scale-95 space-y-2.5 outline-none select-none">
                      <span class="text-4xl bg-white border border-gray-150 p-2.5 rounded-xl shadow-sm leading-none">{{ sub.emoji }}</span>
                      <span class="font-black text-xs text-gray-700 leading-tight text-center">{{ sub.nombre }}</span>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- STEP 3: Product Form Details -->
            @if (currentStep() === 3) {
              <div class="space-y-4 animate-fade-in">
                <!-- Breadcrumbs -->
                <div class="flex items-center gap-1.5 bg-sand/20 border border-gray-200 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-600 shadow-sm justify-between">
                  <div class="flex items-center gap-1">
                    <span>{{ selectedParentCat()?.emoji }} {{ selectedParentCat()?.nombre }}</span>
                    @if (selectedSubCat()) {
                      <span class="text-gray-400 font-normal">/</span>
                      <span>{{ selectedSubCat()?.emoji }} {{ selectedSubCat()?.nombre }}</span>
                    }
                  </div>
                  <button type="button" (click)="goBackFromStep3()" class="text-[10px] font-black text-accent hover:underline">Cambiar Categoría</button>
                </div>

                <form #menuForm="ngForm" class="space-y-4" autocomplete="off" (submit)="saveForm($event)">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2 relative">
                      <label class="block text-xs font-bold text-slate-500 mb-1">Nombre del Producto</label>
                      <input type="text" [(ngModel)]="formData.nombre" name="nombre" #nombreCtrl="ngModel" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm font-semibold" [ngClass]="{'border-red-500': nombreCtrl.invalid && nombreCtrl.touched}" required>
                      @if (nombreCtrl.invalid && nombreCtrl.touched) {
                        <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Obligatorio</span>
                      }
                    </div>
                    <div class="relative">
                      <label class="block text-xs font-bold text-slate-500 mb-1">Precio ($)</label>
                      <input type="number" [(ngModel)]="formData.precio" name="precio" #precioCtrl="ngModel" min="0" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm font-black text-center" [ngClass]="{'border-red-500': precioCtrl.invalid && precioCtrl.touched}" required>
                      @if (precioCtrl.invalid && precioCtrl.touched) {
                        <span class="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">Precio inválido</span>
                      }
                    </div>
                  </div>

                  <div>
                     <label class="block text-xs font-bold text-slate-500 mb-1">Descripción corta</label>
                     <input type="text" [(ngModel)]="formData.descripcion" name="descripcion" autocomplete="off" class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-accent text-sm font-medium" required>
                  </div>
                  
                  <div class="flex gap-2 w-full justify-between items-center pt-4 border-t border-gray-100">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" [(ngModel)]="formData.activo" name="activo" class="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent/10">
                      <span class="text-sm font-bold text-gray-700">Producto Activo en Carta</span>
                    </label>
                    <div class="flex gap-2">
                      <button type="button" (click)="goBackFromStep3()" class="bg-gray-150 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-250">Atrás</button>
                      <button type="submit" [disabled]="menuForm.invalid" class="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-sm hover:bg-opacity-95 disabled:opacity-50">
                        {{ editingId() ? 'Actualizar Producto' : 'Añadir a Carta' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            }
          </div>
        </div>
      }

      <!-- Menu Items List -->
      <div class="space-y-3">
         @for (item of filteredItems(); track item.id) {
           <div class="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-150 group hover:border-gray-300 hover:shadow-sm transition-all" [class.opacity-50]="!item.activo">
             <div>
               <div class="flex items-center gap-2 mb-1.5">
                 <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-gray-200 text-gray-500 bg-gray-50 flex items-center gap-1">
                   {{ getCategoryStringLabel(item) }}
                 </span>
                 @if (item.activo) {
                   <span class="text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                     <span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                     Activo
                   </span>
                 } @else {
                   <span class="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">Inactivo</span>
                 }
               </div>
               <h3 class="font-bold text-gray-800 text-base leading-tight">{{ item.nombre }}</h3>
               <p class="text-xs text-gray-500 clamp-1 mt-1 font-medium">{{ item.descripcion }}</p>
             </div>
             <div class="flex items-center gap-4">
               <span class="font-black text-primary text-lg">\${{ item.precio }}</span>
               
               <div class="flex gap-2">
                 <button (click)="openEditForm(item)" class="bg-green-50 text-green-700 hover:bg-green-100 border border-green-150/40 p-2 rounded-xl text-xs font-bold transition active:scale-95" title="Editar">
                   ✏️
                 </button>
                 <button (click)="dataService.deleteMenuItem(item.id)" class="bg-red-50 text-red-600 hover:bg-red-100 border border-red-150/40 p-2 rounded-xl text-xs font-bold transition active:scale-95" title="Eliminar">
                   🗑️
                 </button>
               </div>
             </div>
           </div>
         } @empty {
           <p class="text-center py-10 text-gray-400 text-sm font-medium">No hay productos en la categoría seleccionada.</p>
         }
      </div>

      <div class="mt-8 pt-6 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Los cambios son locales hasta guardar y publicar.</p>
        
        <div class="flex items-center gap-3">
          @if (saveSuccess()) {
            <span class="text-green-700 font-bold text-xs bg-green-50 border border-green-100 px-3 py-2 rounded-xl animate-fade-in">✅ ¡Guardado en servidor!</span>
          }
          
          <button 
            (click)="syncBackend()"
            [disabled]="isSaving()"
            class="bg-accent text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md hover:bg-opacity-95 transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2">
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
export class AbmMenuComponent implements OnInit {
  dataService = inject(AdminDataService);
  http = inject(HttpClient);

  categoriesList = signal<CategoryNode[]>([]);
  
  // Grid filters
  activeFilterCategoryId = signal<string | null>(null);
  activeFilterCategory = signal<CategoryNode | null>(null);
  activeFilterSubCategoryId = signal<string | null>(null);

  // Form stepper state
  showForm = signal(false);
  currentStep = signal<number>(1);
  selectedParentCat = signal<CategoryNode | null>(null);
  selectedSubCat = signal<CategoryNode | null>(null);
  
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  saveSuccess = signal(false);

  formData: AdminMenuItem = { id: '', categoria: '', nombre: '', precio: 0, descripcion: '', activo: true, menuCategoryId: undefined };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<CategoryNode[]>(`${environment.apiUrl}/api/menu-categories`).subscribe({
      next: (data) => {
        this.categoriesList.set(data);
      },
      error: (err) => {
        console.error('Error al obtener categorías de menú:', err);
      }
    });
  }

  // Visual filters handling
  selectFilterCategory(cat: CategoryNode | null) {
    if (cat === null) {
      this.activeFilterCategoryId.set(null);
      this.activeFilterCategory.set(null);
      this.activeFilterSubCategoryId.set(null);
    } else {
      this.activeFilterCategoryId.set(cat.id);
      this.activeFilterCategory.set(cat);
      this.activeFilterSubCategoryId.set(null); // Reset subcategory filter
    }
  }

  selectFilterSubCategory(sub: CategoryNode | null) {
    if (sub === null) {
      this.activeFilterSubCategoryId.set(null);
    } else {
      this.activeFilterSubCategoryId.set(sub.id);
    }
  }

  // Filtered menu items computing
  filteredItems = computed(() => {
    const items = this.dataService.menuItems();
    const filterCatId = this.activeFilterCategoryId();
    const filterSubCatId = this.activeFilterSubCategoryId();
    const categories = this.categoriesList();

    if (filterCatId === null) {
      return items;
    }

    // Determine the list of valid CategoryIds matching the filter
    const targetIds = new Set<string>();
    
    if (filterSubCatId !== null) {
      targetIds.add(filterSubCatId);
    } else {
      // Add parent category ID and all its nested subcategory IDs
      targetIds.add(filterCatId);
      const catNode = categories.find(c => c.id === filterCatId);
      if (catNode && catNode.subCategories) {
        catNode.subCategories.forEach(sub => targetIds.add(sub.id));
      }
    }

    // Filter items matching the set or having the name fallback
    return items.filter(item => {
      if (item.menuCategoryId) {
        return targetIds.has(item.menuCategoryId);
      }
      
      // Fallback fallback string match for older/unassociated items
      const itemCatLower = (item.categoria || '').toLowerCase().trim();
      const parentNode = categories.find(c => c.id === filterCatId);
      if (parentNode) {
        const parentNameLower = parentNode.nombre.toLowerCase().trim();
        if (itemCatLower.includes(parentNameLower)) return true;
        
        // Check subcategory strings
        if (parentNode.subCategories) {
          const subMatches = parentNode.subCategories.some(sub => {
            const subNameLower = sub.nombre.toLowerCase().trim();
            return itemCatLower.includes(subNameLower) && (filterSubCatId === null || sub.id === filterSubCatId);
          });
          if (subMatches) return true;
        }
      }
      return false;
    });
  });

  // Stepper selections
  selectParentCat(cat: CategoryNode) {
    this.selectedParentCat.set(cat);
    this.selectedSubCat.set(null);
    
    if (cat.subCategories && cat.subCategories.length > 0) {
      this.currentStep.set(2);
    } else {
      this.formData.menuCategoryId = cat.id;
      this.formData.categoria = cat.nombre;
      this.currentStep.set(3);
    }
  }

  selectSubCat(sub: CategoryNode | null) {
    if (sub === null) {
      const parent = this.selectedParentCat();
      this.selectedSubCat.set(null);
      this.formData.menuCategoryId = parent ? parent.id : undefined;
      this.formData.categoria = parent ? parent.nombre : '';
    } else {
      this.selectedSubCat.set(sub);
      this.formData.menuCategoryId = sub.id;
      this.formData.categoria = sub.nombre;
    }
    this.currentStep.set(3);
  }

  goBackFromStep3() {
    const parent = this.selectedParentCat();
    if (parent && parent.subCategories && parent.subCategories.length > 0) {
      this.currentStep.set(2);
    } else {
      this.currentStep.set(1);
    }
  }

  getCategoryStringLabel(item: AdminMenuItem): string {
    const categories = this.categoriesList();
    if (item.menuCategoryId) {
      // Find Category
      for (const cat of categories) {
        if (cat.id === item.menuCategoryId) {
          return `${cat.emoji} ${cat.nombre}`;
        }
        const sub = cat.subCategories?.find(s => s.id === item.menuCategoryId);
        if (sub) {
          return `${cat.emoji} ${cat.nombre} > ${sub.emoji} ${sub.nombre}`;
        }
      }
    }
    return `🍴 ${item.categoria || 'Menú'}`;
  }

  openCreateForm() {
    this.editingId.set(null);
    this.formData = { id: '', categoria: '', nombre: '', precio: 0, descripcion: '', activo: true, menuCategoryId: undefined };
    this.selectedParentCat.set(null);
    this.selectedSubCat.set(null);
    this.currentStep.set(1);
    this.showForm.set(true);
  }

  openEditForm(item: AdminMenuItem) {
    this.editingId.set(item.id);
    this.formData = { ...item };
    
    // Attempt to pre-populate selected category nodes based on menuCategoryId
    this.selectedParentCat.set(null);
    this.selectedSubCat.set(null);

    const categories = this.categoriesList();
    if (item.menuCategoryId) {
      for (const cat of categories) {
        if (cat.id === item.menuCategoryId) {
          this.selectedParentCat.set(cat);
          break;
        }
        const sub = cat.subCategories?.find(s => s.id === item.menuCategoryId);
        if (sub) {
          this.selectedParentCat.set(cat);
          this.selectedSubCat.set(sub);
          break;
        }
      }
    }

    // If pre-populated, open step 3 directly. If not, open step 1.
    if (this.selectedParentCat()) {
      this.currentStep.set(3);
    } else {
      this.currentStep.set(1);
    }
    this.showForm.set(true);
  }

  saveForm(e: Event) {
    e.preventDefault();
    if (this.editingId()) {
      this.dataService.updateMenuItem(this.formData);
    } else {
      this.dataService.addMenuItem({ ...this.formData, id: crypto.randomUUID() });
    }
    this.showForm.set(false);
  }

  syncBackend() {
    this.isSaving.set(true);
    const payload = this.dataService.menuItems();
    
    this.http.post(`${environment.apiUrl}/api/menu/bulk`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('El backend rechazó el guardado:', err);
        this.isSaving.set(false);
        alert('❌ Error: El Backend no está encendido o rechazó la petición. Los cambios a tu carta no se han guardado.');
      }
    });
  }
}
