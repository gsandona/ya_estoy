import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CartService, MenuItem } from '../../../../core/services/cart.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-gray-100">
      <h2 class="text-2xl font-serif font-black text-primary mb-4 tracking-tight">Nuestro Menú</h2>
      
      <div class="space-y-4">
        @for (cat of categories(); track cat.name; let isFirst = $first) {
          <details [open]="isFirst" class="group bg-surface rounded-2xl transition-all overflow-hidden border border-transparent shadow-sm">
            <summary class="flex justify-between items-center p-4 cursor-pointer list-none font-black text-lg text-gray-800 select-none outline-none group-open:bg-gray-50 transition-colors">
              <span class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-accent shrink-0"></span>
                {{ cat.name | titlecase }}
              </span>
              <span class="transition-transform duration-300 group-open:rotate-180 text-gray-400 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
            </summary>
            
            <div class="px-4 pb-4 space-y-4 pt-2 bg-gray-50/50">
               @for (item of cat.items; track item.id) {
                 @if (item.activo !== false) {
                   <div class="flex justify-between items-start pt-4 border-t border-gray-100/60 first:border-0 first:pt-0">
                     <div class="flex-1 pr-4">
                       <h3 class="font-bold text-gray-800 text-lg leading-tight">{{ item.nombre }}</h3>
                       <p class="text-sm text-gray-500 font-medium mt-1 leading-snug">{{ item.descripcion }}</p>
                     </div>
                     <div class="flex flex-col items-end justify-between h-full">
                       <span class="font-black text-primary mb-3 text-lg">\${{ item.precio }}</span>
                        <button 
                          (click)="agregarAlCarrito(item)"
                          [ngClass]="{ 'bg-green-600 scale-105 shadow-green-500/20': addedItemIds()[item.id], 'bg-accent shadow-accent/10': !addedItemIds()[item.id] }"
                          class="text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all transform active:scale-[0.96] shadow-md flex items-center gap-1.5 duration-200">
                          @if (addedItemIds()[item.id]) {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            Agregado
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                            Agregar
                          }
                        </button>
                      </div>
                    </div>
                 }
               }
            </div>
          </details>
        } @empty {
          <div class="text-center py-10">
            <div class="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-500 font-medium">Cargando menú delicioso de API...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    details > summary::-webkit-details-marker {
      display: none;
    }
  `]
})
export class MenuComponent implements OnInit {
  @Input() restauranteId!: string;

  cartService = inject(CartService);
  http = inject(HttpClient);

  categories = signal<{name: string, items: MenuItem[]}[]>([]);
  addedItemIds = signal<Record<string, boolean>>({});

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
        this.groupAndSetCategories(data);
      },
      error: (err) => {
        console.error('Error fetching /api/menu', err);
        // Fallback robusto
        const mockData: MenuItem[] = [
          { id: '1', categoria: 'Aderezos', nombre: 'Kétchup', precio: 1, descripcion: 'Clásico', activo: true },
          { id: '2', categoria: 'Bebidas calientes', nombre: 'Café', precio: 3, descripcion: 'Latte', activo: true }
        ];
        this.groupAndSetCategories(mockData);
      }
    });
  }

  private groupAndSetCategories(data: MenuItem[]) {
    // Agrupar por categoría
    const grouped = data.reduce((acc, item) => {
      const cat = item.categoria || 'Varios';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
    
    // Transformar a Array
    const catArray = Object.keys(grouped).map(key => ({
      name: key,
      items: grouped[key]
    }));
    
    this.categories.set(catArray);
  }
}
