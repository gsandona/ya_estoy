import { Component, Input, inject, signal, OnInit, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CartService, MenuItem } from '../../../../core/services/cart.service';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col">
      <h2 class="text-2xl font-black text-gray-800 mb-5 tracking-tight text-left">Nuestro Menú</h2>
      
      <!-- Buscador Superior Reactivo -->
      <div class="relative mb-5">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input type="text" 
               [ngModel]="searchQuery()" 
               (ngModelChange)="searchQuery.set($event)"
               placeholder="Buscar pizza, pasta, bebida, postre..." 
               class="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-gray-150 focus:border-accent outline-none text-sm font-semibold transition bg-gray-50/50 focus:bg-white placeholder-gray-400">
        @if (searchQuery()) {
          <button (click)="searchQuery.set('')" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition active:scale-90 font-black">
            ✕
          </button>
        }
      </div>

      <!-- Selector de Categorías (Pestañas Premium) -->
      @if (!searchQuery()) {
        <div class="grid grid-cols-4 gap-1 mb-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-150">
        <button (click)="selectTab('Comidas')"
                [ngClass]="activeTab() === 'Comidas' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100/60'"
                class="flex flex-col items-center justify-center py-2.5 rounded-xl transition active:scale-95 outline-none">
          <span class="text-lg mb-0.5">🍕</span>
          <span class="text-[9px] font-black uppercase tracking-wider">Comidas</span>
        </button>
        <button (click)="selectTab('Bebidas')"
                [ngClass]="activeTab() === 'Bebidas' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100/60'"
                class="flex flex-col items-center justify-center py-2.5 rounded-xl transition active:scale-95 outline-none">
          <span class="text-lg mb-0.5">🍹</span>
          <span class="text-[9px] font-black uppercase tracking-wider">Bebidas</span>
        </button>
        <button (click)="selectTab('Postres')"
                [ngClass]="activeTab() === 'Postres' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100/60'"
                class="flex flex-col items-center justify-center py-2.5 rounded-xl transition active:scale-95 outline-none">
          <span class="text-lg mb-0.5">🍰</span>
          <span class="text-[9px] font-black uppercase tracking-wider">Postres</span>
        </button>
        <button (click)="selectTab('Otros')"
                [ngClass]="activeTab() === 'Otros' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100/60'"
                class="flex flex-col items-center justify-center py-2.5 rounded-xl transition active:scale-95 outline-none">
          <span class="text-lg mb-0.5">🏷️</span>
          <span class="text-[9px] font-black uppercase tracking-wider">Otros</span>
        </button>
        </div>
      }

      <!-- Chips de Subcategorías Dinámicas -->
      @if (!searchQuery() && subCategories().length > 0) {
        <div class="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-none select-none">
          <button (click)="selectedSubCategory.set(null)"
                  [ngClass]="selectedSubCategory() === null ? 'bg-accent/15 border-accent/25 text-accent font-black shadow-sm shadow-accent/5' : 'bg-gray-50 border-gray-200 text-slate-500 font-semibold hover:bg-gray-100'"
                  class="px-3.5 py-1.5 rounded-full text-[9px] border transition active:scale-95 outline-none whitespace-nowrap">
            Todos
          </button>
          @for (sub of subCategories(); track sub) {
            <button (click)="selectedSubCategory.set(sub)"
                    [ngClass]="selectedSubCategory() === sub ? 'bg-accent/15 border-accent/25 text-accent font-black shadow-sm shadow-accent/5' : 'bg-gray-50 border-gray-200 text-slate-500 font-semibold hover:bg-gray-100'"
                    class="px-3.5 py-1.5 rounded-full text-[9px] border transition active:scale-95 outline-none whitespace-nowrap">
              {{ sub | titlecase }}
            </button>
          }
        </div>
      }

      <!-- Listado de Productos Filtrados -->
      @if (filteredItems().length === 0) {
        <div class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p class="text-gray-500 font-bold">No se encontraron productos.</p>
        </div>
      }
      <div class="space-y-4 pb-4">
        @for (item of filteredItems(); track item.id) {
          @if (item.activo !== false) {
            <div class="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex justify-between items-start gap-4 transition-all hover:border-accent/30 hover:shadow-md animate-fade-in-quick">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-gray-150 text-gray-500 bg-gray-50/50">{{ item.categoria }}</span>
                </div>
                <h3 class="font-bold text-gray-800 text-base leading-tight truncate">{{ item.nombre }}</h3>
                <p class="text-xs text-gray-400 font-semibold mt-1 leading-snug line-clamp-2">{{ item.descripcion }}</p>
              </div>
              <div class="flex flex-col items-end justify-between self-stretch shrink-0">
                <span class="font-black text-primary text-lg mb-2">\${{ item.precio }}</span>
                <button 
                  (click)="agregarAlCarrito(item)"
                  [ngClass]="{ 'bg-green-50 text-green-700 border border-green-150 scale-105 shadow-green-500/5': addedItemIds()[item.id], 'bg-accent text-white shadow-accent/10': !addedItemIds()[item.id] }"
                  class="px-4 py-2.5 rounded-xl text-xs font-black hover:opacity-95 transition-all transform active:scale-95 shadow-sm flex items-center gap-1.5 duration-200">
                  @if (addedItemIds()[item.id]) {
                    <svg class="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    <span>Agregado</span>
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    <span>Agregar</span>
                  }
                </button>
              </div>
            </div>
          }
        } @empty {
          <div class="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <span class="text-4xl block mb-3 opacity-60">✨</span>
            <p class="text-slate-400 font-bold text-sm">No hay productos disponibles.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-quick {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-quick {
      animation: fade-in-quick 0.25s ease-out forwards;
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class MenuComponent implements OnInit {
  @Input() restauranteId!: string;

  cartService = inject(CartService);
  http = inject(HttpClient);

  menuItems = signal<MenuItem[]>([]);
  addedItemIds = signal<Record<string, boolean>>({});
  
  // Filters signals
  activeTab = signal<'Comidas' | 'Bebidas' | 'Postres' | 'Otros'>('Comidas');
  selectedSubCategory = signal<string | null>(null);
  searchQuery = signal<string>('');

  // Extract unique subcategories for the active primary tab
  subCategories = computed(() => {
    const tab = this.activeTab();
    const itemsInTab = this.menuItems().filter(item => {
      const cat = (item.categoria || '').toLowerCase().trim();
      return this.getGroupForCategory(cat) === tab;
    });
    
    const uniqueCats = Array.from(new Set(itemsInTab.map(i => i.categoria).filter(Boolean)));
    return uniqueCats;
  });

  filteredItems = computed(() => {
    const tab = this.activeTab();
    const sub = this.selectedSubCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.menuItems().filter(item => {
      const cat = (item.categoria || '').toLowerCase().trim();
      
      // Si hay búsqueda, buscar en todos los productos sin importar la categoría
      if (query) {
        const matchesName = (item.nombre || '').toLowerCase().includes(query);
        const matchesDesc = (item.descripcion || '').toLowerCase().includes(query);
        const matchesCat = cat.includes(query);
        return matchesName || matchesDesc || matchesCat;
      }
      
      // 1. Filtrar por pestaña principal
      const group = this.getGroupForCategory(cat);
      if (group !== tab) return false;
      
      // 2. Filtrar por subcategoría (si hay una seleccionada)
      if (sub && item.categoria !== sub) return false;
      
      return true;
    });
  });

  selectTab(tabName: 'Comidas' | 'Bebidas' | 'Postres' | 'Otros') {
    this.activeTab.set(tabName);
    this.selectedSubCategory.set(null); // Reset subcategory filter when switching main category
  }

  agregarAlCarrito(item: MenuItem) {
    this.cartService.addToCart(item);
    this.addedItemIds.update(ids => ({ ...ids, [item.id]: true }));
    setTimeout(() => {
      this.addedItemIds.update(ids => {
        const copy = { ...ids };
        delete copy[item.id];
        return copy;
      });
    }, 1000);
  }

  ngOnInit() {
    const url = this.restauranteId 
      ? `${environment.apiUrl}/api/menu?restauranteId=${this.restauranteId}`
      : `${environment.apiUrl}/api/menu`;

    this.http.get<MenuItem[]>(url).subscribe({
      next: (data) => {
        this.menuItems.set(data);
      },
      error: (err) => {
        console.error('Error fetching /api/menu', err);
        const mockData: MenuItem[] = [
          { id: '1', categoria: 'Aderezos', nombre: 'Kétchup', precio: 150, descripcion: 'Clásico aderezo', activo: true },
          { id: '2', categoria: 'Bebidas calientes', nombre: 'Café Cortado', precio: 320, descripcion: 'Café expreso con un toque de leche', activo: true }
        ];
        this.menuItems.set(mockData);
      }
    });
  }

  private getGroupForCategory(cat: string): 'Comidas' | 'Bebidas' | 'Postres' | 'Otros' {
    if (cat.includes('plato') || cat.includes('pizza') || cat.includes('clásico') || cat.includes('clasico') || 
        cat.includes('pasta') || cat.includes('salado') || cat.includes('comida') || cat.includes('hamburguesa') || 
        cat.includes('milanesa') || cat.includes('sándwich') || cat.includes('sandwich') || cat.includes('entrada') || 
        cat.includes('lomo') || cat.includes('empanada') || cat.includes('tostado') || cat.includes('aderezo') || 
        cat.includes('salsa') || cat.includes('aderezos')) {
      return 'Comidas';
    }
    if (cat.includes('bebida') || cat.includes('cerveza') || cat.includes('agua') || cat.includes('gaseosa') || 
        cat.includes('jugo') || cat.includes('trago') || cat.includes('café') || cat.includes('cafe') || 
        cat.includes('te') || cat.includes('té') || cat.includes('licuado') || cat.includes('beer') || 
        cat.includes('fria') || cat.includes('caliente')) {
      return 'Bebidas';
    }
    if (cat.includes('postre') || cat.includes('dulce') || cat.includes('helado') || cat.includes('tarta') || 
        cat.includes('torta') || cat.includes('alfajor') || cat.includes('medialuna') || cat.includes('flan') || 
        cat.includes('mousse')) {
      return 'Postres';
    }
    return 'Otros';
  }
}
